import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'io.ionic.starter',
  appName: 'face recognition',
  webDir: 'www',
  server: {
    androidScheme: 'http',
    "allowNavigation": ["51.20.121.181:5000","ec2-51-20-121-181.eu-north-1.compute.amazonaws.com:5000"]
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 3000,
      launchAutoHide: true,
      launchFadeOutDuration: 3000,
      androidSplashResourceName: "splash",
      androidScaleType: "CENTER_CROP",
      showSpinner: true,
      androidSpinnerStyle: "large",
      iosSpinnerStyle: "small",
      //spinnerColor: "#999999",
      splashFullScreen: true,
      splashImmersive: true,
      useDialog: true,
    },
  },
};

export default config;
