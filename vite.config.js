import { defineConfig } from "vite";
import { resolve } from "node:path";

const pages = [
  "index.html",
  "about.html",
  "project-1.html",
  "project-2.html",
  "project-3.html",
  "project-4.html",
  "project-5.html",
  "project-6.html",
  "project-7.html",
  "project-8.html",
];

const input = Object.fromEntries(
  pages.map((file) => [file.replace(".html", ""), resolve(__dirname, file)])
);

export default defineConfig({
  appType: "mpa",
  publicDir: "public",
  build: {
    outDir: "dist",
    assetsInlineLimit: 0,
    rollupOptions: { input },
  },
});
