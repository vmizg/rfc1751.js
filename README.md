# RFC1751.js

An implementation of RFC1751 convention in TypeScript / JavaScript.

Converts between 128-bit strings and a human-readable
sequence of words, as defined in RFC1751: "A Convention for
Human-Readable 128-bit Keys", by Daniel L. McDonald:
https://tools.ietf.org/html/rfc1751

## Source implementation

rfc1751.js @ ms-brainwallet.github.io (public domain)
(https://github.com/ms-brainwallet/ms-brainwallet.github.io/blob/master/js/rfc1751.js)

rfc1751.py @ Python Cryptography Toolkit, written by Andrew M. Kuchling and others (public domain)
(https://github.com/dlitz/pycrypto/blob/master/lib/Crypto/Util/RFC1751.py)

## Installation

```
npm install rfc1751.js
```

## Usage

``` javascript
import { btoe, etob } from 'rfc1751.js';

// Convert bytes to words
let bytearray = new Uint8Array([4, 8, 15, 16, 23, 42, 0, 0]);
let words = btoe(bytearray);

// Convert words to bytes
let decoded = etob(words);
```

## License

It is licensed under MIT license.
