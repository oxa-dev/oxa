(oxa:paragraph)=

## Paragraph


A paragraph of inline content.


__type__: _string_, ("Paragraph")

: The type discriminator for Paragraph nodes.

__id__: __string__

: A unique identifier for the node.

__classes__: __array__ ("string")

: A list of class names for styling or semantics.

__data__: __object__

: Arbitrary key-value data attached to the node.

__children__: __array__ ("Inline")

: The inline content of the paragraph.
: See @oxa:inline

### Example

`````{tab-set}
````{tab-item} OXA
:sync: oxa
```json
{"type":"Paragraph","children":[{"type":"Text","value":"This is a paragraph."}]}
```
````

````{tab-item} MyST AST
:sync: myst-ast
```json
{"type":"paragraph","children":[{"type":"text","value":"This is a paragraph."}]}
```
````

````{tab-item} Pandoc Types
:sync: pandoc-types
```json
{"t":"Para","c":[{"t":"Str","c":"This is a paragraph."}]}
```
````

````{tab-item} Stencila Schema
:sync: stencila-schema
```json
{"type":"Paragraph","content":[{"type":"Text","value":"This is a paragraph."}]}
```
````

````{tab-item} Markdown
:sync: markdown
```markdown
This is a paragraph.
```
````

````{tab-item} MyST Markdown
:sync: myst-markdown
```markdown
This is a paragraph.
```
````

````{tab-item} Stencila Markdown
:sync: stencila-markdown
```markdown
This is a paragraph.
```
````

````{tab-item} Quarto Markdown
:sync: quarto-markdown
```markdown
This is a paragraph.
```
````

````{tab-item} HTML
:sync: html
```html
<p>This is a paragraph.</p>
```
````

````{tab-item} JATS
:sync: jats
```xml
<p>This is a paragraph.</p>
```
````

`````