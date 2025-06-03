import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
    plugins: [react(), tailwindcss()],
    resolve: {
        alias: {
            "@": path.resolve("./src"),
        },
    },
    server: {
        port: 3000,
    },
    build: {
        outDir: "build",
    },
});
