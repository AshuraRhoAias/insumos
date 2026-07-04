import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Config recomendada por Tauri: puerto fijo, no limpiar pantalla en errores,
// e ignorar cambios dentro de src-tauri para que el watcher no se dispare solo.
export default defineConfig({
  plugins: [react()],
  clearScreen: false,
  server: {
    port: 1420,
    strictPort: true,
    watch: {
      ignored: ["**/src-tauri/**"],
    },
  },
});
