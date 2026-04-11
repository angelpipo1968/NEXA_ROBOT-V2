import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.nexa.ai',
  appName: 'Nexa AI',
  webDir: 'dist',
  // Remove server.url so the app uses the bundled dist/ files locally
  // This ensures the app works offline and without network dependency at startup
  android: {
    allowMixedContent: true,
    captureInput: true,
    webContentsDebuggingEnabled: false, // set to true when debugging
  },
  plugins: {
    CapacitorHttp: {
      enabled: true,
    },
    SplashScreen: {
      launchShowDuration: 2000,
      launchAutoHide: true,
      backgroundColor: '#030305',
      androidSplashResourceName: 'splash',
      showSpinner: false,
    },
    Keyboard: {
      resize: 'body' as any,
      style: 'dark' as any,
      resizeOnFullScreen: true,
    },
  },
};

export default config;
