#!/usr/bin/env node
/**
 * 部署脚本：将已构建的 dist 上传到 tx-sh 服务器
 * 用法：
 *   node deploy.js     或     pnpm deploy
 *
 * 注意：构建请先单独执行 `pnpm build`，本脚本只负责上传。
 */

import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

// ---- 配置 ----
const SSH_HOST = "tx-sh"; // ~/.ssh/config 中的 Host 简称
const REMOTE_DIR = "/data/nginx/html/home-page"; // 服务器目标目录
const DIST_DIR = "../dist"; // 本地构建产物目录

// ---- 进入脚本所在目录 ----
const __dirname = dirname(fileURLToPath(import.meta.url));
process.chdir(__dirname);

/** 执行命令并继承输出，失败则退出 */
function run(command, args) {
  console.log(`==> ${command} ${args.join(" ")}`);
  const result = spawnSync(command, args, { stdio: "inherit", shell: false });
  if (result.error) {
    console.error(`错误：无法执行 ${command} -> ${result.error.message}`);
    process.exit(1);
  }
  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

// ---- 校验 dist ----
if (!existsSync(resolve(__dirname, DIST_DIR))) {
  console.error(`错误：未找到 ${DIST_DIR} 目录，请先执行 pnpm build。`);
  process.exit(1);
}

// ---- 确保远程目录存在 ----
console.log(`==> 确保远程目录存在：${REMOTE_DIR}`);
run("ssh", [SSH_HOST, `mkdir -p '${REMOTE_DIR}'`]);

// ---- 上传（--delete 会清理远程多余文件，保持与本地一致）----
console.log(`==> 上传 ${DIST_DIR}/ 到 ${SSH_HOST}:${REMOTE_DIR} ...`);
run("rsync", ["-avz", "--delete", `${DIST_DIR}/`, `${SSH_HOST}:${REMOTE_DIR}/`]);

console.log("==> 部署完成 ✅");
