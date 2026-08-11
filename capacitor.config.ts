import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.vibra.music",
  appName: "VIBRA",
  webDir: "out",
  server: {
    androidScheme: "https",
  },
};

export default config;
