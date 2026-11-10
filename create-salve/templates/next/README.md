# __PROJECT_NAME__

A Next.js app (App Router), styled with [salve-css](https://salve-site-mu.vercel.app).

| Command | |
| --- | --- |
| `npm run dev` | start the dev server |
| `npm run build` | build for production |
| `npm start` | serve the build |

```
app/
  layout.tsx        imports salve-css and salve-icons, applies the saved theme before paint
  page.tsx          the page (a Server Component)
components/
  ThemeToggle.tsx   the only client component
public/             files served as-is
```

Start in `app/page.tsx`.

salve-icons also ships React components that work in Server Components: `import { CheckIcon } from "salve-icons/react"`.

Docs: https://salve-site-mu.vercel.app
