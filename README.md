# RFC1751.js

[![npm](https://img.shields.io/npm/v/rfc1751.js?style=flat-square)](https://www.npmjs.com/package/rfc1751.js)
[![npm bundle size](https://img.shields.io/bundlephobia/min/rfc1751.js?style=flat-square)](https://www.npmjs.com/package/rfc1751.js)
![David](https://img.shields.io/david/mizvyt/rfc1751.js?style=flat-square)

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

let bytearray = new Uint8Array([4, 8, 15, 16, 23, 42, 0, 0]);

let words = btoe(bytearray);
// "AT TIC NIBS ODD JACK ABE"

let decoded = etob(words);
// Uint8Array([4, 8, 15, 16, 23, 42, 0, 0])
```

## License

It is licensed under MIT license.
