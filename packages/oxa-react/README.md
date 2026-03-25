# @oxa/react

React components for rendering [OXA](https://oxa.dev) documents.

## Installation

```bash
npm install @oxa/react
```

## Usage

```tsx
import { OxaProvider, OXA, defaultRenderers } from "@oxa/react";

const document = {
  type: "Document",
  children: [
    {
      type: "Paragraph",
      children: [{ type: "Text", value: "Hello, world!" }],
    },
  ],
};

function App() {
  return (
    <OxaProvider renderers={defaultRenderers}>
      <OXA ast={document} />
    </OxaProvider>
  );
}
```

## Adding Styles

This package uses [Tailwind CSS](https://tailwindcss.com/) for default styling. To include the styles in your application, add `@oxa/react` as a source in your CSS:

```css
@import "tailwindcss";
@source "../node_modules/@oxa/react/dist";
```

The `@source` directive tells Tailwind v4 to scan the package's dist files for class names. See the [Tailwind CSS docs on content configuration](https://tailwindcss.com/docs/content-configuration) for more details.

## Custom Renderers

You can override any node renderer by passing a `renderers` prop to `<OxaProvider>`:

```tsx
import { OxaProvider, OXA } from "@oxa/react";
import type { OxaNode } from "@oxa/react";

function CustomHeading({ node }: { node: OxaNode & { level?: number } }) {
  return <h1 style={{ color: "blue" }}>{node.children?.map(/* ... */)}</h1>;
}

function App() {
  return (
    <OxaProvider renderers={{ Heading: CustomHeading }}>
      <OXA ast={document} />
    </OxaProvider>
  );
}
```

Custom renderers are merged with the defaults — you only need to provide the ones you want to override.

## Merging Renderers

Use `mergeRenderers` to combine multiple renderer sets:

```tsx
import { mergeRenderers, defaultRenderers } from "@oxa/react";

const myRenderers = mergeRenderers([defaultRenderers, customRenderers]);
```

Renderers later in the array take precedence.

> This package was inspired by the [`myst-to-react`](https://github.com/jupyter-book/mystmd/tree/main/packages/myst-to-react) package.
