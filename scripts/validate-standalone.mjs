import { readFile, readdir, stat } from "node:fs/promises";
import path from "node:path";

const outputDir = path.resolve("dist");
const htmlPath = path.join(outputDir, "index.html");

function fail(message) {
  console.error(`Standalone artifact validation failed: ${message}`);
  process.exitCode = 1;
}

let html;
try {
  const fileStat = await stat(htmlPath);
  if (!fileStat.isFile() || fileStat.size === 0) {
    fail("dist/index.html is missing or empty.");
    process.exit();
  }
  html = await readFile(htmlPath, "utf8");
} catch {
  fail("dist/index.html does not exist.");
  process.exit();
}

const outputFiles = await readdir(outputDir, { withFileTypes: true });
if (outputFiles.length !== 1 || outputFiles[0].name !== "index.html" || !outputFiles[0].isFile()) {
  fail("dist must contain exactly one file: index.html.");
}

const scriptBlocks = [...html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)];
if (!scriptBlocks.some(([, , content]) => content.trim().length > 0)) {
  fail("No embedded JavaScript was found.");
}
const styleBlocks = [...html.matchAll(/<style\b[^>]*>([\s\S]*?)<\/style>/gi)];
if (!styleBlocks.some(([, content]) => content.trim().length > 0)) {
  fail("No embedded CSS was found.");
}

const runtimeTags = html.match(/<(?:script|link|img|source|video|audio|iframe|object|embed)\b[^>]*>/gi) ?? [];
const runtimeAttributes = /\b(src|href|data)\s*=\s*(["'])(.*?)\2/gi;
for (const tag of runtimeTags) {
  const isLinkStylesheet = /^<link\b/i.test(tag) && /\brel\s*=\s*(["'])?stylesheet\1?/i.test(tag);
  const isScript = /^<script\b/i.test(tag);
  const isAssetTag = /^<(?:img|source|video|audio|iframe|object|embed)\b/i.test(tag);
  if (!isLinkStylesheet && !isScript && !isAssetTag) continue;

  for (const match of tag.matchAll(runtimeAttributes)) {
    const attribute = match[1].toLowerCase();
    const value = match[3].trim();
    const resourceAttribute = isScript ? attribute === "src" : isLinkStylesheet ? attribute === "href" : ["src", "data"].includes(attribute);
    if (!resourceAttribute || !value) continue;
    if (/^(?:https?:)?\/\//i.test(value)) fail(`External runtime resource remains: ${value}`);
    else if (!/^(?:data:|#|blob:)/i.test(value)) fail(`Local runtime resource remains: ${value}`);
  }
}

function cssUrlValues(css) {
  const values = [];
  const urlStart = /url\s*\(/gi;
  let match;

  while ((match = urlStart.exec(css)) !== null) {
    let index = urlStart.lastIndex;
    let depth = 1;
    let quote = null;
    let escaped = false;

    for (; index < css.length; index += 1) {
      const character = css[index];
      if (escaped) {
        escaped = false;
        continue;
      }
      if (character === "\\") {
        escaped = true;
        continue;
      }
      if (quote) {
        if (character === quote) quote = null;
        continue;
      }
      if (character === "'" || character === '"') {
        quote = character;
      } else if (character === "(") {
        depth += 1;
      } else if (character === ")" && --depth === 0) {
        values.push(css.slice(urlStart.lastIndex, index).trim().replace(/^(["'])(.*)\1$/, "$2"));
        urlStart.lastIndex = index + 1;
        break;
      }
    }

    if (depth !== 0) {
      fail("A CSS url() value is not closed.");
      break;
    }
  }

  return values;
}

for (const [, css] of styleBlocks) {
  for (const value of cssUrlValues(css)) {
    // SVG source inside a data URI can itself contain url(%23clipPathId).
    // It is part of the embedded image, not a stylesheet dependency.
    if (value && !/^(?:data:|#|blob:)/i.test(value)) {
      fail(`Unresolved CSS asset reference remains: ${value}`);
    }
  }
}

if (styleBlocks.some(([, css]) => /@import\b/i.test(css))) fail("An unresolved CSS @import remains.");
if (/\b(?:fetch\s*\(|XMLHttpRequest|WebSocket|EventSource|importScripts\s*\(|new\s+Worker\s*\()/i.test(html)) {
  fail("A browser network or external script loading API remains in the artifact.");
}

if (!process.exitCode) console.log(`Standalone artifact validated (${(Buffer.byteLength(html) / 1024).toFixed(1)} KiB).`);
