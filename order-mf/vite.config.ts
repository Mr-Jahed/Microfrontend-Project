import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { federation } from "@module-federation/vite";

export default defineConfig({
  plugins: [
    react({
      reactRefreshHost: "http://localhost:3000",
    }),

    federation({
      name: "order_mf",

      filename: "remoteEntry.js",

      exposes: {
        "./OrderApp": "./src/OrderApp.tsx",
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
    port: 3002,
  },

  preview: {
    port: 3002,
  },

  build: {
    target: "esnext",
  },
});
