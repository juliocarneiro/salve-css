// Adding salve to a project that already exists.
import { existsSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

/** Frameworks the installer recognizes in an existing package.json, most specific first. */
const DETECT = [
  ['next', 'Next.js', ['next']],
  ['nuxt', 'Nuxt', ['nuxt']],
  ['sveltekit', 'SvelteKit', ['@sveltejs/kit']],
  ['astro', 'Astro', ['astro']],
  ['react-router', 'React Router / Remix', ['@react-router/dev', '@remix-run/react']],
  ['veloz', 'Veloz', ['@velozjs/dom']],
  ['vue', 'Vue', ['vue']],
  ['svelte', 'Svelte', ['svelte']],
  ['react', 'React', ['react']],
  ['vanilla', 'JavaScript (Vite)', ['vite']],
];

export function readPackage(dir) {
  const path = join(dir, 'package.json');
  return existsSync(path) ? JSON.parse(readFileSync(path, 'utf8')) : null;
}

/** @returns {{ id: string, title: string }} */
export function detectFramework(pkg) {
  const all = { ...pkg?.dependencies, ...pkg?.devDependencies };
  for (const [id, title, names] of DETECT) {
    if (names.some((n) => n in all)) return { id, title };
  }
  return { id: 'unknown', title: 'Unknown' };
}

/** The import lines salve needs, in order. */
export function importLines(icons) {
  return ['import "salve-css";', ...(icons ? ['import "salve-icons/css";'] : [])];
}

const VITE_ENTRIES = ['src/main.ts', 'src/main.tsx', 'src/main.js', 'src/main.jsx', 'src/index.ts', 'src/index.tsx', 'src/index.js', 'src/index.jsx'];
const ENTRIES = {
  next: ['app/layout.tsx', 'app/layout.jsx', 'app/layout.js', 'src/app/layout.tsx', 'src/app/layout.jsx', 'src/app/layout.js'],
  react: VITE_ENTRIES,
  vue: VITE_ENTRIES,
  svelte: VITE_ENTRIES,
  veloz: VITE_ENTRIES,
  vanilla: VITE_ENTRIES,
  sveltekit: ['src/routes/+layout.svelte'],
  astro: ['src/layouts/Layout.astro', 'src/layouts/BaseLayout.astro', 'src/layouts/Base.astro'],
};

/** Where the imports go, or null when the installer can't tell for sure. */
export function findEntry(dir, framework) {
  for (const file of ENTRIES[framework] ?? []) {
    if (existsSync(join(dir, file))) return file;
  }
  if (framework === 'astro' && existsSync(join(dir, 'src/layouts'))) {
    const layouts = readdirSync(join(dir, 'src/layouts')).filter((f) => f.endsWith('.astro'));
    if (layouts.length === 1) return `src/layouts/${layouts[0]}`;
  }
  return null;
}

/** Instructions for frameworks (or files) the installer doesn't edit itself. */
export function manualSnippet(framework, icons) {
  const lines = importLines(icons);
  switch (framework) {
    case 'nuxt':
      return `// nuxt.config.ts\nexport default defineNuxtConfig({\n  css: [${['"salve-css"', ...(icons ? ['"salve-icons/css"'] : [])].join(', ')}],\n});`;
    case 'react-router':
      return `// app/root.tsx\nimport salve from "salve-css?url";${icons ? '\nimport salveIcons from "salve-icons/css?url";' : ''}\n\nexport const links = () => [\n  { rel: "stylesheet", href: salve },${icons ? '\n  { rel: "stylesheet", href: salveIcons },' : ''}\n];`;
    case 'sveltekit':
      return `<!-- src/routes/+layout.svelte -->\n<script>\n  ${lines.join('\n  ')}\n  let { children } = $props();\n</script>\n\n{@render children()}`;
    case 'astro':
      return `---\n// in your layout's frontmatter\n${lines.join('\n')}\n---`;
    default:
      return `// in your app's entry file (where the app starts)\n${lines.join('\n')}`;
  }
}

/**
 * Adds the imports to the entry file. Returns what happened, never throws for a
 * file that already has them.
 * @returns {{ status: 'added' | 'present', file: string }}
 */
export function addImports(dir, file, icons) {
  const path = join(dir, file);
  const source = readFileSync(path, 'utf8');
  const missing = importLines(icons).filter((line) => {
    const spec = line.match(/"([^"]+)"/)[1];
    return !new RegExp(`import\\s+['"]${spec.replace('/', '\\/')}['"]`).test(source);
  });
  if (missing.length === 0) return { status: 'present', file };

  const eol = source.includes('\r\n') ? '\r\n' : '\n';
  let next;
  if (file.endsWith('.svelte')) {
    // Inside the first <script> block.
    next = /<script[^>]*>/.test(source)
      ? source.replace(/(<script[^>]*>)(\r?\n)?/, (_, tag) => `${tag}${eol}  ${missing.join(`${eol}  `)}${eol}`)
      : `<script>${eol}  ${missing.join(`${eol}  `)}${eol}</script>${eol}${eol}${source}`;
  } else if (file.endsWith('.astro')) {
    // At the top of the frontmatter, creating it if needed.
    next = source.startsWith('---')
      ? source.replace(/^---(\r?\n)/, (_, nl) => `---${nl}${missing.join(eol)}${eol}`)
      : `---${eol}${missing.join(eol)}${eol}---${eol}${eol}${source}`;
  } else {
    // After a leading "use client"/"use strict" directive, otherwise first.
    const directive = source.match(/^(['"]use [a-z]+['"];?[ \t]*\r?\n)/);
    next = directive
      ? directive[1] + missing.join(eol) + eol + source.slice(directive[1].length)
      : missing.join(eol) + eol + source;
  }
  writeFileSync(path, next);
  return { status: 'added', file };
}
