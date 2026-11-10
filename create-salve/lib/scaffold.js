// New projects from a template. No prompts or exits here, so it can be tested.
import { cpSync, existsSync, mkdirSync, readdirSync, readFileSync, renameSync, statSync, writeFileSync } from 'node:fs';
import { basename, extname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

export const TEMPLATES_DIR = fileURLToPath(new URL('../templates/', import.meta.url));

/** Templates in the order the CLI lists them. `install: false` means there is nothing to install. */
export const FRAMEWORKS = [
  { name: 'html', title: 'HTML', description: 'One page, salve from the CDN: no install, no build', install: false, start: 'open index.html' },
  { name: 'vanilla', title: 'JavaScript', description: 'Plain JavaScript with Vite' },
  { name: 'react', title: 'React', description: 'React + TypeScript with Vite' },
  { name: 'vue', title: 'Vue', description: 'Vue + TypeScript with Vite' },
  { name: 'svelte', title: 'Svelte', description: 'Svelte 5 + TypeScript with Vite' },
  { name: 'next', title: 'Next.js', description: 'App Router, Server Components' },
  { name: 'astro', title: 'Astro', description: 'Static site, zero JavaScript by default' },
  { name: 'veloz', title: 'Veloz', description: 'Fine-grained reactive JSX' },
];

const RENAMES = { _gitignore: '.gitignore' }; // npm drops .gitignore from packages
const TEXT = new Set(['.json', '.html', '.md', '.js', '.ts', '.tsx', '.vue', '.svelte', '.astro', '.mjs']);

/** Turns a folder name into a valid npm package name. */
export function toPackageName(dir) {
  const name = basename(resolve(dir))
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/^[._]+/, '')
    .replace(/[^a-z0-9~._-]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return name || 'salve-app';
}

/** The package manager that ran `create`, from npm_config_user_agent. */
export function detectPackageManager(userAgent = process.env.npm_config_user_agent ?? '') {
  const name = userAgent.split(' ')[0]?.split('/')[0];
  return name === 'pnpm' || name === 'yarn' || name === 'bun' ? name : 'npm';
}

export function runCommands(pm) {
  return {
    install: pm === 'yarn' ? 'yarn' : `${pm} install`,
    add: (pkgs) => `${pm === 'npm' ? 'npm install' : `${pm} add`} ${pkgs.join(' ')}`,
    dev: pm === 'npm' ? 'npm run dev' : `${pm} dev`,
  };
}

/** True when the folder does not exist or holds nothing but a .git folder. */
export function isEmptyDir(dir) {
  if (!existsSync(dir)) return true;
  return readdirSync(dir).every((f) => f === '.git');
}

/** Removes everything salve-icons from a file's text: imports, CDN link, icon tags and the dependency. */
export function stripIcons(text, file) {
  if (file.endsWith('package.json')) {
    const pkg = JSON.parse(text);
    if (pkg.dependencies) delete pkg.dependencies['salve-icons'];
    return JSON.stringify(pkg, null, 2) + '\n';
  }
  if (file.endsWith('.md')) {
    return text
      .replace(/ and salve-icons/g, '')
      .split('\n')
      .filter((line) => !line.includes('salve-icons'))
      .join('\n');
  }
  return text
    .replace(/^[ \t]*import ['"]salve-icons\/css['"];\r?\n/gm, '')
    .replace(/^[ \t]*<link[^>]*salve-icons[^>]*>\r?\n/gm, '')
    .replace(/<i (?:class|className)="si [^"]*" aria-hidden="true"><\/i> ?/g, '');
}

function walk(dir) {
  return readdirSync(dir).flatMap((f) => {
    const path = join(dir, f);
    return statSync(path).isDirectory() ? walk(path) : [path];
  });
}

/**
 * Copies a template into `dir`, fills in the project name and, without icons,
 * removes salve-icons.
 * @param {{ dir: string, framework: string, icons?: boolean }} options
 */
export function scaffold({ dir, framework, icons = true }) {
  if (!FRAMEWORKS.some((f) => f.name === framework)) {
    throw new Error(`Unknown framework "${framework}". Use one of: ${FRAMEWORKS.map((f) => f.name).join(', ')}.`);
  }
  const target = resolve(dir);
  if (!isEmptyDir(target)) throw new Error(`${target} is not empty.`);

  mkdirSync(target, { recursive: true });
  cpSync(join(TEMPLATES_DIR, framework), target, { recursive: true });
  for (const [from, to] of Object.entries(RENAMES)) {
    if (existsSync(join(target, from))) renameSync(join(target, from), join(target, to));
  }

  const name = toPackageName(target);
  for (const file of walk(target)) {
    if (!TEXT.has(extname(file))) continue;
    let text = readFileSync(file, 'utf8').replaceAll('__PROJECT_NAME__', name);
    if (!icons) text = stripIcons(text, file);
    writeFileSync(file, text);
  }
  return { target, name };
}
