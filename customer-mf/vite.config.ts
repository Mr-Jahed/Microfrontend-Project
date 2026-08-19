import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { federation } from "@module-federation/vite";

export default defineConfig({
  plugins: [
    react({
      reactRefreshHost: "http://localhost:3000",
    }),

    federation({
      name: "customer_mf",

      filename: "remoteEntry.js",

      exposes: {
        "./CustomerApp": "./src/CustomerApp.tsx",
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
    port: 3001,
  },

  preview: {
    port: 3001,
  },

  build: {
    target: "esnext",
  },
});
