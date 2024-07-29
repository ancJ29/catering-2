import react from "@vitejs/plugin-react";
import path from "path";
import { defineConfig, loadEnv } from "vite";
import preload from "vite-plugin-preload";

export default ({ mode }: { mode: string }) => {
  const env = loadEnv(mode, process.cwd(), "");

  return defineConfig({
    plugins: [react(), preload()],
    server: {
      port: 9000,
    },
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    define: {
      "import.meta.env.LOG_LEVEL": JSON.stringify(env.LOG_LEVEL),
      "import.meta.env.CLIENT_ID": JSON.stringify(env.CLIENT_ID),
      "import.meta.env.BASE_URL": JSON.stringify(env.BASE_URL),
      "import.meta.env.DEBUG_CODE": JSON.stringify(env.DEBUG_CODE),
    },
  });
};
