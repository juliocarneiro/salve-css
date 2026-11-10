'use client';
import { toggleTheme } from 'salve-css/theme';

export function ThemeToggle() {
  return (
    <button className="btn btn-sm btn-ghost" type="button" onClick={toggleTheme}><i className="si si-moon" aria-hidden="true"></i> Theme</button>
  );
}
