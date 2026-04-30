import { defineConfig, type Plugin } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";
import fs from "fs";
import { exec } from "child_process";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";

function staleChunksWarnerPlugin(): Plugin {
  return {
    name: "stale-chunks-warner",
    configureServer(server) {
      const blogDir = path.resolve(import.meta.dirname, "src/data/blog");
      const postsDataPath = path.join(blogDir, "postsData.ts");

      try {
        const postsDataContent = fs.readFileSync(postsDataPath, "utf-8");
        const postsDataCount = (postsDataContent.match(/^\s+id:\s+\d+,/gm) ?? []).length;
        const postsDataMtime = fs.statSync(postsDataPath).mtimeMs;

        const chunkFiles = fs.readdirSync(blogDir).filter((f) => /^postsChunk\d+\.ts$/.test(f));
        let chunkTotal = 0;
        let newestChunkMtime = 0;
        for (const file of chunkFiles) {
          const filePath = path.join(blogDir, file);
          const content = fs.readFileSync(filePath, "utf-8");
          chunkTotal += (content.match(/^\s+"id":\s+\d+,/gm) ?? []).length;
          const mtime = fs.statSync(filePath).mtimeMs;
          if (mtime > newestChunkMtime) newestChunkMtime = mtime;
        }

        const countMismatch = postsDataCount !== chunkTotal;
        const postsDataNewer = newestChunkMtime > 0 && postsDataMtime > newestChunkMtime;

        if (countMismatch || postsDataNewer) {
          const reason = countMismatch
            ? `postsData.ts has ${postsDataCount} post(s), but the chunk files contain ${chunkTotal} post(s)`
            : `postsData.ts was modified after the chunk files were last generated`;
          server.config.logger.warn(
            `\n⚠️  [stale-chunks-warner] Blog chunk files appear to be out of date.\n` +
            `   ${reason}.\n` +
            `   Run the following command to regenerate the chunk files:\n\n` +
            `     pnpm --filter @workspace/universitio run split-posts\n`,
            { timestamp: true }
          );
        }
      } catch (err) {
        server.config.logger.warn(
          `[stale-chunks-warner] Could not check chunk freshness: ${(err as Error).message}`,
          { timestamp: true }
        );
      }
    },
  };
}

function homePostsWatcherPlugin(): Plugin {
  return {
    name: "home-posts-watcher",
    configureServer(server) {
      const chunksDir = path.resolve(import.meta.dirname, "src/data/blog");
      server.watcher.add(path.join(chunksDir, "postsChunk*.ts"));
      server.watcher.on("change", (file) => {
        if (/postsChunk\d+\.ts$/.test(file)) {
          exec(
            "tsx scripts/generate-home-posts.ts",
            { cwd: import.meta.dirname },
            (err, stdout, stderr) => {
              if (err) {
                server.config.logger.error(
                  `[home-posts-watcher] Failed to regenerate homePostsData:\n${stderr}`
                );
              } else {
                server.config.logger.info(
                  `[home-posts-watcher] ${stdout.trim()}`,
                  { timestamp: true }
                );
              }
            }
          );
        }
      });
    },
  };
}

const isBuild = process.argv.includes("build");

const rawPort = process.env.PORT;
if (!rawPort && !isBuild) {
  throw new Error(
    "PORT environment variable is required but was not provided.",
  );
}
const port = Number(rawPort ?? "80");
if ((!isBuild) && (Number.isNaN(port) || port <= 0)) {
  throw new Error(`Invalid PORT value: "${rawPort}"`);
}

const basePath = process.env.BASE_PATH ?? (isBuild ? "/" : undefined);
if (!basePath) {
  throw new Error(
    "BASE_PATH environment variable is required but was not provided.",
  );
}

export default defineConfig({
  base: basePath,
  plugins: [
    react(),
    tailwindcss(),
    runtimeErrorOverlay(),
    staleChunksWarnerPlugin(),
    homePostsWatcherPlugin(),
    ...(process.env.NODE_ENV !== "production" &&
    process.env.REPL_ID !== undefined
      ? [
          await import("@replit/vite-plugin-cartographer").then((m) =>
            m.cartographer({
              root: path.resolve(import.meta.dirname, ".."),
            }),
          ),
          await import("@replit/vite-plugin-dev-banner").then((m) =>
            m.devBanner(),
          ),
        ]
      : []),
  ],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "src"),
      "@assets": path.resolve(import.meta.dirname, "..", "..", "attached_assets"),
    },
    dedupe: ["react", "react-dom"],
  },
  root: path.resolve(import.meta.dirname),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true,
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks(id) {
          const chunkMatch = id.match(/postsChunk(\d+)/);
          if (chunkMatch) return `blog-posts-${chunkMatch[1]}`;
          if (id.includes("node_modules/react-dom") || id.includes("node_modules/react/")) return "vendor-react";
          if (id.includes("node_modules/framer-motion")) return "vendor-motion";
          if (id.includes("node_modules/@tanstack/react-query")) return "vendor-query";
          if (id.includes("node_modules/react-markdown") || id.includes("node_modules/remark") || id.includes("node_modules/rehype") || id.includes("node_modules/unified") || id.includes("node_modules/mdast") || id.includes("node_modules/hast")) return "vendor-markdown";
          if (id.includes("node_modules/lucide-react")) return "vendor-icons";
          if (id.includes("node_modules/@radix-ui")) return "vendor-radix";
          if (id.includes("node_modules/embla-carousel")) return "vendor-carousel";
          if (id.includes("node_modules/date-fns")) return "vendor-dates";
          if (id.includes("node_modules/@stripe") || id.includes("node_modules/stripe")) return "vendor-stripe";
        },
      },
    },
  },
  server: {
    port,
    host: "0.0.0.0",
    allowedHosts: true,
    fs: {
      strict: true,
      deny: ["**/.*"],
    },
    proxy: {
      "/api": {
        target: "http://localhost:8080",
        changeOrigin: true,
      },
    },
  },
  preview: {
    port,
    host: "0.0.0.0",
    allowedHosts: true,
  },
});
