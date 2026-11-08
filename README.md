<div align="center">

# salve.

**English** · [Português](README.pt-BR.md)

**CSS that eases the pain.**

A pure-CSS design system that fixes the everyday pains of styling the web (specificity, centering, dark mode, z-index, small screens) before they show up.

`npm i salve-css` · zero dependencies · zero build · ~25 KB gzip · MIT

</div>

---

## Contents

- [Why salve exists](#why-salve-exists)
- [Installation](#installation)
- [Getting started](#getting-started)
- [Concepts](#concepts)
  - [Layers: your CSS always wins](#layers-your-css-always-wins)
  - [Tokens](#tokens)
  - [A theme from four variables](#a-theme-from-four-variables)
  - [Dark mode](#dark-mode)
  - [Density](#density)
  - [Tones](#tones)
- [Layout](#layout)
- [Components](#components)
- [Motion](#motion)
- [Utilities](#utilities)
- [Customization](#customization)
- [CLI and config file](#cli-and-config-file)
- [Use cases](#use-cases)
- [Frameworks, SSR and Next.js](#frameworks-ssr-and-nextjs)
- [Icons: salve-icons](#icons-salve-icons)
- [Accessibility](#accessibility)
- [Browser support](#browser-support)
- [salve, Tailwind or Bootstrap?](#salve-tailwind-or-bootstrap)
- [FAQ](#faq)
- [Development](#development)

---

## Why salve exists

Everyone who writes CSS runs into the same problems. salve fixes each one at the source, so you don't have to remember the workaround every time.

| Pain | How salve fixes it |
|---|---|
| Specificity wars, `!important` everywhere | All of the library lives in `@layer salve.*`, below your CSS. One class of yours always wins. |
| "How do I center this?" | `class="center"` centers on both axes. |
| A responsive grid with three media queries | `class="grid" style="--min: 14rem"`: as many columns as fit, no media queries. |
| `z-index: 99999` | Named layers: `--s-z-dropdown`, `--s-z-modal`, `--s-z-toast`… |
| `100vh` broken on phones | The reset uses `100dvh`, and there's a `.min-h-screen` utility. |
| Dark mode that duplicates every color | `color-scheme` + `light-dark()`: automatic, and you can force it on any block. |
| Red form errors before the user types | `:user-invalid`: errors only show after the user interacts. |
| iPhone zooming into inputs | `.input` uses 16px on touch screens. |
| Making a whole card clickable | `<a class="card-link">`: one real link stretches over the card. |
| Modals with JS focus traps and scroll locks | Native `<dialog class="dialog">`, no JavaScript at all. |
| Layout jumping when the scrollbar appears | `scrollbar-gutter: stable` in the reset. |
| A single orphan word on the last line of a heading | `text-wrap: balance` on every heading. |
| Animations for people who asked for less motion | Durations become `1ms` right in the tokens, and loops stop. Every component follows. |
| An image that needs to "break out" of the container | `.content-grid` + `.bleed`. |
| Colors with poor contrast | OKLCH palettes with AA contrast on the semantic pairs. |

---

## Installation

### CDN (fastest)

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/salve-css/dist/salve.min.css">
```

Pin a version in production:

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/salve-css@0.2.0/dist/salve.min.css">
```

### npm

```bash
npm i salve-css
```

Import it once in your app's entry point:

```js
import "salve-css";        // readable build
// or
import "salve-css/min";    // minified
```

In CSS (Vite, Parcel, PostCSS with `postcss-import`):

```css
@import "salve-css";
```

### Source files

To import just a part, the source files live in `salve-css/src/*`. To assemble a tailored bundle, the recommended path is the [CLI](#cli-and-config-file).

---

## Getting started

A complete page using only salve:

```html
<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="color-scheme" content="light dark">
  <title>My page</title>
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/salve-css/dist/salve.min.css">
</head>
<body>
  <header class="navbar">
    <strong>Acme</strong>
    <nav class="cluster">
      <a class="nav-link" href="/" aria-current="page">Home</a>
      <a class="nav-link" href="/pricing">Pricing</a>
      <a class="btn btn-sm" href="/login">Log in</a>
    </nav>
  </header>

  <main class="container stack" style="--gap: var(--s-space-12); padding-block: var(--s-space-section)">
    <section class="stack" style="--gap: var(--s-space-4)">
      <h1>Organize your team in minutes</h1>
      <p class="lead">Tasks, deadlines and conversations in one place.</p>
      <div class="cluster">
        <a class="btn btn-lg" href="/signup">Create a free account</a>
        <a class="btn btn-lg btn-ghost" href="/demo">Watch the demo</a>
      </div>
    </section>

    <section class="grid" style="--min: 16rem">
      <article class="card"><h3>Tasks</h3><p class="text-muted">Boards, lists and calendar.</p></article>
      <article class="card"><h3>Deadlines</h3><p class="text-muted">Reminders before you're late.</p></article>
      <article class="card"><h3>Conversations</h3><p class="text-muted">Comments on every task.</p></article>
    </section>
  </main>
</body>
</html>
```

No media queries and no CSS of your own, and the layout still adapts from phone to desktop. Dark mode follows the operating system on its own.

> **Tip:** always include `<meta name="color-scheme" content="light dark">`. It prevents the white flash when loading in dark mode.

---

## Concepts

### Layers: your CSS always wins

salve declares the layer order once and puts each part of the system in one layer:

```css
@layer salve.reset, salve.tokens, salve.theme, salve.base,
       salve.layout, salve.components, salve.motion, salve.utilities;
```

CSS **outside of layers** (what you write normally) always beats any layer, no matter the specificity. In practice:

```css
/* your file: beats salve's .btn, no !important */
.btn { border-radius: 0; }
```

To put your own CSS in layers, declare them **after** salve's:

```css
@layer salve, app;   /* "app" sits above everything in salve */

@layer app {
  .card { border-width: 2px; }
}
```

Inside salve, utilities beat motion, which beats components, which beat layout, which beats base. That's why `class="btn p-6"` works as expected.

### Tokens

Every design decision is a CSS variable with the `--s-` prefix, organized in three tiers:

| Tier | Examples | What for |
|---|---|---|
| **Theme knobs** | `--s-hue`, `--s-chroma`, `--s-radius`, `--s-density`, `--s-font-*` | You change these. |
| **Scales** | `--s-brand-50…950`, `--s-gray-50…950`, `--s-space-1…32`, `--s-text-xs…6xl` | Derived from the knobs. |
| **Semantic** | `--s-bg`, `--s-surface`, `--s-text`, `--s-text-muted`, `--s-border`, `--s-accent`, `--s-danger`… | What components use. |

Components also expose their own variables (`--btn-bg`, `--card-pad`, `--dialog-width`…) for one-off tweaks.

<details>
<summary><strong>Full token reference</strong></summary>

**Semantic colors** (all switch between light and dark on their own)

| Token | Use |
|---|---|
| `--s-bg` | page background |
| `--s-surface` | background of cards, inputs, menus |
| `--s-surface-2` | subtle surfaces (code, hover, table header) |
| `--s-text` / `--s-text-muted` / `--s-text-subtle` | primary, secondary and tertiary text |
| `--s-border` / `--s-border-strong` | decorative borders and control borders (contrast ≥ 3:1) |
| `--s-accent`, `--s-accent-hover`, `--s-accent-subtle`, `--s-accent-text`, `--s-on-accent` | brand color: solid, hover, soft background, text, text on solid |
| `--s-success`, `--s-warning`, `--s-danger`, `--s-info` (+ `-subtle`, `-text`, `on-`) | status, with fixed hues so the meaning never changes |
| `--s-ring` | focus ring |

**Spacing** (multiplied by `--s-density`): `--s-space-0, 1, 2, 3, 4, 5, 6, 8, 10, 12, 16, 20, 24, 32`, where 1 = 0.25rem. Plus `--s-space-section` (fluid vertical rhythm between sections), `--s-gutter` (fluid page side padding) and `--s-space-fluid-xs, sm, md, lg, xl` (grow with the viewport; good for heroes and sections).

**Fluid type:** `--s-text-xs` to `--s-text-6xl`. From `lg` up, sizes grow smoothly between 320px and 1280px wide, and browser zoom keeps working. Also `--s-leading-*`, `--s-tracking-*` and `--s-weight-*`.

**Radius:** `--s-radius-none, sm, md, lg, xl, full`, all derived from `--s-radius`.

**Shadows:** `--s-shadow-sm, md, lg, xl` and `--s-shadow-inner`, layered and tinted with the neutral hue.

**Brand gradient:** `--s-gradient`, which follows the theme's hue and chroma.

**Named z-index:** `--s-z-below, base, raised, dropdown, sticky, overlay, modal, toast, tooltip`.

**Motion:** `--s-ease`, `--s-ease-out`, `--s-ease-in-out`, `--s-ease-spring` (a gentle overshoot), `--s-duration-fast`, `--s-duration`, `--s-duration-slow`. They become `1ms` with `prefers-reduced-motion`.

**Widths:** `--s-measure` (65ch), `--s-container` (72rem), `--s-container-sm/md/lg/xl`.

**Controls:** `--s-control-sm/md/lg` (button and input heights; bigger on touch screens).

</details>

### A theme from four variables

```css
:root {
  --s-hue: 165;        /* brand hue, 0–360 */
  --s-chroma: 0.13;    /* intensity: 0 = gray, 0.2 = vivid */
  --s-radius: 0.5rem;  /* base radius: 0 = sharp corners */
  --s-density: 1;      /* spacing: 0.85 compact, 1.2 airy */
}
```

The palette is generated in **OKLCH**, a perceptual color space: every hue has the same perceived lightness at the same step of the scale. Switching from green to purple doesn't ruin the contrast.

A few hues to start with:

| Hue | Color |
|---|---|
| `25` | red/coral |
| `60` | orange |
| `90` | amber |
| `150` | green |
| `165` | eucalyptus (default) |
| `200` | cyan |
| `250` | blue |
| `280` | purple |
| `330` | pink |

Need your exact brand color? Override the semantic token:

```css
:root {
  --s-accent: #e11d48;
  --s-accent-hover: #be123c;
}
```

**Fonts:**

```css
:root {
  --s-font-sans: "Inter", system-ui, sans-serif;
  --s-font-display: "Fraunces", Georgia, serif;   /* headings */
  --s-font-mono: "JetBrains Mono", monospace;
}
```

salve doesn't load any web font. By default it uses the system font, which is fast and free.

### Dark mode

**Automatic.** Follows the operating system preference. Nothing to do.

**Forced on the whole page:**

```html
<html data-theme="dark">   <!-- or "light" -->
```

**Forced on one block:**

```html
<footer data-theme="dark">…</footer>
<pre data-theme="dark">…</pre>
```

**Toggle button.** In SSR projects (Next.js and friends), use [`salve-css/theme`](#theme-toggle-without-a-flash-salve-csstheme), which avoids the flash. In plain HTML, this minimal example is enough:

```html
<button class="btn btn-ghost" id="theme-toggle">Toggle theme</button>
<script>
  const root = document.documentElement;
  const saved = localStorage.getItem("theme");
  if (saved) root.dataset.theme = saved;

  document.getElementById("theme-toggle").addEventListener("click", () => {
    const isDark = root.dataset.theme
      ? root.dataset.theme === "dark"
      : matchMedia("(prefers-color-scheme: dark)").matches;
    root.dataset.theme = isDark ? "light" : "dark";
    localStorage.setItem("theme", root.dataset.theme);
  });
</script>
```

**Re-theme a section with another color:** any element with `data-theme` recomputes the palette from its own variables.

```html
<section data-theme style="--s-hue: 25">
  <!-- everything in here turns coral -->
</section>
```

### Density

```html
<aside data-density="compact">…</aside>      <!-- 0.8× -->
<main data-density="comfortable">…</main>    <!-- 1.2× -->
```

Or freely: `style="--s-density: 0.9"` together with `data-density` (any value turns on the recomputation).

### Tones

Tones are **one modifier system for every component**. Each tone sets four local colors that buttons, badges, alerts, avatars, progress bars, tabs, steps and more read.

| Class | Use |
|---|---|
| `.tone-accent` | brand color (default) |
| `.tone-neutral` | gray / black and white |
| `.tone-success` | confirmation, paid, active |
| `.tone-warning` | attention, pending |
| `.tone-danger` | error, destructive |
| `.tone-info` | informational |

```html
<button class="btn tone-danger">Delete</button>
<span class="badge tone-success">Paid</span>
<div class="alert tone-warning">…</div>

<!-- on a parent: applies to the whole group -->
<div class="tone-danger cluster">
  <button class="btn">Delete</button>
  <button class="btn btn-outline">Delete all</button>
</div>
```

---

## Layout

Layout primitives adapt to the available space, **without media queries**. Each one takes variables you pass inline or through a class.

### `.stack`: vertical flow with even spacing

Replaces margins between elements. Spacing comes from `gap`, so there are no collapsing margins and no `:last-child { margin: 0 }`.

```html
<div class="stack" style="--gap: var(--s-space-6)">
  <h2>Title</h2>
  <p>Paragraph</p>
  <button class="btn">Action</button>
</div>
```

| Variable | Default |
|---|---|
| `--gap` | `var(--s-space-4)` |

### `.cluster`: inline items that wrap

For tags, button groups and nav links.

```html
<div class="cluster" style="--justify: flex-end">
  <button class="btn btn-ghost">Cancel</button>
  <button class="btn">Save</button>
</div>
```

| Variable | Default |
|---|---|
| `--gap` | `var(--s-space-3)` |
| `--justify` | `flex-start` |
| `--align` | `center` |

### `.split`: two groups at opposite ends

Logo on one side and navigation on the other, or a title and an action.

```html
<div class="split">
  <h2>Orders</h2>
  <button class="btn btn-sm">New order</button>
</div>
```

### `.center`: centers on both axes

```html
<div class="center min-h-screen">
  <form class="card">…</form>
</div>
```

### `.container`: centered max width with side padding

```html
<main class="container">…</main>
<main class="container" style="--max: var(--s-container-sm)">…</main>
```

| Variable | Default |
|---|---|
| `--max` | `var(--s-container)` (72rem) |
| `--gutter` | `var(--s-gutter)` (fluid, 1–2rem) |

### `.grid`: as many columns as fit

```html
<div class="grid" style="--min: 14rem">
  <article class="card">…</article>
  <article class="card">…</article>
  <article class="card">…</article>
</div>
```

| Variable | Default | Note |
|---|---|---|
| `--min` | `16rem` | minimum width of each column |
| `--gap` | `var(--s-space-6)` | |
| `--fit` | `auto-fit` | `auto-fill` keeps empty columns |

### `.sidebar`: side panel + content

The first child is the side. When the content gets too narrow, both stack. Use `.sidebar.sidebar-end` to put the side on the right.

```html
<div class="sidebar" style="--side: 18rem">
  <nav>…</nav>
  <main>…</main>
</div>
```

| Variable | Default |
|---|---|
| `--side` | `16rem` |
| `--content-min` | `55%` (below this, it stacks) |
| `--gap` | `var(--s-space-6)` |

### `.switcher`: all side by side or all stacked

Unlike `.grid`, it never leaves one item alone on the last row.

```html
<div class="switcher" style="--threshold: 40rem">
  <div class="card">Basic</div>
  <div class="card">Pro</div>
  <div class="card">Team</div>
</div>
```

### `.cover`: full-height block with centered content

```html
<section class="cover">
  <header>Logo</header>
  <div class="cover-main"><h1>Vertically centered hero</h1></div>
  <footer>Scroll down</footer>
</section>
```

### `.frame`: fixed aspect ratio for media

```html
<div class="frame" style="--ratio: 4 / 3"><img src="photo.jpg" alt=""></div>
```

### `.reel`: horizontal carousel with snapping

```html
<div class="reel" style="--item: 16rem">
  <article class="card">…</article>
  <article class="card">…</article>
</div>
```

### `.content-grid`: reading column with breakout

```html
<article class="content-grid">
  <h1>Title</h1>
  <p>Text in the reading column…</p>
  <img class="wide" src="chart.png" alt="…">     <!-- wider -->
  <img class="bleed" src="landscape.jpg" alt="…"> <!-- edge to edge -->
</article>
```

### `.flow`: vertical rhythm for content

Space between siblings through margins (only between them, never before the first). Unlike `.stack`, it doesn't turn into flex, so it works with running text.

```html
<article class="flow" style="--flow-space: 1.5em">…</article>
```

### `.layers`: stack elements without `position: absolute`

Every child occupies the same grid cell. Text over an image, a badge over a card, a loading state over content.

```html
<div class="layers" style="--place: end start">
  <img src="cover.jpg" alt="">
  <span class="badge glass m-3">New</span>
</div>
```

### `.bento`: a grid of tiles of different sizes

```html
<div class="bento" style="--cols: 4; --row: 10rem">
  <article class="card span-2 row-span-2">Featured</article>
  <article class="card">A</article>
  <article class="card">B</article>
  <article class="card span-2">Strip</article>
</div>
```

It turns into 2 columns below 48rem on its own. Variables: `--cols` (4), `--row` (`minmax(9rem, auto)`), `--gap`.

### `.masonry`: Pinterest-style columns

```html
<div class="masonry" style="--min: 14rem">…cards of different heights…</div>
```

### `.app-shell`: application frame

Sticky header, a sidebar that scrolls on its own, content, and a footer that always sits at the bottom. Without an `<aside>`, it becomes a single column. On phones the sidebar steps aside (open it in a `.drawer`).

```html
<div class="app-shell" style="--side: 15rem; --header-h: 4rem">
  <header class="navbar">…</header>
  <aside><ul class="nav-list">…</ul></aside>
  <main>…</main>
  <footer>…</footer>
</div>
```

### `.cq`: container query context

Turns the element into a container. Inside it, the `@sm:`, `@md:` and `@lg:` utilities react to the **container's** width, not the screen's.

```html
<div class="cq">
  <article class="flex flex-col @md:flex-row gap-4">…</article>
</div>
```

---

## Components

Components use native HTML whenever it exists, accept [tones](#tones) and expose variables for one-off tweaks.

### Button

```html
<button class="btn">Solid</button>
<button class="btn btn-soft">Soft</button>
<button class="btn btn-outline">Outline</button>
<button class="btn btn-ghost">Ghost</button>

<button class="btn btn-sm">Small</button>
<button class="btn btn-lg">Large</button>
<button class="btn btn-block">Full width</button>
<button class="btn btn-icon" aria-label="Close">✕</button>

<button class="btn tone-danger">Delete</button>
<button class="btn" aria-busy="true">Saving</button>   <!-- automatic spinner -->
<button class="btn" disabled>Unavailable</button>
<a class="btn" href="/plans">Works on links too</a>
```

| Variable | What it changes |
|---|---|
| `--btn-bg`, `--btn-fg`, `--btn-border` | colors |
| `--btn-radius` | radius (`999px` = pill) |
| `--btn-height`, `--btn-px`, `--btn-font-size` | size |

SVG icons (and [salve-icons](#icons-salve-icons)) inside a button are sized and aligned for you. `.btn-group` joins buttons together.

### Card

```html
<article class="card">
  <img src="cover.jpg" alt="">            <!-- first child: goes edge to edge -->
  <span class="badge">New</span>
  <h3>Title</h3>
  <p class="text-muted">Short description.</p>
  <div class="card-footer split">         <!-- pushed to the bottom -->
    <span>$49</span>
    <button class="btn btn-sm">Buy</button>
  </div>
</article>
```

- `.card-elevated`: a shadow instead of a border.
- `.card-interactive` + `<a class="card-link">`: the whole card becomes clickable with **a single real link**, which is accessible and works with "open in new tab".

```html
<article class="card card-interactive">
  <h3><a class="card-link" href="/article">How to run sprints</a></h3>
  <p>Article summary.</p>
</article>
```

| Variable | Default |
|---|---|
| `--card-pad` | `var(--s-space-6)` |
| `--card-gap` | `var(--s-space-3)` |
| `--card-radius` | `var(--s-radius-lg)` |
| `--card-bg` | `var(--s-surface)` |

### Forms

```html
<div class="field">
  <label for="email">Email</label>
  <input class="input" id="email" type="email" required>
  <p class="hint">We never share it.</p>
  <p class="error">Use a valid email, like name@domain.com.</p>
</div>
```

The `.error` only appears **after the user interacts** with the field (through `:user-invalid`). Until then, the hint stays visible. It uses native HTML validation (`required`, `type="email"`, `minlength`, `pattern`…), so no JavaScript is needed.

`.input` works on `<input>`, `<select>` and `<textarea>`. The `<textarea>` grows with its text in browsers that support `field-sizing`. `.input-sm` and `.input-lg` change the size.

```html
<select class="input">…</select>
<textarea class="input"></textarea>

<!-- prefix / suffix -->
<div class="input-group">
  <span>$</span>
  <input class="input" type="number">
  <span>/mo</span>
</div>

<!-- checkbox and radio -->
<label class="check"><input type="checkbox"> I accept the terms</label>
<label class="check"><input type="radio" name="plan"> Monthly</label>

<!-- switch -->
<label class="check"><input class="switch" type="checkbox" role="switch"> Notifications</label>

<!-- segmented control (native radios) -->
<div class="segmented" role="radiogroup" aria-label="Period">
  <label><input type="radio" name="p" checked> Month</label>
  <label><input type="radio" name="p"> Year</label>
</div>

<!-- floating label (needs placeholder=" ") -->
<div class="field-float">
  <input class="input" id="name" placeholder=" ">
  <label for="name">Full name</label>
</div>

<!-- file upload: the input covers the area, so drag and drop works natively -->
<label class="dropzone">
  <input type="file" multiple>
  <strong>Drop files here</strong> or click to choose
</label>
```

Checkbox, radio, range and progress use the brand color through `accent-color`.

### Badge

```html
<span class="badge">Default</span>
<span class="badge badge-solid">Solid</span>
<span class="badge badge-outline">Outline</span>
<span class="badge badge-dot tone-success">Online</span>
```

### Alert

```html
<div class="alert tone-danger" role="alert">
  <svg class="alert-icon">…</svg>          <!-- optional -->
  <div>
    <p class="alert-title">Publishing failed</p>
    <p>The file is over 10 MB.</p>
  </div>
</div>
```

Use `role="alert"` for urgent errors, `role="status"` for confirmations and `role="note"` for informational notices.

### Progress, spinner and skeleton

```html
<progress class="progress" value="60" max="100">60%</progress>
<progress class="progress tone-success" value="100" max="100"></progress>
<progress class="progress"></progress>                   <!-- indeterminate -->

<div class="ring-progress" style="--ring-value: 72" role="progressbar"
     aria-valuenow="72" aria-valuemin="0" aria-valuemax="100">72%</div>

<span class="spinner" role="status" aria-label="Loading"></span>
<span class="skeleton" style="inline-size: 60%"></span>  <!-- placeholder -->
```

The ring animates whenever `--ring-value` changes. Variables: `--ring-size`, `--ring-thickness`; it accepts tones.

### Toast

```html
<div class="toast-region" role="status" aria-live="polite">
  <div class="toast tone-success">Changes saved</div>
</div>
```

The toast animates in on its own. When and how to remove it is up to you (a `setTimeout`, for example).

### Dialog, drawer and bottom sheet

Native `<dialog>`: the browser already handles the focus trap, the Esc key, the inert background and returning focus to the button. salve only styles and animates it.

```html
<button class="btn" command="show-modal" commandfor="confirm">Delete</button>

<dialog class="dialog" id="confirm" closedby="any" aria-labelledby="confirm-title">
  <h2 id="confirm-title">Delete project?</h2>
  <p>This can't be undone.</p>
  <form method="dialog">
    <button class="btn btn-ghost" value="cancel" autofocus>Keep</button>
    <button class="btn tone-danger" value="delete">Delete</button>
  </form>
</dialog>
```

- `closedby="any"` closes it when clicking outside.
- `.drawer` (with `.dialog`) becomes a side panel, and `.drawer-bottom` a sheet that slides up from the bottom, great on phones.
- `--dialog-width` and `--dialog-pad` adjust the size.
- In browsers without `command`/`commandfor`, open it with `document.getElementById('confirm').showModal()`.

### Menu and popover card

```html
<button class="btn btn-outline" popovertarget="actions">Actions</button>
<div class="menu" id="actions" popover>
  <p class="menu-label">Project</p>
  <button>Rename</button>
  <button>Duplicate</button>
  <hr>
  <button class="text-danger">Delete</button>
</div>

<button class="btn" popovertarget="profile">Ana</button>
<div class="popover-card" id="profile" popover>…rich content…</div>
```

They use the native `popover` API: they close when clicking outside and with Esc. Where anchor positioning is supported, they sit right next to the button and flip if there's no room.

### Tooltip

```html
<button class="btn btn-icon" aria-label="Copy" data-tip="Copy">…</button>
<button data-tip="Shows below" data-tip-pos="bottom">…</button>
```

CSS only; it appears on hover and on keyboard focus. The tooltip text is visual, so keep the `aria-label` for screen readers.

### Tabs

They work **without JavaScript**: each tab is a native radio and the matching panel shows up. Up to 8 tabs.

```html
<div class="tabs">
  <div class="tab-list" role="radiogroup" aria-label="Settings">
    <label class="tab"><input type="radio" name="cfg" checked> Account</label>
    <label class="tab"><input type="radio" name="cfg"> Billing</label>
  </div>
  <div class="tab-panel">…</div>
  <div class="tab-panel">…</div>
</div>
```

Prefer the ARIA pattern with JS? Use `<button class="tab" role="tab" aria-selected="true">` and toggle the `hidden` attribute on panels: same styles. `.tabs-pills` swaps the underline for pills.

### Navigation: sidebar menu, pagination and steps

```html
<ul class="nav-list">
  <li><a href="/" aria-current="page"><i class="si si-home"></i> Home</a></li>
  <li><a href="/inbox"><i class="si si-inbox"></i> Inbox <span class="badge">12</span></a></li>
  <li class="nav-label">Team</li>
  <li><a href="/members">Members</a></li>
</ul>

<nav aria-label="Pagination">
  <ul class="pagination">
    <li><a href="?p=1" aria-current="page">1</a></li>
    <li><a href="?p=2">2</a></li>
    <li><span class="pagination-gap">…</span></li>
    <li><a href="?p=9">9</a></li>
  </ul>
</nav>

<ol class="steps">
  <li data-state="done">Cart</li>
  <li aria-current="step">Payment</li>
  <li>Done</li>
</ol>
```

`.steps-vertical` stacks the steps. Tones work on all three. Also available: `.navbar` (sticky, translucent), `.nav-link` (`aria-current="page"`) and `.breadcrumb`.

### Lists, descriptions and timeline

```html
<ul class="list list-interactive">
  <li>
    <span class="avatar">AN</span>
    <div class="list-content"><span class="list-title">Ana Nogueira</span><span class="list-meta">Design</span></div>
    <button class="btn btn-sm btn-soft">Invite</button>
  </li>
</ul>

<dl class="desc-list">
  <div><dt>Plan</dt><dd>Pro yearly</dd></div>
  <div><dt>Next charge</dt><dd>Dec 12</dd></div>
</dl>

<ol class="timeline">
  <li><time>Today</time><span class="timeline-title">Order shipped</span></li>
  <li class="tone-success"><time>Yesterday</time><span class="timeline-title">Payment approved</span></li>
</ol>
```

`.list-flush` removes the list's border and background. The description list stacks on narrow screens. For data tables, use `.table` inside `.table-wrap` (horizontal scroll and sticky header) with `.table-striped`.

### Chat, empty state and code

```html
<div class="chat">
  <p class="bubble">Hi! Has the order shipped?</p>
  <p class="bubble bubble-out">It shipped today. Arrives by Friday.</p>
  <span class="bubble-meta">Read at 2:22 PM</span>
</div>

<div class="empty">
  <i class="si si-inbox empty-icon" aria-hidden="true"></i>
  <h3>No messages yet</h3>
  <p>When someone writes to you, conversations show up here.</p>
  <button class="btn">New conversation</button>
</div>

<figure class="code-window">
  <figcaption class="code-header"><span>app.css</span><button class="btn btn-ghost btn-sm">Copy</button></figcaption>
  <pre><code>@import "salve-css";</code></pre>
</figure>
```

### Chips, rating, indicator and avatar

```html
<label class="chip"><input type="checkbox" checked> Paid</label>
<span class="chip">design <button class="chip-remove" aria-label="Remove design">×</button></span>

<!-- rating with radios, no JS -->
<div class="rating" role="radiogroup" aria-label="Your rating">
  <input type="radio" name="rate" value="1" aria-label="1 star">
  <!-- … up to 5 -->
</div>

<!-- read-only, accepts fractions -->
<span class="stars" style="--value: 4.5" role="img" aria-label="4.5 out of 5"></span>

<span class="indicator">
  <span class="avatar">AN</span>
  <span class="indicator-dot tone-success" aria-label="online"></span>
</span>

<div class="avatar-group">
  <span class="avatar">AN</span>
  <span class="avatar tone-info">BR</span>
  <span class="avatar tone-neutral">+4</span>
</div>
```

### Accordion

```html
<details class="accordion" name="faq">
  <summary>Do I need a build step?</summary>
  <p>No. A link is enough.</p>
</details>
```

The same `name` on several `<details>` = only one open at a time (native). Opening is animated where supported.

### Text helpers and more

```html
<span class="eyebrow">New</span>
<h1>Title</h1>
<p class="lead">Opening paragraph, larger and softer.</p>

<a class="skip-link" href="#content">Skip to content</a>
<div class="divider">or</div>

<div class="stat">
  <span class="stat-label">Revenue</span>
  <span class="stat-value">$48k</span>
</div>

<article class="prose">…HTML from a CMS or markdown…</article>
```

`.prose` styles long-form text with no inner classes: headings, lists, quotes, images, code.

---

## Motion

The `motion` module ships ready-made animations as classes. Everything respects the system's "reduce motion" setting: entrances become instant, loops stop and delays go away.

### Entrances and exits

```html
<div class="card animate-slide-up">Slides up into place</div>
<div class="card animate-pop delay-200">Pops in with a bounce, 200 ms later</div>
<div class="toast animate-fade-out">Goes away</div>
```

| Type | Classes |
|---|---|
| Entrances | `animate-fade-in` `animate-slide-up` `animate-slide-down` `animate-slide-left` `animate-slide-right` `animate-zoom-in` `animate-pop` `animate-blur-in` `animate-flip-in` `animate-wipe-right` `animate-rise` |
| Exits | `animate-fade-out` `animate-zoom-out` `animate-slide-out-up` `animate-slide-out-down` |
| Attention | `animate-shake` `animate-wiggle` `animate-heartbeat` `animate-tada` `animate-jelly` |
| Loops | `animate-spin` `animate-spin-slow` `animate-pulse` `animate-ping` `animate-bounce` `animate-float` `animate-glow` `animate-gradient` |

The classic: an invalid field that "shakes".

```js
input.classList.add("animate-shake");
input.addEventListener("animationend", () => input.classList.remove("animate-shake"), { once: true });
```

Moving gradient text: `<h1 class="animate-gradient text-clip">`.

### Timing control

| Class | Effect |
|---|---|
| `animate-fast` `animate-slow` `animate-slower` | speed |
| `delay-100` `delay-200` `delay-300` `delay-500` `delay-700` `delay-1000` | delay |
| `animate-once` `animate-twice` `animate-infinite` | repetitions |
| `animate-paused` `animate-pause-hover` `animate-none` | pause or turn off |

Or tune it directly with variables: `--animate-duration`, `--animate-delay`, `--animate-ease`, `--animate-iterations` and `--animate-distance` (how far slides travel).

### One after another: `.stagger`

Children enter one after the other, without writing a delay for each.

```html
<ul class="list stagger">
  <li>…</li>  <!-- 0 ms -->
  <li>…</li>  <!-- 70 ms -->
  <li>…</li>  <!-- 140 ms -->
</ul>
```

`--stagger` changes the interval (70 ms by default). `.stagger-fade` and `.stagger-zoom` change the effect.

### Hover and press

```html
<article class="card hover-float">…</article>
<button class="btn hover-shine press">Subscribe</button>
<a class="hover-underline" href="/blog">Blog</a>
```

`hover-grow`, `hover-shrink`, `hover-float`, `hover-glow`, `hover-rotate`, `hover-shine` (a light sweep across the element), `hover-underline` (an underline that grows) and `press` (shrinks on click).

### Scroll-driven (no JavaScript)

```html
<section class="card reveal">Appears as it enters the screen</section>
<img class="parallax" src="background.jpg" alt="" style="--parallax: 20%">
<div class="scroll-progress"></div>  <!-- reading progress bar at the top -->
```

`reveal`, `reveal-left`, `reveal-right`, `reveal-zoom`, `reveal-blur`, `parallax` and `scroll-progress`. They use `animation-timeline`; where it isn't supported, the content simply shows up and the progress bar stays hidden. `--reveal-at` controls when the animation finishes (`28%` by default).

### Text and loading

```html
<!-- --chars = number of characters in the text -->
<span class="typewriter" style="--chars: 24">CSS that eases the pain.</span>

<!-- infinite scroll: repeat the items once (the copy with aria-hidden) -->
<div class="marquee">
  <div class="marquee-track">
    <img src="logo-a.svg" alt="A"> <img src="logo-b.svg" alt="B">
    <img src="logo-a.svg" alt="" aria-hidden="true"> <img src="logo-b.svg" alt="" aria-hidden="true">
  </div>
</div>

<span class="loader-dots" role="status" aria-label="Loading"></span>
```

The marquee pauses on hover; `.marquee-reverse` flips the direction and `--marquee-duration` changes the speed.

---

## Utilities

Names are familiar to anyone coming from Tailwind. Under the hood they use **logical properties** (`padding-inline` instead of `padding-left`), so they work in right-to-left languages.

| Category | Classes |
|---|---|
| Display | `block` `inline` `inline-block` `flex` `inline-flex` `grid` `inline-grid` `contents` `hidden` |
| Flex | `flex-row` `flex-col` `flex-wrap` `flex-1` `grow` `shrink-0` `items-{start,center,end,stretch,baseline}` `justify-{start,center,end,between,around,evenly}` `self-*` `place-center` |
| Grid | `cols-{1…12}` `span-{1…12}` `span-full` `rows-{1…6}` `row-span-{1…6}` |
| Gap | `gap-{n}` `gap-x-{n}` `gap-y-{n}` |
| Padding | `p-{n}` `px-{n}` `py-{n}` `pt-{n}` `pb-{n}` `ps-{n}` `pe-{n}` |
| Margin | `m-{n}` `mx-{n}` `my-{n}` `mt-{n}` `mb-{n}` `ms-{n}` `me-{n}` `mx-auto` `mt-auto` `ms-auto`… |
| Sizing | `w-full` `w-auto` `w-fit` `h-full` `h-screen` `min-h-screen` `min-w-0` `max-w-{sm,md,lg,xl,prose,none}` `size-{n}` `w-{n}` `h-{n}` `w-1/2` `w-1/3` `w-2/3` `w-1/4` `w-3/4` |
| Text | `text-{xs…6xl}` `font-{light,normal,medium,semibold,bold}` `font-{sans,display,mono}` `leading-*` `tracking-*` `text-{start,center,end}` `uppercase` `italic` `underline` `tabular-nums` `text-balance` `text-pretty` `nowrap` `truncate` `line-clamp-{1…5}` `break-words` `hyphens-auto` `list-none` |
| Text color | `text-{default,muted,subtle,accent,success,warning,danger,info,inherit}` `on-accent` |
| Background | `bg-{bg,surface,subtle,accent,accent-subtle,success,warning,danger,info,transparent}` |
| Full palette | `text-brand-{50…950}` `bg-brand-{50…950}` `text-gray-*` `bg-gray-*` |
| Border | `border` `border-0` `border-strong` `border-{t,b,s,e}` `border-{accent,success,warning,danger,info}` `rounded-{none,sm,md,lg,xl,full}` `divide-y` `divide-x` |
| Effects | `shadow-{sm,md,lg,xl,inner,none}` `ring` `ring-danger` `blur-sm` `blur` `grayscale` `glass` `opacity-{0,25,50,75,100}` |
| Gradients | `bg-gradient` `text-gradient` `border-gradient` |
| Transitions | `transition` `transition-colors` `transition-transform` `transition-none` `duration-fast` `duration-slow` `ease-spring` |
| Transforms | `lift` `scale-{95,105,110}` `rotate-{45,90,180}` `flip-x` |
| Position | `static` `relative` `absolute` `fixed` `sticky` `inset-0` `inset-x-0` `inset-y-0` `top-0` `bottom-0` `start-0` `end-0` `absolute-center` `z-{below,base,raised,dropdown,sticky,overlay,modal,toast,tooltip}` |
| Scrolling | `scrollbar-thin` `scrollbar-none` `scroll-shadow` `overscroll-contain` `snap-x` `snap-y` `snap-{start,center,end}` |
| Safe area (iPhone) | `pt-safe` `pb-safe` `px-safe` |
| Other | `overflow-{hidden,auto,clip}` `overflow-x-auto` `aspect-{square,video,photo,portrait,wide}` `object-{cover,contain,top,center,bottom}` `columns-{1…4}` `cursor-pointer` `select-none` `pointer-events-none` `isolate` `invisible` `visible` `sr-only` `not-sr-only` |
| Theme | `only-light` `only-dark` (swap a logo or illustration per mode) |
| Print | `print:hidden` `print-only` |

`{n}` follows the spacing scale: `0 1 2 3 4 5 6 8 10 12 16 20 24 32` (1 = 0.25rem × density).

**Scroll shadow:** `class="scroll-shadow"` shows a shadow at the top or bottom only when there's more content to scroll. Pure CSS.

### States: `hover:`, `focus-visible:` and `group-hover:`

Colors, backgrounds, shadows, opacity and transforms have state variants:

```html
<a class="card transition-transform hover:lift hover:shadow-lg">…</a>
<button class="btn btn-ghost hover:text-danger">Delete</button>

<article class="group card">
  <i class="si si-arrow-right opacity-0 group-hover:opacity-100"></i>
</article>
```

### Responsive

**Screen** prefixes (mobile-first, from the given width up):

| Prefix | From |
|---|---|
| `sm:` | 40rem (640px) |
| `md:` | 48rem (768px) |
| `lg:` | 64rem (1024px) |
| `xl:` | 80rem (1280px) |

**Container** prefixes (inside an element with `.cq`):

| Prefix | From |
|---|---|
| `@sm:` | 24rem |
| `@md:` | 36rem |
| `@lg:` | 52rem |

```html
<div class="flex flex-col md:flex-row gap-4 md:gap-8">…</div>
<nav class="hidden lg:flex">…</nav>
<div class="cols-1 sm:cols-2 lg:cols-4 grid gap-6">…</div>
```

Responsive variants cover display, flex, grid, gap, `p`/`px`/`py`, text size, text alignment and sizing. To include other groups, use the [config file](#cli-and-config-file).

---

## Customization

There are four levels. Start with the first and only move up when you need to.

**Level 1 · Theme variables** (no build)

```css
:root {
  --s-hue: 280;
  --s-radius: 0;
  --s-density: 0.9;
  --s-font-sans: "Inter", sans-serif;
}
```

**Level 2 · Per block or per instance**

```html
<section data-theme="dark" style="--s-hue: 25">…</section>
<button class="btn" style="--btn-radius: 99px">Subscribe</button>
<div class="grid" style="--min: 12rem; --gap: var(--s-space-2)">…</div>
```

**Level 3 · Utilities**

```html
<div class="p-6 md:p-10 rounded-xl shadow-lg bg-surface">…</div>
```

**Level 4 · Your own build** with your modules, breakpoints and spacing scale. See the next section.

### Building your own components

Use the tokens in your own CSS and you get dark mode, theming and density for free:

```css
.pricing-card {
  padding: var(--s-space-8);
  border-radius: var(--s-radius-xl);
  background: var(--s-surface);
  box-shadow: var(--s-shadow-lg);
  color: var(--s-text);
}

.pricing-card[data-featured] {
  outline: 2px solid var(--s-accent);
}
```

---

## CLI and config file

The CLI ships with the package and builds a tailored CSS file.

```bash
npx salve init            # creates salve.config.js
npx salve build           # writes ./salve.css
npx salve build -m        # minified
npx salve build -c theme.config.js -o public/css/app.css -m
```

| Option | Description |
|---|---|
| `-c, --config <file>` | config file (default: `./salve.config.js`, if present) |
| `-o, --out <file>` | output file (default: `./salve.css`) |
| `-m, --minify` | minify |

### `salve.config.js`, full reference

```js
export default {
  theme: {
    hue: 250,                 // --s-hue
    chroma: 0.15,             // --s-chroma
    neutralHue: 250,          // --s-neutral-hue (tint the grays with another hue)
    neutralChroma: 0.02,      // --s-neutral-chroma
    radius: '0.75rem',        // --s-radius
    density: 1,               // --s-density
    fonts: {
      sans: '"Inter", system-ui, sans-serif',
      display: '"Fraunces", serif',
      mono: '"JetBrains Mono", monospace',
    },
    tokens: {                 // any token; the --s- prefix is optional
      '--s-accent': '#2563eb',
      'container': '80rem',
    },
  },

  modules: {
    reset: true,
    base: true,
    layout: true,
    // pick component modules (or true for all)
    components: ['tone', 'button', 'card', 'form', 'feedback', 'overlay', 'data', 'nav',
                 'tabs', 'navigation', 'content', 'controls'],
    motion: true,             // animations (salve.motion)
    utilities: true,
  },

  utilities: {
    spacing: [0, 1, 2, 3, 4, 6, 8, 12, 16, 24],
    breakpoints: { sm: '40rem', md: '48rem', lg: '64rem', xl: '80rem' },
    containerBreakpoints: { sm: '24rem', md: '36rem', lg: '52rem' },
    // groups with sm:/md:/lg:/xl: variants
    responsive: ['display', 'flex', 'grid', 'spacing', 'gap', 'text', 'align', 'sizing'],
    // groups with @sm:/@md:/@lg: variants
    containerResponsive: ['display', 'flex', 'grid', 'gap', 'text', 'align'],
    // groups with hover:/focus-visible:/group-hover: variants
    states: ['color', 'effect', 'opacity', 'transform'],
  },

  minify: false,
};
```

| Component module | Includes |
|---|---|
| `tone` | `.tone-*` (needed for tones on the others) |
| `button` | `.btn` and variants |
| `card` | `.card`, `.card-link` |
| `form` | `.field`, `.input`, `.input-group`, `.check`, `.switch`, `.segmented` |
| `feedback` | `.badge`, `.alert`, `.progress`, `.spinner`, `.skeleton`, `.toast` |
| `overlay` | `.dialog`, `.drawer`, `.drawer-bottom`, `.menu`, `.popover-card`, `[data-tip]` |
| `data` | `.table`, `.avatar`, `.accordion`, `.divider`, `.stat` |
| `nav` | `.navbar`, `.nav-link`, `.breadcrumb`, `.prose` |
| `tabs` | `.tabs`, `.tab-list`, `.tab`, `.tab-panel`, `.tabs-pills` |
| `navigation` | `.nav-list`, `.pagination`, `.steps` |
| `content` | `.lead`, `.eyebrow`, `.skip-link`, `.list`, `.desc-list`, `.timeline`, `.empty`, `.chat`/`.bubble`, `.code-window` |
| `controls` | `.chip`, `.btn-group`, `.rating`, `.stars`, `.dropzone`, `.field-float`, `.input-sm`/`.input-lg`, `.indicator`, `.ring-progress` |

The full package is about 144 KB minified and 25 KB gzipped, with everything. With the CLI you keep only what you use; a build with just the reset, base, layout and buttons stays under 8 KB gzipped.

### Build API (Node)

```js
import { build } from "salve-css/build";

const css = await build({ theme: { hue: 25 }, minify: true });
```

---

## Use cases

### Landing page

```html
<section class="cover" style="--min-h: 80dvh">
  <div class="cover-main container stack items-center text-center" style="--gap: var(--s-space-6)">
    <span class="badge animate-fade-in">New · version 2.0</span>
    <h1 class="text-6xl animate-slide-up">Your product, faster</h1>
    <p class="lead animate-slide-up delay-100">One clear sentence about the benefit.</p>
    <div class="cluster animate-slide-up delay-200" style="--justify: center">
      <a class="btn btn-lg hover-shine" href="#">Start free</a>
      <a class="btn btn-lg btn-outline" href="#">Talk to sales</a>
    </div>
  </div>
</section>
```

### Login screen

```html
<main class="center min-h-screen p-4">
  <form class="card stack" style="--card-pad: var(--s-space-8); inline-size: min(24rem, 100%)">
    <h1 class="text-2xl">Log in</h1>
    <div class="field">
      <label for="e">Email</label>
      <input class="input" id="e" type="email" autocomplete="email" required>
      <p class="error">Use a valid email.</p>
    </div>
    <div class="field">
      <label for="s">Password</label>
      <input class="input" id="s" type="password" autocomplete="current-password" minlength="8" required>
      <p class="error">Passwords have at least 8 characters.</p>
    </div>
    <button class="btn btn-block">Log in</button>
    <div class="divider">or</div>
    <a class="btn btn-block btn-outline tone-neutral" href="#">Send me a magic link</a>
  </form>
</main>
```

### Dashboard

```html
<div class="app-shell" style="--side: 15rem">
  <header class="navbar"><strong>Acme</strong></header>
  <aside class="p-3 border-e" data-density="compact">
    <ul class="nav-list">
      <li><a href="#" aria-current="page">Overview</a></li>
      <li><a href="#">Orders</a></li>
      <li><a href="#">Customers</a></li>
    </ul>
  </aside>
  <main class="stack p-6 md:p-10" style="--gap: var(--s-space-8)">
    <div class="split">
      <h1 class="text-3xl">Overview</h1>
      <button class="btn">Export</button>
    </div>
    <div class="grid stagger" style="--min: 12rem; --gap: var(--s-space-4)">
      <div class="card stat"><span class="stat-label">Revenue</span><span class="stat-value">$48k</span></div>
      <div class="card stat"><span class="stat-label">Orders</span><span class="stat-value">1,204</span></div>
      <div class="card stat"><span class="stat-label">Average ticket</span><span class="stat-value">$39.90</span></div>
    </div>
    <div class="table-wrap"><table class="table">…</table></div>
  </main>
</div>
```

### Product grid

```html
<div class="grid" style="--min: 14rem">
  <article class="card card-interactive hover-float">
    <img src="sneaker.jpg" alt="" class="aspect-square">
    <h3 class="text-base"><a class="card-link" href="/p/sneaker">Light Sneaker</a></h3>
    <div class="split">
      <strong>$89</strong>
      <span class="badge tone-success">Free shipping</span>
    </div>
  </article>
</div>
```

### Blog or documentation

```html
<article class="content-grid">
  <header class="stack" style="--gap: var(--s-space-3)">
    <span class="eyebrow">Nov 8, 2026 · 5 min</span>
    <h1>Post title</h1>
  </header>
  <div class="prose">
    <!-- HTML from markdown/CMS -->
  </div>
  <img class="wide reveal" src="diagram.png" alt="…">
</article>
```

### Adopting it gradually in an existing project

Because everything lives in layers, salve doesn't override the CSS you already have. You can bring it in step by step:

1. Add salve's `<link>` **before** your CSS.
2. Use the layout primitives and tokens on new screens.
3. If the reset or the base get in the way, build without them:

```js
// salve.config.js
export default { modules: { reset: false, base: false } };
```

---

## Frameworks, SSR and Next.js

salve is just CSS, so it works with any stack, with or without server rendering.

### SSR and Next.js

**The CSS doesn't depend on JavaScript.** It's rendered on the server like any stylesheet: there's no code running in the browser to apply classes or themes, and automatic dark mode comes from CSS alone. So there's no flash, no hydration warning and no extra setup.

Tested in a Next.js 16 app (App Router) with **Turbopack and with webpack**: the build passes, the `@layer` rules are preserved and the console stays clean.

```jsx
// app/layout.jsx
import "salve-css";

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
```

That's it. Components are just classes, so they work in Server Components without `"use client"`.

### Theme toggle without a flash: `salve-css/theme`

You only need this if you offer a button to switch between light and dark. The classic SSR problem: the server doesn't know the preference saved in `localStorage`, so the page is born light and "flashes" to dark. `salve-css/theme` fixes it with a one-line script that runs **before the first paint**.

```jsx
// app/layout.jsx
import "salve-css";
import { themeScript } from "salve-css/theme";

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
```

```jsx
// app/theme-toggle.jsx
"use client";
import { toggleTheme } from "salve-css/theme";

export function ThemeToggle() {
  return (
    <button className="btn btn-ghost btn-icon" onClick={toggleTheme} aria-label="Toggle theme">
      ◐
    </button>
  );
}
```

- `suppressHydrationWarning` on `<html>` is needed because the script sets `data-theme` before React hydrates. It only applies to `<html>`'s attributes, not the whole page.
- Every function is safe to import on the server: they only touch the DOM when called in the browser.

| Function | What it does |
|---|---|
| `themeScript` | string for `<head>`: applies the saved theme before paint |
| `setTheme("light" \| "dark" \| "system")` | applies and saves the choice; `"system"` follows the OS again |
| `toggleTheme()` | switches between light and dark based on what's on screen |
| `getTheme()` | saved choice: `"light"`, `"dark"` or `"system"` |
| `getResolvedTheme()` | theme on screen right now: `"light"` or `"dark"` |

TypeScript types are included.

### Other frameworks

**Vite / React / Vue / Svelte**

```js
// main.jsx | main.ts
import "salve-css";
```

**Remix / React Router**

```jsx
// app/root.jsx
import salve from "salve-css?url";
export const links = () => [{ rel: "stylesheet", href: salve }];
```

**Nuxt**

```js
// nuxt.config.ts
export default defineNuxtConfig({ css: ["salve-css"] });
```

**SvelteKit**

```svelte
<!-- src/routes/+layout.svelte -->
<script>import "salve-css";</script>
<slot />
```

**Astro**

```astro
---
import "salve-css";
---
```

`themeScript` works the same in all of them: put its content in an inline `<script>` in the layout's `<head>`.

### React tips

Inline variables work through `style`:

```jsx
<div className="grid" style={{ "--min": "14rem" }}>
  <button className="btn tone-danger" aria-busy={saving}>Delete</button>
</div>
```

A component with variants:

```jsx
export function Button({ variant, tone, size, className = "", ...props }) {
  const cls = ["btn", variant && `btn-${variant}`, tone && `tone-${tone}`, size && `btn-${size}`, className]
    .filter(Boolean).join(" ");
  return <button className={cls} {...props} />;
}

// <Button variant="soft" tone="danger">Delete</Button>
```

**WordPress, Rails, Django, Laravel, PHP:** put the `<link>` in the base template.

---

## Icons: salve-icons

[`salve-icons`](https://github.com/juliocarneiro/salve-icons) is salve's sister icon library: 292 stroke icons, social brands included. They inherit color (`currentColor`) and size (`1em`) from the text, so they line up with buttons, badges and links on their own. They also ship React components that work in Server Components.

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/salve-icons/dist/salve-icons.css">

<button class="btn"><i class="si si-plus" aria-hidden="true"></i> New project</button>
```

```jsx
import { PlusIcon } from "salve-icons/react";

<button className="btn"><PlusIcon /> New project</button>
```

---

## Accessibility

What salve already takes care of:

- **Visible focus** on every interactive element (`:focus-visible`), with a ring in the brand color.
- **Contrast:** semantic pairs (text on background, text on the brand color) meet WCAG AA, and control borders have contrast ≥ 3:1.
- **Reduced motion:** with `prefers-reduced-motion`, duration tokens become `1ms`, loops stop, delays go away and scroll-driven effects are skipped.
- **Touch targets:** controls get bigger on touch screens (`pointer: coarse`).
- **Windows High Contrast** (`forced-colors`): buttons, cards, tabs and switches keep visible borders.
- **Native components:** `<dialog>`, `popover`, `<details>` and real form controls bring keyboard and screen reader support for free.
- **RTL:** logical properties throughout.
- **Print:** white background, no navigation or overlays, link URLs visible.

What stays with you:

- Alternative text (`alt`) and labels (`<label for>`, `aria-label` on icon-only buttons).
- Not using color alone to convey state. That's why dot badges (`.badge-dot`) should have text next to them.
- A logical heading order (`h1` → `h2` → `h3`).

---

## Browser support

salve targets modern browsers: **Chrome/Edge 123+, Safari 17.5+ and Firefox 128+** (all from 2024 onward). The core of the system (layers, nesting, `light-dark()`, `:has()`, container queries) works in all of them.

Some features are **progressive enhancement**. Without support, the component works normally, just without the extra:

| Feature | Without support |
|---|---|
| Anchor positioning (`.menu`, `.popover-card` next to the button) | opens centered |
| `::details-content` (animated `.accordion`) | opens without animation |
| `field-sizing` (growing `<textarea>`) | fixed size, resizable |
| `closedby` (close the dialog by clicking outside) | closes with Esc and the buttons |
| `command` / `commandfor` | use `dialog.showModal()` |
| `transition-behavior: allow-discrete` | no exit animation |
| `animation-timeline` (`.reveal`, `.parallax`, `.scroll-progress`) | content shows normally; progress bar hidden |

---

## salve, Tailwind or Bootstrap?

| | salve | Tailwind | Bootstrap |
|---|---|---|---|
| Needs a build step | no (optional) | yes | no |
| Ready-made components | yes | no (utilities only) | yes |
| Utilities | yes, with `md:`, `@md:` and `hover:` | yes | partial |
| Layout without media queries | yes (intrinsic primitives) | no | no |
| Ready-made animations | yes, incl. scroll-driven | a few | no |
| Overrides without `!important` | yes (`@layer`) | yes | hard |
| Runtime theming (no rebuild) | yes (CSS variables) | partial | partial |
| Automatic dark mode | yes | manual (`dark:`) | yes |
| JavaScript required | none | none | for modals and menus |
| Resulting HTML | lean | many classes | medium |

**Pick salve** if you want something that works by pasting a link, with accessible components and clean HTML, and that you can still customize all the way to your own build.

---

## FAQ

**Do I need Node, PostCSS or a build step?**
No. The CLI is optional and only for people who want a tailored CSS file.

**Will salve mess with my project's CSS?**
No. Everything lives in layers, and your CSS outside of layers always wins. The reset uses `:where()`, which has zero specificity.

**Will `.card` and `.btn` clash with mine?**
If you already have a `.card`, the styles add up and yours win. If you'd rather isolate them, build without the conflicting component module.

**Does it work alongside Tailwind?**
It does, but both have a reset and utilities with similar names. Prefer just one, or build salve without `reset` and `utilities`.

**How do I use my exact brand color?**
Override `--s-accent` (and optionally `--s-accent-hover`, `--s-accent-subtle`, `--s-accent-text`, `--s-on-accent`).

**Why OKLCH?**
Because it's perceptual: changing the hue doesn't change the lightness. With HEX or HSL, a yellow and a blue "of the same shade" have very different contrast.

**How big is it?**
The full package is about 144 KB minified and 25 KB gzipped. With the CLI you remove what you don't use.

---

## Development

```bash
git clone https://github.com/juliocarneiro/salve-css.git
cd salve-css
npm run build     # writes dist/salve.css and dist/salve.min.css
```

```
src/
  tokens.css          theme knobs, palettes, semantic tokens, scales
  reset.css           modern, zero-specificity reset
  base.css            class-less HTML, print styles
  layout.css          layout primitives
  components/         tone, button, card, form, feedback, overlay, data, nav,
                      tabs, navigation, content, controls
  motion.css          animations (salve.motion)
lib/
  build.js            assembles the final CSS from the config
  utilities.js        generates utilities and their variants
runtime/theme.js      salve-css/theme (SSR-safe theme helpers)
bin/salve.js          CLI
dist/                 built (published to npm, not in git)
```

The documentation site lives in a separate project: [salve-site](https://github.com/juliocarneiro/salve-site).

**Conventions**

- One layer per file, always inside `@layer salve.<name>`.
- Reset and base selectors always wrapped in `:where()`.
- Every color, space, radius and duration comes from a token.
- Logical properties by default. Physical ones only where they shouldn't flip in RTL.
- New features land as progressive enhancement, with acceptable behavior without them.

See the [CHANGELOG](CHANGELOG.md) for what changed in each version.

## License

MIT © Julio Carneiro
