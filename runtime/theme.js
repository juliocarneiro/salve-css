// salve-css/theme — color-mode helpers that work with SSR (Next.js, Remix, Astro, Nuxt…).
//
// The stylesheet already follows the OS preference with zero JS. You only need this
// when you offer a manual light/dark toggle and want it to persist without a flash.
//
//   import { themeScript } from "salve-css/theme";
//   <script dangerouslySetInnerHTML={{ __html: themeScript }} />   // in <head>, before paint
//
//   import { setTheme, toggleTheme, getTheme } from "salve-css/theme";
//   setTheme("dark" | "light" | "system");
//
// Every function is safe to import on the server: DOM access only happens when called
// in the browser.

export const STORAGE_KEY = 'salve-theme';

/**
 * Inline this in <head> (before any CSS-dependent paint). It applies the saved choice
 * to <html data-theme> so the first frame already has the right colors.
 * Keep `suppressHydrationWarning` on <html> in React, since the attribute is set before hydration.
 */
export const themeScript = `(function(){try{var t=localStorage.getItem('${STORAGE_KEY}');if(t==='light'||t==='dark')document.documentElement.setAttribute('data-theme',t)}catch(e){}})();`;

const hasDom = () => typeof document !== 'undefined';

/** The stored choice: "light" | "dark" | "system". Returns "system" on the server. */
export function getTheme() {
  if (!hasDom()) return 'system';
  try {
    const value = localStorage.getItem(STORAGE_KEY);
    return value === 'light' || value === 'dark' ? value : 'system';
  } catch {
    return 'system';
  }
}

/** The theme actually on screen right now: "light" | "dark". Returns "light" on the server. */
export function getResolvedTheme() {
  if (!hasDom()) return 'light';
  const forced = document.documentElement.getAttribute('data-theme');
  if (forced === 'light' || forced === 'dark') return forced;
  return matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

/** Apply and persist a choice. "system" removes the override and follows the OS again. */
export function setTheme(theme) {
  if (!hasDom()) return;
  const root = document.documentElement;
  try {
    if (theme === 'light' || theme === 'dark') {
      root.setAttribute('data-theme', theme);
      localStorage.setItem(STORAGE_KEY, theme);
    } else {
      root.removeAttribute('data-theme');
      localStorage.removeItem(STORAGE_KEY);
    }
  } catch {
    /* storage blocked (private mode): the attribute still applies for this visit */
  }
}

/** Flip between light and dark based on what is currently on screen. Returns the new theme. */
export function toggleTheme() {
  const next = getResolvedTheme() === 'dark' ? 'light' : 'dark';
  setTheme(next);
  return next;
}
