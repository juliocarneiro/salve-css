// salve · build
// Assembles src/*.css + generated utilities into one file, applying an
// optional user config (theme knobs, module selection, breakpoints).
// Zero dependencies: Node 18+ only.

import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { generateUtilities } from './utilities.js';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const pkg = JSON.parse(await readFile(join(root, 'package.json'), 'utf8'));

export const ALL_COMPONENTS = [
  'tone', 'button', 'card', 'form', 'feedback', 'overlay', 'data', 'nav',
  'tabs', 'navigation', 'content', 'controls',
];

const LAYER_ORDER =
  '@layer salve.reset, salve.tokens, salve.theme, salve.base, salve.layout, salve.components, salve.motion, salve.utilities;';

// theme config key → CSS custom property
const THEME_MAP = {
  hue: '--s-hue',
  chroma: '--s-chroma',
  neutralHue: '--s-neutral-hue',
  neutralChroma: '--s-neutral-chroma',
  radius: '--s-radius',
  density: '--s-density',
};

function themeLayer(theme = {}) {
  const decls = [];
  for (const [key, prop] of Object.entries(THEME_MAP)) {
    if (theme[key] !== undefined) decls.push(`  ${prop}: ${theme[key]};`);
  }
  for (const [key, value] of Object.entries(theme.fonts ?? {})) {
    decls.push(`  --s-font-${key}: ${value};`);
  }
  for (const [prop, value] of Object.entries(theme.tokens ?? {})) {
    decls.push(`  ${prop.startsWith('--') ? prop : `--s-${prop}`}: ${value};`);
  }
  if (!decls.length) return '';
  return `@layer salve.theme {\n:root {\n${decls.join('\n')}\n}\n}`;
}

export function minify(css) {
  return css
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/\s+/g, ' ')
    .replace(/\s*([{};,])\s*/g, '$1')
    .replace(/;}/g, '}')
    .trim();
}

export async function build(config = {}) {
  const modules = {
    reset: true,
    base: true,
    layout: true,
    components: ALL_COMPONENTS,
    motion: true,
    utilities: true,
    ...config.modules,
  };
  const components = modules.components === true ? ALL_COMPONENTS : modules.components || [];

  const read = (p) => readFile(join(root, 'src', p), 'utf8');
  const parts = [
    `/*! salve v${pkg.version} · CSS that eases the pain · MIT License */`,
    LAYER_ORDER,
    await read('tokens.css'),
  ];
  const theme = themeLayer(config.theme);
  if (theme) parts.push(theme);
  if (modules.reset) parts.push(await read('reset.css'));
  if (modules.base) parts.push(await read('base.css'));
  if (modules.layout) parts.push(await read('layout.css'));
  for (const name of components) {
    if (!ALL_COMPONENTS.includes(name)) throw new Error(`Unknown component module "${name}". Available: ${ALL_COMPONENTS.join(', ')}`);
    parts.push(await read(`components/${name}.css`));
  }
  if (modules.motion) parts.push(await read('motion.css'));
  if (modules.utilities) parts.push(generateUtilities(config.utilities));

  const css = parts.join('\n\n');
  return config.minify ? minify(css) : css;
}
