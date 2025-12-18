# oxa-types

TypeScript type definitions generated from the [OXA JSON Schema](../../schema/).

## Installation

```bash
npm install oxa-types
```

## Usage

```typescript
import type { Document, Block, Inline, Paragraph, Text } from "oxa-types";

const doc: Document = {
  type: "Document",
  metadata: {},
  title: [{ type: "Text", value: "Hello", classes: [], data: {} }],
  children: [
    {
      type: "Paragraph",
      classes: [],
      data: {},
      children: [{ type: "Text", value: "World", classes: [], data: {} }],
    },
  ],
};
```

The types include discriminated unions for `Block` and `Inline`, enabling type-safe pattern matching:

```typescript
function getTextContent(inline: Inline): string {
  switch (inline.type) {
    case "Text":
      return inline.value;
    case "Strong":
      return inline.children.map(getTextContent).join("");
  }
}
```

## Development

Types are auto-generated from the YAML schemas in [`schema/`](../../schema/). To regenerate:

```bash
pnpm codegen ts
```

See the [contributing guide](../../CONTRIBUTING.md) for more details on schema development.
