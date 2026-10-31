package ru.ligaznaniy.math;

import android.Manifest;
import android.app.Activity;
import android.print.PrintManager;
import android.content.Context;
import android.print.PrintAttributes;
import android.print.PrintDocumentAdapter;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.graphics.Color;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.view.View;
import android.view.Gravity;
import android.webkit.JavascriptInterface;
import android.webkit.ValueCallback;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceRequest;
import android.webkit.WebResourceResponse;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.Toast;
import android.widget.FrameLayout;
import android.widget.LinearLayout;
import android.widget.Button;
import android.widget.TextView;

import java.io.FileNotFoundException;
import java.io.InputStream;
import java.io.OutputStream;
import java.nio.charset.StandardCharsets;
import java.util.Locale;

public class MainActivity extends Activity {
    private static final String ORIGIN = "https://appassets.androidplatform.net";
    private static final int FILE_OPEN = 413, FILE_SAVE = 414, NOTIFY_PERMISSION = 415;
    private WebView web;
    private FrameLayout root;
    private LinearLayout pdfOverlay;
    private WebView pdfWeb;
    private ValueCallback<Uri[]> fileCallback;
    private String pendingContents;
    private String pendingMime;

    @Override public void onCreate(Bundle state) {
        super.onCreate(state);
        getWindow().setStatusBarColor(Color.rgb(63,48,170));
        ReminderScheduler.createChannel(this);
        ReminderScheduler.scheduleNext(this);
        web = new WebView(this);
        web.setBackgroundColor(Color.rgb(250,251,255));
        web.setOverScrollMode(View.OVER_SCROLL_NEVER);
        root = new FrameLayout(this);
        root.addView(web,new FrameLayout.LayoutParams(-1,-1));
        setContentView(root);
        WebSettings settings = web.getSettings();
        settings.setJavaScriptEnabled(true);
        settings.setDomStorageEnabled(true);
        settings.setAllowFileAccess(false);
        settings.setAllowContentAccess(false);
        settings.setAllowFileAccessFromFileURLs(false);
        settings.setAllowUniversalAccessFromFileURLs(false);
        settings.setMixedContentMode(WebSettings.MIXED_CONTENT_NEVER_ALLOW);
        settings.setSupportMultipleWindows(false);
        settings.setMediaPlaybackRequiresUserGesture(true);
        web.addJavascriptInterface(new AndroidBridge(), "AndroidBridge");
        web.setWebViewClient(new WebViewClient() {
            @Override public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest request) {
                return !isInternal(request.getUrl());
            }
            @Override public WebResourceResponse shouldInterceptRequest(WebView view, WebResourceRequest request) {
                Uri uri = request.getUrl();
                if (!isInternal(uri)) return blocked();
                String path = uri.getPath();
                if (path == null || !path.startsWith("/assets/")) return blocked();
                String filename = path.substring(8);
                if (filename.isEmpty() || filename.contains("..") || filename.startsWith("/")) return blocked();
                try {
                    InputStream stream = getAssets().open(filename);
                    String mime = mimeFor(filename);
                    return new WebResourceResponse(mime, mime.startsWith("image/")?null:"UTF-8", stream);
                } catch (Exception e) { return blocked(); }
            }
        });
        web.setWebChromeClient(new WebChromeClient() {
            @Override public boolean onShowFileChooser(WebView view, ValueCallback<Uri[]> callback, FileChooserParams params) {
                if (fileCallback != null) fileCallback.onReceiveValue(null);
                fileCallback = callback;
                Intent intent = new Intent(Intent.ACTION_OPEN_DOCUMENT);
                intent.addCategory(Intent.CATEGORY_OPENABLE);
                intent.setType("application/json");
                try { startActivityForResult(intent, FILE_OPEN); }
                catch (Exception e) { fileCallback.onReceiveValue(null); fileCallback=null; return false; }
                return true;
            }
        });
        if (state == null) web.loadUrl(ORIGIN + (getIntent()!=null && getIntent().getBooleanExtra("openDailyPlan",false) ? "/assets/plan.html" : "/assets/index.html"));
        else web.restoreState(state);
    }

    private static boolean isInternal(Uri uri) {
        return "https".equals(uri.getScheme()) && "appassets.androidplatform.net".equals(uri.getHost());
    }
    private static String mimeFor(String path) {
        String lower=path.toLowerCase(Locale.ROOT);
        if(lower.endsWith(".html")) return "text/html";
        if(lower.endsWith(".js")) return "application/javascript";
        if(lower.endsWith(".css")) return "text/css";
        if(lower.endsWith(".png")) return "image/png";
        if(lower.endsWith(".webmanifest") || lower.endsWith(".json")) return "application/json";
        if(lower.endsWith(".svg")) return "image/svg+xml";
        return "application/octet-stream";
    }
    private static WebResourceResponse blocked() {
        return new WebResourceResponse("text/plain","UTF-8", new java.io.ByteArrayInputStream(new byte[0]));
    }

    public final class AndroidBridge {
        @JavascriptInterface public void updatePlan(String json) {
            runOnUiThread(() -> ReminderScheduler.updatePlan(MainActivity.this, json));
        }
        @JavascriptInterface public void requestNotifications() {
            runOnUiThread(() -> {
                if(Build.VERSION.SDK_INT>=33 && checkSelfPermission(Manifest.permission.POST_NOTIFICATIONS)!=PackageManager.PERMISSION_GRANTED)
                    requestPermissions(new String[]{Manifest.permission.POST_NOTIFICATIONS},NOTIFY_PERMISSION);
                else {
                    ReminderScheduler.scheduleNext(MainActivity.this);
                    Toast.makeText(MainActivity.this,"Напоминания настроены",Toast.LENGTH_SHORT).show();
                }
            });
        }
        @JavascriptInterface public void openPdfReport(String html,String title) {
            if(html==null || html.length()>6_000_000)return;
            runOnUiThread(() -> showPdfPreview(html,title));
        }
        @JavascriptInterface public void saveTextFile(String name,String mime,String content) {
            runOnUiThread(() -> startSave(name,mime,content));
        }
    }

    private void showPdfPreview(String html,String title) {
        hidePdfPreview();
        pdfOverlay=new LinearLayout(this);
        pdfOverlay.setOrientation(LinearLayout.VERTICAL);
        pdfOverlay.setBackgroundColor(Color.WHITE);
        LinearLayout toolbar=new LinearLayout(this);
        toolbar.setGravity(Gravity.CENTER_VERTICAL);
        toolbar.setPadding(12,8,12,8);
        toolbar.setBackgroundColor(Color.rgb(242,240,254));
        Button back=new Button(this);
        back.setText("← Назад");
        back.setOnClickListener(v->hidePdfPreview());
        toolbar.addView(back,new LinearLayout.LayoutParams(-2,-2));
        TextView label=new TextView(this);
        label.setText("Предпросмотр PDF");
        label.setTextColor(Color.rgb(48,39,111));
        label.setTextSize(15);
        label.setGravity(Gravity.CENTER);
        toolbar.addView(label,new LinearLayout.LayoutParams(0,-2,1));
        Button save=new Button(this);
        save.setText("Сохранить PDF");
        save.setEnabled(false);
        toolbar.addView(save,new LinearLayout.LayoutParams(-2,-2));
        pdfOverlay.addView(toolbar,new LinearLayout.LayoutParams(-1,-2));
        pdfWeb=new WebView(this);
        pdfWeb.setBackgroundColor(Color.WHITE);
        pdfWeb.getSettings().setJavaScriptEnabled(false);
        pdfWeb.getSettings().setAllowFileAccess(false);
        pdfWeb.setWebViewClient(new WebViewClient(){
            @Override public void onPageFinished(WebView view,String url){save.setEnabled(true);}
        });
        pdfOverlay.addView(pdfWeb,new LinearLayout.LayoutParams(-1,0,1));
        root.addView(pdfOverlay,new FrameLayout.LayoutParams(-1,-1));
        final WebView report=pdfWeb;
        save.setOnClickListener(v->{
            try{
                PrintManager pm=(PrintManager)getSystemService(Context.PRINT_SERVICE);
                PrintDocumentAdapter adapter=report.createPrintDocumentAdapter(title==null?"Лига знаний — отчёт":title);
                pm.print(title==null?"Лига знаний — отчёт":title,adapter,new PrintAttributes.Builder()
                    .setMediaSize(PrintAttributes.MediaSize.ISO_A4)
                    .setColorMode(PrintAttributes.COLOR_MODE_COLOR)
                    .build());
                Toast.makeText(this,"Выберите «Сохранить как PDF» и место для файла",Toast.LENGTH_LONG).show();
            }catch(Exception e){Toast.makeText(this,"Не удалось открыть печать: "+e.getMessage(),Toast.LENGTH_LONG).show();}
        });
        pdfWeb.loadDataWithBaseURL(ORIGIN+"/assets/",html,"text/html","UTF-8",null);
    }

    private void hidePdfPreview(){
        if(pdfOverlay!=null){root.removeView(pdfOverlay);pdfOverlay=null;}
        if(pdfWeb!=null){pdfWeb.destroy();pdfWeb=null;}
    }

    private void startSave(String name,String mime,String content) {
        if (pendingContents != null) {
            Toast.makeText(this,"Сначала завершите сохранение предыдущего файла",Toast.LENGTH_SHORT).show();return;
        }
        pendingContents=content;
        pendingMime=mime==null?"text/plain":mime.split(";")[0];
        String filename=(name==null?"liga-znaniy-report.txt":name).replaceAll("[^a-zA-Z0-9_.-]","_");
        Intent intent=new Intent(Intent.ACTION_CREATE_DOCUMENT);
        intent.addCategory(Intent.CATEGORY_OPENABLE);
        intent.setType(pendingMime);
        intent.putExtra(Intent.EXTRA_TITLE,filename);
        try{startActivityForResult(intent,FILE_SAVE);}
        catch(Exception e){pendingContents=null;Toast.makeText(this,"Не удалось открыть сохранение",Toast.LENGTH_LONG).show();}
    }
    @Override protected void onActivityResult(int request,int result,Intent data) {
        super.onActivityResult(request,result,data);
        if(request==FILE_OPEN){
            if(fileCallback!=null){fileCallback.onReceiveValue(result==RESULT_OK&&data!=null&&data.getData()!=null?new Uri[]{data.getData()}:null);fileCallback=null;}
        } else if(request==FILE_SAVE){
            if(result==RESULT_OK && data!=null && data.getData()!=null && pendingContents!=null){
                try(OutputStream out=getContentResolver().openOutputStream(data.getData())){
                    if(out==null)throw new FileNotFoundException("Невозможно открыть файл");
                    out.write(pendingContents.getBytes(StandardCharsets.UTF_8));
                    Toast.makeText(this,"Отчёт сохранён",Toast.LENGTH_SHORT).show();
                }catch(Exception e){Toast.makeText(this,"Ошибка при сохранении: "+e.getMessage(),Toast.LENGTH_LONG).show();}
            }
            pendingContents=null;pendingMime=null;
        }
    }
    @Override public void onRequestPermissionsResult(int request,String[] permissions,int[] grants) {
        super.onRequestPermissionsResult(request,permissions,grants);
        if(request==NOTIFY_PERMISSION){
            if(grants.length>0 && grants[0]==PackageManager.PERMISSION_GRANTED){
                ReminderScheduler.scheduleNext(this);
                Toast.makeText(this,"Напоминания разрешены",Toast.LENGTH_SHORT).show();
            } else Toast.makeText(this,"Уведомления отключены в настройках Android",Toast.LENGTH_LONG).show();
        }
    }
    @Override protected void onNewIntent(Intent intent){
        super.onNewIntent(intent);
        setIntent(intent);
        if(intent!=null && intent.getBooleanExtra("openDailyPlan",false) && web!=null)
            web.loadUrl(ORIGIN+"/assets/plan.html");
    }
    @Override public void onBackPressed(){
        if(pdfOverlay!=null){hidePdfPreview();return;}
        if(web!=null && web.canGoBack()) web.goBack(); else super.onBackPressed();
    }
    @Override protected void onSaveInstanceState(Bundle out){ if(web!=null)web.saveState(out);super.onSaveInstanceState(out); }
    @Override protected void onDestroy(){hidePdfPreview();if(web!=null){web.destroy();web=null;}super.onDestroy();}
}