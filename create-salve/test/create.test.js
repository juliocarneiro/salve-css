import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, mkdtempSync, readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { FRAMEWORKS, detectPackageManager, runCommands, scaffold, stripIcons, toPackageName } from '../lib/scaffold.js';
import { addImports, detectFramework, findEntry, manualSnippet } from '../lib/add.js';

const CLI = fileURLToPath(new URL('../index.js', import.meta.url));
const tmp = () => mkdtempSync(join(tmpdir(), 'create-salve-'));
const read = (...p) => readFileSync(join(...p), 'utf8');
const walk = (dir) => readdirSync(dir).flatMap((f) => (statSync(join(dir, f)).isDirectory() ? walk(join(dir, f)) : [join(dir, f)]));
const allText = (dir) => walk(dir).filter((f) => !f.endsWith('.svg')).map((f) => readFileSync(f, 'utf8')).join('\n');

describe('helpers', () => {
  it('makes valid package names and detects the package manager', () => {
    assert.equal(toPackageName('My Site'), 'my-site');
    assert.equal(toPackageName('!!!'), 'salve-app');
    assert.equal(detectPackageManager('pnpm/11.1.2 npm/? node/v22'), 'pnpm');
    assert.equal(detectPackageManager(''), 'npm');
    assert.equal(runCommands('npm').add(['salve-css']), 'npm install salve-css');
    assert.equal(runCommands('pnpm').add(['salve-css', 'salve-icons']), 'pnpm add salve-css salve-icons');
  });

  it('strips every trace of salve-icons', () => {
    const jsx = 'import "x";\nimport \'salve-icons/css\';\n<a className="btn">Go <i className="si si-arrow-right" aria-hidden="true"></i></a>\n<h3><i class="si si-moon" aria-hidden="true"></i> Dark</h3>';
    assert.equal(stripIcons(jsx, 'App.tsx'), 'import "x";\n<a className="btn">Go </a>\n<h3>Dark</h3>');
    const html = '  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/salve-icons@0.2/dist/salve-icons.css" />\n<p>ok</p>';
    assert.equal(stripIcons(html, 'index.html'), '<p>ok</p>');
    const pkg = JSON.parse(stripIcons(JSON.stringify({ dependencies: { 'salve-css': '1', 'salve-icons': '1' } }), 'package.json'));
    assert.deepEqual(pkg.dependencies, { 'salve-css': '1' });
  });
});

