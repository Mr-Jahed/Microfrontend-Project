import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { federation } from "@module-federation/vite";

export default defineConfig({
  plugins: [
    react({
      reactRefreshHost: "http://localhost:3000",
    }),

    federation({
      name: "report_mf",

      filename: "remoteEntry.js",

      exposes: {
        "./ReportApp": "./src/ReportApp.tsx",
      },

      shared: {
        react: {
          singleton: true,
        },
        "react-dom": {
          singleton: true,
        },
      },
    }),
  ],

  server: {
    port: 3003,
  },

  preview: {
    port: 3003,
  },

  build: {
    target: "esnext",
  },
});
