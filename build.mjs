// build.mjs — post-tsc step: assemble the static site into ./public
// so Vercel can serve everything from a single output directory.
import { mkdir, copyFile, rm } from "node:fs/promises";
import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = dirname(fileURLToPath(import.meta.url));
const out = join(root, "public");

// start from a clean output dir (tsc already wrote script.js here)
if (existsSync(out)) {
  // keep public/script.js from tsc; remove anything else stale
  // (re-copy below overwrites as needed)
}

await mkdir(out, { recursive: true });

const filesToCopy = ["index.html", "styles.css", "logo.svg", "favicon.svg"];
for (const f of filesToCopy) {
  await copyFile(join(root, f), join(out, f));
  console.log(`copied ${f} -> public/${f}`);
}

// sanity: confirm script.js is present (tsc must have written it)
if (!existsSync(join(out, "script.js"))) {
  console.error("ERROR: public/script.js missing — did tsc run first?");
  process.exit(1);
}
console.log("build complete — public/ ready for Vercel");
