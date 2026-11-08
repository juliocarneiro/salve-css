// salve · utility generator
// Builds the utility layer from a small spec, so breakpoints, spacing scale and
// which groups get responsive variants are all configurable (salve.config.js).
// Utilities read tokens (var(--s-*)), so theme knobs keep working on them.

const SPACING = [0, 1, 2, 3, 4, 5, 6, 8, 10, 12, 16, 20, 24, 32];

export const defaultUtilityConfig = {
  spacing: SPACING,
  breakpoints: { sm: '40rem', md: '48rem', lg: '64rem', xl: '80rem' },
  containerBreakpoints: { sm: '24rem', md: '36rem', lg: '52rem' },
  // groups that get sm:/md:/lg:/xl: (viewport) and @sm:/@md:/@lg: (container) variants
  responsive: ['display', 'flex', 'grid', 'spacing', 'gap', 'text', 'align', 'sizing'],
  containerResponsive: ['display', 'flex', 'grid', 'gap', 'text', 'align'],
  // groups that get hover:, focus-visible: and group-hover: variants
  states: ['color', 'effect', 'opacity', 'transform'],
};

// calc() on the base unit, so any custom spacing key works and density applies
const space = (n) => (n === 0 ? '0' : `calc(var(--s-space) * ${n})`);

