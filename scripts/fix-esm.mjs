import { promises as fs } from "fs";
import path from "path";

const distDir = path.resolve("./dist");

const candidateExtensions = [".js", ".mjs", ".cjs", ".json", ".node"];

async function pathExists(filePath) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

function normalizeSpec(spec) {
  return spec.replace(/\\/g, "/");
}

function needsRewrite(spec) {
  const normalized = normalizeSpec(spec);
  const { ext } = path.posix.parse(normalized);
  return ext === "";
}

async function resolveReplacement(spec, filePath) {
  if (!spec.startsWith(".")) {
    return spec;
  }

  if (!needsRewrite(spec)) {
    return spec;
  }

  const fileDir = path.dirname(filePath);
  const absoluteBase = path.resolve(fileDir, spec);

  for (const ext of candidateExtensions) {
    const fsTarget = `${absoluteBase}${ext}`;
    if (await pathExists(fsTarget)) {
      return normalizeSpec(`${spec}${ext}`);
    }
  }

  const indexCandidates = ["index.js", "index.mjs", "index.cjs"];
  for (const indexFile of indexCandidates) {
    const fsTarget = path.join(absoluteBase, indexFile);
    if (await pathExists(fsTarget)) {
      const prefix = spec.endsWith("/") ? spec : `${spec}/`;
      return normalizeSpec(`${prefix}${indexFile}`);
    }
  }

  return spec;
}

async function processFile(filePath) {
  let content = await fs.readFile(filePath, "utf8");
  let changed = false;

  const patterns = [
    /(from\s+)(['"])(\.{1,2}\/[^'"`]+)(\2)/g,
    /(import\s+)(['"])(\.{1,2}\/[^'"`]+)(\2)/g,
    /(import\s*\()(\s*['"])(\.{1,2}\/[^'"`]+)(['"]\s*\))/g,
  ];

  for (const pattern of patterns) {
    const matches = Array.from(content.matchAll(pattern));
    if (matches.length === 0) continue;

    let cursor = 0;
    let updated = "";

    for (const match of matches) {
      const [full, prefix, quotePart, spec, suffix] = match;
      const start = match.index ?? 0;
      updated += content.slice(cursor, start);
      const replacementSpec = await resolveReplacement(spec, filePath);
      if (replacementSpec !== spec) {
        changed = true;
      }
      updated += `${prefix}${quotePart}${replacementSpec}${suffix}`;
      cursor = start + full.length;
    }

    updated += content.slice(cursor);
    content = updated;
  }

  if (changed) {
    await fs.writeFile(filePath, content, "utf8");
  }
}

async function collectFiles(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...await collectFiles(fullPath));
    } else if (entry.isFile() && (entry.name.endsWith(".js") || entry.name.endsWith(".d.ts"))) {
      files.push(fullPath);
    }
  }
  return files;
}

async function main() {
  const exists = await pathExists(distDir);
  if (!exists) {
    console.error("dist directory not found. Run the TypeScript build first.");
    process.exit(1);
  }

  const files = await collectFiles(distDir);
  for (const file of files) {
    await processFile(file);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
