# Changelog

All notable changes to salve-css. The project follows [semantic versioning](https://semver.org/).

## 0.2.0

A release focused on making salve complete for real applications. No class from 0.1 changed behavior.

### New: motion module (`salve.motion`)

- **Entrances and exits:** `animate-fade-in`, `animate-slide-up/-down/-left/-right`, `animate-zoom-in`, `animate-pop`, `animate-blur-in`, `animate-flip-in`, `animate-wipe-right`, `animate-rise`, `animate-fade-out`, `animate-zoom-out`, `animate-slide-out-up/-down`.
- **Attention seekers:** `animate-shake`, `animate-wiggle`, `animate-heartbeat`, `animate-tada`, `animate-jelly`.
- **Loops:** `animate-spin`, `animate-spin-slow`, `animate-pulse`, `animate-ping`, `animate-bounce`, `animate-float`, `animate-glow`, `animate-gradient`.
- **Timing control:** `animate-fast/-slow/-slower`, `delay-*`, `animate-once/-twice/-infinite`, `animate-paused`, `animate-pause-hover`, `animate-none`, plus `--animate-duration`, `--animate-delay`, `--animate-ease`, `--animate-iterations` and `--animate-distance`.
- **`.stagger`:** children animate one after another (`.stagger-fade`, `.stagger-zoom`, `--stagger`).
- **Hover and press:** `hover-grow`, `hover-shrink`, `hover-float`, `hover-glow`, `hover-rotate`, `hover-shine`, `hover-underline`, `press`.
- **Scroll-driven, no JavaScript:** `reveal`, `reveal-left/-right/-zoom/-blur`, `parallax`, `scroll-progress`.
- **Text and loaders:** `typewriter`, `marquee`, `loader-dots`.
- Everything respects `prefers-reduced-motion`: entrances become instant, loops stop and delays go away.

### New components

- **Tabs** (`.tabs`, `.tab-list`, `.tab`, `.tab-panel`, `.tabs-pills`): work without JavaScript using native radios, or with the ARIA pattern and your own JS.
- **Navigation** (`navigation` module): `.nav-list` sidebar menu, `.pagination` and `.steps` / `.steps-vertical`.
- **Content** (`content` module): `.lead`, `.eyebrow`, `.skip-link`, `.list` (with `.list-interactive` and `.list-flush`), `.desc-list`, `.timeline`, `.empty`, `.chat` / `.bubble` and `.code-window`.
- **Controls** (`controls` module): `.chip`, `.btn-group`, `.rating` (no JS), `.stars` (read-only, with fractions), `.dropzone` (native drag and drop), `.field-float` (floating label), `.input-sm` / `.input-lg`, `.indicator` and `.ring-progress` (animated ring).
- **Overlays:** `.popover-card` (rich popover anchored to its button) and `.drawer-bottom` (bottom sheet).

### New layouts

- `.flow`, `.layers`, `.bento`, `.masonry` and `.app-shell`.

### New utilities

- State variants `hover:`, `focus-visible:` and `group-hover:` for color, background, shadow, opacity and transforms (new `utilities.states` config option).
- Effects: `glass`, `bg-gradient`, `text-gradient`, `border-gradient`, `ring`, `blur`, `grayscale`, `shadow-inner`.
- Full palette (`text-brand-*`, `bg-brand-*`, `text-gray-*`, `bg-gray-*`), sizes (`size-*`, `w-*`, `h-*`, fractions), `rows-*`, `row-span-*`, opacity, `divide-y` / `divide-x`.
- Scrolling: `scroll-shadow`, `scrollbar-thin`, `scrollbar-none`, `snap-*`, `overscroll-contain`.
- iPhone safe area (`pt-safe`, `pb-safe`, `px-safe`), `only-light` / `only-dark`, `print:hidden` / `print-only`.

### Tokens and base

- `--s-gradient`, `--s-space-fluid-*`, `--s-ease-spring` and `--s-shadow-inner`.
- Print styles in the base layer: white background, no navigation or overlays, visible link URLs and careful page breaks.

### Docs

- The README is now in English, with a Portuguese version in `README.pt-BR.md`.

## 0.1.0

First release: OKLCH tokens with a 4-variable theme, `@layer` cascade layers, reset and base, layout primitives, components (button, card, forms, feedback, overlays, data, navigation), responsive utilities, a build CLI and `salve-css/theme` for SSR.
