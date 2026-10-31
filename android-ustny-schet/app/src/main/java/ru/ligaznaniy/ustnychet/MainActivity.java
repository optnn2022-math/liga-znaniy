package ru.ligaznaniy.ustnychet;

import android.app.Activity;
import android.print.PrintManager;
import android.content.Context;
import android.content.Intent;
import android.graphics.Color;
import android.net.Uri;
import android.os.Bundle;
import android.print.PrintDocumentAdapter;
import android.view.View;
import android.view.ViewGroup;
import android.webkit.JavascriptInterface;
import android.webkit.ValueCallback;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceRequest;
import android.webkit.WebResourceResponse;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.FrameLayout;
import android.widget.Toast;
import org.json.JSONObject;
import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.InputStream;
import java.io.OutputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.nio.charset.StandardCharsets;
import java.util.HashMap;
import java.util.Map;

/**
 * Лига знаний. Одна безопасная HTTPS-имитация origin для offline, сохранения
 * localStorage и обновляемых автономных страниц. Никакого сервера для запуска нет.
 */
public final class MainActivity extends Activity {
    private static final String APP_ORIGIN = "https://appassets.androidplatform.net";
    private static final String APP_URL = APP_ORIGIN + "/app/index.html";
    private static final String UPDATES = "https://optnn2022-math.github.io/liga-znaniy/ustny-schet/";
    private static final int BUILT_IN_BUILD = 59;
    private static final int REQUEST_OPEN_FILE = 101;
    private static final int REQUEST_SAVE_FILE = 102;

    private WebView webView;
    private WebView printView;
    private FrameLayout root;
    private ValueCallback<Uri[]> fileCallback;
    private String pendingContent;

    @Override public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        getWindow().setStatusBarColor(Color.rgb(88, 64, 216));
        getWindow().setNavigationBarColor(Color.WHITE);
        getWindow().getDecorView().setSystemUiVisibility(View.SYSTEM_UI_FLAG_LIGHT_NAVIGATION_BAR);

        root = new FrameLayout(this);
        webView = new WebView(this);
        root.addView(webView, new FrameLayout.LayoutParams(-1, -1));
        setContentView(root);
        WebSettings cfg = webView.getSettings();
        cfg.setJavaScriptEnabled(true);
        cfg.setDomStorageEnabled(true);
        cfg.setDefaultTextEncodingName("UTF-8");
        cfg.setAllowFileAccess(false);
        cfg.setAllowContentAccess(true);
        cfg.setMixedContentMode(WebSettings.MIXED_CONTENT_NEVER_ALLOW);
        cfg.setMediaPlaybackRequiresUserGesture(false);
        webView.setBackgroundColor(Color.rgb(250, 249, 255));
        webView.addJavascriptInterface(new WebBridge(), "AndroidBridge");

