(oxa:strong)=

## Strong


Strongly emphasized content (typically bold).


__type__: _string_, ("Strong")

: The type discriminator for Strong nodes.

__id__: __string__

: A unique identifier for the node.

__classes__: __array__ ("string")

: A list of class names for styling or semantics.

__data__: __object__

: Arbitrary key-value data attached to the node.

__children__: __array__ ("Inline")

: The inline content to emphasize.
: See @oxa:inline

### Example

`````{tab-set}
````{tab-item} OXA
:sync: oxa
```json
{"type":"Strong","children":[{"type":"Text","value":"strong text"}]}
```
````

````{tab-item} MyST AST
:sync: myst-ast
```json
{"type":"strong","children":[{"type":"text","value":"strong text"}]}
```
````

````{tab-item} Pandoc Types
:sync: pandoc-types
```json
{"t":"Strong","c":[{"t":"Str","c":"strong text"}]}
```
````

````{tab-item} Stencila Schema
:sync: stencila-schema
```json
{"type":"Strong","content":[{"type":"Text","value":"strong text"}]}
```
````

````{tab-item} Markdown
:sync: markdown
```markdown
**strong text**
```
````

````{tab-item} MyST Markdown
:sync: myst-markdown
```markdown
**strong text**
```
````

````{tab-item} Stencila Markdown
:sync: stencila-markdown
```markdown
**strong text**
```
````

````{tab-item} Quarto Markdown
:sync: quarto-markdown
```markdown
**strong text**
```
````

````{tab-item} HTML
:sync: html
```html
<strong>strong text</strong>
```
````

````{tab-item} JATS
:sync: jats
```xml
<bold>strong text</bold>
```
````

`````