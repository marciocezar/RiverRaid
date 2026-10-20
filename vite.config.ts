import { defineConfig } from "vite";
import { viteSingleFile } from "vite-plugin-singlefile";

// Um único index.html com o JavaScript embutido: funciona por duplo clique (file://)
// e em qualquer servidor estático, sem caminhos absolutos.
export default defineConfig({
  base: "./",
  plugins: [viteSingleFile()],
  build: {
    outDir: "builds/web",
    emptyOutDir: true,
  },
});
