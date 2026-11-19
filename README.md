# Thatipally Anudeep — Drawing Set

Blueprint-style portfolio of **Thatipally Anudeep** (Civil engineer · IIT Hyderabad).
A single-page, drafting-paper-themed site covering structural design, sustainable
materials, digital fabrication and computation.

> Originally delivered as one self-contained `portfolio.html`. This repo splits it
> into `index.html` + `styles.css` + a small TypeScript build step so it can deploy
> cleanly on Vercel.

## Project structure

```
.
├── index.html         # markup + meta
├── styles.css         # full stylesheet (was the inline <style> block)
├── src/
│   └── script.ts      # all interactivity (was the inline <script> block)
├── public/            # build output (created by `npm run build`, gitignored)
│   └── script.js
├── package.json
├── tsconfig.json
├── vercel.json
└── README.md
```

## Local development

Requires Node.js 18+.

```bash
npm install
npm run build      # compiles src/script.ts -> public/script.js
```

Then open `index.html` in a browser, or serve the folder:

```bash
npx serve .
# or
python3 -m http.server 8000
```

Visit `http://localhost:8000`.

## Deploy on Vercel

### Option A — Git-connected (recommended)

1. Push this repo to GitHub (see "Push to GitHub" below).
2. Go to <https://vercel.com/new>.
3. Import the repository.
4. Vercel auto-detects settings from `vercel.json`. The defaults are:
   - **Build command:** `npm run build`
   - **Output directory:** `public`
   - **Install command:** `npm install`
5. Click **Deploy**. Vercel runs `tsc`, serves `index.html` from the root and
   `script.js` + `styles.css` from `public/`.

### Option B — Vercel CLI

```bash
npm i -g vercel
vercel          # preview deploy
vercel --prod   # production deploy
```

## Build output note

Vercel's static host serves files from the project root **and** the output
directory. The build copies `script.js` into `public/` and `index.html`
references `/script.js`; `vercel.json` is configured so both `index.html`
(root) and `public/script.js` are served correctly. `styles.css` lives at the
root next to `index.html`.

## Credits

Set in **Big Shoulders Display**, **Host Grotesk** and **JetBrains Mono**.
Fonts loaded from Google Fonts and Fontshare.
