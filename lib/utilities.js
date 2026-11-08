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
  add('misc', 'opacity-50', 'opacity:.5');
  add('misc', 'isolate', 'isolation:isolate');
  add('misc', 'transition', 'transition:all var(--s-duration) var(--s-ease)');
  add('misc', 'sr-only',
    'position:absolute;inline-size:1px;block-size:1px;padding:0;margin:-1px;overflow:hidden;clip-path:inset(50%);white-space:nowrap;border:0');
  add('misc', 'not-sr-only',
    'position:static;inline-size:auto;block-size:auto;margin:0;overflow:visible;clip-path:none;white-space:normal');

  return rules;
}

const esc = (name) => name.replace(/[:@.\/]/g, (c) => '\\' + c);
const rule = (name, decl, prefix = '') => `.${esc(prefix + name)}{${decl}}`;

export function generateUtilities(userCfg = {}) {
  const cfg = { ...defaultUtilityConfig, ...userCfg };
  const rules = buildRules(cfg);
  const pick = (groups) => { const set = new Set(groups); return rules.filter((r) => set.has(r.group)); };
  const variantRules = pick(cfg.responsive);
  const containerRules = pick(cfg.containerResponsive);

  const out = ['@layer salve.utilities {'];
  out.push(rules.map((r) => rule(r.name, r.decl)).join('\n'));

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
