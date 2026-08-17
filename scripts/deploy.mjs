import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { execFile } from "node:child_process";
import { promisify } from "node:util";

const exec = promisify(execFile);
const root = process.cwd();
const siteConfigPath = resolve(root, "dist/server/wrangler.json");
const siteConfig = JSON.parse(await readFile(siteConfigPath, "utf8"));
for (const database of siteConfig.d1_databases ?? []) delete database.preview_database_id;
for (const namespace of siteConfig.kv_namespaces ?? []) delete namespace.preview_id;
delete siteConfig.previews;
await writeFile(siteConfigPath, `${JSON.stringify(siteConfig)}\n`);

await exec("npx", ["wrangler", "deploy", "--config", siteConfigPath], { cwd: root, stdio: "inherit" });
await exec("npx", ["wrangler", "deploy", "--config", resolve(root, "wrangler.email.jsonc")], { cwd: root, stdio: "inherit" });
