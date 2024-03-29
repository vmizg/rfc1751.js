/*
    Implementation of RFC1751 standard in TypeScript / JavaScript.

    Converts between 128-bit strings and a human-readable
    sequence of words, as defined in RFC1751: "A Convention for
    Human-Readable 128-bit Keys", by Daniel L. McDonald:
    https://tools.ietf.org/html/rfc1751

    Source implementation:

    rfc1751.js @ ms-brainwallet.github.io (public domain)
        https://github.com/ms-brainwallet/ms-brainwallet.github.io/blob/master/js/rfc1751.js

    rfc1751.py @ Python Cryptography Toolkit
        Written by Andrew M. Kuchling and others (public domain)
        https://github.com/dlitz/pycrypto/blob/master/lib/Crypto/Util/RFC1751.py

    -----------------------------------------------------------------------------------------

    MIT License

    Copyright (c) 2020 Vytautas Mizgiris and others

    Permission is hereby granted, free of charge, to any person obtaining a copy
    of this software and associated documentation files (the "Software"), to deal
    in the Software without restriction, including without limitation the rights
    to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
    copies of the Software, and to permit persons to whom the Software is
    furnished to do so, subject to the following conditions:

    The above copyright notice and this permission notice shall be included in all
    copies or substantial portions of the Software.

    THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
    IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
    FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
    AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
    LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
    OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
    SOFTWARE.
*/

import { WORDLIST } from './wordlist';

const BINARY = [
    '0000',
    '0001',
    '0010',
    '0011',
    '0100',
    '0101',
    '0110',
    '0111',
    '1000',
    '1001',
    '1010',
    '1011',
    '1100',
    '1101',
    '1110',
    '1111',
];

function key2bin(key: Uint8Array | number[]): string {
    let res = '';
    for (let i = 0; i < key.length; i++) {
        res += BINARY[key[i] >> 4] + BINARY[key[i] & 0x0f];
    }
    return res;
}

function extract(key: string, start: number, length: number): number {
    const k = key.substring(start, start + length);
    let acc = 0;
    for (let i = 0; i < k.length; i++) {
        acc = acc * 2 + k.charCodeAt(i) - 48;
    }
    return acc;
}

/**
 * Encode 8 bytes as a string of English words.
 *
 * The byte array must contain elements that do not exceed
 * 8 bits in size. Any element that is larger
 * than 8 bits will be truncated.
 *
 * @param bytes Uint8Array | number[]
 */
export function btoe(bytes: Uint8Array | number[]): string {
    let key = new Uint8Array(bytes);

    // Pad to 8 bytes
    const pad = (8 - (key.byteLength % 8)) % 8;
    const padded = new Uint8Array(pad + key.byteLength);
    for (let i = 0; i < key.byteLength; i++) {
        padded[i] = key[i];
    }
    key = padded;

    let english = '';
    for (let index = 0; index < key.byteLength; index += 8) {
        let subkey = key.slice(index, index + 8);

        // Compute parity
        let skbin = key2bin(subkey);
        let p = 0;
        for (let i = 0; i < 64; i += 2) {
            p = p + extract(skbin, i, 2);
        }

        const subkeyLen = subkey.byteLength;
        const subkeyP = new Uint8Array(subkeyLen + 1);
        subkeyP.set(subkey);
        subkeyP[subkeyLen] = (p << 6) & 0xff;
        subkey = subkeyP;

        skbin = key2bin(subkey);
        for (let i = 0; i < 64; i += 11) {
            english += WORDLIST[extract(skbin, i, 11)] + ' ';
        }
    }
    return english.slice(0, english.length - 1);
}

/**
 * Decode English words to binary.
 *
 * The string must contain words separated by whitespace; the number
 * of words must be a multiple of 6.
 *
 * @param str string
 */
export function etob(str: string): Uint8Array {
    const mnemonic = str.toUpperCase().split(' ');
    let key = new Uint8Array();
    let word = '';

    for (let i = 0; i < mnemonic.length; i += 6) {
        const ch = new Uint8Array([0, 0, 0, 0, 0, 0, 0, 0, 0]);
        const sublist = mnemonic.slice(i, i + 6);
        let bits = 0;

        for (let j = 0; j < sublist.length; j++) {
            word = sublist[j];
            if (word.length > 4 || word.length < 1) {
                throw new SyntaxError(
                    'Words must be between 1 and 4 characters long'
                );
            }
            const index = WORDLIST.indexOf(word);
            const shift = (8 - ((bits + 11) % 8)) % 8;
            const y = index << shift;
            const cl = y >> 16;
            const cc = (y >> 8) & 0xff;
            const cr = y & 0xff;
            const t = Math.floor(bits / 8);

            if (shift > 5) {
                ch[t] = ch[t] | cl;
                ch[t + 1] = ch[t + 1] | cc;
                ch[t + 2] = ch[t + 2] | cr;
            } else if (shift > -3) {
                ch[t] = ch[t] | cc;
                ch[t + 1] = ch[t + 1] | cr;
            } else {
                ch[t] = ch[t] | cr;
            }
            bits = bits + 11;
        }
        const subkey = ch.slice();

        // Check parity
        const skbin = key2bin(subkey);
        let p = 0;
        for (let j = 0; j < 64; j += 2) {
            p = p + extract(skbin, j, 2);
        }
        const cs0 = extract(skbin, 64, 2);
        const cs1 = p & 3;
        if (cs0 !== cs1) {
            throw new Error('Parity error at ' + word);
        }

        // Perform concatenation
        if (key) {
            const newkeyLen = key.byteLength + subkey.byteLength - 1;
            const newkey = new Uint8Array(newkeyLen);
            newkey.set(key);
            newkey.set(subkey.slice(0, 8), key.byteLength);
            key = newkey;
        } else {
            key = subkey.slice(0, 8);
        }
    }
    return key;
}
