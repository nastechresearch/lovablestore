import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "co.za.lovablestore.app",
  appName: "Lovable Store",
  webDir: "public",
  server: {
    url: process.env.CAPACITOR_SERVER_URL || "https://lovablestorex.vercel.app",
    cleartext: false,
  },
  android: {
    allowMixedContent: false,
    backgroundColor: "#f8f3eb",
  },
  ios: {
    contentInset: "always",
    backgroundColor: "#f8f3eb",
  },
};

export default config;
