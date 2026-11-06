# Bike Anatomy

An interactive guide to how a 7-speed bike works: the six systems, the path
from pedal to wheel, the seven gears with a live speed calculator, and how the
rear derailleur shifts.

The source is plain HTML, CSS and ES modules. Vite serves the source files in
development, and the production build inlines everything (styles, scripts
and photos) into a single `dist/index.html`.

## Development

```sh
npm install
npm run dev
```

Vite serves the source files with live reload. Open the URL it prints
(usually `http://localhost:5173`).

> The root `index.html` is the **source** page and loads
> `assets/js/main.js` as an ES module. Browsers block module scripts on
> `file://` (a CORS error), so don't open it directly from disk: use
> `npm run dev`, or build and open `dist/index.html`, which inlines the script
> and works offline.

| Command | Purpose |
| --- | --- |
| `npm run dev` | Dev server with live reload |
| `npm run build` | Bundle everything into `dist/index.html` |
| `npm run preview` | Serve the built output locally |
| `npm run validate:standalone` | Check that `dist/` is exactly one self-contained file |
| `npm run format` | Format HTML, CSS and JS with Prettier |

## Project structure

```
index.html                  The page (single source of markup)
assets/
  css/
    core/                   reset, helpers
    components/             reusable blocks (button, range-slider, disclosure, ...)
    top.css                 tokens, base elements, header, intro   (in <head>)
    main.css                parts, power path, gears, shifting
    bottom.css              systems, comparison, glossary, print
  img/                      photos used in the annotated diagrams (.webp)
  js/
    main.js                 bootstrap only
    data/                   parts list and gearing data
    modules/                one module per feature (initX)
    utils/                  pure helpers (gear maths) and DOM helpers
scripts/
  validate-standalone.mjs   checks on the production output
```

## Standalone offline HTML

The final artifact is `dist/index.html`. Open it directly in a browser,
including through a `file://` URL. It needs no server and no internet
connection, and makes no runtime network requests.

## GitHub Actions download

The **Build and deploy** workflow runs on pull requests, pushes to `main`
and manual runs. After a run completes, open it under **Actions** and download
the **standalone-app** artifact. The artifact contains only `index.html`.

If a run was re-run with **Re-run failed jobs**, its summary page shows only
the artifacts of the selected attempt. Pick the first attempt from the attempt
menu to see **standalone-app**.

## GitHub Pages

Pushes to `main` also deploy `dist/` to GitHub Pages:
https://incodenet.github.io/bike-anatomy/. Pull requests build and validate
but do not deploy. The page served there is the same standalone file.

## Guidelines

Code follows the project guidelines in `.docs/`: `architecture.md`, `html.md`,
`css.md` and `javascript.md`.