function buildRules(cfg) {
  const rules = [];
  const add = (group, name, decl) => rules.push({ group, name, decl });
  const sp = cfg.spacing;

  // Display
  for (const [n, v] of [
    ['block', 'block'], ['inline', 'inline'], ['inline-block', 'inline-block'],
    ['flex', 'flex'], ['inline-flex', 'inline-flex'], ['grid', 'grid'],
    ['inline-grid', 'inline-grid'], ['contents', 'contents'], ['hidden', 'none'],
  ]) add('display', n, `display:${v}`);

  // Flexbox
  add('flex', 'flex-row', 'flex-direction:row');
  add('flex', 'flex-col', 'flex-direction:column');
  add('flex', 'flex-row-reverse', 'flex-direction:row-reverse');
  add('flex', 'flex-col-reverse', 'flex-direction:column-reverse');
  add('flex', 'flex-wrap', 'flex-wrap:wrap');
  add('flex', 'flex-nowrap', 'flex-wrap:nowrap');
  add('flex-item', 'flex-1', 'flex:1 1 0%');
  add('flex-item', 'flex-auto', 'flex:1 1 auto');
  add('flex-item', 'flex-none', 'flex:none');
  add('flex-item', 'grow', 'flex-grow:1');
  add('flex-item', 'shrink-0', 'flex-shrink:0');
  for (const v of ['start', 'center', 'end', 'stretch', 'baseline'])
    add('flex', `items-${v}`, `align-items:${v === 'start' || v === 'end' ? 'flex-' + v : v}`);
  for (const [n, v] of [['start', 'flex-start'], ['center', 'center'], ['end', 'flex-end'],
    ['between', 'space-between'], ['around', 'space-around'], ['evenly', 'space-evenly']])
    add('flex', `justify-${n}`, `justify-content:${v}`);
  for (const v of ['start', 'center', 'end', 'stretch'])
    add('flex-item', `self-${v}`, `align-self:${v}`);
  add('flex', 'place-center', 'place-items:center;place-content:center');

  // Grid
  for (let i = 1; i <= 12; i++) {
    add('grid', `cols-${i}`, `grid-template-columns:repeat(${i},minmax(0,1fr))`);
    add('grid', `span-${i}`, `grid-column:span ${i}/span ${i}`);
  }
  add('grid', 'span-full', 'grid-column:1/-1');

  // Gap
  for (const n of sp) {
    add('gap', `gap-${n}`, `gap:${space(n)}`);
    add('gap-axis', `gap-x-${n}`, `column-gap:${space(n)}`);
    add('gap-axis', `gap-y-${n}`, `row-gap:${space(n)}`);
  }

  // Spacing — familiar names, logical properties underneath (RTL-ready)
  const boxes = [
    ['p', 'padding'], ['px', 'padding-inline'], ['py', 'padding-block'],
    ['pt', 'padding-block-start'], ['pb', 'padding-block-end'],
    ['ps', 'padding-inline-start'], ['pe', 'padding-inline-end'],
    ['m', 'margin'], ['mx', 'margin-inline'], ['my', 'margin-block'],
    ['mt', 'margin-block-start'], ['mb', 'margin-block-end'],
    ['ms', 'margin-inline-start'], ['me', 'margin-inline-end'],
  ];
  // only the shorthand p/px/py get responsive variants; single sides stay base-only
  const responsiveBoxes = new Set(['p', 'px', 'py']);
  for (const [p, prop] of boxes)
    for (const n of sp) add(responsiveBoxes.has(p) ? 'spacing' : 'spacing-side', `${p}-${n}`, `${prop}:${space(n)}`);
  for (const [p, prop] of boxes.filter(([p]) => p.startsWith('m')))
    add('spacing-side', `${p}-auto`, `${prop}:auto`);

  // Sizing
  add('sizing', 'w-full', 'inline-size:100%');
  add('sizing', 'w-auto', 'inline-size:auto');
  add('sizing', 'w-fit', 'inline-size:fit-content');
  add('sizing', 'h-full', 'block-size:100%');
  add('sizing', 'min-h-screen', 'min-block-size:100vh;min-block-size:100dvh');
  add('sizing', 'h-screen', 'block-size:100vh;block-size:100dvh');
  add('sizing', 'min-w-0', 'min-inline-size:0');
  for (const s of ['sm', 'md', 'lg', 'xl'])
    add('sizing', `max-w-${s}`, `max-inline-size:var(--s-container-${s})`);
  add('sizing', 'max-w-prose', 'max-inline-size:var(--s-measure)');
  add('sizing', 'max-w-none', 'max-inline-size:none');

  // Typography
  for (const s of ['xs', 'sm', 'base', 'lg', 'xl', '2xl', '3xl', '4xl', '5xl', '6xl'])
    add('text', `text-${s}`, `font-size:var(--s-text-${s})`);
  for (const w of ['normal', 'medium', 'semibold', 'bold'])
    add('type', `font-${w}`, `font-weight:var(--s-weight-${w})`);
  add('type', 'font-sans', 'font-family:var(--s-font-sans)');
  add('type', 'font-display', 'font-family:var(--s-font-display)');
  add('type', 'font-mono', 'font-family:var(--s-font-mono)');
  for (const l of ['tight', 'snug', 'normal', 'relaxed'])
    add('type', `leading-${l}`, `line-height:var(--s-leading-${l})`);
  for (const t of ['tight', 'normal', 'wide'])
    add('type', `tracking-${t}`, `letter-spacing:var(--s-tracking-${t})`);
  for (const a of ['start', 'center', 'end'])
    add('align', `text-${a}`, `text-align:${a}`);
  add('type', 'uppercase', 'text-transform:uppercase');
  add('type', 'italic', 'font-style:italic');
  add('type', 'tabular-nums', 'font-variant-numeric:tabular-nums');
  add('type', 'text-balance', 'text-wrap:balance');
  add('type', 'text-pretty', 'text-wrap:pretty');
  add('type', 'nowrap', 'white-space:nowrap');
  add('type', 'truncate', 'overflow:hidden;text-overflow:ellipsis;white-space:nowrap');
  for (let i = 1; i <= 5; i++)
    add('type', `line-clamp-${i}`, `display:-webkit-box;-webkit-box-orient:vertical;-webkit-line-clamp:${i};line-clamp:${i};overflow:hidden`);
  add('type', 'no-underline', 'text-decoration-line:none');

  // Color
  const textColors = {
    default: 'var(--s-text)', muted: 'var(--s-text-muted)', subtle: 'var(--s-text-subtle)',
    accent: 'var(--s-accent-text)', success: 'var(--s-success-text)',
    warning: 'var(--s-warning-text)', danger: 'var(--s-danger-text)', info: 'var(--s-info-text)',
    inherit: 'inherit',
  };
  for (const [n, v] of Object.entries(textColors)) add('color', `text-${n}`, `color:${v}`);
  const bgColors = {
    bg: 'var(--s-bg)', surface: 'var(--s-surface)', subtle: 'var(--s-surface-2)',
    accent: 'var(--s-accent)', 'accent-subtle': 'var(--s-accent-subtle)',
    success: 'var(--s-success-subtle)', warning: 'var(--s-warning-subtle)',
    danger: 'var(--s-danger-subtle)', info: 'var(--s-info-subtle)', transparent: 'transparent',
  };
  for (const [n, v] of Object.entries(bgColors)) add('color', `bg-${n}`, `background-color:${v}`);
  add('color', 'on-accent', 'color:var(--s-on-accent)');

  // Borders, radius, shadow
  add('border', 'border', 'border:1px solid var(--s-border)');
  add('border', 'border-0', 'border:0');
  add('border', 'border-strong', 'border-color:var(--s-border-strong)');
  add('border', 'border-t', 'border-block-start:1px solid var(--s-border)');
  add('border', 'border-b', 'border-block-end:1px solid var(--s-border)');
  add('border', 'border-s', 'border-inline-start:1px solid var(--s-border)');
  add('border', 'border-e', 'border-inline-end:1px solid var(--s-border)');
  for (const r of ['none', 'sm', 'md', 'lg', 'xl', 'full'])
    add('border', `rounded-${r}`, `border-radius:var(--s-radius-${r})`);
  for (const s of ['sm', 'md', 'lg', 'xl']) add('effect', `shadow-${s}`, `box-shadow:var(--s-shadow-${s})`);
  add('effect', 'shadow-none', 'box-shadow:none');

  // Position & layering (named z-index, never 9999)
  for (const p of ['static', 'relative', 'absolute', 'fixed', 'sticky']) add('position', p, `position:${p}`);
  add('position', 'inset-0', 'inset:0');
  add('position', 'top-0', 'inset-block-start:0');
  add('position', 'bottom-0', 'inset-block-end:0');
  for (const z of ['below', 'base', 'raised', 'dropdown', 'sticky', 'overlay', 'modal', 'toast', 'tooltip'])
    add('position', `z-${z}`, `z-index:var(--s-z-${z})`);

  // Misc
  for (const o of ['hidden', 'auto', 'clip']) add('misc', `overflow-${o}`, `overflow:${o}`);
  add('misc', 'overflow-x-auto', 'overflow-x:auto');
  add('misc', 'aspect-square', 'aspect-ratio:1');
  add('misc', 'aspect-video', 'aspect-ratio:16/9');
  add('misc', 'object-cover', 'object-fit:cover');
  add('misc', 'object-contain', 'object-fit:contain');
  add('misc', 'cursor-pointer', 'cursor:pointer');
  add('misc', 'select-none', 'user-select:none');
  add('misc', 'pointer-events-none', 'pointer-events:none');
  add('misc', 'isolate', 'isolation:isolate');
  add('misc', 'sr-only',
    'position:absolute;inline-size:1px;block-size:1px;padding:0;margin:-1px;overflow:hidden;clip-path:inset(50%);white-space:nowrap;border:0');
  add('misc', 'not-sr-only',
    'position:static;inline-size:auto;block-size:auto;margin:0;overflow:visible;clip-path:none;white-space:normal');
  add('misc', 'invisible', 'visibility:hidden');
  add('misc', 'visible', 'visibility:visible');
  for (const a of [['photo', '4/3'], ['portrait', '3/4'], ['wide', '21/9']]) add('misc', `aspect-${a[0]}`, `aspect-ratio:${a[1]}`);
  for (const p of ['top', 'center', 'bottom']) add('misc', `object-${p}`, `object-position:${p}`);
  for (let i = 1; i <= 4; i++) add('misc', `columns-${i}`, `columns:${i}`);

  // Opacity
  for (const o of [0, 25, 50, 75, 100]) add('opacity', `opacity-${o}`, `opacity:${o / 100}`);

  // More typography
  add('type', 'font-light', 'font-weight:300');
  add('type', 'leading-none', 'line-height:1');
  add('type', 'break-words', 'overflow-wrap:anywhere');
  add('type', 'break-all', 'word-break:break-all');
  add('type', 'hyphens-auto', 'hyphens:auto');
  add('type', 'list-none', 'list-style:none;padding-inline-start:0');
  add('type', 'underline', 'text-decoration-line:underline;text-underline-offset:.2em');

  // Full palette (brand + gray scales) and status borders
  const steps = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950];
  for (const n of steps) {
    add('palette', `text-brand-${n}`, `color:var(--s-brand-${n})`);
    add('palette', `bg-brand-${n}`, `background-color:var(--s-brand-${n})`);
  }
  for (const n of [...steps.slice(0, 9), 850, 900, 950].filter((v, i, a) => a.indexOf(v) === i)) {
    add('palette', `text-gray-${n}`, `color:var(--s-gray-${n})`);
    add('palette', `bg-gray-${n}`, `background-color:var(--s-gray-${n})`);
  }
  for (const t of ['accent', 'success', 'warning', 'danger', 'info'])
    add('border', `border-${t}`, `border-color:var(--s-${t})`);

  // Sizes on the spacing scale and fractions
  for (const n of sp) {
    add('dims', `size-${n}`, `inline-size:${space(n)};block-size:${space(n)}`);
    add('dims', `w-${n}`, `inline-size:${space(n)}`);
    add('dims', `h-${n}`, `block-size:${space(n)}`);
  }
  for (const [n, v] of [['1/2', '50%'], ['1/3', '33.333%'], ['2/3', '66.667%'], ['1/4', '25%'], ['3/4', '75%']])
    add('sizing', `w-${n}`, `inline-size:${v}`);

  // Grid & placement extras
  for (let i = 1; i <= 6; i++) {
    add('grid', `rows-${i}`, `grid-template-rows:repeat(${i},minmax(0,1fr))`);
    add('grid', `row-span-${i}`, `grid-row:span ${i}/span ${i}`);
  }
  add('flex', 'order-first', 'order:-9999');
  add('flex', 'order-last', 'order:9999');
  for (const v of ['start', 'center', 'end', 'stretch']) add('flex', `justify-self-${v}`, `justify-self:${v}`);
  add('flex', 'place-self-center', 'place-self:center');

  // Position extras
  add('position', 'inset-x-0', 'inset-inline:0');
  add('position', 'inset-y-0', 'inset-block:0');
  add('position', 'start-0', 'inset-inline-start:0');
  add('position', 'end-0', 'inset-inline-end:0');
  add('position', 'absolute-center', 'position:absolute;inset:0;margin:auto;inline-size:fit-content;block-size:fit-content');

  // Dividers between children
  add('border', 'divide-y', '&>:not(:last-child){border-block-end:1px solid var(--s-border)}');
  add('border', 'divide-x', '&>:not(:last-child){border-inline-end:1px solid var(--s-border)}');

  // Effects
  add('effect', 'shadow-inner', 'box-shadow:var(--s-shadow-inner)');
  add('effect', 'ring', 'box-shadow:0 0 0 2px var(--s-ring)');
  add('effect', 'ring-danger', 'box-shadow:0 0 0 2px var(--s-danger)');
  add('effect', 'blur-sm', 'filter:blur(4px)');
  add('effect', 'blur', 'filter:blur(10px)');
  add('effect', 'grayscale', 'filter:grayscale(1)');
  add('effect', 'glass',
    'background-color:color-mix(in oklab,var(--s-surface) 70%,transparent);backdrop-filter:blur(14px) saturate(1.5);-webkit-backdrop-filter:blur(14px) saturate(1.5)');
  add('effect', 'bg-gradient', 'background-image:var(--s-gradient)');
  add('effect', 'text-gradient',
    'background-image:var(--s-gradient);background-clip:text;-webkit-background-clip:text;color:transparent');
  add('effect', 'border-gradient',
    'border:1px solid transparent;background:linear-gradient(var(--s-surface),var(--s-surface)) padding-box,var(--s-gradient) border-box');

  // Transitions & transforms
  add('motion', 'transition', 'transition:all var(--s-duration) var(--s-ease)');
  add('motion', 'transition-colors',
    'transition:color var(--s-duration) var(--s-ease),background-color var(--s-duration) var(--s-ease),border-color var(--s-duration) var(--s-ease)');
  add('motion', 'transition-transform',
    'transition:translate var(--s-duration) var(--s-ease-out),scale var(--s-duration) var(--s-ease-out),rotate var(--s-duration) var(--s-ease-out)');
  add('motion', 'transition-none', 'transition:none');
  add('motion', 'duration-fast', 'transition-duration:var(--s-duration-fast)');
  add('motion', 'duration-slow', 'transition-duration:var(--s-duration-slow)');
  add('motion', 'ease-spring', 'transition-timing-function:var(--s-ease-spring)');
  for (const s of [95, 105, 110]) add('transform', `scale-${s}`, `scale:${s / 100}`);
  for (const r of [45, 90, 180]) add('transform', `rotate-${r}`, `rotate:${r}deg`);
  add('transform', 'flip-x', 'scale:-1 1');
  add('transform', 'lift', 'translate:0 -3px');

  // Scrolling
  add('scroll', 'scrollbar-thin', 'scrollbar-width:thin');
  add('scroll', 'scrollbar-none', 'scrollbar-width:none');
  add('scroll', 'overscroll-contain', 'overscroll-behavior:contain');
  add('scroll', 'snap-x', 'scroll-snap-type:x mandatory');
  add('scroll', 'snap-y', 'scroll-snap-type:y mandatory');
  for (const s of ['start', 'center', 'end']) add('scroll', `snap-${s}`, `scroll-snap-align:${s}`);
  add('scroll', 'scroll-shadow',
    '--_sbg:var(--scroll-bg,var(--s-surface));overflow:auto;background:linear-gradient(var(--_sbg) 30%,transparent) center top/100% 2.5rem no-repeat local,linear-gradient(transparent,var(--_sbg) 70%) center bottom/100% 2.5rem no-repeat local,radial-gradient(farthest-side at 50% 0,var(--s-shadow-color),transparent) center top/100% .75rem no-repeat scroll,radial-gradient(farthest-side at 50% 100%,var(--s-shadow-color),transparent) center bottom/100% .75rem no-repeat scroll;background-color:var(--_sbg)');

  // iPhone notch / home bar
  add('safe', 'pt-safe', 'padding-block-start:max(var(--s-space-4),env(safe-area-inset-top))');
  add('safe', 'pb-safe', 'padding-block-end:max(var(--s-space-4),env(safe-area-inset-bottom))');
  add('safe', 'px-safe',
    'padding-inline:max(var(--s-gutter),env(safe-area-inset-left)) max(var(--s-gutter),env(safe-area-inset-right))');

  return rules;
}

