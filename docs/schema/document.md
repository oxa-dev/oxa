(oxa:document)=

## Document


A document with metadata, title, and block content.


__type__: _string_, ("Document")

: The type discriminator for Document nodes.

__id__: __string__

: A unique identifier for the node.

__classes__: __array__ ("string")

: A list of class names for styling or semantics.

__data__: __object__

: Arbitrary key-value data attached to the node.

__metadata__: __object__

: Arbitrary document metadata.

__title__: __array__ ("Inline")

: The document title as inline content.
: See @oxa:inline

__children__: __array__ ("Block")

: The block content of the document.
: See @oxa:block
