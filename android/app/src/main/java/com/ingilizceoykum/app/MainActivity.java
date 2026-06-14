package com.ingilizceoykum.app;

import android.os.Bundle;
import android.webkit.WebSettings;
import android.view.View;
import android.os.Build;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        
        // Restore default WebView caching to ensure high performance loading from local assets
        if (this.bridge != null && this.bridge.getWebView() != null) {
            this.bridge.getWebView().getSettings().setCacheMode(WebSettings.LOAD_DEFAULT);
            
            // Disable Android Autofill on the WebView to prevent password/autofill popups and keyboard toolbar icons
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                this.bridge.getWebView().setImportantForAutofill(View.IMPORTANT_FOR_AUTOFILL_NO_EXCLUDE_DESCENDANTS);
            }
        }
    }
}
