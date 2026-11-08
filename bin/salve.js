#!/usr/bin/env node
// salve CLI
//   salve init                         create salve.config.js
//   salve build [options]              build a custom salve.css
//     -c, --config <file>   config file (default: ./salve.config.js if present)
//     -o, --out <file>      output file (default: ./salve.css)
//     -m, --minify          minify output

import { writeFile, access, mkdir } from 'node:fs/promises';
import { resolve, dirname } from 'node:path';
import { pathToFileURL } from 'node:url';
import { build } from '../lib/build.js';

const args = process.argv.slice(2);
const cmd = args[0];

const flag = (short, long) => args.includes(short) || args.includes(long);
const option = (short, long) => {
  const i = args.findIndex((a) => a === short || a === long);
  return i > -1 ? args[i + 1] : undefined;
};
const exists = (p) => access(p).then(() => true, () => false);

const TEMPLATE = `// salve.config.js — run \`npx salve build\` after editing
export default {
  theme: {
    hue: 165,            // brand hue 0–360
    chroma: 0.13,        // 0 = gray … 0.2 = vivid
    radius: '0.5rem',    // 0 = sharp corners
    density: 1,          // .85 compact … 1.2 airy
    fonts: {
      // sans: '"Inter", system-ui, sans-serif',
      // display: '"Fraunces", serif',
    },
    tokens: {
      // any token: '--s-accent': '#e11d48',
    },
  },

  // drop what you don't use
  modules: {
    components: ['tone', 'button', 'card', 'form', 'feedback', 'overlay', 'data', 'nav'],
    utilities: true,
  },

  utilities: {
    breakpoints: { sm: '40rem', md: '48rem', lg: '64rem', xl: '80rem' },
    // spacing: [0, 1, 2, 3, 4, 6, 8, 12, 16],
  },
};
`;

async function main() {
  if (cmd === 'init') {
    const target = resolve('salve.config.js');
    if (await exists(target)) {
      console.error('salve.config.js already exists. Nothing changed.');
      process.exit(1);
    }
    await writeFile(target, TEMPLATE);
    console.log('Created salve.config.js. Edit it, then run: npx salve build');
    return;
  }

  if (cmd === 'build') {
    const configPath = option('-c', '--config') ?? 'salve.config.js';
    let config = {};
    if (configPath === 'none') {
      // build the stock distribution, ignoring any local config
    } else if (await exists(resolve(configPath))) {
      config = (await import(pathToFileURL(resolve(configPath)).href)).default ?? {};
    } else if (option('-c', '--config')) {
      throw new Error(`Config file not found: ${configPath}`);
    }
    const out = resolve(option('-o', '--out') ?? 'salve.css');
    const css = await build({ ...config, minify: flag('-m', '--minify') || config.minify });
    await mkdir(dirname(out), { recursive: true });
    await writeFile(out, css);
    console.log(`salve → ${out} (${(Buffer.byteLength(css) / 1024).toFixed(1)} KB)`);
    return;
  }

  console.log(`salve — CSS que alivia

Usage:
  salve init                 create salve.config.js
  salve build [-c file] [-o file] [-m]`);
}

main().catch((err) => {
  console.error(`salve: ${err.message}`);
  process.exit(1);
});
