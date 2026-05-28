(oxa:codeexpr)=

## CodeExpr


An executable expression embedded within prose.


__type__: _string_, ("CodeExpr")

: The type discriminator for CodeExpr nodes.

__id__: __string__

: A unique identifier for the node.

__classes__: __array__ ("string")

: A list of class names for styling or semantics.

__data__: __object__

: Arbitrary key-value data attached to the node.

__code__: __string__

: The expression to evaluate.

__language__: __string__

: The programming language identifier for the expression.

### Example

`````{tab-set}
````{tab-item} OXA
:sync: oxa
```json
{"type":"CodeExpr","language":"python","code":"len(df)"}
```
````

`````