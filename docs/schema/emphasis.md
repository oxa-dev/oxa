(oxa:emphasis)=

## Emphasis


Emphasized content (typically italicized).


__type__: _string_, ("Emphasis")

: The type discriminator for Emphasis nodes.

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

````{tab-set}
```{tab-item} OXA
:sync: oxa
```json
{"type":"Emphasis","children":[{"type":"Text","value":"emphasized text"}]}
```
```

```{tab-item} MyST
:sync: myst
```json
{"type":"emphasis","children":[{"type":"text","value":"emphasized text"}]}
```
```

```{tab-item} Pandoc
:sync: pandoc
```json
{"t":"Emph","c":[{"t":"Str","c":"emphasized text"}]}
```
```

```{tab-item} Stencila
:sync: stencila
```json
{"type":"Emphasis","content":[{"type":"Text","value":"emphasized text"}]}
```
```

```{tab-item} Markdown
:sync: markdown
```markdown
*emphasized text*
```
```

```{tab-item} HTML
:sync: html
```html
<em>emphasized text</em>
```
```

```{tab-item} JATS
:sync: jats
```xml
<italic>emphasized text</italic>
```
```

````