        webView.setWebViewClient(new WebViewClient() {
            @Override public WebResourceResponse shouldInterceptRequest(WebView view, WebResourceRequest request) {
                Uri u = request.getUrl();
                if (!"appassets.androidplatform.net".equals(u.getHost())) return null;
                try {
                    String path = u.getPath();
                    InputStream data;
                    String mime;
                    if ("/app/index.html".equals(path)) {
                        File updated = new File(getFilesDir(), "current-web-app.html");
                        int updateBuild = getSharedPreferences("web", MODE_PRIVATE).getInt("build", 0);
                        data = updated.isFile() && updated.length() > 100000 && updateBuild > BUILT_IN_BUILD
                            ? new FileInputStream(updated) : getAssets().open("index.html");
                        mime = "text/html";
                    } else if (path != null && path.endsWith("/icon-192.png")) {
                        data = getAssets().open("icons/icon-192.png"); mime = "image/png";
                    } else if (path != null && path.endsWith("/icon-512.png")) {
                        data = getAssets().open("icons/icon-512.png"); mime = "image/png";
                    } else if (path != null && path.endsWith("/manifest.webmanifest")) {
                        data = getAssets().open("manifest.webmanifest"); mime = "application/manifest+json";
                    } else {
                        return new WebResourceResponse("text/plain", "UTF-8", 404, "Not Found",
                            new HashMap<>(), new ByteArrayInputStream(new byte[0]));
                    }
                    Map<String, String> headers = new HashMap<>();
                    headers.put("Cache-Control", "no-store");
                    return new WebResourceResponse(mime, "UTF-8", 200, "OK", headers, data);
                } catch (Exception ex) {
                    return new WebResourceResponse("text/plain", "UTF-8", 500, "Asset Error",
                        new HashMap<>(), new ByteArrayInputStream(new byte[0]));
                }
            }
            @Override public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest request) {
                Uri url = request.getUrl();
                if (APP_ORIGIN.equals(url.getScheme() + "://" + url.getHost())) return false;
                String scheme = url.getScheme();
                if (!"https".equals(scheme) && !"http".equals(scheme)) return true;
                try { startActivity(new Intent(Intent.ACTION_VIEW, url)); } catch (Exception ignored) {}
                return true;
            }
        });
        webView.setWebChromeClient(new WebChromeClient() {
            @Override public boolean onShowFileChooser(WebView view, ValueCallback<Uri[]> callback,
                                                         FileChooserParams params) {
                if (fileCallback != null) fileCallback.onReceiveValue(null);
                fileCallback = callback;
                try {
                    Intent intent = params.createIntent();
                    startActivityForResult(intent, REQUEST_OPEN_FILE);
                    return true;
                } catch (Exception e) {
                    fileCallback = null;
                    return false;
                }
            }
        });
        webView.loadUrl(APP_URL);
        // Проверка выполняется отдельно, не блокирует открытие приложения без сети.
        new Thread(this::checkForUpdates, "liga-web-updates").start();
    }

    private final class WebBridge {
        @JavascriptInterface public void saveTextFile(String name, String mime, String data) {
            if (data == null || data.length() > 8_000_000) return;
            runOnUiThread(() -> {
                pendingContent = data;
                Intent save = new Intent(Intent.ACTION_CREATE_DOCUMENT);
                save.addCategory(Intent.CATEGORY_OPENABLE);
                save.setType(mime != null && (mime.equals("application/json") || mime.equals("text/plain"))
                    ? mime : "application/json");
                save.putExtra(Intent.EXTRA_TITLE, safeName(name, "liga-znaniy-backup.json"));
                try { startActivityForResult(save, REQUEST_SAVE_FILE); }
                catch (Exception e) { pendingContent = null; Toast.makeText(MainActivity.this,
                    "Не удалось открыть сохранение файла", Toast.LENGTH_LONG).show(); }
            });
        }

        @JavascriptInterface public void openPdfReport(String html, String title) {
            if (html == null || html.length() > 5_000_000) return;
            runOnUiThread(() -> printDocument(html, title));
        }

        // План и напоминания управляются веб-приложением; Android не меняет localStorage.
        @JavascriptInterface public void updatePlan(String planJson) { }
    }

    private static String safeName(String name, String fallback) {
        if (name == null || name.trim().isEmpty()) return fallback;
        String cleaned = name.replaceAll("[\\\\/:*?\"<>|]", "_").trim();
        return cleaned.isEmpty() ? fallback : cleaned.substring(0, Math.min(cleaned.length(), 100));
    }

    private void printDocument(String html, String title) {
        if (printView != null) { root.removeView(printView); printView.destroy(); }
        printView = new WebView(this);
        printView.setBackgroundColor(Color.WHITE);
        printView.setAlpha(0.01f);
        root.addView(printView, 0, new FrameLayout.LayoutParams(-1, -1));
        final WebView printSource = printView;
        printSource.setWebViewClient(new WebViewClient() {
            @Override public void onPageFinished(WebView view, String url) {
                PrintManager pm = (PrintManager) getSystemService(Context.PRINT_SERVICE);
                if (pm == null) return;
                PrintDocumentAdapter adapter = printSource.createPrintDocumentAdapter(
                    safeName(title, "Лига знаний — отчёт"));
                pm.print("Лига знаний — устный счёт", adapter, null);
            }
        });
        printSource.loadDataWithBaseURL(APP_ORIGIN + "/app/", html, "text/html", "UTF-8", null);
    }

    @Override protected void onActivityResult(int requestCode, int resultCode, Intent data) {
        super.onActivityResult(requestCode, resultCode, data);
        if (requestCode == REQUEST_OPEN_FILE) {
            if (fileCallback != null) {
                fileCallback.onReceiveValue(WebChromeClient.FileChooserParams.parseResult(resultCode, data));
                fileCallback = null;
            }
        } else if (requestCode == REQUEST_SAVE_FILE) {
            if (resultCode == RESULT_OK && data != null && data.getData() != null && pendingContent != null) {
                try (OutputStream out = getContentResolver().openOutputStream(data.getData())) {
                    if (out != null) {
                        out.write(pendingContent.getBytes(StandardCharsets.UTF_8));
                        Toast.makeText(this, "Файл сохранён", Toast.LENGTH_SHORT).show();
                    }
                } catch (Exception e) {
                    Toast.makeText(this, "Ошибка сохранения файла", Toast.LENGTH_LONG).show();
                }
            }
            pendingContent = null;
        }
    }

    private void checkForUpdates() {
        int current = Math.max(BUILT_IN_BUILD, getSharedPreferences("web", MODE_PRIVATE).getInt("build", 0));
        try {
            byte[] meta = fetch(UPDATES + "android-version.json", 20_000);
            JSONObject m = new JSONObject(new String(meta, StandardCharsets.UTF_8));
            int available = m.getInt("build");
            if (available <= current) return;
            String file = m.getString("file");
            if (!file.matches("v[0-9]+-[0-9]+\\.html")) return;
            byte[] html = fetch(UPDATES + file, 15_000_000);
            String body = new String(html, StandardCharsets.UTF_8);
            if (html.length < 200_000 || !body.contains("id=\"page-topics\"") ||
                !body.contains("id=\"page-stats\"") || !body.contains("id=\"page-plan\"") ||
                !body.contains("</html>")) return;

            File temp = new File(getFilesDir(), "web-app-download.tmp");
            File target = new File(getFilesDir(), "current-web-app.html");
            try (FileOutputStream output = new FileOutputStream(temp)) { output.write(html); output.getFD().sync(); }
            if (!temp.renameTo(target)) {
                try (FileInputStream in = new FileInputStream(temp);
                     FileOutputStream out = new FileOutputStream(target)) {
                    byte[] buffer = new byte[8192]; int n;
                    while ((n = in.read(buffer)) != -1) out.write(buffer, 0, n);
                    out.getFD().sync();
                }
                temp.delete();
            }
            getSharedPreferences("web", MODE_PRIVATE).edit().putInt("build", available).apply();
            runOnUiThread(() -> Toast.makeText(this,
                "Обновление " + m.optString("version") + " загружено. Откройте приложение снова для установки.",
                Toast.LENGTH_LONG).show());
        } catch (Exception ignored) {
            // При отсутствии интернета всегда остаётся доступна последняя рабочая версия.
        }
    }

    private static byte[] fetch(String url, int maxBytes) throws Exception {
        HttpURLConnection connection = (HttpURLConnection) new URL(url).openConnection();
        connection.setConnectTimeout(7500);
        connection.setReadTimeout(12000);
        connection.setInstanceFollowRedirects(false);
        connection.setRequestProperty("User-Agent", "LigaZnaniy-MentalMath-Android/5.9");
        try {
            if (connection.getResponseCode() != HttpURLConnection.HTTP_OK) throw new Exception("HTTP");
            try (InputStream in = connection.getInputStream(); ByteArrayOutputStream out = new ByteArrayOutputStream()) {
                byte[] buf = new byte[16384]; int n;
                while ((n = in.read(buf)) != -1) {
                    if (out.size() + n > maxBytes) throw new Exception("File too large");
                    out.write(buf, 0, n);
                }
                return out.toByteArray();
            }
        } finally { connection.disconnect(); }
    }

    @Override public void onBackPressed() {
        if (webView != null && webView.canGoBack()) webView.goBack();
        else super.onBackPressed();
    }

    @Override protected void onDestroy() {
        if (fileCallback != null) fileCallback.onReceiveValue(null);
        if (printView != null) { root.removeView(printView); printView.destroy(); }
        if (webView != null) { root.removeView(webView); webView.destroy(); }
        super.onDestroy();
    }
}
