(oxa:text)=

## Text


A text node containing a string value.


__type__: _string_, ("Text")

: The type discriminator for Text nodes.

__id__: __string__

: A unique identifier for the node.

__classes__: __array__ ("string")

: A list of class names for styling or semantics.

__data__: __object__

: Arbitrary key-value data attached to the node.

__value__: __string__

: The text content.

### Example

`````{tab-set}
````{tab-item} OXA
:sync: oxa
```json
{"type":"Text","value":"Hello, world!"}
```
````

````{tab-item} MyST AST
:sync: myst-ast
```json
{"type":"text","value":"Hello, world!"}
```
````

````{tab-item} Pandoc Types
:sync: pandoc-types
```json
{"t":"Str","c":"Hello, world!"}
```
````

````{tab-item} Stencila Schema
:sync: stencila-schema
```json
{"type":"Text","value":"Hello, world!"}
```
````

````{tab-item} Markdown
:sync: markdown
```markdown
Hello, world!
```
````

````{tab-item} MyST Markdown
:sync: myst-markdown
```markdown
Hello, world!
```
````

````{tab-item} Stencila Markdown
:sync: stencila-markdown
```markdown
Hello, world!
```
````

````{tab-item} Quarto Markdown
:sync: quarto-markdown
```markdown
Hello, world!
```
````

````{tab-item} HTML
:sync: html
```html
Hello, world!
```
````

````{tab-item} JATS
:sync: jats
```xml
Hello, world!
```
````

`````