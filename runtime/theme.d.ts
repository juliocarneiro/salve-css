export type ThemeChoice = 'light' | 'dark' | 'system';
export type ResolvedTheme = 'light' | 'dark';

/** localStorage key used to persist the choice ("salve-theme"). */
export declare const STORAGE_KEY: string;

/** Inline script for <head>: applies the saved theme before first paint (no flash). */
export declare const themeScript: string;

/** The stored choice. "system" on the server or when nothing is saved. */
export declare function getTheme(): ThemeChoice;

/** The theme currently on screen. "light" on the server. */
export declare function getResolvedTheme(): ResolvedTheme;

/** Apply and persist a choice; "system" follows the OS again. No-op on the server. */
export declare function setTheme(theme: ThemeChoice): void;

/** Flip between light and dark; returns the new theme. */
export declare function toggleTheme(): ResolvedTheme;
