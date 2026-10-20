import type { CapacitorConfig } from "@capacitor/cli";

// Builds mobile: o Vite gera o HTML em builds/mobile e o Capacitor copia para o app nativo.
const config: CapacitorConfig = {
  appId: "dev.mrc.riverraid",
  appName: "River Raid",
  webDir: "builds/mobile",
  ios: {
    contentInset: "never",
  },
};

export default config;
