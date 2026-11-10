# create-salve

Start a project with [salve-css](https://salve-site-mu.vercel.app), and optionally [salve-icons](https://salve-site-mu.vercel.app/icons), in one command.

[Documentation](https://salve-site-mu.vercel.app) · [GitHub](https://github.com/juliocarneiro/salve-css)

```bash
npm create salve@latest
```

```bash
pnpm create salve
yarn create salve
bun create salve
```

It asks for a name, a framework and whether you want salve-icons, installs the dependencies and prints the command to start. Every project comes with a sample page built only with salve classes and a light/dark button that doesn't flash on reload.

## Frameworks

| Framework | What you get |
| --- | --- |
| `html` | One `index.html` with salve from the CDN. No install, no build: open the file. |
| `vanilla` | Plain JavaScript with Vite. |
| `react` | React + TypeScript with Vite. |
| `vue` | Vue + TypeScript with Vite. |
| `svelte` | Svelte 5 + TypeScript with Vite. |
| `next` | Next.js App Router. The page is a Server Component; only the theme button is a client component. |
| `astro` | Astro, zero JavaScript by default. |
| `veloz` | [Veloz](https://veloz-site.vercel.app), fine-grained reactive JSX. |

## Already have a project?

Run it inside the project:

```bash
npm create salve@latest -- --add
```

It reads your `package.json` to find the framework, installs `salve-css` (and `salve-icons`, if you want) with your package manager and adds the imports to your entry file: `src/main.*` for Vite apps, `app/layout.*` for Next.js, the layout for Astro and `+layout.svelte` for SvelteKit. It asks before editing, skips imports that are already there, and prints the exact code to paste when it can't tell where it goes (Nuxt, React Router).

Run without `--add` inside a folder with a `package.json`, and it asks whether to add salve there or create a new project.

## Without prompts

```bash
npm create salve@latest my-app -- --framework react --icons --install
npm create salve@latest -- --add --no-icons --yes
```

| Option | |
| --- | --- |
| `[dir]` | project folder (default `salve-app`) |
| `-f, --framework <name>` | `html`, `vanilla`, `react`, `vue`, `svelte`, `next`, `astro` or `veloz` |
| `--icons` / `--no-icons` | include salve-icons (default: yes) |
| `--install` / `--no-install` | install dependencies without asking, or skip it |
| `--add` | add salve to the project in the current folder |
| `-y, --yes` | accept the defaults; with `--add`, also edit the entry file and install |
| `-h, --help` | show the options |

With npm, options go after `--`. Outside an interactive terminal it never asks: it uses the defaults and doesn't install unless told to.

Requires Node 20.19+.
