(oxa:reference)=

## Reference


A block-level bibliographic record.


__type__: _string_, ("Reference")

: The type discriminator for Reference nodes.

__id__: __string__

: A unique identifier for the node, used by Cite xref values.

__classes__: __array__ ("string")

: A list of class names for styling or semantics.

__data__: __object__

: Arbitrary key-value data attached to the node.

__children__: __array__ ("Inline")

: Optional inline content for the rendered display of this reference.
: See @oxa:inline

__csl__: __object__

: A CSL-JSON item object for the bibliographic record.

### Example

`````{tab-set}
````{tab-item} OXA
:sync: oxa
```json
{"type":"Reference","id":"jones2022","children":[{"type":"Text","value":"Jones and Chen (2022)."}],"csl":{"id":"jones2022","citation-key":"jones2022","type":"article-journal","title":"A Framework for Open Science","author":[{"given":"Alice","family":"Jones"},{"given":"Bob","family":"Chen"}],"issued":{"date-parts":[[2022]]}}}
```
````

````{tab-item} HTML
:sync: html
```html
<div id="jones2022" role="doc-biblioentry">Jones and Chen (2022).</div>
```
````

````{tab-item} JATS
:sync: jats
```xml
<ref id="jones2022"><element-citation publication-type="journal"><article-title>A Framework for Open Science</article-title></element-citation></ref>
```
````

`````