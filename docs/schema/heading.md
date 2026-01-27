(oxa:heading)=

## Heading


A heading with a level and inline content.


__type__: _string_, ("Heading")

: The type discriminator for Heading nodes.

__id__: __string__

: A unique identifier for the node.

__classes__: __array__ ("string")

: A list of class names for styling or semantics.

__data__: __object__

: Arbitrary key-value data attached to the node.

__level__: __number__

: The heading level (1-6).

__children__: __array__ ("Inline")

: The inline content of the heading.
: See @oxa:inline

### Example

`````{tab-set}
````{tab-item} OXA
:sync: oxa
```json
{"type":"Heading","level":1,"children":[{"type":"Text","value":"Introduction"}]}
```
````

````{tab-item} MyST AST
:sync: myst-ast
```json
{"type":"heading","depth":1,"children":[{"type":"text","value":"Introduction"}]}
```
````

````{tab-item} Pandoc Types
:sync: pandoc-types
```json
{"t":"Header","c":[1,["",[],[]],[{"t":"Str","c":"Introduction"}]]}
```
````

````{tab-item} Stencila Schema
:sync: stencila-schema
```json
{"type":"Heading","depth":1,"content":[{"type":"Text","value":"Introduction"}]}
```
````

````{tab-item} Markdown
:sync: markdown
```markdown
# Introduction
```
````

````{tab-item} MyST Markdown
:sync: myst-markdown
```markdown
# Introduction
```
````

````{tab-item} Stencila Markdown
:sync: stencila-markdown
```markdown
# Introduction
```
````

````{tab-item} Quarto Markdown
:sync: quarto-markdown
```markdown
# Introduction
```
````

````{tab-item} HTML
:sync: html
```html
<h1>Introduction</h1>
```
````

````{tab-item} JATS
:sync: jats
```xml
<title>Introduction</title>
```
````

`````