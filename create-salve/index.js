#!/usr/bin/env node
// npm create salve@latest [dir] [-- --framework react --icons --install]
// npm create salve@latest -- --add            (add salve to the project in this folder)
import { spawnSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { relative } from 'node:path';
import { emitKeypressEvents } from 'node:readline';
import { createInterface } from 'node:readline/promises';
import { parseArgs } from 'node:util';
import { addImports, detectFramework, findEntry, importLines, manualSnippet, readPackage } from './lib/add.js';
import { FRAMEWORKS, detectPackageManager, isEmptyDir, runCommands, scaffold, toPackageName } from './lib/scaffold.js';

const { version } = JSON.parse(readFileSync(new URL('./package.json', import.meta.url), 'utf8'));
const interactive = Boolean(process.stdin.isTTY && process.stdout.isTTY);
const color = !process.env.NO_COLOR && (process.stdout.hasColors?.() ?? false);
const paint = (code) => (text) => (color ? `\x1b[${code}m${text}\x1b[0m` : text);
const bold = paint(1);
const dim = paint(2);
const accent = paint(36);
const green = paint(32);
const red = paint(31);
const DOCS = 'https://salve-site-mu.vercel.app';

const HELP = `
${bold('create-salve')} ${dim(version)}

Usage:
  npm create salve@latest [dir] -- [options]      new project
  npm create salve@latest -- --add [options]      add salve to the project in this folder

Options:
  -f, --framework <name>  ${FRAMEWORKS.map((f) => f.name).join(', ')}
      --icons / --no-icons      include salve-icons (default: yes)
      --install / --no-install  install dependencies without asking
      --add                     add salve to an existing project
  -y, --yes                     accept the defaults (and, with --add, edit the entry file)
  -h, --help                    show this message
`;

function fail(message) {
  console.error(`\n${red('✖')} ${message}\n`);
  process.exit(1);
}

async function ask(question, fallback) {
  const rl = createInterface({ input: process.stdin, output: process.stdout });
  try {
    const answer = (await rl.question(`${accent('?')} ${bold(question)} ${dim(`(${fallback})`)} `)).trim();
    return answer || fallback;
  } finally {
    rl.close();
  }
}

async function confirm(question, yes = true) {
  const answer = await ask(question, yes ? 'Y/n' : 'y/N');
  if (answer === 'Y/n') return true;
  if (answer === 'y/N') return false;
  return /^y/i.test(answer);
}

/** Arrow-key list. Resolves with the chosen item. */
function select(question, items, start = 0) {
  return new Promise((done) => {
    let index = start;
    const { stdin, stdout } = process;
    const draw = (first) => {
      if (!first) stdout.write(`\x1b[${items.length}A`);
      for (const [i, item] of items.entries()) {
        const line = i === index ? `${accent('›')} ${bold(item.title.padEnd(11))} ${dim(item.description)}` : `  ${item.title.padEnd(11)} ${dim(item.description)}`;
        stdout.write(`\x1b[2K${line}\n`);
      }
    };
    const onKey = (_text, key = {}) => {
      if (key.ctrl && key.name === 'c') {
        stdout.write('\n');
        process.exit(130);
      }
      if (key.name === 'up' || key.name === 'k') index = (index + items.length - 1) % items.length;
      else if (key.name === 'down' || key.name === 'j') index = (index + 1) % items.length;
      else if (key.name === 'return' || key.name === 'enter') {
        stdin.off('keypress', onKey);
        stdin.setRawMode(false);
        stdin.pause();
        stdout.write(`\x1b[${items.length}A\x1b[J${dim('  ' + items[index].title)}\n`);
        done(items[index]);
        return;
      } else return;
      draw(false);
    };
    stdout.write(`${accent('?')} ${bold(question)} ${dim('(↑/↓, enter)')}\n`);
    emitKeypressEvents(stdin);
    stdin.setRawMode(true);
    stdin.resume();
    stdin.on('keypress', onKey);
    draw(true);
  });
}

function install(pm, cwd, packages) {
  const args = packages ? [pm === 'npm' ? 'install' : 'add', ...packages] : ['install'];
  const result = spawnSync(pm, args, { cwd, stdio: 'inherit', shell: process.platform === 'win32' });
  return result.status === 0;
}

async function addToExisting(values, pm) {
  const cwd = process.cwd();
  const pkg = readPackage(cwd);
  if (!pkg) fail('There is no package.json in this folder. Run this inside your project, or create a new one.');

  const detected = detectFramework(pkg);
  console.log(`Found: ${bold(detected.title)}${pkg.name ? dim(` (${pkg.name})`) : ''}`);
  const icons = values['no-icons'] ? false : values.icons ?? (interactive && !values.yes ? await confirm('Include salve-icons too?') : true);
  const packages = ['salve-css', ...(icons ? ['salve-icons'] : [])];
  const commands = runCommands(pm);

  let installed = false;
  const doInstall = values['no-install'] ? false : values.install ?? (interactive && !values.yes ? await confirm(`Install ${packages.join(' and ')} with ${pm}?`) : Boolean(values.yes));
  if (doInstall) {
    console.log('');
    installed = install(pm, cwd, packages);
    if (!installed) console.log(`\n${red('✖')} Install failed. Run ${bold(commands.add(packages))} to retry.`);
  }

  const entry = findEntry(cwd, detected.id);
  let edited = null;
  if (entry) {
    const go = values.yes || (interactive ? await confirm(`Add the imports to ${entry}?`) : false);
    if (go) edited = addImports(cwd, entry, icons);
  }

  console.log('');
  if (installed) console.log(`${green('✔')} Installed ${packages.join(' and ')}.`);
  else console.log(`Install: ${accent(commands.add(packages))}`);
  if (edited?.status === 'added') console.log(`${green('✔')} Added ${importLines(icons).map((l) => dim(l)).join(' and ')} to ${bold(edited.file)}.`);
  else if (edited?.status === 'present') console.log(`${green('✔')} ${bold(edited.file)} already imports salve.`);
  else {
    console.log(`\n${entry ? `Add this to ${bold(entry)}:` : 'Add this to your project:'}\n`);
    console.log(manualSnippet(entry ? 'default' : detected.id, icons).replace(/^/gm, '  '));
  }
  console.log(dim(`\nDark mode follows the system on its own. For a toggle without a flash: ${DOCS}/#instalar\n`));
}

async function createNew(values, positionals, pm) {
  let dir = positionals[0];
  if (!dir) dir = interactive && !values.yes ? await ask('Project name:', 'salve-app') : 'salve-app';
  if (!isEmptyDir(dir)) fail(`The folder "${dir}" already exists and is not empty. Pick another name.`);

  let framework = values.framework;
  if (framework && !FRAMEWORKS.some((f) => f.name === framework)) {
    fail(`Unknown framework "${framework}". Use one of: ${FRAMEWORKS.map((f) => f.name).join(', ')}.`);
  }
  if (!framework) framework = interactive && !values.yes ? (await select('Framework:', FRAMEWORKS, 2)).name : 'vanilla';
  const info = FRAMEWORKS.find((f) => f.name === framework);

  const icons = values['no-icons'] ? false : values.icons ?? (interactive && !values.yes ? await confirm('Include salve-icons?') : true);

  const { target } = scaffold({ dir, framework, icons });
  const commands = runCommands(pm);
  console.log(`\n${green('✔')} Created ${bold(toPackageName(target))} with ${bold(info.title)}${icons ? ' and salve-icons' : ''}.`);

  let installed = false;
  if (info.install !== false) {
    const doInstall = values['no-install'] ? false : values.install ?? (interactive && !values.yes ? await confirm(`Install dependencies with ${pm}?`) : false);
    if (doInstall) {
      console.log('');
      installed = install(pm, target);
      if (!installed) console.log(`\n${red('✖')} Install failed. Run ${bold(commands.install)} in the project folder to retry.`);
    }
  }

  const cd = relative(process.cwd(), target);
  console.log(`\nNext:\n`);
  if (cd) console.log(`  ${accent(`cd ${cd.includes(' ') ? `"${cd}"` : cd}`)}`);
  if (info.install === false) {
    console.log(`  ${accent(info.start)}`);
  } else {
    if (!installed) console.log(`  ${accent(commands.install)}`);
    console.log(`  ${accent(commands.dev)}`);
  }
  console.log(dim(`\nDocs: ${DOCS}\n`));
}

async function main() {
  let args;
  try {
    args = parseArgs({
      allowPositionals: true,
      options: {
        framework: { type: 'string', short: 'f' },
        icons: { type: 'boolean' },
        'no-icons': { type: 'boolean' },
        install: { type: 'boolean' },
        'no-install': { type: 'boolean' },
        add: { type: 'boolean' },
        yes: { type: 'boolean', short: 'y' },
        help: { type: 'boolean', short: 'h' },
      },
    });
  } catch (err) {
    fail(`${err.message}\n${HELP}`);
  }
  const { values, positionals } = args;
  if (values.help) {
    console.log(HELP);
    return;
  }

  console.log(`\n${bold('salve')} ${dim(`create-salve ${version}`)}\n`);
  const pm = detectPackageManager();

  // Inside a project with no folder given: offer to add salve to it.
  let mode = values.add ? 'add' : 'new';
  if (!values.add && !positionals[0] && interactive && !values.yes && readPackage(process.cwd())) {
    mode = (
      await select('There is a package.json here. What do you want to do?', [
        { name: 'add', title: 'Add salve', description: 'to the project in this folder' },
        { name: 'new', title: 'New project', description: 'in a new folder' },
      ])
    ).name;
  }
  if (mode === 'add') await addToExisting(values, pm);
  else await createNew(values, positionals, pm);
}

main().catch((err) => fail(err?.message ?? String(err)));
