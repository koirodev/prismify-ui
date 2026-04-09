/**
 * One-off extractor: reads Figma-export icons.svg (24×24 cells + clip paths),
 * skips social / brand glyphs, writes src/components/element/PfIcon/paths.ts
 *
 * Normal workflow: put individual `.svg` files in `src/icons/svg/` and run `npm run icons:build`.
 *
 * Usage: node scripts/extract-pf-icons.mjs [path/to/icons.svg]
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const defaultInput = path.join(
  process.env.USERPROFILE || '',
  'Desktop',
  'icons.svg'
);
const inputPath = path.resolve(process.argv[2] || defaultInput);
const outPath = path.join(root, 'src/components/element/PfIcon/paths.ts');

function parseClipRects(svg) {
  const map = new Map();
  const re =
    /<clipPath id="clip(\d+)_303_5180">\s*<rect width="([\d.]+)" height="([\d.]+)"[^>]*transform="translate\(([\d.]+)\s+([\d.]+)\)"/g;
  let m;
  while ((m = re.exec(svg)) !== null) {
    map.set(Number(m[1]), {
      w: Number(m[2]),
      h: Number(m[3]),
      tx: Number(m[4]),
      ty: Number(m[5]),
    });
  }
  return map;
}

/** Extract each <g clip-path="url(#clipN_303_5180)">...</g> with balanced </g> */
function extractClipGroups(svg) {
  const openRe = /<g\s+clip-path="url\(#clip(\d+)_303_5180\)">/g;
  const out = [];
  let m;
  while ((m = openRe.exec(svg)) !== null) {
    const clipId = Number(m[1]);
    let i = m.index;
    let depth = 0;
    const start = i;
    while (i < svg.length) {
      const tail = svg.slice(i);
      if (tail.startsWith('</g>')) {
        depth--;
        i += 4;
        if (depth === 0) {
          out.push({ clipId, raw: svg.slice(start, i) });
          break;
        }
        continue;
      }
      // <g …> but not <gradient
      if (/^<g[\s>]/.test(tail) && !tail.startsWith('<gradient')) {
        depth++;
        i += 2;
        continue;
      }
      i++;
    }
  }
  return out;
}

function isSocialOrBrand(inner) {
  if (inner.includes('fill="url(#')) return true;
  const brandFills = [
    '#F20000',
    '#334C8C',
    '#FF6800',
    '#4065D6',
    '#00A6DE',
    '#376FDD',
    '#2AABEE',
    '#229ED9',
    '#002952',
  ];
  for (const c of brandFills) {
    if (inner.includes(`fill="${c}"`)) return true;
  }
  return false;
}

function normalizeFills(html) {
  return html
    .replace(/\sfill="black"/g, ' fill="currentColor"')
    .replace(/\sfill="#293D4E"/g, ' fill="currentColor"')
    .replace(/\sfill="#002952"/g, ' fill="currentColor"')
    .replace(/\sfill="white"/g, ' fill="var(--pf-color-surface)"');
}

function parsePaths(inner) {
  const paths = [];
  const pathRe = /<path\s+([^>]*?)\/>/gs;
  let m;
  while ((m = pathRe.exec(inner)) !== null) {
    const attrs = m[1];
    const dM = attrs.match(/(?:^|\s)d="([^"]*)"/);
    if (!dM) continue;
    const d = dM[1];
    const fillM = attrs.match(/(?:^|\s)fill="([^"]*)"/);
    const fill = fillM ? fillM[1] : undefined;
    const frM = attrs.match(/(?:^|\s)fill-rule="([^"]*)"/);
    const fillRule = frM?.[1];
    const crM = attrs.match(/(?:^|\s)clip-rule="([^"]*)"/);
    const clipRule = crM?.[1];
    paths.push({ d, fill, fillRule, clipRule });
  }
  return paths;
}

function toPascalFromClip(clipId) {
  return `Sprite${clipId}`;
}

function main() {
  if (!fs.existsSync(inputPath)) {
    console.error('Input not found:', inputPath);
    process.exit(1);
  }
  const svg = fs.readFileSync(inputPath, 'utf8');
  const rects = parseClipRects(svg);
  const groups = extractClipGroups(svg);

  const byClip = new Map();
  for (const g of groups) {
    const inner = g.raw.replace(/^<g[^>]*>/, '').replace(/<\/g>\s*$/, '');
    if (!rects.has(g.clipId)) continue;
    if (isSocialOrBrand(inner)) continue;
    const paths = parsePaths(normalizeFills(inner));
    if (paths.length === 0) continue;
    const { tx, ty, w, h } = rects.get(g.clipId);
    const viewBox = `${tx} ${ty} ${w} ${h}`;
    byClip.set(g.clipId, { viewBox, paths });
  }

  const sortedIds = [...byClip.keys()].sort((a, b) => a - b);
  const names = sortedIds.map(toPascalFromClip);

  const lines = [];
  lines.push(
    `/** Built-in icons for {@link PfIcon} (from design sprite; 24×24 cells, filled). */`
  );
  lines.push(`export type PfIconPathDef = {`);
  lines.push(`  d: string`);
  lines.push(`  fill?: string`);
  lines.push(`  fillRule?: 'evenodd' | 'nonzero'`);
  lines.push(`  clipRule?: 'evenodd' | 'nonzero'`);
  lines.push(`}`);
  lines.push(``);
  lines.push(`export type PfIconGlyph = {`);
  lines.push(`  viewBox: string`);
  lines.push(`  paths: readonly PfIconPathDef[]`);
  lines.push(`}`);
  lines.push(``);
  lines.push(`export const PF_ICON_NAMES = [`);
  for (const n of names) lines.push(`  '${n}',`);
  lines.push(`] as const`);
  lines.push(``);
  lines.push(`export type PfIconName = (typeof PF_ICON_NAMES)[number]`);
  lines.push(``);
  lines.push(
    `export const PF_ICON_GLYPHS: Record<PfIconName, PfIconGlyph> = {`
  );

  for (const id of sortedIds) {
    const name = toPascalFromClip(id);
    const { viewBox, paths } = byClip.get(id);
    lines.push(`  ${name}: {`);
    lines.push(`    viewBox: '${viewBox}',`);
    lines.push(`    paths: [`);
    for (const p of paths) {
      const parts = [`      { d: ${JSON.stringify(p.d)}`];
      if (p.fill) parts[0] += `, fill: ${JSON.stringify(p.fill)}`;
      if (p.fillRule) parts[0] += `, fillRule: '${p.fillRule}'`;
      if (p.clipRule) parts[0] += `, clipRule: '${p.clipRule}'`;
      parts[0] += ` },`;
      lines.push(parts[0]);
    }
    lines.push(`    ],`);
    lines.push(`  },`);
  }
  lines.push(`}`);
  lines.push(``);

  fs.writeFileSync(outPath, lines.join('\n') + '\n', 'utf8');
  console.log(
    'Wrote',
    outPath,
    'icons:',
    sortedIds.length,
    'skipped social/brand by fill rules'
  );
}

main();
