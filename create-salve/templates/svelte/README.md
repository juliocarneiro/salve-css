# __PROJECT_NAME__

A Svelte app with Vite, styled with [salve-css](https://salve-site-mu.vercel.app).

| Command | |
| --- | --- |
| `npm run dev` | start the dev server |
| `npm run build` | build to `dist/` |
| `npm run check` | type-check with svelte-check |
| `npm run preview` | serve the build |

```
src/
  main.ts      imports salve-css and salve-icons, mounts App
  App.svelte   the page
public/        files served as-is
index.html     the HTML shell (applies the saved theme before paint)
```

Start in `src/App.svelte`.

Docs: https://salve-site-mu.vercel.app
