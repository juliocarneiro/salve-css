<div align="center">

# salve.

**CSS que alivia.**

Um design system em CSS puro que resolve as dores de sempre (especificidade, centralização, dark mode, z-index, telas pequenas) antes que elas apareçam.

`npm i salve-css` · zero dependências · zero build · ~15 KB gzip · MIT

</div>

---

## Índice

- [Por que o salve existe](#por-que-o-salve-existe)
- [Instalação](#instalação)
- [Primeiros passos](#primeiros-passos)
- [Conceitos](#conceitos)
  - [Camadas: seu CSS sempre vence](#camadas-seu-css-sempre-vence)
  - [Tokens](#tokens)
  - [Tema com quatro variáveis](#tema-com-quatro-variáveis)
  - [Dark mode](#dark-mode)
  - [Densidade](#densidade)
  - [Tons](#tons)
- [Layout](#layout)
- [Componentes](#componentes)
- [Utilitários](#utilitários)
- [Customização](#customização)
- [CLI e arquivo de configuração](#cli-e-arquivo-de-configuração)
- [Casos de uso](#casos-de-uso)
- [Usando com frameworks (SSR e Next.js)](#usando-com-frameworks)
- [Ícones: salve-icons](#ícones-salve-icons)
- [Acessibilidade](#acessibilidade)
- [Suporte a navegadores](#suporte-a-navegadores)
- [salve, Tailwind ou Bootstrap?](#salve-tailwind-ou-bootstrap)
- [Perguntas frequentes](#perguntas-frequentes)
- [Desenvolvimento](#desenvolvimento)

---

## Por que o salve existe

Quem escreve CSS esbarra sempre nos mesmos problemas. O salve resolve cada um deles na fonte, para que você não precise lembrar da solução toda vez.

| Dor | Como o salve resolve |
|---|---|
| Brigas de especificidade, `!important` espalhado | Todo o CSS da lib fica em `@layer salve.*`, abaixo do seu. Uma classe sua sempre vence. |
| "Como eu centralizo isso?" | `class="center"` centraliza nos dois eixos. |
| Grade responsiva com três media queries | `class="grid" style="--min: 14rem"`: cabem quantas colunas der, sem media query. |
| `z-index: 99999` | Camadas nomeadas: `--s-z-dropdown`, `--s-z-modal`, `--s-z-toast`… |
| `100vh` quebrado no celular | O reset usa `100dvh`, e existe o utilitário `.min-h-screen`. |
| Dark mode duplicando cores | `color-scheme` + `light-dark()`: é automático e dá para forçar em qualquer bloco. |
| Erro vermelho no formulário antes de digitar | `:user-invalid`: o erro só aparece depois que a pessoa interage. |
| iPhone dando zoom no input | `.input` usa 16px em telas de toque. |
| Card inteiro clicável | `<a class="card-link">`: um link de verdade estica para cobrir o card. |
| Modal com focus-trap e scroll-lock em JS | `<dialog class="dialog">` nativo, sem nenhuma linha de JavaScript. |
| Layout pulando quando aparece a scrollbar | `scrollbar-gutter: stable` no reset. |
| Palavra sozinha na última linha do título | `text-wrap: balance` em todos os títulos. |
| Animações para quem pediu menos movimento | As durações viram `1ms` direto nos tokens. Todo componente respeita. |
| Imagem que precisa "sair" do container | `.content-grid` + `.bleed`. |
| Cores sem contraste | Paletas OKLCH com contraste AA nos pares semânticos. |

---

## Instalação

### CDN (mais rápido)

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/salve-css/dist/salve.min.css">
```

Para fixar uma versão (recomendado em produção):

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/salve-css@0.1.0/dist/salve.min.css">
```

### npm

```bash
npm i salve-css
```

Importe uma vez no ponto de entrada da aplicação:

```js
import "salve-css";            // versão legível
// ou
import "salve-css/min";        // minificada
```

Em CSS (Vite, Parcel, PostCSS com `postcss-import`):

```css
@import "salve-css";
```

### Arquivos-fonte

Para importar só uma parte, os arquivos-fonte ficam em `salve-css/src/*`. Para montar um pacote sob medida, o caminho recomendado é o [CLI](#cli-e-arquivo-de-configuração).

---

## Primeiros passos

Uma página completa usando só o salve:

```html
<!doctype html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="color-scheme" content="light dark">
  <title>Minha página</title>
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/salve-css/dist/salve.min.css">
</head>
<body>
  <header class="navbar">
    <strong>Acme</strong>
    <nav class="cluster">
      <a class="nav-link" href="/" aria-current="page">Início</a>
      <a class="nav-link" href="/precos">Preços</a>
      <a class="btn btn-sm" href="/entrar">Entrar</a>
    </nav>
  </header>

  <main class="container stack" style="--gap: var(--s-space-12); padding-block: var(--s-space-section)">
    <section class="stack" style="--gap: var(--s-space-4)">
      <h1>Organize seu time em minutos</h1>
      <p class="text-lg text-muted max-w-prose">Tarefas, prazos e conversas no mesmo lugar.</p>
      <div class="cluster">
        <a class="btn btn-lg" href="/criar">Criar conta grátis</a>
        <a class="btn btn-lg btn-ghost" href="/demo">Ver demonstração</a>
      </div>
    </section>

    <section class="grid" style="--min: 16rem">
      <article class="card">
        <h3>Tarefas</h3>
        <p class="text-muted">Quadros, listas e calendário.</p>
      </article>
      <article class="card">
        <h3>Prazos</h3>
        <p class="text-muted">Lembretes antes de atrasar.</p>
      </article>
      <article class="card">
        <h3>Conversas</h3>
        <p class="text-muted">Comentários em cada tarefa.</p>
      </article>
    </section>
  </main>
</body>
</html>
```

Repare que não tem nenhuma media query e nenhum CSS próprio, e mesmo assim o layout se adapta do celular ao desktop. O dark mode segue o sistema operacional sozinho.

> **Dica:** inclua sempre `<meta name="color-scheme" content="light dark">`. Ele evita o "flash" branco ao carregar no modo escuro.

---

## Conceitos

### Camadas: seu CSS sempre vence

O salve declara a ordem das camadas uma vez e coloca cada parte do sistema numa delas:

```css
@layer salve.reset, salve.tokens, salve.theme, salve.base,
       salve.layout, salve.components, salve.utilities;
```

O CSS **fora de camadas** (o que você escreve normalmente) sempre ganha de qualquer camada, não importa a especificidade. Na prática:

```css
/* seu arquivo: ganha do .btn do salve, sem !important */
.btn { border-radius: 0; }
```

Para colocar seu próprio CSS em camadas, declare-as **depois** das do salve:

```css
@layer salve, app;   /* "app" fica acima de tudo do salve */

@layer app {
  .card { border-width: 2px; }
}
```

Dentro do salve, utilitários ganham de componentes, que ganham de layout, que ganha de base. Por isso `class="btn p-6"` funciona como esperado.

### Tokens

Todas as decisões de design são variáveis CSS com o prefixo `--s-`, organizadas em três níveis:

| Nível | Exemplos | Para quê |
|---|---|---|
| **Botões do tema** | `--s-hue`, `--s-chroma`, `--s-radius`, `--s-density`, `--s-font-*` | Você muda estes. |
| **Escalas** | `--s-brand-50…950`, `--s-gray-50…950`, `--s-space-1…32`, `--s-text-xs…6xl` | Derivadas dos botões. |
| **Semânticos** | `--s-bg`, `--s-surface`, `--s-text`, `--s-text-muted`, `--s-border`, `--s-accent`, `--s-danger`… | O que os componentes usam. |

Os componentes também expõem variáveis próprias (`--btn-bg`, `--card-pad`, `--dialog-width`…) para ajustes por instância.

<details>
<summary><strong>Referência completa de tokens</strong></summary>

**Cores semânticas** (todas mudam sozinhas entre claro e escuro)

| Token | Uso |
|---|---|
| `--s-bg` | fundo da página |
| `--s-surface` | fundo de cards, inputs, menus |
| `--s-surface-2` | superfícies sutis (código, hover, cabeçalho de tabela) |
| `--s-text` / `--s-text-muted` / `--s-text-subtle` | texto principal, secundário e terciário |
| `--s-border` / `--s-border-strong` | bordas decorativas e bordas de controles (contraste ≥ 3:1) |
| `--s-accent`, `--s-accent-hover`, `--s-accent-subtle`, `--s-accent-text`, `--s-on-accent` | cor da marca: sólida, hover, fundo suave, texto, texto sobre sólido |
| `--s-success`, `--s-warning`, `--s-danger`, `--s-info` (+ `-subtle`, `-text`, `on-`) | status, com matiz fixa para manter o significado |
| `--s-ring` | anel de foco |

**Espaçamento** (multiplicado por `--s-density`): `--s-space-0, 1, 2, 3, 4, 5, 6, 8, 10, 12, 16, 20, 24, 32`, onde 1 = 0,25rem. Também existem `--s-space-section` (ritmo vertical fluido entre seções) e `--s-gutter` (margem lateral fluida da página).

**Tipografia fluida:** `--s-text-xs` até `--s-text-6xl`. De `lg` para cima, o tamanho cresce suavemente entre 320px e 1280px de largura, e o zoom do navegador continua funcionando. Também `--s-leading-*`, `--s-tracking-*` e `--s-weight-*`.

**Raio:** `--s-radius-none, sm, md, lg, xl, full`, todos derivados de `--s-radius`.

**Sombras:** `--s-shadow-sm, md, lg, xl`, em camadas e tingidas pela matiz neutra.

**Z-index nomeado:** `--s-z-below, base, raised, dropdown, sticky, overlay, modal, toast, tooltip`.

**Movimento:** `--s-ease`, `--s-ease-out`, `--s-ease-in-out`, `--s-duration-fast`, `--s-duration`, `--s-duration-slow`. Viram `1ms` com `prefers-reduced-motion`.

**Larguras:** `--s-measure` (65ch), `--s-container` (72rem), `--s-container-sm/md/lg/xl`.

**Controles:** `--s-control-sm/md/lg` (alturas de botões e inputs; ficam maiores em telas de toque).

</details>

### Tema com quatro variáveis

```css
:root {
  --s-hue: 165;              /* matiz da marca, 0–360 */
  --s-chroma: 0.13;          /* intensidade: 0 = cinza, 0.2 = vibrante */
  --s-radius: 0.5rem;        /* raio base: 0 = cantos retos */
  --s-density: 1;            /* espaçamento: 0.85 compacto, 1.2 arejado */
}
```

A paleta é gerada em **OKLCH**, um espaço de cor perceptual: todas as matizes têm o mesmo brilho percebido na mesma posição da escala. Trocar de verde para roxo não estraga o contraste.

Algumas matizes para começar:

| Matiz | Cor |
|---|---|
| `25` | vermelho/coral |
| `60` | laranja |
| `90` | âmbar |
| `150` | verde |
| `165` | eucalipto (padrão) |
| `200` | ciano |
| `250` | azul |
| `280` | roxo |
| `330` | rosa |

Precisa da cor exata da marca? Sobrescreva o token semântico:

```css
:root {
  --s-accent: #e11d48;
  --s-accent-hover: #be123c;
}
```

**Fontes:**

```css
:root {
  --s-font-sans: "Inter", system-ui, sans-serif;
  --s-font-display: "Fraunces", Georgia, serif;   /* títulos */
  --s-font-mono: "JetBrains Mono", monospace;
}
```

O salve não carrega nenhuma fonte web. Por padrão ele usa a fonte do sistema, que é rápida e não tem custo.

### Dark mode

**Automático.** Segue a preferência do sistema operacional. Não precisa fazer nada.

**Forçado na página toda:**

```html
<html data-theme="dark">   <!-- ou "light" -->
```

**Forçado em um bloco:**

```html
<footer data-theme="dark">…</footer>
<pre data-theme="dark">…</pre>
```

**Botão de alternância.** Em projetos com SSR (Next.js e afins), use o [`salve-css/theme`](#botão-de-tema-sem-flash-salve-csstheme), que evita o flash. Em HTML puro, este exemplo mínimo basta:

```html
<button class="btn btn-ghost" id="theme-toggle">Alternar tema</button>
<script>
  const root = document.documentElement;
  const saved = localStorage.getItem("theme");
  if (saved) root.dataset.theme = saved;

  document.getElementById("theme-toggle").addEventListener("click", () => {
    const isDark = root.dataset.theme
      ? root.dataset.theme === "dark"
      : matchMedia("(prefers-color-scheme: dark)").matches;
    root.dataset.theme = isDark ? "light" : "dark";
    localStorage.setItem("theme", root.dataset.theme);
  });
</script>
```

**Re-tematizar uma seção com outra cor:** qualquer elemento com `data-theme` recalcula a paleta a partir das variáveis dele.

```html
<section data-theme style="--s-hue: 25">
  <!-- tudo aqui dentro fica coral -->
</section>
```

### Densidade

```html
<aside data-density="compact">…</aside>      <!-- 0.8× -->
<main data-density="comfortable">…</main>    <!-- 1.2× -->
```

Ou de forma livre: `style="--s-density: 0.9"` junto com `data-density` (qualquer valor serve para ativar o recálculo).

### Tons

Tons são **um único sistema de modificadores para todos os componentes**. Cada tom define quatro cores locais que botões, badges, alertas, avatares e barras de progresso leem.

| Classe | Uso |
|---|---|
| `.tone-accent` | cor da marca (padrão) |
| `.tone-neutral` | cinza / preto e branco |
| `.tone-success` | confirmação, pago, ativo |
| `.tone-warning` | atenção, pendente |
| `.tone-danger` | erro, destrutivo |
| `.tone-info` | informativo |

```html
<button class="btn tone-danger">Excluir</button>
<span class="badge tone-success">Pago</span>
<div class="alert tone-warning">…</div>

<!-- num pai: vale para o grupo inteiro -->
<div class="tone-danger cluster">
  <button class="btn">Excluir</button>
  <button class="btn btn-outline">Excluir tudo</button>
</div>
```

---

## Layout

As primitivas de layout se adaptam ao espaço disponível, **sem media queries**. Cada uma tem variáveis que você passa inline ou por classe.

### `.stack`: pilha vertical com espaçamento uniforme

Substitui margens entre elementos. O espaçamento vem do `gap`, então não existe margem colapsando nem `:last-child { margin: 0 }`.

```html
<div class="stack" style="--gap: var(--s-space-6)">
  <h2>Título</h2>
  <p>Parágrafo</p>
  <button class="btn">Ação</button>
</div>
```

| Variável | Padrão |
|---|---|
| `--gap` | `var(--s-space-4)` |

### `.cluster`: itens em linha que quebram

Ideal para tags, grupos de botões e links de navegação.

```html
<div class="cluster" style="--justify: flex-end">
  <button class="btn btn-ghost">Cancelar</button>
  <button class="btn">Salvar</button>
</div>
```

| Variável | Padrão |
|---|---|
| `--gap` | `var(--s-space-3)` |
| `--justify` | `flex-start` |
| `--align` | `center` |

### `.split`: dois grupos em extremos opostos

Logo de um lado e navegação do outro, ou título de um lado e ação do outro.

```html
<div class="split">
  <h2>Pedidos</h2>
  <button class="btn btn-sm">Novo pedido</button>
</div>
```

### `.center`: centraliza nos dois eixos

```html
<div class="center min-h-screen">
  <form class="card">…</form>
</div>
```

### `.container`: largura máxima centralizada com respiro lateral

```html
<main class="container">…</main>
<main class="container" style="--max: var(--s-container-sm)">…</main>
```

| Variável | Padrão |
|---|---|
| `--max` | `var(--s-container)` (72rem) |
| `--gutter` | `var(--s-gutter)` (fluido, 1–2rem) |

### `.grid`: quantas colunas couberem

```html
<div class="grid" style="--min: 14rem">
  <article class="card">…</article>
  <article class="card">…</article>
  <article class="card">…</article>
</div>
```

| Variável | Padrão | Observação |
|---|---|---|
| `--min` | `16rem` | largura mínima de cada coluna |
| `--gap` | `var(--s-space-6)` | |
| `--fit` | `auto-fit` | `auto-fill` mantém colunas vazias |

### `.sidebar`: painel lateral + conteúdo

O primeiro filho é a lateral. Quando o conteúdo fica estreito demais, os dois empilham. Use `.sidebar.sidebar-end` para a lateral ficar à direita.

```html
<div class="sidebar" style="--side: 18rem">
  <nav>…</nav>
  <main>…</main>
</div>
```

| Variável | Padrão |
|---|---|
| `--side` | `16rem` |
| `--content-min` | `55%` (abaixo disso, empilha) |
| `--gap` | `var(--s-space-6)` |

### `.switcher`: todos lado a lado ou todos empilhados

Diferente do `.grid`, nunca deixa um item sozinho na última linha.

```html
<div class="switcher" style="--threshold: 40rem">
  <div class="card">Básico</div>
  <div class="card">Pro</div>
  <div class="card">Time</div>
</div>
```

### `.cover`: bloco de altura total com o conteúdo centralizado

```html
<section class="cover">
  <header>Logo</header>
  <div class="cover-main"><h1>Hero centralizado verticalmente</h1></div>
  <footer>Role para baixo</footer>
</section>
```

### `.frame`: proporção fixa para mídia

```html
<div class="frame" style="--ratio: 4 / 3"><img src="foto.jpg" alt=""></div>
```

### `.reel`: carrossel horizontal com snap

```html
<div class="reel" style="--item: 16rem">
  <article class="card">…</article>
  <article class="card">…</article>
</div>
```

### `.content-grid`: coluna de leitura com saída para as bordas

```html
<article class="content-grid">
  <h1>Título</h1>
  <p>Texto na coluna de leitura…</p>
  <img class="wide" src="grafico.png" alt="…">   <!-- mais largo -->
  <img class="bleed" src="paisagem.jpg" alt="…"> <!-- de borda a borda -->
</article>
```

### `.cq`: contexto de container query

Torna o elemento um container. Dentro dele, os utilitários `@sm:`, `@md:` e `@lg:` reagem à largura **do container**, e não da tela.

```html
<div class="cq">
  <article class="flex flex-col @md:flex-row gap-4">…</article>
</div>
```

---

## Componentes

Os componentes usam HTML nativo sempre que existe, aceitam [tons](#tons) e expõem variáveis para ajustes pontuais.

### Botão

```html
<button class="btn">Sólido</button>
<button class="btn btn-soft">Suave</button>
<button class="btn btn-outline">Contorno</button>
<button class="btn btn-ghost">Fantasma</button>

<button class="btn btn-sm">Pequeno</button>
<button class="btn btn-lg">Grande</button>
<button class="btn btn-block">Largura total</button>
<button class="btn btn-icon" aria-label="Fechar">✕</button>

<button class="btn tone-danger">Excluir</button>
<button class="btn" aria-busy="true">Salvando</button>   <!-- spinner automático -->
<button class="btn" disabled>Indisponível</button>
<a class="btn" href="/planos">Também funciona em links</a>
```

| Variável | O que muda |
|---|---|
| `--btn-bg`, `--btn-fg`, `--btn-border` | cores |
| `--btn-radius` | raio (`999px` = pílula) |
| `--btn-height`, `--btn-px`, `--btn-font-size` | tamanho |

Ícones SVG dentro do botão são dimensionados e alinhados sozinhos.

### Card

```html
<article class="card">
  <img src="capa.jpg" alt="">            <!-- 1º filho: vai até as bordas -->
  <span class="badge">Novo</span>
  <h3>Título</h3>
  <p class="text-muted">Descrição curta.</p>
  <div class="card-footer split">        <!-- empurrado para baixo -->
    <span>R$ 49</span>
    <button class="btn btn-sm">Comprar</button>
  </div>
</article>
```

- `.card-elevated`: sombra em vez de borda.
- `.card-interactive` + `<a class="card-link">`: o card inteiro vira área de clique, com **um único link real**, que é acessível e funciona com "abrir em nova aba".

```html
<article class="card card-interactive">
  <h3><a class="card-link" href="/artigo">Como organizar sprints</a></h3>
  <p>Resumo do artigo.</p>
</article>
```

| Variável | Padrão |
|---|---|
| `--card-pad` | `var(--s-space-6)` |
| `--card-gap` | `var(--s-space-3)` |
| `--card-radius` | `var(--s-radius-lg)` |
| `--card-bg` | `var(--s-surface)` |

### Formulários

```html
<div class="field">
  <label for="email">E-mail</label>
  <input class="input" id="email" type="email" required>
  <p class="hint">Nunca compartilhamos.</p>
  <p class="error">Use um e-mail válido, como nome@dominio.com.</p>
</div>
```

O `.error` só aparece **depois que a pessoa interage** com o campo (via `:user-invalid`). Enquanto isso, a dica fica visível. Isso usa a validação nativa do HTML (`required`, `type="email"`, `minlength`, `pattern`…), então não precisa de JavaScript.

`.input` funciona em `<input>`, `<select>` e `<textarea>`. O `<textarea>` cresce conforme o texto nos navegadores que suportam `field-sizing`.

```html
<select class="input">…</select>
<textarea class="input"></textarea>

<!-- prefixo / sufixo -->
<div class="input-group">
  <span>R$</span>
  <input class="input" type="number">
  <span>/mês</span>
</div>

<!-- checkbox e radio -->
<label class="check"><input type="checkbox"> Aceito os termos</label>
<label class="check"><input type="radio" name="plano"> Mensal</label>

<!-- switch -->
<label class="check"><input class="switch" type="checkbox" role="switch"> Notificações</label>

<!-- controle segmentado (radios nativos) -->
<div class="segmented" role="radiogroup" aria-label="Período">
  <label><input type="radio" name="p" checked> Mês</label>
  <label><input type="radio" name="p"> Ano</label>
</div>
```

Checkbox, radio, range e progress usam a cor da marca via `accent-color`.

### Badge

```html
<span class="badge">Padrão</span>
<span class="badge badge-solid">Sólido</span>
<span class="badge badge-outline">Contorno</span>
<span class="badge badge-dot tone-success">Online</span>
```

### Alerta

```html
<div class="alert tone-danger" role="alert">
  <svg class="alert-icon">…</svg>          <!-- opcional -->
  <div>
    <p class="alert-title">Falha ao publicar</p>
    <p>O arquivo passa de 10 MB.</p>
  </div>
</div>
```

Use `role="alert"` para erros urgentes, `role="status"` para confirmações e `role="note"` para avisos informativos.

### Progresso, spinner e skeleton

```html
<progress class="progress" value="60" max="100">60%</progress>
<progress class="progress tone-success" value="100" max="100"></progress>
<progress class="progress"></progress>                  <!-- indeterminado -->

<span class="spinner" role="status" aria-label="Carregando"></span>

<span class="skeleton" style="inline-size: 60%"></span>  <!-- placeholder -->
```

### Toast

```html
<div class="toast-region" role="status" aria-live="polite">
  <div class="toast tone-success">Alterações salvas</div>
</div>
```

O toast entra animado sozinho. Quando e como remover fica com você (um `setTimeout`, por exemplo).

### Diálogo e gaveta

`<dialog>` nativo: o navegador já cuida do foco preso, da tecla Esc, do fundo inerte e de devolver o foco ao botão. O salve só estiliza e anima.

```html
<button class="btn" command="show-modal" commandfor="confirmar">Excluir</button>

<dialog class="dialog" id="confirmar" closedby="any" aria-labelledby="confirmar-titulo">
  <h2 id="confirmar-titulo">Excluir projeto?</h2>
  <p>Essa ação não pode ser desfeita.</p>
  <form method="dialog">
    <button class="btn btn-ghost" value="cancel" autofocus>Manter</button>
    <button class="btn tone-danger" value="delete">Excluir</button>
  </form>
</dialog>
```

- `closedby="any"` fecha ao clicar fora.
- `.drawer` (junto com `.dialog`) vira painel lateral.
- `--dialog-width` e `--dialog-pad` ajustam o tamanho.
- Em navegadores sem `command`/`commandfor`, abra com `document.getElementById('confirmar').showModal()`.

### Menu

```html
<button class="btn btn-outline" popovertarget="acoes">Ações</button>
<div class="menu" id="acoes" popover>
  <p class="menu-label">Projeto</p>
  <button>Renomear</button>
  <button>Duplicar</button>
  <hr>
  <button class="text-danger">Excluir</button>
</div>
```

Usa a API `popover` nativa: fecha ao clicar fora e com Esc. Onde há suporte a anchor positioning, o menu se posiciona colado ao botão e vira para o outro lado se faltar espaço.

### Tooltip

```html
<button class="btn btn-icon" aria-label="Copiar" data-tip="Copiar">…</button>
<button data-tip="Aparece embaixo" data-tip-pos="bottom">…</button>
```

É só CSS e aparece no hover e no foco do teclado. O texto do tooltip é visual, então mantenha o `aria-label` para leitores de tela.

### Tabela

```html
<div class="table-wrap">               <!-- rolagem horizontal + cabeçalho fixo -->
  <table class="table table-striped">
    <thead><tr><th scope="col">Cliente</th><th scope="col" class="num">Total</th></tr></thead>
    <tbody><tr><td>Ana</td><td class="num">R$ 1.280,00</td></tr></tbody>
  </table>
</div>
```

### Avatar

```html
<span class="avatar">JC</span>
<span class="avatar" style="--avatar-size: 3rem"><img src="foto.jpg" alt="Julio"></span>

<div class="avatar-group">
  <span class="avatar">AN</span>
  <span class="avatar tone-info">BR</span>
  <span class="avatar tone-neutral">+4</span>
</div>
```

### Accordion

```html
<details class="accordion" name="faq">
  <summary>Preciso de build?</summary>
  <p>Não. Um link basta.</p>
</details>
```

Mesmo atributo `name` em vários `<details>` = só um aberto por vez (nativo). A abertura é animada onde houver suporte.

### Outros

```html
<hr>                                         <!-- separador simples -->
<div class="divider">ou</div>                <!-- separador com texto -->

<div class="stat">
  <span class="stat-label">Receita</span>
  <span class="stat-value">R$ 48 mil</span>
</div>

<nav aria-label="Breadcrumb">
  <ol class="breadcrumb">
    <li><a href="/">Início</a></li>
    <li><span aria-current="page">Pedidos</span></li>
  </ol>
</nav>

<header class="navbar">…</header>            <!-- fixa no topo, translúcida -->
<a class="nav-link" aria-current="page">…</a>

<article class="prose">…HTML vindo de CMS ou markdown…</article>
```

`.prose` estiliza texto longo sem nenhuma classe interna: títulos, listas, citações, imagens, código.

---

## Utilitários

Os nomes são familiares para quem vem do Tailwind. Por baixo, eles usam **propriedades lógicas** (`padding-inline` em vez de `padding-left`), então funcionam em idiomas da direita para a esquerda.

| Categoria | Classes |
|---|---|
| Display | `block` `inline` `inline-block` `flex` `inline-flex` `grid` `inline-grid` `contents` `hidden` |
| Flex | `flex-row` `flex-col` `flex-wrap` `flex-1` `grow` `shrink-0` `items-{start,center,end,stretch,baseline}` `justify-{start,center,end,between,around,evenly}` `self-*` `place-center` |
| Grid | `cols-{1…12}` `span-{1…12}` `span-full` |
| Gap | `gap-{n}` `gap-x-{n}` `gap-y-{n}` |
| Padding | `p-{n}` `px-{n}` `py-{n}` `pt-{n}` `pb-{n}` `ps-{n}` `pe-{n}` |
| Margin | `m-{n}` `mx-{n}` `my-{n}` `mt-{n}` `mb-{n}` `ms-{n}` `me-{n}` `mx-auto` `mt-auto` `ms-auto`… |
| Tamanho | `w-full` `w-auto` `w-fit` `h-full` `h-screen` `min-h-screen` `min-w-0` `max-w-{sm,md,lg,xl,prose,none}` |
| Texto | `text-{xs…6xl}` `font-{normal,medium,semibold,bold}` `font-{sans,display,mono}` `leading-*` `tracking-*` `text-{start,center,end}` `uppercase` `italic` `tabular-nums` `text-balance` `text-pretty` `nowrap` `truncate` `line-clamp-{1…5}` `no-underline` |
| Cor do texto | `text-{default,muted,subtle,accent,success,warning,danger,info,inherit}` `on-accent` |
| Fundo | `bg-{bg,surface,subtle,accent,accent-subtle,success,warning,danger,info,transparent}` |
| Borda | `border` `border-0` `border-strong` `border-{t,b,s,e}` `rounded-{none,sm,md,lg,xl,full}` |
| Sombra | `shadow-{sm,md,lg,xl,none}` |
| Posição | `static` `relative` `absolute` `fixed` `sticky` `inset-0` `top-0` `bottom-0` `z-{below,base,raised,dropdown,sticky,overlay,modal,toast,tooltip}` |
| Outros | `overflow-{hidden,auto,clip}` `overflow-x-auto` `aspect-{square,video}` `object-{cover,contain}` `cursor-pointer` `select-none` `pointer-events-none` `opacity-50` `isolate` `transition` `sr-only` `not-sr-only` |

`{n}` segue a escala de espaçamento: `0 1 2 3 4 5 6 8 10 12 16 20 24 32` (1 = 0,25rem × densidade).

### Responsivo

Prefixos de **tela** (mobile-first, a partir da largura indicada):

| Prefixo | A partir de |
|---|---|
| `sm:` | 40rem (640px) |
| `md:` | 48rem (768px) |
| `lg:` | 64rem (1024px) |
| `xl:` | 80rem (1280px) |

Prefixos de **container** (dentro de um elemento `.cq`):

| Prefixo | A partir de |
|---|---|
| `@sm:` | 24rem |
| `@md:` | 36rem |
| `@lg:` | 52rem |

```html
<div class="flex flex-col md:flex-row gap-4 md:gap-8">…</div>
<nav class="hidden lg:flex">…</nav>
<div class="cols-1 sm:cols-2 lg:cols-4 grid gap-6">…</div>
```

As variantes responsivas cobrem display, flex, grid, gap, `p`/`px`/`py`, tamanho de texto, alinhamento de texto e tamanho. Para incluir outros grupos, use o [arquivo de configuração](#cli-e-arquivo-de-configuração).

---

## Customização

Existem quatro níveis. Comece pelo primeiro e só suba quando precisar.

**Nível 1 · Variáveis do tema** (sem build)

```css
:root {
  --s-hue: 280;
  --s-radius: 0;
  --s-density: 0.9;
  --s-font-sans: "Inter", sans-serif;
}
```

**Nível 2 · Por bloco ou por instância**

```html
<section data-theme="dark" style="--s-hue: 25">…</section>
<button class="btn" style="--btn-radius: 99px">Assinar</button>
<div class="grid" style="--min: 12rem; --gap: var(--s-space-2)">…</div>
```

**Nível 3 · Utilitários**

```html
<div class="p-6 md:p-10 rounded-xl shadow-lg bg-surface">…</div>
```

**Nível 4 · Build próprio** com seus módulos, breakpoints e escala de espaçamento. Veja a próxima seção.

### Criando seus componentes

Use os tokens no seu próprio CSS e você ganha dark mode, tema e densidade de graça:

```css
.pricing-card {
  padding: var(--s-space-8);
  border-radius: var(--s-radius-xl);
  background: var(--s-surface);
  box-shadow: var(--s-shadow-lg);
  color: var(--s-text);
}

.pricing-card[data-featured] {
  outline: 2px solid var(--s-accent);
}
```

---

## CLI e arquivo de configuração

O CLI vem junto com o pacote e serve para gerar um CSS sob medida.

```bash
npx salve init            # cria salve.config.js
npx salve build           # gera ./salve.css
npx salve build -m        # minificado
npx salve build -c tema.config.js -o public/css/app.css -m
```

| Opção | Descrição |
|---|---|
| `-c, --config <arquivo>` | arquivo de configuração (padrão: `./salve.config.js`, se existir) |
| `-o, --out <arquivo>` | arquivo de saída (padrão: `./salve.css`) |
| `-m, --minify` | minifica |

### `salve.config.js`, referência completa

```js
export default {
  theme: {
    hue: 250,                 // --s-hue
    chroma: 0.15,             // --s-chroma
    neutralHue: 250,          // --s-neutral-hue (tinge os cinzas com outra matiz)
    neutralChroma: 0.02,      // --s-neutral-chroma
    radius: '0.75rem',        // --s-radius
    density: 1,               // --s-density
    fonts: {
      sans: '"Inter", system-ui, sans-serif',
      display: '"Fraunces", serif',
      mono: '"JetBrains Mono", monospace',
    },
    tokens: {                 // qualquer token; o prefixo --s- é opcional
      '--s-accent': '#2563eb',
      'container': '80rem',
    },
  },

  modules: {
    reset: true,
    base: true,
    layout: true,
    // escolha os componentes (ou true para todos)
    components: ['tone', 'button', 'card', 'form', 'feedback', 'overlay', 'data', 'nav'],
    utilities: true,
  },

  utilities: {
    spacing: [0, 1, 2, 3, 4, 6, 8, 12, 16, 24],
    breakpoints: { sm: '40rem', md: '48rem', lg: '64rem', xl: '80rem' },
    containerBreakpoints: { sm: '24rem', md: '36rem', lg: '52rem' },
    // grupos com variantes sm:/md:/lg:/xl:
    responsive: ['display', 'flex', 'grid', 'spacing', 'gap', 'text', 'align', 'sizing'],
    // grupos com variantes @sm:/@md:/@lg:
    containerResponsive: ['display', 'flex', 'grid', 'gap', 'text', 'align'],
  },

  minify: false,
};
```

| Módulo de componentes | Inclui |
|---|---|
| `tone` | `.tone-*` (necessário para tons nos outros) |
| `button` | `.btn` e variantes |
| `card` | `.card`, `.card-link` |
| `form` | `.field`, `.input`, `.input-group`, `.check`, `.switch`, `.segmented` |
| `feedback` | `.badge`, `.alert`, `.progress`, `.spinner`, `.skeleton`, `.toast` |
| `overlay` | `.dialog`, `.drawer`, `.menu`, `[data-tip]` |
| `data` | `.table`, `.avatar`, `.accordion`, `.divider`, `.stat` |
| `nav` | `.navbar`, `.nav-link`, `.breadcrumb`, `.prose` |

### API de build (Node)

```js
import { build } from "salve-css/build";

const css = await build({ theme: { hue: 25 }, minify: true });
```

---

## Casos de uso

### Landing page

```html
<section class="cover" style="--min-h: 80dvh">
  <div class="cover-main container stack items-center text-center" style="--gap: var(--s-space-6)">
    <span class="badge">Novo · versão 2.0</span>
    <h1 class="text-6xl">Seu produto, mais rápido</h1>
    <p class="text-lg text-muted max-w-prose">Uma frase clara sobre o benefício.</p>
    <div class="cluster" style="--justify: center">
      <a class="btn btn-lg" href="#">Começar grátis</a>
      <a class="btn btn-lg btn-outline" href="#">Falar com vendas</a>
    </div>
  </div>
</section>
```

### Tela de login

```html
<main class="center min-h-screen p-4">
  <form class="card stack" style="--card-pad: var(--s-space-8); inline-size: min(24rem, 100%)">
    <h1 class="text-2xl">Entrar</h1>
    <div class="field">
      <label for="e">E-mail</label>
      <input class="input" id="e" type="email" autocomplete="email" required>
      <p class="error">Use um e-mail válido.</p>
    </div>
    <div class="field">
      <label for="s">Senha</label>
      <input class="input" id="s" type="password" autocomplete="current-password" minlength="8" required>
      <p class="error">A senha tem pelo menos 8 caracteres.</p>
    </div>
    <button class="btn btn-block">Entrar</button>
    <div class="divider">ou</div>
    <a class="btn btn-block btn-outline tone-neutral" href="#">Entrar com link mágico</a>
  </form>
</main>
```

### Dashboard

```html
<div class="sidebar" style="--side: 15rem; --gap: 0">
  <nav class="stack p-4 border-e min-h-screen" style="--gap: var(--s-space-1)" data-density="compact">
    <strong class="p-2">Acme</strong>
    <a class="nav-link" href="#" aria-current="page">Visão geral</a>
    <a class="nav-link" href="#">Pedidos</a>
    <a class="nav-link" href="#">Clientes</a>
  </nav>

  <main class="stack p-6 md:p-10" style="--gap: var(--s-space-8)">
    <div class="split">
      <h1 class="text-3xl">Visão geral</h1>
      <button class="btn">Exportar</button>
    </div>
    <div class="grid" style="--min: 12rem; --gap: var(--s-space-4)">
      <div class="card stat"><span class="stat-label">Receita</span><span class="stat-value">R$ 48 mil</span></div>
      <div class="card stat"><span class="stat-label">Pedidos</span><span class="stat-value">1.204</span></div>
      <div class="card stat"><span class="stat-label">Ticket médio</span><span class="stat-value">R$ 39,90</span></div>
    </div>
    <div class="table-wrap">
      <table class="table">…</table>
    </div>
  </main>
</div>
```

### Vitrine de produtos

```html
<div class="grid" style="--min: 14rem">
  <article class="card card-interactive">
    <img src="tenis.jpg" alt="" class="aspect-square">
    <h3 class="text-base"><a class="card-link" href="/p/tenis">Tênis Leve</a></h3>
    <div class="split">
      <strong>R$ 299</strong>
      <span class="badge tone-success">Frete grátis</span>
    </div>
  </article>
</div>
```

### Blog ou documentação

```html
<article class="content-grid">
  <header class="stack" style="--gap: var(--s-space-3)">
    <span class="text-sm text-muted">8 de novembro de 2026 · 5 min</span>
    <h1>Título do post</h1>
  </header>
  <div class="prose">
    <!-- HTML do markdown/CMS -->
  </div>
  <img class="wide" src="diagrama.png" alt="…">
</article>
```

### Adotando aos poucos num projeto existente

Como tudo fica em camadas, o salve não sobrescreve o CSS que você já tem. Dá para entrar aos poucos:

1. Adicione o `<link>` do salve **antes** do seu CSS.
2. Use as primitivas de layout e os tokens em telas novas.
3. Se o reset ou a base atrapalharem, gere um build sem eles:

```js
// salve.config.js
export default { modules: { reset: false, base: false } };
```

---

## Usando com frameworks

O salve é só CSS, então funciona em qualquer stack, com ou sem renderização no servidor.

### SSR e Next.js

**O CSS não depende de JavaScript.** Ele é renderizado no servidor como qualquer folha de estilo: não existe código que rode no navegador para aplicar classes ou temas, e o dark mode automático vem só do CSS. Por isso não há flash, nem aviso de hydration, nem configuração extra.

Testado num app Next.js 16 (App Router) com **Turbopack e com webpack**: o build passa, as camadas `@layer` são preservadas e o console fica limpo.

```jsx
// app/layout.jsx
import "salve-css";

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
```

Pronto. Os componentes são só classes, então funcionam em Server Components sem `"use client"`.

### Botão de tema sem flash: `salve-css/theme`

Só é preciso se você oferecer um botão para trocar entre claro e escuro. O problema clássico do SSR: o servidor não sabe a preferência salva no `localStorage`, então a página nasce clara e "pisca" para escura. O `salve-css/theme` resolve com um script de uma linha que roda **antes da primeira pintura**.

```jsx
// app/layout.jsx
import "salve-css";
import { themeScript } from "salve-css/theme";

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
```

```jsx
// app/theme-toggle.jsx
"use client";
import { toggleTheme } from "salve-css/theme";

export function ThemeToggle() {
  return (
    <button className="btn btn-ghost btn-icon" onClick={toggleTheme} aria-label="Alternar tema">
      ◐
    </button>
  );
}
```

- O `suppressHydrationWarning` no `<html>` é necessário porque o script define `data-theme` antes do React hidratar. Ele vale só para os atributos do `<html>`, não para a página inteira.
- Todas as funções podem ser importadas no servidor sem quebrar, porque só acessam o DOM quando chamadas no navegador.

| Função | O que faz |
|---|---|
| `themeScript` | string para o `<head>`: aplica o tema salvo antes da pintura |
| `setTheme("light" \| "dark" \| "system")` | aplica e salva a escolha; `"system"` volta a seguir o sistema |
| `toggleTheme()` | alterna entre claro e escuro, conforme o que está na tela |
| `getTheme()` | escolha salva: `"light"`, `"dark"` ou `"system"` |
| `getResolvedTheme()` | tema visível agora: `"light"` ou `"dark"` |

Os tipos TypeScript vêm incluídos.

### Outros frameworks

**Vite / React / Vue / Svelte**

```js
// main.jsx | main.ts
import "salve-css";
```

**Remix / React Router**

```jsx
// app/root.jsx
import salve from "salve-css?url";
export const links = () => [{ rel: "stylesheet", href: salve }];
```

**Nuxt**

```js
// nuxt.config.ts
export default defineNuxtConfig({ css: ["salve-css"] });
```

**SvelteKit**

```svelte
<!-- src/routes/+layout.svelte -->
<script>import "salve-css";</script>
<slot />
```

**Astro**

```astro
---
import "salve-css";
---
```

O `themeScript` funciona igual em todos eles: coloque o conteúdo dele num `<script>` inline no `<head>` do layout.

### Dicas para React

As variáveis inline funcionam via `style`:

```jsx
<div className="grid" style={{ "--min": "14rem" }}>
  <button className="btn tone-danger" aria-busy={saving}>Excluir</button>
</div>
```

Componente com variantes:

```jsx
export function Button({ variant, tone, size, className = "", ...props }) {
  const cls = ["btn", variant && `btn-${variant}`, tone && `tone-${tone}`, size && `btn-${size}`, className]
    .filter(Boolean).join(" ");
  return <button className={cls} {...props} />;
}

// <Button variant="soft" tone="danger">Excluir</Button>
```

**WordPress, Rails, Django, Laravel, PHP:** coloque o `<link>` no template base.

---

## Ícones: salve-icons

O [`salve-icons`](../salve-icons) é a biblioteca de ícones irmã do salve: 292 ícones de traço, incluindo redes sociais. Eles herdam a cor (`currentColor`) e o tamanho (`1em`) do texto, então se alinham sozinhos com botões, badges e links. Também têm componentes React que funcionam em Server Components.

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/salve-icons/dist/salve-icons.css">

<button class="btn"><i class="si si-plus" aria-hidden="true"></i> Novo projeto</button>
```

```jsx
import { PlusIcon } from "salve-icons/react";

<button className="btn"><PlusIcon /> Novo projeto</button>
```

---

## Acessibilidade

O que o salve já cuida para você:

- **Foco visível** em todos os elementos interativos (`:focus-visible`), com anel na cor da marca.
- **Contraste:** os pares semânticos (texto sobre fundo, texto sobre a cor da marca) atendem WCAG AA, e as bordas de controles têm contraste ≥ 3:1.
- **Movimento reduzido:** com `prefers-reduced-motion`, as durações dos tokens viram `1ms` e o skeleton para de pulsar.
- **Alvos de toque:** controles ficam maiores em telas de toque (`pointer: coarse`).
- **Alto contraste do Windows** (`forced-colors`): botões, cards e switches mantêm bordas visíveis.
- **Componentes nativos:** `<dialog>`, `popover`, `<details>` e controles de formulário reais trazem teclado e leitores de tela funcionando.
- **RTL:** propriedades lógicas em todo o código.

O que continua com você:

- Textos alternativos (`alt`), rótulos (`<label for>`, `aria-label` em botões só com ícone).
- Não usar só cor para comunicar estado. Por isso os badges com ponto (`.badge-dot`) devem ter texto junto.
- Ordem lógica dos títulos (`h1` → `h2` → `h3`).

---

## Suporte a navegadores

O salve mira navegadores modernos: **Chrome/Edge 123+, Safari 17.5+ e Firefox 128+** (todos de 2024 em diante). A base do sistema (camadas, nesting, `light-dark()`, `:has()`, container queries) funciona em todos eles.

Alguns recursos são **aprimoramento progressivo**. Onde não há suporte, o componente funciona normalmente, só sem o extra:

| Recurso | Sem suporte |
|---|---|
| Anchor positioning (`.menu` colado ao botão) | o menu abre centralizado |
| `::details-content` (`.accordion` animado) | abre sem animação |
| `field-sizing` (`<textarea>` que cresce) | tamanho fixo, redimensionável |
| `closedby` (fechar diálogo clicando fora) | fecha com Esc e com os botões |
| `command` / `commandfor` | use `dialog.showModal()` |
| `transition-behavior: allow-discrete` | sem animação de saída |

---

## salve, Tailwind ou Bootstrap?

| | salve | Tailwind | Bootstrap |
|---|---|---|---|
| Precisa de build | não (opcional) | sim | não |
| Componentes prontos | sim | não (só utilitários) | sim |
| Utilitários | sim, com `md:` e `@md:` | sim | parcial |
| Layout sem media query | sim (primitivas intrínsecas) | não | não |
| Sobrescrever sem `!important` | sim (`@layer`) | sim | difícil |
| Tema em runtime (sem rebuild) | sim (variáveis CSS) | parcial | parcial |
| Dark mode automático | sim | manual (`dark:`) | sim |
| JavaScript necessário | nenhum | nenhum | para modais e menus |
| HTML resultante | enxuto | muitas classes | médio |

**Escolha o salve** se quer algo que funcione colando um link, com componentes acessíveis e um HTML limpo. Dá para personalizar tudo, até o nível de um build próprio.

---

## Perguntas frequentes

**Preciso de Node, PostCSS ou build?**
Não. O CLI é opcional e só serve para quem quer um CSS sob medida.

**O salve vai bagunçar o CSS do meu projeto?**
Não. Tudo fica em camadas, e o seu CSS fora de camadas sempre vence. O reset usa `:where()`, que tem especificidade zero.

**As classes `.card` e `.btn` vão colidir com as minhas?**
Se você já tem uma `.card`, os estilos se somam e os seus vencem. Se preferir isolar, gere um build sem o módulo de componentes em conflito.

**Funciona com Tailwind junto?**
Funciona, mas os dois têm reset e utilitários com nomes parecidos. Prefira usar um só, ou gere um salve sem `reset` e sem `utilities`.

**Como uso a cor exata da minha marca?**
Sobrescreva `--s-accent` (e opcionalmente `--s-accent-hover`, `--s-accent-subtle`, `--s-accent-text`, `--s-on-accent`).

**Por que OKLCH?**
Porque é perceptual: mudar a matiz não muda o brilho. Com HEX ou HSL, um amarelo e um azul "do mesmo tom" têm contrastes muito diferentes.

**Qual o tamanho final?**
O pacote completo tem cerca de 87 KB minificado e 15 KB com gzip. Com o CLI você remove o que não usa.

---

## Desenvolvimento

```bash
git clone https://github.com/<seu-usuario>/salve-css.git
cd salve-css
npm run build     # gera dist/salve.css e dist/salve.min.css
```

```
src/
  tokens.css          botões do tema, paletas, semânticos, escalas
  reset.css           reset moderno e de especificidade zero
  base.css            HTML sem classe
  layout.css          primitivas de layout
  components/         tone, button, card, form, feedback, overlay, data, nav
lib/
  build.js            monta o CSS final aplicando a configuração
  utilities.js        gera os utilitários e as variantes responsivas
bin/salve.js          CLI
dist/                 gerado pelo build (publicado no npm, fora do git)
```

O site de documentação fica num projeto separado: [salve-site](../salve-site).

**Convenções**

- Uma camada por arquivo, sempre dentro de `@layer salve.<nome>`.
- Seletores de reset e base sempre com `:where()`.
- Toda cor, espaço, raio e duração vem de um token.
- Propriedades lógicas por padrão. As físicas só quando não devem inverter em RTL.
- Recursos novos entram como aprimoramento progressivo, com um comportamento aceitável sem eles.

## Licença

MIT © Julio Carneiro
