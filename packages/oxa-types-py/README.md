# oxa-types

Pydantic models generated from the OXA JSON Schema.

## Installation

```bash
pip install oxa-types
```

Or with uv:

```bash
uv add oxa-types
```

## Usage

```python
from oxa_types import Document, Paragraph, Text, Block, Inline

# Create a simple document
doc = Document(
    metadata={},
    title=[Text(value="Hello World")],
    children=[
        Paragraph(children=[Text(value="This is a paragraph.")])
    ]
)

# Serialize to JSON
print(doc.model_dump_json(indent=2))
```

## Development

This package is automatically generated from the OXA JSON Schema. Do not edit the generated files directly.

To regenerate the types:

```bash
pnpm codegen py
```
