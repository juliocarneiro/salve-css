import 'salve-css';
import 'salve-icons/css';
import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { themeScript } from 'salve-css/theme';

export const metadata: Metadata = {
  title: '__PROJECT_NAME__',
  icons: '/favicon.svg',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    // suppressHydrationWarning: themeScript sets data-theme on <html> before React hydrates.
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="color-scheme" content="light dark" />
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
