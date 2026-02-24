import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.nexa.ai',
  appName: 'Nexa AI',
  webDir: 'dist',
  server: {
    url: 'https://nexa-ai.dev/',
    cleartext: true
  }
};

export default config;
