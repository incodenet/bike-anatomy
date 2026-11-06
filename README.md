# DIY Tripod Side Table

This project is a static HTML, CSS, and JavaScript guide with an interactive build phase guide and leg calculator.

## Development

Install the development dependencies with `npm install`, then run `npm run dev`. Vite serves the source files locally and provides live reload while you work.

## Production build

Run `npm run build` to create the production output in `dist/`. Run `npm run validate:standalone` to check that the output is a self-contained HTML file with embedded JavaScript, styles, fonts, and illustrations.

## Standalone offline HTML

The final artifact is `dist/index.html`. Open that file directly in a browser, including through its `file://` URL, to use the guide without a development server or internet connection. JetBrains Mono is bundled locally; the design's Inter and Fraunces typefaces use system font fallbacks offline. No external runtime APIs are used.

The source is kept in separate HTML, CSS, and JavaScript files. Development mode serves those source files; the production build bundles and inlines them into the single standalone HTML artifact.

## GitHub Actions download

The **Build standalone HTML** workflow runs for pull requests, pushes to `main`, and manual runs. After it completes, open the run under **Actions**, then download the **standalone-app** artifact from the run's Artifacts section. The artifact contains only `index.html`.
