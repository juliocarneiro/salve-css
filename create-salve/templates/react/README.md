# __PROJECT_NAME__

A React app with Vite, styled with [salve-css](https://salve-site-mu.vercel.app).

| Command | |
| --- | --- |
| `npm run dev` | start the dev server |
| `npm run build` | type-check and build to `dist/` |
| `npm run preview` | serve the build |

```
src/
  main.tsx   imports salve-css and salve-icons, renders <App />
  App.tsx    the page
public/      files served as-is
index.html   the HTML shell (applies the saved theme before paint)
```

Start in `src/App.tsx`.

salve-icons also ships React components: `import { CheckIcon } from "salve-icons/react"`.

Docs: https://salve-site-mu.vercel.app
