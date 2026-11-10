import type { CSSProperties } from 'react';
import { ThemeToggle } from '@/components/ThemeToggle';

// A Server Component: salve is plain CSS, so the page needs no client JavaScript
// except the theme button.
export default function Home() {
  return (
    <>
      <header className="navbar">
        <strong className="brand"><i className="si si-salve" aria-hidden="true"></i> __PROJECT_NAME__</strong>
        <nav className="cluster" aria-label="Main">
          <a className="nav-link" href="https://salve-site-mu.vercel.app">Docs</a>
          <ThemeToggle />
        </nav>
      </header>
      <main className="container stack" style={{ '--gap': 'var(--s-space-12)', paddingBlock: 'var(--s-space-section)' } as CSSProperties}>
        <section className="stack" style={{ '--gap': 'var(--s-space-4)' } as CSSProperties}>
          <span className="badge badge-dot">salve-css + Next.js</span>
          <h1>Your project is ready</h1>
          <p className="lead">Edit <code>app/page.tsx</code> and save. Every class on this page comes from salve-css: no CSS of your own yet.</p>
          <div className="cluster">
            <a className="btn btn-lg" href="https://salve-site-mu.vercel.app/#componentes">Browse components <i className="si si-arrow-right" aria-hidden="true"></i></a>
            <a className="btn btn-lg btn-ghost" href="https://salve-site-mu.vercel.app/#customizar">Customize the theme</a>
          </div>
        </section>
        <section className="grid" style={{ '--min': '16rem' } as CSSProperties}>
          <article className="card stack">
            <h3 className="text-xl"><i className="si si-layout-grid" aria-hidden="true"></i> Layouts without media queries</h3>
            <p className="text-muted"><code>.stack</code>, <code>.cluster</code>, <code>.grid</code> and <code>.sidebar</code> adapt to the space on their own.</p>
          </article>
          <article className="card stack">
            <h3 className="text-xl"><i className="si si-palette" aria-hidden="true"></i> A theme from four variables</h3>
            <p className="text-muted">Change <code>--s-hue</code>, <code>--s-chroma</code>, <code>--s-radius</code> and <code>--s-density</code> on <code>:root</code>.</p>
          </article>
          <article className="card stack">
            <h3 className="text-xl"><i className="si si-moon" aria-hidden="true"></i> Dark mode built in</h3>
            <p className="text-muted">It follows the system. The Theme button saves your choice, with no flash on reload.</p>
          </article>
        </section>
      </main>
    </>
  );
}