describe('new projects', () => {
  for (const { name: framework, install } of FRAMEWORKS) {
    it(`${framework}: with salve-icons`, () => {
      const dir = join(tmp(), 'My App');
      scaffold({ dir, framework, icons: true });
      const text = allText(dir);
      assert.doesNotMatch(text, /__PROJECT_NAME__/);
      assert.match(text, /my-app/);
      assert.match(text, /si si-/);
      assert.ok(existsSync(join(dir, 'README.md')));
      if (install !== false) {
        const pkg = JSON.parse(read(dir, 'package.json'));
        assert.equal(pkg.name, 'my-app');
        assert.ok(pkg.dependencies['salve-css'], 'salve-css dependency');
        assert.ok(pkg.dependencies['salve-icons'], 'salve-icons dependency');
        assert.ok(existsSync(join(dir, '.gitignore')));
        assert.match(text, /import ['"]salve-css['"]/);
        assert.match(text, /import ['"]salve-icons\/css['"]/);
      } else {
        assert.match(text, /salve-css@0\.2\/dist\/salve\.min\.css/);
      }
      // Every template applies the saved theme before paint and has a theme button.
      assert.match(text, /salve-theme|themeScript/);
      assert.match(text, /toggleTheme|data-theme-toggle/);
    });

    it(`${framework}: without salve-icons`, () => {
      const dir = join(tmp(), 'plain');
      scaffold({ dir, framework, icons: false });
      const text = allText(dir);
      assert.doesNotMatch(text, /salve-icons/);
      assert.doesNotMatch(text, /si si-/);
      assert.match(text, /salve-css/);
    });
  }

  it('refuses a folder with files and unknown frameworks', () => {
    const dir = tmp();
    writeFileSync(join(dir, 'keep.txt'), 'x');
    assert.throws(() => scaffold({ dir, framework: 'react' }), /not empty/);
    assert.throws(() => scaffold({ dir: join(tmp(), 'x'), framework: 'angular' }), /Unknown framework/);
  });
});

describe('existing projects', () => {
  const project = (deps, files = {}) => {
    const dir = tmp();
    writeFileSync(join(dir, 'package.json'), JSON.stringify({ name: 'mine', dependencies: deps }));
    for (const [file, text] of Object.entries(files)) {
      mkdirSync(join(dir, file, '..'), { recursive: true });
      writeFileSync(join(dir, file), text);
    }
    return dir;
  };

  it('detects the framework, most specific first', () => {
    assert.equal(detectFramework({ dependencies: { next: '16', react: '19' } }).id, 'next');
    assert.equal(detectFramework({ devDependencies: { '@sveltejs/kit': '2', svelte: '5' } }).id, 'sveltekit');
    assert.equal(detectFramework({ dependencies: { vue: '3' }, devDependencies: { vite: '8' } }).id, 'vue');
    assert.equal(detectFramework({ dependencies: { '@velozjs/dom': '0.1' } }).id, 'veloz');
    assert.equal(detectFramework({ devDependencies: { vite: '8' } }).id, 'vanilla');
    assert.equal(detectFramework({}).id, 'unknown');
  });

  it('adds imports to a Vite entry, once', () => {
    const dir = project({ react: '19', vite: '8' }, { 'src/main.tsx': "import { createRoot } from 'react-dom/client';\n" });
    assert.equal(findEntry(dir, 'react'), 'src/main.tsx');
    assert.equal(addImports(dir, 'src/main.tsx', true).status, 'added');
    assert.equal(read(dir, 'src/main.tsx'), 'import "salve-css";\nimport "salve-icons/css";\nimport { createRoot } from \'react-dom/client\';\n');
    assert.equal(addImports(dir, 'src/main.tsx', true).status, 'present');
  });

  it('adds only what is missing and keeps "use client" first', () => {
    const dir = project({ next: '16' }, { 'app/layout.tsx': "'use client';\nimport 'salve-css';\nexport default function L() {}\n" });
    assert.equal(findEntry(dir, 'next'), 'app/layout.tsx');
    addImports(dir, 'app/layout.tsx', true);
    assert.equal(read(dir, 'app/layout.tsx'), "'use client';\nimport \"salve-icons/css\";\nimport 'salve-css';\nexport default function L() {}\n");
  });

  it('edits Svelte and Astro files in the right place', () => {
    const dir = project({ '@sveltejs/kit': '2' }, {
      'src/routes/+layout.svelte': '<script>\n  let { children } = $props();\n</script>\n{@render children()}\n',
      'src/layouts/Layout.astro': '---\nconst title = "x";\n---\n<html></html>\n',
    });
    addImports(dir, 'src/routes/+layout.svelte', false);
    assert.equal(read(dir, 'src/routes/+layout.svelte'), '<script>\n  import "salve-css";\n  let { children } = $props();\n</script>\n{@render children()}\n');
    assert.equal(findEntry(dir, 'astro'), 'src/layouts/Layout.astro');
    addImports(dir, 'src/layouts/Layout.astro', true);
    assert.match(read(dir, 'src/layouts/Layout.astro'), /^---\nimport "salve-css";\nimport "salve-icons\/css";\nconst title/);
  });

  it('gives instructions where it does not edit', () => {
    assert.match(manualSnippet('nuxt', true), /css: \["salve-css", "salve-icons\/css"\]/);
    assert.match(manualSnippet('react-router', false), /salve-css\?url/);
    assert.doesNotMatch(manualSnippet('react-router', false), /salve-icons/);
  });
});

describe('CLI', () => {
  const run = (args, cwd, ua = 'npm/11.0.0 node/v22') =>
    spawnSync(process.execPath, [CLI, ...args], { cwd, encoding: 'utf8', env: { ...process.env, npm_config_user_agent: ua, NO_COLOR: '1' } });

  it('creates a project without prompts outside a terminal', () => {
    const cwd = tmp();
    const r = run(['shop', '--framework', 'vue', '--no-icons'], cwd, 'pnpm/11 node/v22');
    assert.equal(r.status, 0, r.stderr);
    assert.ok(existsSync(join(cwd, 'shop', 'src', 'App.vue')));
    assert.doesNotMatch(read(cwd, 'shop', 'package.json'), /salve-icons/);
    assert.match(r.stdout, /cd shop/);
    assert.match(r.stdout, /pnpm install/);
    assert.match(r.stdout, /pnpm dev/);
  });

  it('tells HTML users to just open the file', () => {
    const cwd = tmp();
    const r = run(['page', '-f', 'html'], cwd);
    assert.equal(r.status, 0, r.stderr);
    assert.match(r.stdout, /open index\.html/);
    assert.doesNotMatch(r.stdout, /npm install/);
  });

  it('--add edits the entry with --yes and prints the install command', () => {
    const cwd = tmp();
    writeFileSync(join(cwd, 'package.json'), JSON.stringify({ name: 'mine', dependencies: { vue: '3' } }));
    mkdirSync(join(cwd, 'src'));
    writeFileSync(join(cwd, 'src', 'main.ts'), "import { createApp } from 'vue';\n");
    const r = run(['--add', '--yes', '--no-install'], cwd);
    assert.equal(r.status, 0, r.stderr);
    assert.match(r.stdout, /Found: Vue/);
    assert.match(r.stdout, /npm install salve-css salve-icons/);
    assert.match(read(cwd, 'src', 'main.ts'), /^import "salve-css";\nimport "salve-icons\/css";/);
  });

  it('--add without a package.json explains what to do', () => {
    const r = run(['--add'], tmp());
    assert.equal(r.status, 1);
    assert.match(r.stderr, /no package\.json/);
  });

  it('rejects unknown frameworks', () => {
    const r = run(['x', '-f', 'angular'], tmp());
    assert.equal(r.status, 1);
    assert.match(r.stderr, /Unknown framework/);
  });
});
