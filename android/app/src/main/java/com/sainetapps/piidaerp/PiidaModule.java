package com.sainetapps.piidaerp;

import static android.provider.Settings.System.getString;

import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.Callback;
//import com.paymentsway.sdk.MobilePaymentsSdk;

public class PiidaModule extends ReactContextBaseJavaModule {
  //private MobilePaymentsSdk mobilePaymentsSdk;

  public PiidaModule(ReactApplicationContext reactContext) {
    super(reactContext);
  }

  @Override
  public String getName() {
		return "Piida";
  }

  @ReactMethod
  public void initSDK() {
    //mobilePaymentsSdk = MobilePaymentsSdk.Companion.builder(getCurrentActivity(), "MDExMDc3NGUyNGQwZTc4YmQxYjIyZjNjNWZlY2VjMDMyZTJlNzQ1NjYyYTRmOWVhYjdmZDBmNTZjNGY1ZmU2NzJlMWYzYTJmNjBhZjQ1ZTRmMjZmYzllZDczZTVhNjQ0MTk3NWZmZWRkYzNkZGMzOGRmM2UzYTJhOGRmODNmYTM=")
    //  .build();
  }

  @ReactMethod
  public void startApConfiguration(String deviceSsid, Callback successCallback, Callback errorCallback) {
    if (deviceSsid.isEmpty()) {
      errorCallback.invoke("One or more parameters are empty");
      return;
    }

    successCallback.invoke(deviceSsid);
  }
}
