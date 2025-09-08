import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  define: {
    "process.env.NODE_ENV": JSON.stringify(mode), // or "production"
  },
  plugins: [react(), mode === "development" ? componentTagger() : null].filter(
    Boolean
  ),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    cssCodeSplit: true,
    lib: {
      entry: path.resolve(__dirname, "src/widget-entry.tsx"),
      name: "GlobalChatWidget",
      fileName: (fmt) => `global-chat-widget.${fmt}.js`,
      formats: ["umd"],
    },
    rollupOptions: {
      // Remove externals to bundle React and ReactDOM
      // external: ["react", "react-dom"],
      output: {
        // Remove globals mapping
        // globals: { react: "React", "react-dom": "ReactDOM" },
        assetFileNames: (assetInfo) => {
          if (assetInfo.name && assetInfo.name.endsWith(".css")) {
            return "global-chat-widget.css";
          }
          return "assets/[name][extname]";
        },
      },
    },
  },
}));
