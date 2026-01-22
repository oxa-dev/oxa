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

````{tab-set}
```{tab-item} OXA
:sync: oxa
```json
{"type":"Text","value":"Hello, world!"}
```
```

```{tab-item} MyST
:sync: myst
```json
{"type":"text","value":"Hello, world!"}
```
```

```{tab-item} Pandoc
:sync: pandoc
```json
{"t":"Str","c":"Hello, world!"}
```
```

```{tab-item} Stencila
:sync: stencila
```json
{"type":"Text","value":"Hello, world!"}
```
```

```{tab-item} Markdown
:sync: markdown
```markdown
Hello, world!
```
```

```{tab-item} HTML
:sync: html
```html
Hello, world!
```
```

```{tab-item} JATS
:sync: jats
```xml
Hello, world!
```
```

````