const esc = (name) => name.replace(/[:@.\/]/g, (c) => '\\' + c);
const rule = (name, decl, prefix = '', suffix = '', before = '') =>
  `${before}.${esc(prefix + name)}${suffix}{${decl}}`;

// Hand-written pieces that don't fit the one-class/one-declaration shape
const EXTRA_CSS = `
/* Show something only in one color scheme (logos, illustrations).
   Only ever hides, so your own display (flex, grid…) is kept. Follows the OS
   or <html data-theme>. */
@media (prefers-color-scheme: light) {
  :root:not([data-theme="dark"]) .only-dark { display: none; }
}
@media (prefers-color-scheme: dark) {
  :root:not([data-theme="light"]) .only-light { display: none; }
}
:root[data-theme="light"] .only-dark,
:root[data-theme="dark"] .only-light { display: none; }

/* Print */
@media print {
  .print\\:hidden { display: none !important; }
}
@media not print {
  .print-only { display: none !important; }
}
`;

export function generateUtilities(userCfg = {}) {
  const cfg = { ...defaultUtilityConfig, ...userCfg };
  const rules = buildRules(cfg);
  const pick = (groups) => { const set = new Set(groups); return rules.filter((r) => set.has(r.group)); };
  const variantRules = pick(cfg.responsive);
  const containerRules = pick(cfg.containerResponsive);

  const stateRules = pick(cfg.states);

  const out = ['@layer salve.utilities {'];
  out.push(rules.map((r) => rule(r.name, r.decl)).join('\n'));

  // State variants: hover:bg-subtle, focus-visible:ring, group-hover:text-accent
  out.push(stateRules.map((r) => rule(r.name, r.decl, 'hover:', ':hover')).join('\n'));
  out.push(stateRules.map((r) => rule(r.name, r.decl, 'focus-visible:', ':focus-visible')).join('\n'));
  out.push(stateRules.map((r) => rule(r.name, r.decl, 'group-hover:', '', '.group:hover ')).join('\n'));
  out.push(EXTRA_CSS);

  for (const [bp, min] of Object.entries(cfg.breakpoints)) {
    out.push(`@media (width >= ${min}) {`);
    out.push(variantRules.map((r) => rule(r.name, r.decl, `${bp}:`)).join('\n'));
    out.push('}');
  }
  for (const [bp, min] of Object.entries(cfg.containerBreakpoints)) {
    out.push(`@container (width >= ${min}) {`);
    out.push(containerRules.map((r) => rule(r.name, r.decl, `@${bp}:`)).join('\n'));
    out.push('}');
  }
  out.push('}');
  return out.join('\n');
}
