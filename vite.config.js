/* eslint-disable no-undef */
import { defineConfig, loadEnv } from "vite";
import { ElementPlusResolver } from "unplugin-vue-components/resolvers";
import { resolve } from "path";
import { VitePWA } from "vite-plugin-pwa";
import vue from "@vitejs/plugin-vue";
import AutoImport from "unplugin-auto-import/vite";
import Components from "unplugin-vue-components/vite";
import viteCompression from "vite-plugin-compression";

// https://vitejs.dev/config/
export default ({ mode }) =>
  defineConfig({
    plugins: [
      vue(),
      AutoImport({
        imports: ["vue"],
        resolvers: [ElementPlusResolver()],
      }),
      Components({
        resolvers: [ElementPlusResolver()],
      }),
      VitePWA({
        registerType: "autoUpdate",
        workbox: {
          skipWaiting: true,
          clientsClaim: true,
          // SPA 单页路由回退到 index.html
          navigateFallback: "/index.html",
          // 以下路径不走 SPA 回退，交给 nginx 处理（避免破坏其他 location 映射）
          // 仅 dist 内的真实静态目录（home-page-assets / home-page-font / home-page-images）及带后缀的文件被排除，
          // 其余 navigation 请求仍回退到 index.html 由前端路由处理
          navigateFallbackDenylist: [
            /^\/home-page-assets\//, // 构建产物静态资源
            /^\/home-page-font\//, // 字体文件
            /^\/home-page-images\//, // 图片资源
            /^\/assets\//, // nginx 原有的 assets 目录映射（非本应用，交给 nginx）
            // 含文件后缀的请求（如 .xml / .txt / .html / .webmanifest 等静态文件）
            /\/[^/?]+\.[^/]+$/,
          ],
          runtimeCaching: [
            {
              // 仅缓存本应用自己的 js / css / 字体（限定在 home-page-* 目录），
              // 避免拦截 nginx 其他路径下的同类资源
              urlPattern: /\/home-page-(assets|font)\/.*\.(js|css|woff2|woff|ttf)$/,
              handler: "CacheFirst",
              options: {
                cacheName: "js-css-cache",
              },
            },
            {
              // 仅缓存本应用自己的图片（限定在 home-page-images 目录）
              urlPattern:
                /\/home-page-(assets|images)\/.*\.(png|jpe?g|svg|gif|bmp|psd|tiff|tga|eps)$/,
              handler: "CacheFirst",
              options: {
                cacheName: "image-cache",
              },
            },
          ],
        },
        manifest: {
          name: loadEnv(mode, process.cwd()).VITE_SITE_NAME,
          short_name: loadEnv(mode, process.cwd()).VITE_SITE_NAME,
          description: loadEnv(mode, process.cwd()).VITE_SITE_DES,
          display: "standalone",
          start_url: "/",
          theme_color: "#424242",
          background_color: "#424242",
          icons: [
            {
              src: "/home-page-images/icon/48.png",
              sizes: "48x48",
              type: "image/png",
            },
            {
              src: "/home-page-images/icon/72.png",
              sizes: "72x72",
              type: "image/png",
            },
            {
              src: "/home-page-images/icon/96.png",
              sizes: "96x96",
              type: "image/png",
            },
            {
              src: "/home-page-images/icon/128.png",
              sizes: "128x128",
              type: "image/png",
            },
            {
              src: "/home-page-images/icon/144.png",
              sizes: "144x144",
              type: "image/png",
            },
            {
              src: "/home-page-images/icon/192.png",
              sizes: "192x192",
              type: "image/png",
            },
            {
              src: "/home-page-images/icon/512.png",
              sizes: "512x512",
              type: "image/png",
            },
          ],
        },
      }),
      viteCompression(),
    ],
    server: {
      port: "3000",
      open: true,
    },
    resolve: {
      alias: [
        {
          find: "@",
          replacement: resolve(__dirname, "src"),
        },
      ],
    },
    css: {
      preprocessorOptions: {
        scss: {
          api: "modern",
          additionalData: `@use "./src/style/global.scss" as *;`,
          silenceDeprecations: ["legacy-js-api"],
        },
      },
    },
    build: {
      // 构建产物静态资源目录，加 home-page 前缀
      assetsDir: "home-page-assets",
      minify: "terser",
      terserOptions: {
        compress: {
          pure_funcs: ["console.log"],
        },
      },
    },
  });
