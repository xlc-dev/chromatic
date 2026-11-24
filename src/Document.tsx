import { HydrationScript, type JSX } from "@solidjs/web";

const favicon = `${import.meta.env.BASE_URL}favicon.svg`;

export default function Document(props: { children?: JSX.Element }) {
  return (
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta name="description" content="Finally a normal colorscheme generator." />
        <meta name="author" content="xlc-dev" />
        <meta name="theme-color" content="#667eea" />

        <meta property="og:type" content="website" />
        <meta property="og:title" content="Chromatic - Colorscheme Generator" />
        <meta property="og:description" content="Finally a normal colorscheme generator." />
        <meta property="og:image" content={favicon} />

        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Chromatic - Colorscheme Generator" />
        <meta name="twitter:description" content="Finally a normal colorscheme generator." />
        <meta name="twitter:image" content={favicon} />

        <link rel="icon" type="image/svg+xml" href={favicon} />

        <title>Chromatic - Colorscheme Generator</title>

        <HydrationScript />
      </head>
      <body>{props.children}</body>
    </html>
  );
}
