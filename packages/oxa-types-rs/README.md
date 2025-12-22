# oxa-types

Rust types generated from the [OXA](https://github.com/oxa-dev/oxa) schema.

## Installation

Add this to your `Cargo.toml`:

```toml
[dependencies]
oxa-types = "0.1"
```

## Usage

```rust
use oxa_types::{Document, Block, Paragraph, Inline, Text};

fn main() {
    // Parse from JSON
    let json = r#"{
        "type": "Document",
        "metadata": {},
        "title": [],
        "children": [
            {
                "type": "Paragraph",
                "classes": [],
                "data": {},
                "children": [
                    {"type": "Text", "classes": [], "data": {}, "value": "Hello, world!"}
                ]
            }
        ]
    }"#;

    let doc: Document = serde_json::from_str(json).unwrap();
    println!("{:?}", doc);

    // Serialize back to JSON
    let output = serde_json::to_string_pretty(&doc).unwrap();
    println!("{}", output);
}
```

The `type` field uses `monostate::MustBe!` to ensure type-safe deserialization - each struct only accepts its specific type value.

## Development

The types in this crate are auto-generated from the OXA JSON Schema. Do not edit `src/lib.rs` directly. Instead:

1. Edit the YAML schema files in `schema/`
2. Run `pnpm codegen rs` to regenerate the Rust types
