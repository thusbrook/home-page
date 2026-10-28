#!/usr/bin/env node

import { spawnSync } from "node:child_process";
import { statSync } from "node:fs";
import { fileURLToPath } from "node:url";

const WEBDAV_URL = "https://webdav.thusrock.com/home-page/";
const DIST_DIR = fileURLToPath(new URL("../dist/", import.meta.url));

function run(command, args, options = {}) {
  const result = spawnSync(command, args, { stdio: "inherit", ...options, shell: false });
  if (result.error) {
    throw new Error(`无法执行 ${command}：${result.error.message}`);
  }
  if (result.status !== 0) {
    throw new Error(
      `${command} 执行失败（${result.signal ?? result.status}）${result.stderr ? `：${result.stderr.trim()}` : ""}`,
    );
  }
  return result.stdout;
}

function deploy() {
  if (process.platform !== "darwin") {
    throw new Error("此脚本仅支持 macOS Finder 挂载的 WebDAV 网络磁盘。");
  }

  const dist = statSync(DIST_DIR, { throwIfNoEntry: false });
  if (!dist?.isDirectory()) {
    throw new Error("未找到 dist 构建目录，请先执行 pnpm build。");
  }
  const index = statSync(new URL("../dist/index.html", import.meta.url), {
    throwIfNoEntry: false,
  });
  if (!index?.isFile()) {
    throw new Error("dist/index.html 不存在或不是文件，请重新执行 pnpm build。");
  }

  const mounts = run("mount", ["-t", "webdav"], { encoding: "utf8", stdio: "pipe" });
  const destinations = mounts
    .split("\n")
    .map((line) => line.match(/^(.+) on (.+) \(webdav(?:,|\))/))
    .filter((match) => match && `${match[1].replace(/\/+$/, "")}/` === WEBDAV_URL)
    .map((match) => match[2]);

  if (destinations.length !== 1) {
    throw new Error(
      destinations.length === 0
        ? `未找到目标 WebDAV 挂载。请在 Finder 中按 Command+K 连接 ${WEBDAV_URL}，然后重试。`
        : "目标 WebDAV 被挂载了多次，请在 Finder 中仅保留一个连接后重试。",
    );
  }

  const destination = destinations[0];
  if (!statSync(destination).isDirectory()) {
    throw new Error(`WebDAV 挂载点不是目录：${destination}`);
  }

  console.log(`==> 复制 ${DIST_DIR} 到 ${destination}/`);
  // Finder WebDAV 可能不支持临时文件重命名，直接写入目标文件。
  run("rsync", [
    "-rv",
    "--checksum",
    "--inplace",
    "--exclude=.DS_Store",
    "--exclude=._*",
    "--",
    DIST_DIR,
    `${destination}/`,
  ]);
  console.log("==> WebDAV 复制完成。");
}

try {
  deploy();
} catch (error) {
  console.error(`错误：${error.message}`);
  process.exitCode = 1;
}
