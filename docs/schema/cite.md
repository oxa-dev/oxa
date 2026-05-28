(oxa:cite)=

## Cite


An inline citation to a bibliographic reference.


__type__: _string_, ("Cite")

: The type discriminator for Cite nodes.

__id__: __string__

: A unique identifier for the node.

__classes__: __array__ ("string")

: A list of class names for styling or semantics.

__data__: __object__

: Arbitrary key-value data attached to the node.

__xref__: __string__

: Reference to the id of a Reference node in the containing document.

__children__: __array__ ("Inline")

: Optional inline content that overrides generated citation display text.
: See @oxa:inline

__prefix__: __array__ ("Inline")

: Inline content preceding the citation within its group.
: See @oxa:inline

__suffix__: __array__ ("Inline")

: Inline content following the citation within its group.
: See @oxa:inline

__display__: _string_, ("author" | "date" | "full")

: Controls which part of the referenced bibliographic record is rendered.

__locator__: __string__

: A human-readable locator within the referenced work.

__url__: __string__

: A deep link to a specific location in the referenced work.

__intent__: __string__

: The citation intent, typically using a CiTO vocabulary value.

### Example

`````{tab-set}
````{tab-item} OXA
:sync: oxa
```json
{"type":"Cite","xref":"jones2022","prefix":[{"type":"Text","value":"see "}],"locator":"fig. 3","intent":"extends"}
```
````

````{tab-item} Markdown
:sync: markdown
```markdown
[@jones2022]
```
````

````{tab-item} HTML
:sync: html
```html
<a href="#jones2022" role="doc-biblioref">see Jones, 2022, fig. 3</a>
```
````

````{tab-item} JATS
:sync: jats
```xml
<xref ref-type="bibr" rid="jones2022">see Jones, 2022, fig. 3</xref>
```
````

`````