(oxa:citegroup)=

## CiteGroup


An inline container that groups citations with shared display semantics.


__type__: _string_, ("CiteGroup")

: The type discriminator for CiteGroup nodes.

__id__: __string__

: A unique identifier for the node.

__classes__: __array__ ("string")

: A list of class names for styling or semantics.

__data__: __object__

: Arbitrary key-value data attached to the node.

__kind__: _string_, ("narrative" | "parenthetical")

: The citation display style shared by the group.

__children__: __array__ ("Cite")

: The citations in the group.
: See @oxa:cite

### Example

`````{tab-set}
````{tab-item} OXA
:sync: oxa
```json
{"type":"CiteGroup","kind":"parenthetical","children":[{"type":"Cite","xref":"jones2022"},{"type":"Cite","xref":"smith2021"}]}
```
````

````{tab-item} Markdown
:sync: markdown
```markdown
[@jones2022; @smith2021]
```
````

````{tab-item} HTML
:sync: html
```html
<span role="doc-biblioref">(Jones, 2022; Smith, 2021)</span>
```
````

````{tab-item} JATS
:sync: jats
```xml
<xref ref-type="bibr" rid="jones2022">Jones, 2022</xref>; <xref ref-type="bibr" rid="smith2021">Smith, 2021</xref>
```
````

`````