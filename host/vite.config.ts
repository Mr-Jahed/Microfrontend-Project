import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { federation } from "@module-federation/vite";

export default defineConfig({
  plugins: [
    react(),

    federation({
      name: "host",

      remotes: {
        customer_mf: {
          type: "module",
          name: "customer_mf",
          entry: "http://localhost:3001/remoteEntry.js",
          entryGlobalName: "customer_mf",
        },
        order_mf: {
          type: "module",
          name: "order_mf",
          entry: "http://localhost:3002/remoteEntry.js",
          entryGlobalName: "order_mf",
        },
        report_mf: {
          type: "module",
          name: "report_mf",
          entry: "http://localhost:3003/remoteEntry.js",
          entryGlobalName: "report_mf",
        },
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
    port: 3000,
  },

  preview: {
    port: 3000,
  },

  build: {
    target: "esnext",
  },
});
