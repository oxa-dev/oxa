(oxa:codecell)=

## CodeCell


An executable block of code that can produce outputs.


__type__: _string_, ("CodeCell")

: The type discriminator for CodeCell nodes.

__id__: __string__

: A unique identifier for the node.

__classes__: __array__ ("string")

: A list of class names for styling or semantics.

__data__: __object__

: Arbitrary key-value data attached to the node.

__code__: __string__

: The source code to execute.

__language__: __string__

: The programming language identifier for the code.

__isEchoed__: __boolean__

: Whether the source code is displayed to readers.

__isHidden__: __boolean__

: Whether outputs are hidden from readers.

### Example

`````{tab-set}
````{tab-item} OXA
:sync: oxa
```json
{"type":"CodeCell","language":"python","code":"x = 1\nx","isEchoed":true}
```
````

`````