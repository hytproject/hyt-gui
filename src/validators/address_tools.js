/*
 JavaScript BigInteger library version 0.9
 http://silentmatt.com/biginteger/

 Copyright (c) 2009 Matthew Crumley <email@matthewcrumley.com>
 Copyright (c) 2010,2011 by John Tobey <John.Tobey@gmail.com>
 Licensed under the MIT license.

 Support for arbitrary internal representation base was added by
 Vitaly Magerya.
 */

// Copyright (c) 2014-2015, MyMonero.com
//
// All rights reserved.
//
// Redistribution and use in source and binary forms, with or without modification, are
// permitted provided that the following conditions are met:
//
// 1. Redistributions of source code must retain the above copyright notice, this list of
//    conditions and the following disclaimer.
//
// 2. Redistributions in binary form must reproduce the above copyright notice, this list
//    of conditions and the following disclaimer in the documentation and/or other
//    materials provided with the distribution.
//
// 3. Neither the name of the copyright holder nor the names of its contributors may be
//    used to endorse or promote products derived from this software without specific
//    prior written permission.
//
// THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY
// EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF
// MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL
// THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,
// SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO,
// PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS
// INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT,
// STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF
// THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.

// Original Author: Lucas Jones

        /*!
 * Waves v0.6.0
 * http://fian.my.id/Waves
 *
 * Copyright 2014 Alfiana E. Sibuea and other contributors
 * Released under the MIT license
 * https://github.com/fians/Waves/blob/master/LICENSE
 */

        /*
    @license
    Copyright (c) 2014 The Polymer Project Authors. All rights reserved.
    This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
    The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
    The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
    Code distributed by Google as part of the polymer project is also
    subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
 */


/*
 * js-sha3 v0.5.1
 * https://github.com/emn178/js-sha3
 *
 * Copyright 2015, emn178@gmail.com
 *
 * Licensed under the MIT license:
 * http://www.opensource.org/licenses/MIT
 */

/* Wallet generator modifications: Copyright 2015 moneromooo */

var JSBigInt = (function () {
    "use strict";
    /*
     Class: BigInteger
     An arbitrarily-large integer.

     <BigInteger> objects should be considered immutable. None of the "built-in"
     methods modify *this* or their arguments. All properties should be
     considered private.

     All the methods of <BigInteger> instances can be called "statically". The
     static versions are convenient if you don't already have a <BigInteger>
     object.

     As an example, these calls are equivalent.

     > BigInteger(4).multiply(5); // returns BigInteger(20);
     > BigInteger.multiply(4, 5); // returns BigInteger(20);

     > var a = 42;
     > var a = BigInteger.toJSValue("0b101010"); // Not completely useless...
     */

    var CONSTRUCT = {}; // Unique token to call "private" version of constructor

    /*
     Constructor: BigInteger()
     Convert a value to a <BigInteger>.

     Although <BigInteger()> is the constructor for <BigInteger> objects, it is
     best not to call it as a constructor. If *n* is a <BigInteger> object, it is
     simply returned as-is. Otherwise, <BigInteger()> is equivalent to <parse>
     without a radix argument.

     > var n0 = BigInteger();      // Same as <BigInteger.ZERO>
     > var n1 = BigInteger("123"); // Create a new <BigInteger> with value 123
     > var n2 = BigInteger(123);   // Create a new <BigInteger> with value 123
     > var n3 = BigInteger(n2);    // Return n2, unchanged

     The constructor form only takes an array and a sign. *n* must be an
     array of numbers in little-endian order, where each digit is between 0
     and BigInteger.base.  The second parameter sets the sign: -1 for
     negative, +1 for positive, or 0 for zero. The array is *not copied and
     may be modified*. If the array contains only zeros, the sign parameter
     is ignored and is forced to zero.

     > new BigInteger([5], -1): create a new BigInteger with value -5

     Parameters:

     n - Value to convert to a <BigInteger>.

     Returns:

     A <BigInteger> value.

     See Also:

     <parse>, <BigInteger>
     */
    function BigInteger(n, s, token) {
        if (token !== CONSTRUCT) {
            if (n instanceof BigInteger) {
                return n;
            } else if (typeof n === "undefined") {
                return ZERO;
            }
            return BigInteger.parse(n);
        }

        n = n || []; // Provide the nullary constructor for subclasses.
        while (n.length && !n[n.length - 1]) {
            --n.length;
        }
        this._d = n;
        this._s = n.length ? (s || 1) : 0;
    }

    BigInteger._construct = function (n, s) {
        return new BigInteger(n, s, CONSTRUCT);
    };

    // Base-10 speedup hacks in parse, toString, exp10 and log functions
    // require base to be a power of 10. 10^7 is the largest such power
    // that won't cause a precision loss when digits are multiplied.
    var BigInteger_base = 10000000;
    var BigInteger_base_log10 = 7;

    BigInteger.base = BigInteger_base;
    BigInteger.base_log10 = BigInteger_base_log10;

    var ZERO = new BigInteger([], 0, CONSTRUCT);
    // Constant: ZERO
    // <BigInteger> 0.
    BigInteger.ZERO = ZERO;

    var ONE = new BigInteger([1], 1, CONSTRUCT);
    // Constant: ONE
    // <BigInteger> 1.
    BigInteger.ONE = ONE;

    var M_ONE = new BigInteger(ONE._d, -1, CONSTRUCT);
    // Constant: M_ONE
    // <BigInteger> -1.
    BigInteger.M_ONE = M_ONE;

    // Constant: _0
    // Shortcut for <ZERO>.
    BigInteger._0 = ZERO;

    // Constant: _1
    // Shortcut for <ONE>.
    BigInteger._1 = ONE;

    /*
     Constant: small
     Array of <BigIntegers> from 0 to 36.

     These are used internally for parsing, but useful when you need a "small"
     <BigInteger>.

     See Also:

     <ZERO>, <ONE>, <_0>, <_1>
     */
    BigInteger.small = [
        ZERO,
        ONE,
        /* Assuming BigInteger_base > 36 */
        new BigInteger([2], 1, CONSTRUCT),
        new BigInteger([3], 1, CONSTRUCT),
        new BigInteger([4], 1, CONSTRUCT),
        new BigInteger([5], 1, CONSTRUCT),
        new BigInteger([6], 1, CONSTRUCT),
        new BigInteger([7], 1, CONSTRUCT),
        new BigInteger([8], 1, CONSTRUCT),
        new BigInteger([9], 1, CONSTRUCT),
        new BigInteger([10], 1, CONSTRUCT),
        new BigInteger([11], 1, CONSTRUCT),
        new BigInteger([12], 1, CONSTRUCT),
        new BigInteger([13], 1, CONSTRUCT),
        new BigInteger([14], 1, CONSTRUCT),
        new BigInteger([15], 1, CONSTRUCT),
        new BigInteger([16], 1, CONSTRUCT),
        new BigInteger([17], 1, CONSTRUCT),
        new BigInteger([18], 1, CONSTRUCT),
        new BigInteger([19], 1, CONSTRUCT),
        new BigInteger([20], 1, CONSTRUCT),
        new BigInteger([21], 1, CONSTRUCT),
        new BigInteger([22], 1, CONSTRUCT),
        new BigInteger([23], 1, CONSTRUCT),
        new BigInteger([24], 1, CONSTRUCT),
        new BigInteger([25], 1, CONSTRUCT),
        new BigInteger([26], 1, CONSTRUCT),
        new BigInteger([27], 1, CONSTRUCT),
        new BigInteger([28], 1, CONSTRUCT),
        new BigInteger([29], 1, CONSTRUCT),
        new BigInteger([30], 1, CONSTRUCT),
        new BigInteger([31], 1, CONSTRUCT),
        new BigInteger([32], 1, CONSTRUCT),
        new BigInteger([33], 1, CONSTRUCT),
        new BigInteger([34], 1, CONSTRUCT),
        new BigInteger([35], 1, CONSTRUCT),
        new BigInteger([36], 1, CONSTRUCT)
    ];

    // Used for parsing/radix conversion
    BigInteger.digits = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

    /*
     Method: toString
     Convert a <BigInteger> to a string.

     When *base* is greater than 10, letters are upper case.

     Parameters:

     base - Optional base to represent the number in (default is base 10).
     Must be between 2 and 36 inclusive, or an Error will be thrown.

     Returns:

     The string representation of the <BigInteger>.
     */
    BigInteger.prototype.toString = function (base) {
        base = +base || 10;
        if (base < 2 || base > 36) {
            throw new Error("illegal radix " + base + ".");
        }
        if (this._s === 0) {
            return "0";
        }
        if (base === 10) {
            var str = this._s < 0 ? "-" : "";
            str += this._d[this._d.length - 1].toString();
            for (var i = this._d.length - 2; i >= 0; i--) {
                var group = this._d[i].toString();
                while (group.length < BigInteger_base_log10) group = '0' + group;
                str += group;
            }
            return str;
        } else {
            var numerals = BigInteger.digits;
            base = BigInteger.small[base];
            var sign = this._s;

            var n = this.abs();
            var digits = [];
            var digit;

            while (n._s !== 0) {
                var divmod = n.divRem(base);
                n = divmod[0];
                digit = divmod[1];
                // TODO: This could be changed to unshift instead of reversing at the end.
                // Benchmark both to compare speeds.
                digits.push(numerals[digit.valueOf()]);
            }
            return (sign < 0 ? "-" : "") + digits.reverse().join("");
        }
    };

    // Verify strings for parsing
    BigInteger.radixRegex = [
        /^$/,
        /^$/,
        /^[01]*$/,
        /^[012]*$/,
        /^[0-3]*$/,
        /^[0-4]*$/,
        /^[0-5]*$/,
        /^[0-6]*$/,
        /^[0-7]*$/,
        /^[0-8]*$/,
        /^[0-9]*$/,
        /^[0-9aA]*$/,
        /^[0-9abAB]*$/,
        /^[0-9abcABC]*$/,
        /^[0-9a-dA-D]*$/,
        /^[0-9a-eA-E]*$/,
        /^[0-9a-fA-F]*$/,
        /^[0-9a-gA-G]*$/,
        /^[0-9a-hA-H]*$/,
        /^[0-9a-iA-I]*$/,
        /^[0-9a-jA-J]*$/,
        /^[0-9a-kA-K]*$/,
        /^[0-9a-lA-L]*$/,
        /^[0-9a-mA-M]*$/,
        /^[0-9a-nA-N]*$/,
        /^[0-9a-oA-O]*$/,
        /^[0-9a-pA-P]*$/,
        /^[0-9a-qA-Q]*$/,
        /^[0-9a-rA-R]*$/,
        /^[0-9a-sA-S]*$/,
        /^[0-9a-tA-T]*$/,
        /^[0-9a-uA-U]*$/,
        /^[0-9a-vA-V]*$/,
        /^[0-9a-wA-W]*$/,
        /^[0-9a-xA-X]*$/,
        /^[0-9a-yA-Y]*$/,
        /^[0-9a-zA-Z]*$/
    ];

    /*
     Function: parse
     Parse a string into a <BigInteger>.

     *base* is optional but, if provided, must be from 2 to 36 inclusive. If
     *base* is not provided, it will be guessed based on the leading characters
     of *s* as follows:

     - "0x" or "0X": *base* = 16
     - "0c" or "0C": *base* = 8
     - "0b" or "0B": *base* = 2
     - else: *base* = 10

     If no base is provided, or *base* is 10, the number can be in exponential
     form. For example, these are all valid:

     > BigInteger.parse("1e2");              // Same as "1000000000"
     > BigInteger.parse("1.234*10^3");       // Same as 1234
     > BigInteger.parse("56789 * 10 ** -2"); // Same as 567

     If any characters fall outside the range defined by the radix, an exception
     will be thrown.

     Parameters:

     s - The string to parse.
     base - Optional radix (default is to guess based on *s*).

     Returns:

     a <BigInteger> instance.
     */
    BigInteger.parse = function (s, base) {
        // Expands a number in exponential form to decimal form.
        // expandExponential("-13.441*10^5") === "1344100";
        // expandExponential("1.12300e-1") === "0.112300";
        // expandExponential(1000000000000000000000000000000) === "1000000000000000000000000000000";
        function expandExponential(str) {
            str = str.replace(/\s*[*xX]\s*10\s*(\^|\*\*)\s*/, "e");

            return str.replace(/^([+\-])?(\d+)\.?(\d*)[eE]([+\-]?\d+)$/, function (x, s, n, f, c) {
                c = +c;
                var l = c < 0;
                var i = n.length + c;
                x = (l ? n : f).length;
                c = ((c = Math.abs(c)) >= x ? c - x + l : 0);
                var z = (new Array(c + 1)).join("0");
                var r = n + f;
                return (s || "") + (l ? r = z + r : r += z).substr(0, i += l ? z.length : 0) + (i < r.length ? "." + r.substr(i) : "");
            });
        }

        s = s.toString();
        if (typeof base === "undefined" || +base === 10) {
            s = expandExponential(s);
        }

        var prefixRE;
        if (typeof base === "undefined") {
            prefixRE = '0[xcb]';
        } else if (base == 16) {
            prefixRE = '0x';
        } else if (base == 8) {
            prefixRE = '0c';
        } else if (base == 2) {
            prefixRE = '0b';
        } else {
            prefixRE = '';
        }
        var parts = new RegExp('^([+\\-]?)(' + prefixRE + ')?([0-9a-z]*)(?:\\.\\d*)?$', 'i').exec(s);
        if (parts) {
            var sign = parts[1] || "+";
            var baseSection = parts[2] || "";
            var digits = parts[3] || "";

            if (typeof base === "undefined") {
                // Guess base
                if (baseSection === "0x" || baseSection === "0X") { // Hex
                    base = 16;
                } else if (baseSection === "0c" || baseSection === "0C") { // Octal
                    base = 8;
                } else if (baseSection === "0b" || baseSection === "0B") { // Binary
                    base = 2;
                } else {
                    base = 10;
                }
            } else if (base < 2 || base > 36) {
                throw new Error("Illegal radix " + base + ".");
            }

            base = +base;

            // Check for digits outside the range
            if (!(BigInteger.radixRegex[base].test(digits))) {
                throw new Error("Bad digit for radix " + base);
            }

            // Strip leading zeros, and convert to array
            digits = digits.replace(/^0+/, "").split("");
            if (digits.length === 0) {
                return ZERO;
            }

            // Get the sign (we know it's not zero)
            sign = (sign === "-") ? -1 : 1;

            // Optimize 10
            if (base == 10) {
                var d = [];
                while (digits.length >= BigInteger_base_log10) {
                    d.push(parseInt(digits.splice(digits.length - BigInteger.base_log10, BigInteger.base_log10).join(''), 10));
                }
                d.push(parseInt(digits.join(''), 10));
                return new BigInteger(d, sign, CONSTRUCT);
            }

            // Do the conversion
            var d = ZERO;
            base = BigInteger.small[base];
            var small = BigInteger.small;
            for (var i = 0; i < digits.length; i++) {
                d = d.multiply(base).add(small[parseInt(digits[i], 36)]);
            }
            return new BigInteger(d._d, sign, CONSTRUCT);
        } else {
            throw new Error("Invalid BigInteger format: " + s);
        }
    };

    /*
     Function: add
     Add two <BigIntegers>.

     Parameters:

     n - The number to add to *this*. Will be converted to a <BigInteger>.

     Returns:

     The numbers added together.

     See Also:

     <subtract>, <multiply>, <quotient>, <next>
     */
    BigInteger.prototype.add = function (n) {
        if (this._s === 0) {
            return BigInteger(n);
        }

        n = BigInteger(n);
        if (n._s === 0) {
            return this;
        }
        if (this._s !== n._s) {
            n = n.negate();
            return this.subtract(n);
        }

        var a = this._d;
        var b = n._d;
        var al = a.length;
        var bl = b.length;
        var sum = new Array(Math.max(al, bl) + 1);
        var size = Math.min(al, bl);
        var carry = 0;
        var digit;

        for (var i = 0; i < size; i++) {
            digit = a[i] + b[i] + carry;
            sum[i] = digit % BigInteger_base;
            carry = (digit / BigInteger_base) | 0;
        }
        if (bl > al) {
            a = b;
            al = bl;
        }
        for (i = size; carry && i < al; i++) {
            digit = a[i] + carry;
            sum[i] = digit % BigInteger_base;
            carry = (digit / BigInteger_base) | 0;
        }
        if (carry) {
            sum[i] = carry;
        }

        for (; i < al; i++) {
            sum[i] = a[i];
        }

        return new BigInteger(sum, this._s, CONSTRUCT);
    };

    /*
     Function: negate
     Get the additive inverse of a <BigInteger>.

     Returns:

     A <BigInteger> with the same magnatude, but with the opposite sign.

     See Also:

     <abs>
     */
    BigInteger.prototype.negate = function () {
        return new BigInteger(this._d, (-this._s) | 0, CONSTRUCT);
    };

    /*
     Function: abs
     Get the absolute value of a <BigInteger>.

     Returns:

     A <BigInteger> with the same magnatude, but always positive (or zero).

     See Also:

     <negate>
     */
    BigInteger.prototype.abs = function () {
        return (this._s < 0) ? this.negate() : this;
    };

    /*
     Function: subtract
     Subtract two <BigIntegers>.

     Parameters:

     n - The number to subtract from *this*. Will be converted to a <BigInteger>.

     Returns:

     The *n* subtracted from *this*.

     See Also:

     <add>, <multiply>, <quotient>, <prev>
     */
    BigInteger.prototype.subtract = function (n) {
        if (this._s === 0) {
            return BigInteger(n).negate();
        }

        n = BigInteger(n);
        if (n._s === 0) {
            return this;
        }
        if (this._s !== n._s) {
            n = n.negate();
            return this.add(n);
        }

        var m = this;
        // negative - negative => -|a| - -|b| => -|a| + |b| => |b| - |a|
        if (this._s < 0) {
            m = new BigInteger(n._d, 1, CONSTRUCT);
            n = new BigInteger(this._d, 1, CONSTRUCT);
        }

        // Both are positive => a - b
        var sign = m.compareAbs(n);
        if (sign === 0) {
            return ZERO;
        } else if (sign < 0) {
            // swap m and n
            var t = n;
            n = m;
            m = t;
        }

        // a > b
        var a = m._d;
        var b = n._d;
        var al = a.length;
        var bl = b.length;
        var diff = new Array(al); // al >= bl since a > b
        var borrow = 0;
        var i;
        var digit;

        for (i = 0; i < bl; i++) {
            digit = a[i] - borrow - b[i];
            if (digit < 0) {
                digit += BigInteger_base;
                borrow = 1;
            } else {
                borrow = 0;
            }
            diff[i] = digit;
        }
        for (i = bl; i < al; i++) {
            digit = a[i] - borrow;
            if (digit < 0) {
                digit += BigInteger_base;
            } else {
                diff[i++] = digit;
                break;
            }
            diff[i] = digit;
        }
        for (; i < al; i++) {
            diff[i] = a[i];
        }

        return new BigInteger(diff, sign, CONSTRUCT);
    };

    (function () {
        function addOne(n, sign) {
            var a = n._d;
            var sum = a.slice();
            var carry = true;
            var i = 0;

            while (true) {
                var digit = (a[i] || 0) + 1;
                sum[i] = digit % BigInteger_base;
                if (digit <= BigInteger_base - 1) {
                    break;
                }
                ++i;
            }

            return new BigInteger(sum, sign, CONSTRUCT);
        }

        function subtractOne(n, sign) {
            var a = n._d;
            var sum = a.slice();
            var borrow = true;
            var i = 0;

            while (true) {
                var digit = (a[i] || 0) - 1;
                if (digit < 0) {
                    sum[i] = digit + BigInteger_base;
                } else {
                    sum[i] = digit;
                    break;
                }
                ++i;
            }

            return new BigInteger(sum, sign, CONSTRUCT);
        }

        /*
         Function: next
         Get the next <BigInteger> (add one).

         Returns:

         *this* + 1.

         See Also:

         <add>, <prev>
         */
        BigInteger.prototype.next = function () {
            switch (this._s) {
            case 0:
                return ONE;
            case -1:
                return subtractOne(this, -1);
                // case 1:
            default:
                return addOne(this, 1);
            }
        };

        /*
         Function: prev
         Get the previous <BigInteger> (subtract one).

         Returns:

         *this* - 1.

         See Also:

         <next>, <subtract>
         */
        BigInteger.prototype.prev = function () {
            switch (this._s) {
            case 0:
                return M_ONE;
            case -1:
                return addOne(this, -1);
                // case 1:
            default:
                return subtractOne(this, 1);
            }
        };
    })();

    /*
     Function: compareAbs
     Compare the absolute value of two <BigIntegers>.

     Calling <compareAbs> is faster than calling <abs> twice, then <compare>.

     Parameters:

     n - The number to compare to *this*. Will be converted to a <BigInteger>.

     Returns:

     -1, 0, or +1 if *|this|* is less than, equal to, or greater than *|n|*.

     See Also:

     <compare>, <abs>
     */
    BigInteger.prototype.compareAbs = function (n) {
        if (this === n) {
            return 0;
        }

        if (!(n instanceof BigInteger)) {
            if (!isFinite(n)) {
                return (isNaN(n) ? n : -1);
            }
            n = BigInteger(n);
        }

        if (this._s === 0) {
            return (n._s !== 0) ? -1 : 0;
        }
        if (n._s === 0) {
            return 1;
        }

        var l = this._d.length;
        var nl = n._d.length;
        if (l < nl) {
            return -1;
        } else if (l > nl) {
            return 1;
        }

        var a = this._d;
        var b = n._d;
        for (var i = l - 1; i >= 0; i--) {
            if (a[i] !== b[i]) {
                return a[i] < b[i] ? -1 : 1;
            }
        }

        return 0;
    };

    /*
     Function: compare
     Compare two <BigIntegers>.

     Parameters:

     n - The number to compare to *this*. Will be converted to a <BigInteger>.

     Returns:

     -1, 0, or +1 if *this* is less than, equal to, or greater than *n*.

     See Also:

     <compareAbs>, <isPositive>, <isNegative>, <isUnit>
     */
    BigInteger.prototype.compare = function (n) {
        if (this === n) {
            return 0;
        }

        n = BigInteger(n);

        if (this._s === 0) {
            return -n._s;
        }

        if (this._s === n._s) { // both positive or both negative
            var cmp = this.compareAbs(n);
            return cmp * this._s;
        } else {
            return this._s;
        }
    };

    /*
     Function: isUnit
     Return true iff *this* is either 1 or -1.

     Returns:

     true if *this* compares equal to <BigInteger.ONE> or <BigInteger.M_ONE>.

     See Also:

     <isZero>, <isNegative>, <isPositive>, <compareAbs>, <compare>,
     <BigInteger.ONE>, <BigInteger.M_ONE>
     */
    BigInteger.prototype.isUnit = function () {
        return this === ONE ||
            this === M_ONE ||
            (this._d.length === 1 && this._d[0] === 1);
    };

    /*
     Function: multiply
     Multiply two <BigIntegers>.

     Parameters:

     n - The number to multiply *this* by. Will be converted to a
     <BigInteger>.

     Returns:

     The numbers multiplied together.

     See Also:

     <add>, <subtract>, <quotient>, <square>
     */
    BigInteger.prototype.multiply = function (n) {
        // TODO: Consider adding Karatsuba multiplication for large numbers
        if (this._s === 0) {
            return ZERO;
        }

        n = BigInteger(n);
        if (n._s === 0) {
            return ZERO;
        }
        if (this.isUnit()) {
            if (this._s < 0) {
                return n.negate();
            }
            return n;
        }
        if (n.isUnit()) {
            if (n._s < 0) {
                return this.negate();
            }
            return this;
        }
        if (this === n) {
            return this.square();
        }

        var r = (this._d.length >= n._d.length);
        var a = (r ? this : n)._d; // a will be longer than b
        var b = (r ? n : this)._d;
        var al = a.length;
        var bl = b.length;

        var pl = al + bl;
        var partial = new Array(pl);
        var i;
        for (i = 0; i < pl; i++) {
            partial[i] = 0;
        }

        for (i = 0; i < bl; i++) {
            var carry = 0;
            var bi = b[i];
            var jlimit = al + i;
            var digit;
            for (var j = i; j < jlimit; j++) {
                digit = partial[j] + bi * a[j - i] + carry;
                carry = (digit / BigInteger_base) | 0;
                partial[j] = (digit % BigInteger_base) | 0;
            }
            if (carry) {
                digit = partial[j] + carry;
                carry = (digit / BigInteger_base) | 0;
                partial[j] = digit % BigInteger_base;
            }
        }
        return new BigInteger(partial, this._s * n._s, CONSTRUCT);
    };

    // Multiply a BigInteger by a single-digit native number
    // Assumes that this and n are >= 0
    // This is not really intended to be used outside the library itself
    BigInteger.prototype.multiplySingleDigit = function (n) {
        if (n === 0 || this._s === 0) {
            return ZERO;
        }
        if (n === 1) {
            return this;
        }

        var digit;
        if (this._d.length === 1) {
            digit = this._d[0] * n;
            if (digit >= BigInteger_base) {
                return new BigInteger([(digit % BigInteger_base) | 0,
                    (digit / BigInteger_base) | 0], 1, CONSTRUCT);
            }
            return new BigInteger([digit], 1, CONSTRUCT);
        }

        if (n === 2) {
            return this.add(this);
        }
        if (this.isUnit()) {
            return new BigInteger([n], 1, CONSTRUCT);
        }

        var a = this._d;
        var al = a.length;

        var pl = al + 1;
        var partial = new Array(pl);
        for (var i = 0; i < pl; i++) {
            partial[i] = 0;
        }

        var carry = 0;
        for (var j = 0; j < al; j++) {
            digit = n * a[j] + carry;
            carry = (digit / BigInteger_base) | 0;
            partial[j] = (digit % BigInteger_base) | 0;
        }
        if (carry) {
            partial[j] = carry;
        }

        return new BigInteger(partial, 1, CONSTRUCT);
    };

    /*
     Function: square
     Multiply a <BigInteger> by itself.

     This is slightly faster than regular multiplication, since it removes the
     duplicated multiplcations.

     Returns:

     > this.multiply(this)

     See Also:
     <multiply>
     */
    BigInteger.prototype.square = function () {
        // Normally, squaring a 10-digit number would take 100 multiplications.
        // Of these 10 are unique diagonals, of the remaining 90 (100-10), 45 are repeated.
        // This procedure saves (N*(N-1))/2 multiplications, (e.g., 45 of 100 multiplies).
        // Based on code by Gary Darby, Intellitech Systems Inc., www.DelphiForFun.org

        if (this._s === 0) {
            return ZERO;
        }
        if (this.isUnit()) {
            return ONE;
        }

        var digits = this._d;
        var length = digits.length;
        var imult1 = new Array(length + length + 1);
        var product, carry, k;
        var i;

        // Calculate diagonal
        for (i = 0; i < length; i++) {
            k = i * 2;
            product = digits[i] * digits[i];
            carry = (product / BigInteger_base) | 0;
            imult1[k] = product % BigInteger_base;
            imult1[k + 1] = carry;
        }

        // Calculate repeating part
        for (i = 0; i < length; i++) {
            carry = 0;
            k = i * 2 + 1;
            for (var j = i + 1; j < length; j++, k++) {
                product = digits[j] * digits[i] * 2 + imult1[k] + carry;
                carry = (product / BigInteger_base) | 0;
                imult1[k] = product % BigInteger_base;
            }
            k = length + i;
            var digit = carry + imult1[k];
            carry = (digit / BigInteger_base) | 0;
            imult1[k] = digit % BigInteger_base;
            imult1[k + 1] += carry;
        }

        return new BigInteger(imult1, 1, CONSTRUCT);
    };

    /*
     Function: quotient
     Divide two <BigIntegers> and truncate towards zero.

     <quotient> throws an exception if *n* is zero.

     Parameters:

     n - The number to divide *this* by. Will be converted to a <BigInteger>.

     Returns:

     The *this* / *n*, truncated to an integer.

     See Also:

     <add>, <subtract>, <multiply>, <divRem>, <remainder>
     */
    BigInteger.prototype.quotient = function (n) {
        return this.divRem(n)[0];
    };

    /*
     Function: divide
     Deprecated synonym for <quotient>.
     */
    BigInteger.prototype.divide = BigInteger.prototype.quotient;

    /*
     Function: remainder
     Calculate the remainder of two <BigIntegers>.

     <remainder> throws an exception if *n* is zero.

     Parameters:

     n - The remainder after *this* is divided *this* by *n*. Will be
     converted to a <BigInteger>.

     Returns:

     *this* % *n*.

     See Also:

     <divRem>, <quotient>
     */
    BigInteger.prototype.remainder = function (n) {
        return this.divRem(n)[1];
    };

    /*
     Function: divRem
     Calculate the integer quotient and remainder of two <BigIntegers>.

     <divRem> throws an exception if *n* is zero.

     Parameters:

     n - The number to divide *this* by. Will be converted to a <BigInteger>.

     Returns:

     A two-element array containing the quotient and the remainder.

     > a.divRem(b)

     is exactly equivalent to

     > [a.quotient(b), a.remainder(b)]

     except it is faster, because they are calculated at the same time.

     See Also:

     <quotient>, <remainder>
     */
    BigInteger.prototype.divRem = function (n) {
        n = BigInteger(n);
        if (n._s === 0) {
            throw new Error("Divide by zero");
        }
        if (this._s === 0) {
            return [ZERO, ZERO];
        }
        if (n._d.length === 1) {
            return this.divRemSmall(n._s * n._d[0]);
        }

        // Test for easy cases -- |n1| <= |n2|
        switch (this.compareAbs(n)) {
        case 0: // n1 == n2
            return [this._s === n._s ? ONE : M_ONE, ZERO];
        case -1: // |n1| < |n2|
            return [ZERO, this];
        }

        var sign = this._s * n._s;
        var a = n.abs();
        var b_digits = this._d;
        var b_index = b_digits.length;
        var digits = n._d.length;
        var quot = [];
        var guess;

        var part = new BigInteger([], 0, CONSTRUCT);
        part._s = 1;

        while (b_index) {
            part._d.unshift(b_digits[--b_index]);

            if (part.compareAbs(n) < 0) {
                quot.push(0);
                continue;
            }
            if (part._s === 0) {
                guess = 0;
            } else {
                var xlen = part._d.length,
                    ylen = a._d.length;
                var highx = part._d[xlen - 1] * BigInteger_base + part._d[xlen - 2];
                var highy = a._d[ylen - 1] * BigInteger_base + a._d[ylen - 2];
                if (part._d.length > a._d.length) {
                    // The length of part._d can either match a._d length,
                    // or exceed it by one.
                    highx = (highx + 1) * BigInteger_base;
                }
                guess = Math.ceil(highx / highy);
            }
            do {
                var check = a.multiplySingleDigit(guess);
                if (check.compareAbs(part) <= 0) {
                    break;
                }
                guess--;
            } while (guess);

            quot.push(guess);
            if (!guess) {
                continue;
            }
            var diff = part.subtract(check);
            part._d = diff._d.slice();
            if (part._d.length === 0) {
                part._s = 0;
            }
        }

        return [new BigInteger(quot.reverse(), sign, CONSTRUCT),
            new BigInteger(part._d, this._s, CONSTRUCT)];
    };

    // Throws an exception if n is outside of (-BigInteger.base, -1] or
    // [1, BigInteger.base).  It's not necessary to call this, since the
    // other division functions will call it if they are able to.
    BigInteger.prototype.divRemSmall = function (n) {
        var r;
        n = +n;
        if (n === 0) {
            throw new Error("Divide by zero");
        }

        var n_s = n < 0 ? -1 : 1;
        var sign = this._s * n_s;
        n = Math.abs(n);

        if (n < 1 || n >= BigInteger_base) {
            throw new Error("Argument out of range");
        }

        if (this._s === 0) {
            return [ZERO, ZERO];
        }

        if (n === 1 || n === -1) {
            return [(sign === 1) ? this.abs() : new BigInteger(this._d, sign, CONSTRUCT), ZERO];
        }

        // 2 <= n < BigInteger_base

        // divide a single digit by a single digit
        if (this._d.length === 1) {
            var q = new BigInteger([(this._d[0] / n) | 0], 1, CONSTRUCT);
            r = new BigInteger([(this._d[0] % n) | 0], 1, CONSTRUCT);
            if (sign < 0) {
                q = q.negate();
            }
            if (this._s < 0) {
                r = r.negate();
            }
            return [q, r];
        }

        var digits = this._d.slice();
        var quot = new Array(digits.length);
        var part = 0;
        var diff = 0;
        var i = 0;
        var guess;

        while (digits.length) {
            part = part * BigInteger_base + digits[digits.length - 1];
            if (part < n) {
                quot[i++] = 0;
                digits.pop();
                diff = BigInteger_base * diff + part;
                continue;
            }
            if (part === 0) {
                guess = 0;
            } else {
                guess = (part / n) | 0;
            }

            var check = n * guess;
            diff = part - check;
            quot[i++] = guess;
            if (!guess) {
                digits.pop();
                continue;
            }

            digits.pop();
            part = diff;
        }

        r = new BigInteger([diff], 1, CONSTRUCT);
        if (this._s < 0) {
            r = r.negate();
        }
        return [new BigInteger(quot.reverse(), sign, CONSTRUCT), r];
    };

    /*
     Function: isEven
     Return true iff *this* is divisible by two.

     Note that <BigInteger.ZERO> is even.

     Returns:

     true if *this* is even, false otherwise.

     See Also:

     <isOdd>
     */
    BigInteger.prototype.isEven = function () {
        var digits = this._d;
        return this._s === 0 || digits.length === 0 || (digits[0] % 2) === 0;
    };

    /*
     Function: isOdd
     Return true iff *this* is not divisible by two.

     Returns:

     true if *this* is odd, false otherwise.

     See Also:

     <isEven>
     */
    BigInteger.prototype.isOdd = function () {
        return !this.isEven();
    };

    /*
     Function: sign
     Get the sign of a <BigInteger>.

     Returns:

     * -1 if *this* < 0
     * 0 if *this* == 0
     * +1 if *this* > 0

     See Also:

     <isZero>, <isPositive>, <isNegative>, <compare>, <BigInteger.ZERO>
     */
    BigInteger.prototype.sign = function () {
        return this._s;
    };

    /*
     Function: isPositive
     Return true iff *this* > 0.

     Returns:

     true if *this*.compare(<BigInteger.ZERO>) == 1.

     See Also:

     <sign>, <isZero>, <isNegative>, <isUnit>, <compare>, <BigInteger.ZERO>
     */
    BigInteger.prototype.isPositive = function () {
        return this._s > 0;
    };

    /*
     Function: isNegative
     Return true iff *this* < 0.

     Returns:

     true if *this*.compare(<BigInteger.ZERO>) == -1.

     See Also:

     <sign>, <isPositive>, <isZero>, <isUnit>, <compare>, <BigInteger.ZERO>
     */
    BigInteger.prototype.isNegative = function () {
        return this._s < 0;
    };

    /*
     Function: isZero
     Return true iff *this* == 0.

     Returns:

     true if *this*.compare(<BigInteger.ZERO>) == 0.

     See Also:

     <sign>, <isPositive>, <isNegative>, <isUnit>, <BigInteger.ZERO>
     */
    BigInteger.prototype.isZero = function () {
        return this._s === 0;
    };

    /*
     Function: exp10
     Multiply a <BigInteger> by a power of 10.

     This is equivalent to, but faster than

     > if (n >= 0) {
     >     return this.multiply(BigInteger("1e" + n));
     > }
     > else { // n <= 0
     >     return this.quotient(BigInteger("1e" + -n));
     > }

     Parameters:

     n - The power of 10 to multiply *this* by. *n* is converted to a
     javascipt number and must be no greater than <BigInteger.MAX_EXP>
     (0x7FFFFFFF), or an exception will be thrown.

     Returns:

     *this* * (10 ** *n*), truncated to an integer if necessary.

     See Also:

     <pow>, <multiply>
     */
    BigInteger.prototype.exp10 = function (n) {
        n = +n;
        if (n === 0) {
            return this;
        }
        if (Math.abs(n) > Number(MAX_EXP)) {
            throw new Error("exponent too large in BigInteger.exp10");
        }
        if (n > 0) {
            var k = new BigInteger(this._d.slice(), this._s, CONSTRUCT);

            for (; n >= BigInteger_base_log10; n -= BigInteger_base_log10) {
                k._d.unshift(0);
            }
            if (n == 0)
                return k;
            k._s = 1;
            k = k.multiplySingleDigit(Math.pow(10, n));
            return (this._s < 0 ? k.negate() : k);
        } else if (-n >= this._d.length * BigInteger_base_log10) {
            return ZERO;
        } else {
            var k = new BigInteger(this._d.slice(), this._s, CONSTRUCT);

            for (n = -n; n >= BigInteger_base_log10; n -= BigInteger_base_log10) {
                k._d.shift();
            }
            return (n == 0) ? k : k.divRemSmall(Math.pow(10, n))[0];
        }
    };

    /*
     Function: pow
     Raise a <BigInteger> to a power.

     In this implementation, 0**0 is 1.

     Parameters:

     n - The exponent to raise *this* by. *n* must be no greater than
     <BigInteger.MAX_EXP> (0x7FFFFFFF), or an exception will be thrown.

     Returns:

     *this* raised to the *nth* power.

     See Also:

     <modPow>
     */
    BigInteger.prototype.pow = function (n) {
        if (this.isUnit()) {
            if (this._s > 0) {
                return this;
            } else {
                return BigInteger(n).isOdd() ? this : this.negate();
            }
        }

        n = BigInteger(n);
        if (n._s === 0) {
            return ONE;
        } else if (n._s < 0) {
            if (this._s === 0) {
                throw new Error("Divide by zero");
            } else {
                return ZERO;
            }
        }
        if (this._s === 0) {
            return ZERO;
        }
        if (n.isUnit()) {
            return this;
        }

        if (n.compareAbs(MAX_EXP) > 0) {
            throw new Error("exponent too large in BigInteger.pow");
        }
        var x = this;
        var aux = ONE;
        var two = BigInteger.small[2];

        while (n.isPositive()) {
            if (n.isOdd()) {
                aux = aux.multiply(x);
                if (n.isUnit()) {
                    return aux;
                }
            }
            x = x.square();
            n = n.quotient(two);
        }

        return aux;
    };

    /*
     Function: modPow
     Raise a <BigInteger> to a power (mod m).

     Because it is reduced by a modulus, <modPow> is not limited by
     <BigInteger.MAX_EXP> like <pow>.

     Parameters:

     exponent - The exponent to raise *this* by. Must be positive.
     modulus - The modulus.

     Returns:

     *this* ^ *exponent* (mod *modulus*).

     See Also:

     <pow>, <mod>
     */
    BigInteger.prototype.modPow = function (exponent, modulus) {
        var result = ONE;
        var base = this;

        while (exponent.isPositive()) {
            if (exponent.isOdd()) {
                result = result.multiply(base).remainder(modulus);
            }

            exponent = exponent.quotient(BigInteger.small[2]);
            if (exponent.isPositive()) {
                base = base.square().remainder(modulus);
            }
        }

        return result;
    };

    /*
     Function: log
     Get the natural logarithm of a <BigInteger> as a native JavaScript number.

     This is equivalent to

     > Math.log(this.toJSValue())

     but handles values outside of the native number range.

     Returns:

     log( *this* )

     See Also:

     <toJSValue>
     */
    BigInteger.prototype.log = function () {
        switch (this._s) {
        case 0:
            return -Infinity;
        case -1:
            return NaN;
        default: // Fall through.
        }

        var l = this._d.length;

        if (l * BigInteger_base_log10 < 30) {
            return Math.log(this.valueOf());
        }

        var N = Math.ceil(30 / BigInteger_base_log10);
        var firstNdigits = this._d.slice(l - N);
        return Math.log((new BigInteger(firstNdigits, 1, CONSTRUCT)).valueOf()) + (l - N) * Math.log(BigInteger_base);
    };

    /*
     Function: valueOf
     Convert a <BigInteger> to a native JavaScript integer.

     This is called automatically by JavaScipt to convert a <BigInteger> to a
     native value.

     Returns:

     > parseInt(this.toString(), 10)

     See Also:

     <toString>, <toJSValue>
     */
    BigInteger.prototype.valueOf = function () {
        return parseInt(this.toString(), 10);
    };

    /*
     Function: toJSValue
     Convert a <BigInteger> to a native JavaScript integer.

     This is the same as valueOf, but more explicitly named.

     Returns:

     > parseInt(this.toString(), 10)

     See Also:

     <toString>, <valueOf>
     */
    BigInteger.prototype.toJSValue = function () {
        return parseInt(this.toString(), 10);
    };


    /*
    Function: lowVal
    Author: Lucas Jones
    */
    BigInteger.prototype.lowVal = function () {
        return this._d[0] || 0;
    };

    var MAX_EXP = BigInteger(0x7FFFFFFF);
    // Constant: MAX_EXP
    // The largest exponent allowed in <pow> and <exp10> (0x7FFFFFFF or 2147483647).
    BigInteger.MAX_EXP = MAX_EXP;

    (function () {
        function makeUnary(fn) {
            return function (a) {
                return fn.call(BigInteger(a));
            };
        }

        function makeBinary(fn) {
            return function (a, b) {
                return fn.call(BigInteger(a), BigInteger(b));
            };
        }

        function makeTrinary(fn) {
            return function (a, b, c) {
                return fn.call(BigInteger(a), BigInteger(b), BigInteger(c));
            };
        }

        (function () {
            var i, fn;
            var unary = "toJSValue,isEven,isOdd,sign,isZero,isNegative,abs,isUnit,square,negate,isPositive,toString,next,prev,log".split(",");
            var binary = "compare,remainder,divRem,subtract,add,quotient,divide,multiply,pow,compareAbs".split(",");
            var trinary = ["modPow"];

            for (i = 0; i < unary.length; i++) {
                fn = unary[i];
                BigInteger[fn] = makeUnary(BigInteger.prototype[fn]);
            }

            for (i = 0; i < binary.length; i++) {
                fn = binary[i];
                BigInteger[fn] = makeBinary(BigInteger.prototype[fn]);
            }

            for (i = 0; i < trinary.length; i++) {
                fn = trinary[i];
                BigInteger[fn] = makeTrinary(BigInteger.prototype[fn]);
            }

            BigInteger.exp10 = function (x, n) {
                return BigInteger(x).exp10(n);
            };
        })();
    })();

    return BigInteger;
})();
var cnBase58 = (function () {
    var b58 = {};

    var alphabet_str = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";
    var alphabet = [];
    for (var i = 0; i < alphabet_str.length; i++) {
        alphabet.push(alphabet_str.charCodeAt(i));
    }
    var encoded_block_sizes = [0, 2, 3, 5, 6, 7, 9, 10, 11];

    var alphabet_size = alphabet.length;
    var full_block_size = 8;
    var full_encoded_block_size = 11;

    var UINT64_MAX = new JSBigInt(2).pow(64);

    function hextobin(hex) {
        if (hex.length % 2 !== 0) throw "Hex string has invalid length!";
        var res = new Uint8Array(hex.length / 2);
        for (var i = 0; i < hex.length / 2; ++i) {
            res[i] = parseInt(hex.slice(i * 2, i * 2 + 2), 16);
        }
        return res;
    }
    this.hextobin = hextobin;
    b58.hextobin = hextobin;

    function bintohex(bin) {
        var out = [];
        for (var i = 0; i < bin.length; ++i) {
            out.push(("0" + bin[i].toString(16)).slice(-2));
        }
        return out.join("");
    }
    this.bintohex = bintohex;
    b58.bintohex = bintohex;

    function strtobin(str) {
        var res = new Uint8Array(str.length);
        for (var i = 0; i < str.length; i++) {
            res[i] = str.charCodeAt(i);
        }
        return res;
    }
    this.strtobin = strtobin;
    b58.strtobin = strtobin;

    function bintostr(bin) {
        var out = [];
        for (var i = 0; i < bin.length; i++) {
            out.push(String.fromCharCode(bin[i]));
        }
        return out.join("");
    }

    function uint8_be_to_64(data) {
        if (data.length < 1 || data.length > 8) {
            throw "Invalid input length";
        }
        var res = JSBigInt.ZERO;
        var twopow8 = new JSBigInt(2).pow(8);
        var i = 0;
        switch (9 - data.length) {
        case 1:
            res = res.add(data[i++]);
        case 2:
            res = res.multiply(twopow8).add(data[i++]);
        case 3:
            res = res.multiply(twopow8).add(data[i++]);
        case 4:
            res = res.multiply(twopow8).add(data[i++]);
        case 5:
            res = res.multiply(twopow8).add(data[i++]);
        case 6:
            res = res.multiply(twopow8).add(data[i++]);
        case 7:
            res = res.multiply(twopow8).add(data[i++]);
        case 8:
            res = res.multiply(twopow8).add(data[i++]);
            break;
        default:
            throw "Impossible condition";
        }
        return res;
    }

    function uint64_to_8be(num, size) {
        var res = new Uint8Array(size);
        if (size < 1 || size > 8) {
            throw "Invalid input length";
        }
        var twopow8 = new JSBigInt(2).pow(8);
        for (var i = size - 1; i >= 0; i--) {
            res[i] = num.remainder(twopow8).toJSValue();
            num = num.divide(twopow8);
        }
        return res;
    }

    b58.encode_block = function (data, buf, index) {
        if (data.length < 1 || data.length > full_encoded_block_size) {
            throw "Invalid block length: " + data.length;
        }
        var num = uint8_be_to_64(data);
        var i = encoded_block_sizes[data.length] - 1;
        // while num > 0
        while (num.compare(0) === 1) {
            var div = num.divRem(alphabet_size);
            // remainder = num % alphabet_size
            var remainder = div[1];
            // num = num / alphabet_size
            num = div[0];
            buf[index + i] = alphabet[remainder.toJSValue()];
            i--;
        }
        return buf;
    };

    b58.encode = function (hex) {
        var data = hextobin(hex);
        if (data.length === 0) {
            return "";
        }
        var full_block_count = Math.floor(data.length / full_block_size);
        var last_block_size = data.length % full_block_size;
        var res_size = full_block_count * full_encoded_block_size + encoded_block_sizes[last_block_size];

        var res = new Uint8Array(res_size);
        var i;
        for (i = 0; i < res_size; ++i) {
            res[i] = alphabet[0];
        }
        for (i = 0; i < full_block_count; i++) {
            res = b58.encode_block(data.subarray(i * full_block_size, i * full_block_size + full_block_size), res, i * full_encoded_block_size);
        }
        if (last_block_size > 0) {
            res = b58.encode_block(data.subarray(full_block_count * full_block_size, full_block_count * full_block_size + last_block_size), res, full_block_count * full_encoded_block_size)
        }
        return bintostr(res);
    };

    b58.decode_block = function (data, buf, index) {
        if (data.length < 1 || data.length > full_encoded_block_size) {
            throw "Invalid block length: " + data.length;
        }

        var res_size = encoded_block_sizes.indexOf(data.length);
        if (res_size <= 0) {
            throw "Invalid block size";
        }
        var res_num = new JSBigInt(0);
        var order = new JSBigInt(1);
        for (var i = data.length - 1; i >= 0; i--) {
            var digit = alphabet.indexOf(data[i]);
            if (digit < 0) {
                throw "Invalid symbol";
            }
            var product = order.multiply(digit).add(res_num);
            // if product > UINT64_MAX
            if (product.compare(UINT64_MAX) === 1) {
                throw "Overflow";
            }
            res_num = product;
            order = order.multiply(alphabet_size);
        }
        if (res_size < full_block_size && (new JSBigInt(2).pow(8 * res_size).compare(res_num) <= 0)) {
            throw "Overflow 2";
        }
        buf.set(uint64_to_8be(res_num, res_size), index);
        return buf;
    };

    b58.decode = function (enc) {
        enc = strtobin(enc);
        if (enc.length === 0) {
            return "";
        }
        var full_block_count = Math.floor(enc.length / full_encoded_block_size);
        var last_block_size = enc.length % full_encoded_block_size;
        var last_block_decoded_size = encoded_block_sizes.indexOf(last_block_size);
        if (last_block_decoded_size < 0) {
            throw "Invalid encoded length";
        }
        var data_size = full_block_count * full_block_size + last_block_decoded_size;
        var data = new Uint8Array(data_size);
        for (var i = 0; i < full_block_count; i++) {
            data = b58.decode_block(enc.subarray(i * full_encoded_block_size, i * full_encoded_block_size + full_encoded_block_size), data, i * full_block_size);
        }
        if (last_block_size > 0) {
            data = b58.decode_block(enc.subarray(full_block_count * full_encoded_block_size, full_block_count * full_encoded_block_size + last_block_size), data, full_block_count * full_block_size);
        }
        return bintohex(data);
    };

    return b58;
})();
var crc32 = (function () {
    'use strict';
    var crc32 = {};

    crc32.Utf8Encode = function (string) {
        return unescape(encodeURIComponent(string));
    };

    crc32.run = function (str) {
        var crc = new crc32.Type();
        crc.processString(str);
        return crc.checksum();
    };

    crc32.table = [
        0, 1996959894, 3993919788, 2567524794, 124634137, 1886057615, 3915621685, 2657392035,
        249268274, 2044508324, 3772115230, 2547177864, 162941995, 2125561021, 3887607047, 2428444049,
        498536548, 1789927666, 4089016648, 2227061214, 450548861, 1843258603, 4107580753, 2211677639,
        325883990, 1684777152, 4251122042, 2321926636, 335633487, 1661365465, 4195302755, 2366115317,
        997073096, 1281953886, 3579855332, 2724688242, 1006888145, 1258607687, 3524101629, 2768942443,
        901097722, 1119000684, 3686517206, 2898065728, 853044451, 1172266101, 3705015759, 2882616665,
        651767980, 1373503546, 3369554304, 3218104598, 565507253, 1454621731, 3485111705, 3099436303,
        671266974, 1594198024, 3322730930, 2970347812, 795835527, 1483230225, 3244367275, 3060149565,
        1994146192, 31158534, 2563907772, 4023717930, 1907459465, 112637215, 2680153253, 3904427059,
        2013776290, 251722036, 2517215374, 3775830040, 2137656763, 141376813, 2439277719, 3865271297,
        1802195444, 476864866, 2238001368, 4066508878, 1812370925, 453092731, 2181625025, 4111451223,
        1706088902, 314042704, 2344532202, 4240017532, 1658658271, 366619977, 2362670323, 4224994405,
        1303535960, 984961486, 2747007092, 3569037538, 1256170817, 1037604311, 2765210733, 3554079995,
        1131014506, 879679996, 2909243462, 3663771856, 1141124467, 855842277, 2852801631, 3708648649,
        1342533948, 654459306, 3188396048, 3373015174, 1466479909, 544179635, 3110523913, 3462522015,
        1591671054, 702138776, 2966460450, 3352799412, 1504918807, 783551873, 3082640443, 3233442989,
        3988292384, 2596254646, 62317068, 1957810842, 3939845945, 2647816111, 81470997, 1943803523,
        3814918930, 2489596804, 225274430, 2053790376, 3826175755, 2466906013, 167816743, 2097651377,
        4027552580, 2265490386, 503444072, 1762050814, 4150417245, 2154129355, 426522225, 1852507879,
        4275313526, 2312317920, 282753626, 1742555852, 4189708143, 2394877945, 397917763, 1622183637,
        3604390888, 2714866558, 953729732, 1340076626, 3518719985, 2797360999, 1068828381, 1219638859,
        3624741850, 2936675148, 906185462, 1090812512, 3747672003, 2825379669, 829329135, 1181335161,
        3412177804, 3160834842, 628085408, 1382605366, 3423369109, 3138078467, 570562233, 1426400815,
        3317316542, 2998733608, 733239954, 1555261956, 3268935591, 3050360625, 752459403, 1541320221,
        2607071920, 3965973030, 1969922972, 40735498, 2617837225, 3943577151, 1913087877, 83908371,
        2512341634, 3803740692, 2075208622, 213261112, 2463272603, 3855990285, 2094854071, 198958881,
        2262029012, 4057260610, 1759359992, 534414190, 2176718541, 4139329115, 1873836001, 414664567,
        2282248934, 4279200368, 1711684554, 285281116, 2405801727, 4167216745, 1634467795, 376229701,
        2685067896, 3608007406, 1308918612, 956543938, 2808555105, 3495958263, 1231636301, 1047427035,
        2932959818, 3654703836, 1088359270, 936918000, 2847714899, 3736837829, 1202900863, 817233897,
        3183342108, 3401237130, 1404277552, 615818150, 3134207493, 3453421203, 1423857449, 601450431,
        3009837614, 3294710456, 1567103746, 711928724, 3020668471, 3272380065, 1510334235, 755167117
    ];
    crc32.Type = function () {
        this.rem_ = 0xFFFFFFFF;
        this.checksum = function () {
            return ((this.rem_ ^ 0xFFFFFFFF) >>> 0);
        };
        this.processString = function (str) {
            str = crc32.Utf8Encode(str);
            for (var i = 0; i < str.length; i++) {
                var byte_index = ((str.charCodeAt(i) ^ this.rem_) >>> 0) & 0xFF;
                this.rem_ = ((this.rem_ >>> 8) ^ crc32.table[byte_index]) >>> 0;
            }
        };
        return this;
    };

    return crc32;
})();
var Module;if(!Module)Module=(typeof Module!=="undefined"?Module:null)||{};var moduleOverrides={};for(var key in Module){if(Module.hasOwnProperty(key)){moduleOverrides[key]=Module[key]}}var ENVIRONMENT_IS_NODE=typeof process==="object"&&typeof require==="function";var ENVIRONMENT_IS_WEB=typeof window==="object";var ENVIRONMENT_IS_WORKER=typeof importScripts==="function";var ENVIRONMENT_IS_SHELL=!ENVIRONMENT_IS_WEB&&!ENVIRONMENT_IS_NODE&&!ENVIRONMENT_IS_WORKER;if(ENVIRONMENT_IS_NODE){if(!Module["print"])Module["print"]=function print(x){process["stdout"].write(x+"\n")};if(!Module["printErr"])Module["printErr"]=function printErr(x){process["stderr"].write(x+"\n")};var nodeFS=require("fs");var nodePath=require("path");Module["read"]=function read(filename,binary){filename=nodePath["normalize"](filename);var ret=nodeFS["readFileSync"](filename);if(!ret&&filename!=nodePath["resolve"](filename)){filename=path.join(__dirname,"..","src",filename);ret=nodeFS["readFileSync"](filename)}if(ret&&!binary)ret=ret.toString();return ret};Module["readBinary"]=function readBinary(filename){return Module["read"](filename,true)};Module["load"]=function load(f){globalEval(read(f))};Module["thisProgram"]=process["argv"][1].replace(/\\/g,"/");Module["arguments"]=process["argv"].slice(2);if(typeof module!=="undefined"){module["exports"]=Module}}else if(ENVIRONMENT_IS_SHELL){if(!Module["print"])Module["print"]=print;if(typeof printErr!="undefined")Module["printErr"]=printErr;if(typeof read!="undefined"){Module["read"]=read}else{Module["read"]=function read(){throw"no read() available (jsc?)"}}Module["readBinary"]=function readBinary(f){return read(f,"binary")};if(typeof scriptArgs!="undefined"){Module["arguments"]=scriptArgs}else if(typeof arguments!="undefined"){Module["arguments"]=arguments}this["Module"]=Module}else if(ENVIRONMENT_IS_WEB||ENVIRONMENT_IS_WORKER){Module["read"]=function read(url){var xhr=new XMLHttpRequest;xhr.open("GET",url,false);xhr.send(null);return xhr.responseText};if(typeof arguments!="undefined"){Module["arguments"]=arguments}if(typeof console!=="undefined"){if(!Module["print"])Module["print"]=function print(x){console.log(x)};if(!Module["printErr"])Module["printErr"]=function printErr(x){console.log(x)}}else{var TRY_USE_DUMP=false;if(!Module["print"])Module["print"]=TRY_USE_DUMP&&typeof dump!=="undefined"?(function(x){dump(x)}):(function(x){})}if(ENVIRONMENT_IS_WEB){window["Module"]=Module}else{Module["load"]=importScripts}}else{throw"Unknown runtime environment. Where are we?"}function globalEval(x){eval.call(null,x)}if(!Module["load"]=="undefined"&&Module["read"]){Module["load"]=function load(f){globalEval(Module["read"](f))}}if(!Module["print"]){Module["print"]=(function(){})}if(!Module["printErr"]){Module["printErr"]=Module["print"]}if(!Module["arguments"]){Module["arguments"]=[]}if(!Module["thisProgram"]){Module["thisProgram"]="./this.program"}Module.print=Module["print"];Module.printErr=Module["printErr"];Module["preRun"]=[];Module["postRun"]=[];for(var key in moduleOverrides){if(moduleOverrides.hasOwnProperty(key)){Module[key]=moduleOverrides[key]}}var Runtime={setTempRet0:(function(value){tempRet0=value}),getTempRet0:(function(){return tempRet0}),stackSave:(function(){return STACKTOP}),stackRestore:(function(stackTop){STACKTOP=stackTop}),forceAlign:(function(target,quantum){quantum=quantum||4;if(quantum==1)return target;if(isNumber(target)&&isNumber(quantum)){return Math.ceil(target/quantum)*quantum}else if(isNumber(quantum)&&isPowerOfTwo(quantum)){return"((("+target+")+"+(quantum-1)+")&"+ -quantum+")"}return"Math.ceil(("+target+")/"+quantum+")*"+quantum}),isNumberType:(function(type){return type in Runtime.INT_TYPES||type in Runtime.FLOAT_TYPES}),isPointerType:function isPointerType(type){return type[type.length-1]=="*"},isStructType:function isStructType(type){if(isPointerType(type))return false;if(isArrayType(type))return true;if(/<?\{ ?[^}]* ?\}>?/.test(type))return true;return type[0]=="%"},INT_TYPES:{"i1":0,"i8":0,"i16":0,"i32":0,"i64":0},FLOAT_TYPES:{"float":0,"double":0},or64:(function(x,y){var l=x|0|(y|0);var h=(Math.round(x/4294967296)|Math.round(y/4294967296))*4294967296;return l+h}),and64:(function(x,y){var l=(x|0)&(y|0);var h=(Math.round(x/4294967296)&Math.round(y/4294967296))*4294967296;return l+h}),xor64:(function(x,y){var l=(x|0)^(y|0);var h=(Math.round(x/4294967296)^Math.round(y/4294967296))*4294967296;return l+h}),getNativeTypeSize:(function(type){switch(type){case"i1":case"i8":return 1;case"i16":return 2;case"i32":return 4;case"i64":return 8;case"float":return 4;case"double":return 8;default:{if(type[type.length-1]==="*"){return Runtime.QUANTUM_SIZE}else if(type[0]==="i"){var bits=parseInt(type.substr(1));assert(bits%8===0);return bits/8}else{return 0}}}}),getNativeFieldSize:(function(type){return Math.max(Runtime.getNativeTypeSize(type),Runtime.QUANTUM_SIZE)}),dedup:function dedup(items,ident){var seen={};if(ident){return items.filter((function(item){if(seen[item[ident]])return false;seen[item[ident]]=true;return true}))}else{return items.filter((function(item){if(seen[item])return false;seen[item]=true;return true}))}},set:function set(){var args=typeof arguments[0]==="object"?arguments[0]:arguments;var ret={};for(var i=0;i<args.length;i++){ret[args[i]]=0}return ret},STACK_ALIGN:8,getAlignSize:(function(type,size,vararg){if(!vararg&&(type=="i64"||type=="double"))return 8;if(!type)return Math.min(size,8);return Math.min(size||(type?Runtime.getNativeFieldSize(type):0),Runtime.QUANTUM_SIZE)}),calculateStructAlignment:function calculateStructAlignment(type){type.flatSize=0;type.alignSize=0;var diffs=[];var prev=-1;var index=0;type.flatIndexes=type.fields.map((function(field){index++;var size,alignSize;if(Runtime.isNumberType(field)||Runtime.isPointerType(field)){size=Runtime.getNativeTypeSize(field);alignSize=Runtime.getAlignSize(field,size)}else if(Runtime.isStructType(field)){if(field[1]==="0"){size=0;if(Types.types[field]){alignSize=Runtime.getAlignSize(null,Types.types[field].alignSize)}else{alignSize=type.alignSize||QUANTUM_SIZE}}else{size=Types.types[field].flatSize;alignSize=Runtime.getAlignSize(null,Types.types[field].alignSize)}}else if(field[0]=="b"){size=field.substr(1)|0;alignSize=1}else if(field[0]==="<"){size=alignSize=Types.types[field].flatSize}else if(field[0]==="i"){size=alignSize=parseInt(field.substr(1))/8;assert(size%1===0,"cannot handle non-byte-size field "+field)}else{assert(false,"invalid type for calculateStructAlignment")}if(type.packed)alignSize=1;type.alignSize=Math.max(type.alignSize,alignSize);var curr=Runtime.alignMemory(type.flatSize,alignSize);type.flatSize=curr+size;if(prev>=0){diffs.push(curr-prev)}prev=curr;return curr}));if(type.name_&&type.name_[0]==="["){type.flatSize=parseInt(type.name_.substr(1))*type.flatSize/2}type.flatSize=Runtime.alignMemory(type.flatSize,type.alignSize);if(diffs.length==0){type.flatFactor=type.flatSize}else if(Runtime.dedup(diffs).length==1){type.flatFactor=diffs[0]}type.needsFlattening=type.flatFactor!=1;return type.flatIndexes},generateStructInfo:(function(struct,typeName,offset){var type,alignment;if(typeName){offset=offset||0;type=(typeof Types==="undefined"?Runtime.typeInfo:Types.types)[typeName];if(!type)return null;if(type.fields.length!=struct.length){printErr("Number of named fields must match the type for "+typeName+": possibly duplicate struct names. Cannot return structInfo");return null}alignment=type.flatIndexes}else{var type={fields:struct.map((function(item){return item[0]}))};alignment=Runtime.calculateStructAlignment(type)}var ret={__size__:type.flatSize};if(typeName){struct.forEach((function(item,i){if(typeof item==="string"){ret[item]=alignment[i]+offset}else{var key;for(var k in item)key=k;ret[key]=Runtime.generateStructInfo(item[key],type.fields[i],alignment[i])}}))}else{struct.forEach((function(item,i){ret[item[1]]=alignment[i]}))}return ret}),dynCall:(function(sig,ptr,args){if(args&&args.length){if(!args.splice)args=Array.prototype.slice.call(args);args.splice(0,0,ptr);return Module["dynCall_"+sig].apply(null,args)}else{return Module["dynCall_"+sig].call(null,ptr)}}),functionPointers:[],addFunction:(function(func){for(var i=0;i<Runtime.functionPointers.length;i++){if(!Runtime.functionPointers[i]){Runtime.functionPointers[i]=func;return 2*(1+i)}}throw"Finished up all reserved function pointers. Use a higher value for RESERVED_FUNCTION_POINTERS."}),removeFunction:(function(index){Runtime.functionPointers[(index-2)/2]=null}),getAsmConst:(function(code,numArgs){if(!Runtime.asmConstCache)Runtime.asmConstCache={};var func=Runtime.asmConstCache[code];if(func)return func;var args=[];for(var i=0;i<numArgs;i++){args.push(String.fromCharCode(36)+i)}var source=Pointer_stringify(code);if(source[0]==='"'){if(source.indexOf('"',1)===source.length-1){source=source.substr(1,source.length-2)}else{abort("invalid EM_ASM input |"+source+"|. Please use EM_ASM(..code..) (no quotes) or EM_ASM({ ..code($0).. }, input) (to input values)")}}try{var evalled=eval("(function("+args.join(",")+"){ "+source+" })")}catch(e){Module.printErr("error in executing inline EM_ASM code: "+e+" on: \n\n"+source+"\n\nwith args |"+args+"| (make sure to use the right one out of EM_ASM, EM_ASM_ARGS, etc.)");throw e}return Runtime.asmConstCache[code]=evalled}),warnOnce:(function(text){if(!Runtime.warnOnce.shown)Runtime.warnOnce.shown={};if(!Runtime.warnOnce.shown[text]){Runtime.warnOnce.shown[text]=1;Module.printErr(text)}}),funcWrappers:{},getFuncWrapper:(function(func,sig){assert(sig);if(!Runtime.funcWrappers[sig]){Runtime.funcWrappers[sig]={}}var sigCache=Runtime.funcWrappers[sig];if(!sigCache[func]){sigCache[func]=function dynCall_wrapper(){return Runtime.dynCall(sig,func,arguments)}}return sigCache[func]}),UTF8Processor:(function(){var buffer=[];var needed=0;this.processCChar=(function(code){code=code&255;if(buffer.length==0){if((code&128)==0){return String.fromCharCode(code)}buffer.push(code);if((code&224)==192){needed=1}else if((code&240)==224){needed=2}else{needed=3}return""}if(needed){buffer.push(code);needed--;if(needed>0)return""}var c1=buffer[0];var c2=buffer[1];var c3=buffer[2];var c4=buffer[3];var ret;if(buffer.length==2){ret=String.fromCharCode((c1&31)<<6|c2&63)}else if(buffer.length==3){ret=String.fromCharCode((c1&15)<<12|(c2&63)<<6|c3&63)}else{var codePoint=(c1&7)<<18|(c2&63)<<12|(c3&63)<<6|c4&63;ret=String.fromCharCode(Math.floor((codePoint-65536)/1024)+55296,(codePoint-65536)%1024+56320)}buffer.length=0;return ret});this.processJSString=function processJSString(string){string=unescape(encodeURIComponent(string));var ret=[];for(var i=0;i<string.length;i++){ret.push(string.charCodeAt(i))}return ret}}),getCompilerSetting:(function(name){throw"You must build with -s RETAIN_COMPILER_SETTINGS=1 for Runtime.getCompilerSetting or emscripten_get_compiler_setting to work"}),stackAlloc:(function(size){var ret=STACKTOP;STACKTOP=STACKTOP+size|0;STACKTOP=STACKTOP+7&-8;return ret}),staticAlloc:(function(size){var ret=STATICTOP;STATICTOP=STATICTOP+size|0;STATICTOP=STATICTOP+7&-8;return ret}),dynamicAlloc:(function(size){var ret=DYNAMICTOP;DYNAMICTOP=DYNAMICTOP+size|0;DYNAMICTOP=DYNAMICTOP+7&-8;if(DYNAMICTOP>=TOTAL_MEMORY)enlargeMemory();return ret}),alignMemory:(function(size,quantum){var ret=size=Math.ceil(size/(quantum?quantum:8))*(quantum?quantum:8);return ret}),makeBigInt:(function(low,high,unsigned){var ret=unsigned?+(low>>>0)+ +(high>>>0)*+4294967296:+(low>>>0)+ +(high|0)*+4294967296;return ret}),GLOBAL_BASE:8,QUANTUM_SIZE:4,__dummy__:0};Module["Runtime"]=Runtime;function getSafeHeapType(bytes,isFloat){switch(bytes){case 1:return"i8";case 2:return"i16";case 4:return isFloat?"float":"i32";case 8:return"double";default:assert(0)}}function SAFE_HEAP_STORE(dest,value,bytes,isFloat){if(dest<=0)abort("segmentation fault storing "+bytes+" bytes to address "+dest);if(dest%bytes!==0)abort("alignment error storing to address "+dest+", which was expected to be aligned to a multiple of "+bytes);if(dest+bytes>Math.max(DYNAMICTOP,STATICTOP))abort("segmentation fault, exceeded the top of the available heap when storing "+bytes+" bytes to address "+dest+". STATICTOP="+STATICTOP+", DYNAMICTOP="+DYNAMICTOP);assert(DYNAMICTOP<=TOTAL_MEMORY);setValue(dest,value,getSafeHeapType(bytes,isFloat),1)}function SAFE_HEAP_LOAD(dest,bytes,isFloat,unsigned){if(dest<=0)abort("segmentation fault loading "+bytes+" bytes from address "+dest);if(dest%bytes!==0)abort("alignment error loading from address "+dest+", which was expected to be aligned to a multiple of "+bytes);if(dest+bytes>Math.max(DYNAMICTOP,STATICTOP))abort("segmentation fault, exceeded the top of the available heap when loading "+bytes+" bytes from address "+dest+". STATICTOP="+STATICTOP+", DYNAMICTOP="+DYNAMICTOP);assert(DYNAMICTOP<=TOTAL_MEMORY);var type=getSafeHeapType(bytes,isFloat);var ret=getValue(dest,type,1);if(unsigned)ret=unSign(ret,parseInt(type.substr(1)),1);return ret}function SAFE_FT_MASK(value,mask){var ret=value&mask;if(ret!==value){abort("Function table mask error: function pointer is "+value+" which is masked by "+mask+", the likely cause of this is that the function pointer is being called by the wrong type.")}return ret}var __THREW__=0;var ABORT=false;var EXITSTATUS=0;var undef=0;var tempValue,tempInt,tempBigInt,tempInt2,tempBigInt2,tempPair,tempBigIntI,tempBigIntR,tempBigIntS,tempBigIntP,tempBigIntD,tempDouble,tempFloat;var tempI64,tempI64b;var tempRet0,tempRet1,tempRet2,tempRet3,tempRet4,tempRet5,tempRet6,tempRet7,tempRet8,tempRet9;function assert(condition,text){if(!condition){abort("Assertion failed: "+text)}}var globalScope=this;function getCFunc(ident){var func=Module["_"+ident];if(!func){try{func=eval("_"+ident)}catch(e){}}assert(func,"Cannot call unknown function "+ident+" (perhaps LLVM optimizations or closure removed it?)");return func}var cwrap,ccall;((function(){var stack=0;var JSfuncs={"stackSave":(function(){stack=Runtime.stackSave()}),"stackRestore":(function(){Runtime.stackRestore(stack)}),"arrayToC":(function(arr){var ret=Runtime.stackAlloc(arr.length);writeArrayToMemory(arr,ret);return ret}),"stringToC":(function(str){var ret=0;if(str!==null&&str!==undefined&&str!==0){ret=Runtime.stackAlloc(str.length+1);writeStringToMemory(str,ret)}return ret})};var toC={"string":JSfuncs["stringToC"],"array":JSfuncs["arrayToC"]};ccall=function ccallFunc(ident,returnType,argTypes,args){var func=getCFunc(ident);var cArgs=[];if(args){for(var i=0;i<args.length;i++){var converter=toC[argTypes[i]];if(converter){if(stack===0)stack=Runtime.stackSave();cArgs[i]=converter(args[i])}else{cArgs[i]=args[i]}}}var ret=func.apply(null,cArgs);if(returnType==="string")ret=Pointer_stringify(ret);if(stack!==0)JSfuncs["stackRestore"]();return ret};var sourceRegex=/^function\s*\(([^)]*)\)\s*{\s*([^*]*?)[\s;]*(?:return\s*(.*?)[;\s]*)?}$/;function parseJSFunc(jsfunc){var parsed=jsfunc.toString().match(sourceRegex).slice(1);return{arguments:parsed[0],body:parsed[1],returnValue:parsed[2]}}var JSsource={};for(var fun in JSfuncs){if(JSfuncs.hasOwnProperty(fun)){JSsource[fun]=parseJSFunc(JSfuncs[fun])}}cwrap=function cwrap(ident,returnType,argTypes){argTypes=argTypes||[];var cfunc=getCFunc(ident);var numericArgs=argTypes.every((function(type){return type==="number"}));var numericRet=returnType!=="string";if(numericRet&&numericArgs){return cfunc}var argNames=argTypes.map((function(x,i){return"$"+i}));var funcstr="(function("+argNames.join(",")+") {";var nargs=argTypes.length;if(!numericArgs){funcstr+=JSsource["stackSave"].body+";";for(var i=0;i<nargs;i++){var arg=argNames[i],type=argTypes[i];if(type==="number")continue;var convertCode=JSsource[type+"ToC"];funcstr+="var "+convertCode.arguments+" = "+arg+";";funcstr+=convertCode.body+";";funcstr+=arg+"="+convertCode.returnValue+";"}}var cfuncname=parseJSFunc((function(){return cfunc})).returnValue;funcstr+="var ret = "+cfuncname+"("+argNames.join(",")+");";if(!numericRet){var strgfy=parseJSFunc((function(){return Pointer_stringify})).returnValue;funcstr+="ret = "+strgfy+"(ret);"}if(!numericArgs){funcstr+=JSsource["stackRestore"].body+";"}funcstr+="return ret})";return eval(funcstr)}}))();Module["cwrap"]=cwrap;Module["ccall"]=ccall;function setValue(ptr,value,type,noSafe){type=type||"i8";if(type.charAt(type.length-1)==="*")type="i32";if(noSafe){switch(type){case"i1":HEAP8[ptr>>0]=value;break;case"i8":HEAP8[ptr>>0]=value;break;case"i16":HEAP16[ptr>>1]=value;break;case"i32":HEAP32[ptr>>2]=value;break;case"i64":tempI64=[value>>>0,(tempDouble=value,+Math_abs(tempDouble)>=+1?tempDouble>+0?(Math_min(+Math_floor(tempDouble/+4294967296),+4294967295)|0)>>>0:~~+Math_ceil((tempDouble- +(~~tempDouble>>>0))/+4294967296)>>>0:0)],HEAP32[ptr>>2]=tempI64[0],HEAP32[ptr+4>>2]=tempI64[1];break;case"float":HEAPF32[ptr>>2]=value;break;case"double":HEAPF64[ptr>>3]=value;break;default:abort("invalid type for setValue: "+type)}}else{switch(type){case"i1":SAFE_HEAP_STORE(ptr|0,value|0,1,0)|0;break;case"i8":SAFE_HEAP_STORE(ptr|0,value|0,1,0)|0;break;case"i16":SAFE_HEAP_STORE(ptr|0,value|0,2,0)|0;break;case"i32":SAFE_HEAP_STORE(ptr|0,value|0,4,0)|0;break;case"i64":tempI64=[value>>>0,(tempDouble=value,+Math_abs(tempDouble)>=+1?tempDouble>+0?(Math_min(+Math_floor(tempDouble/+4294967296),+4294967295)|0)>>>0:~~+Math_ceil((tempDouble- +(~~tempDouble>>>0))/+4294967296)>>>0:0)],SAFE_HEAP_STORE(ptr|0,tempI64[0]|0,4,0)|0,SAFE_HEAP_STORE(ptr+4|0,tempI64[1]|0,4,0)|0;break;case"float":+SAFE_HEAP_STORE(ptr|0,+value,4,1);break;case"double":+SAFE_HEAP_STORE(ptr|0,+value,8,1);break;default:abort("invalid type for setValue: "+type)}}}Module["setValue"]=setValue;function getValue(ptr,type,noSafe){type=type||"i8";if(type.charAt(type.length-1)==="*")type="i32";if(noSafe){switch(type){case"i1":return HEAP8[ptr>>0];case"i8":return HEAP8[ptr>>0];case"i16":return HEAP16[ptr>>1];case"i32":return HEAP32[ptr>>2];case"i64":return HEAP32[ptr>>2];case"float":return HEAPF32[ptr>>2];case"double":return HEAPF64[ptr>>3];default:abort("invalid type for setValue: "+type)}}else{switch(type){case"i1":return SAFE_HEAP_LOAD(ptr|0,1,0,0)|0;case"i8":return SAFE_HEAP_LOAD(ptr|0,1,0,0)|0;case"i16":return SAFE_HEAP_LOAD(ptr|0,2,0,0)|0;case"i32":return SAFE_HEAP_LOAD(ptr|0,4,0,0)|0;case"i64":return SAFE_HEAP_LOAD(ptr|0,8,0,0)|0;case"float":return+SAFE_HEAP_LOAD(ptr|0,4,1,0);case"double":return+SAFE_HEAP_LOAD(ptr|0,8,1,0);default:abort("invalid type for setValue: "+type)}}return null}Module["getValue"]=getValue;var ALLOC_NORMAL=0;var ALLOC_STACK=1;var ALLOC_STATIC=2;var ALLOC_DYNAMIC=3;var ALLOC_NONE=4;Module["ALLOC_NORMAL"]=ALLOC_NORMAL;Module["ALLOC_STACK"]=ALLOC_STACK;Module["ALLOC_STATIC"]=ALLOC_STATIC;Module["ALLOC_DYNAMIC"]=ALLOC_DYNAMIC;Module["ALLOC_NONE"]=ALLOC_NONE;function allocate(slab,types,allocator,ptr){var zeroinit,size;if(typeof slab==="number"){zeroinit=true;size=slab}else{zeroinit=false;size=slab.length}var singleType=typeof types==="string"?types:null;var ret;if(allocator==ALLOC_NONE){ret=ptr}else{ret=[_malloc,Runtime.stackAlloc,Runtime.staticAlloc,Runtime.dynamicAlloc][allocator===undefined?ALLOC_STATIC:allocator](Math.max(size,singleType?1:types.length))}if(zeroinit){var ptr=ret,stop;assert((ret&3)==0);stop=ret+(size&~3);for(;ptr<stop;ptr+=4){HEAP32[ptr>>2]=0}stop=ret+size;while(ptr<stop){HEAP8[ptr++>>0]=0}return ret}if(singleType==="i8"){if(slab.subarray||slab.slice){HEAPU8.set(slab,ret)}else{HEAPU8.set(new Uint8Array(slab),ret)}return ret}var i=0,type,typeSize,previousType;while(i<size){var curr=slab[i];if(typeof curr==="function"){curr=Runtime.getFunctionIndex(curr)}type=singleType||types[i];if(type===0){i++;continue}if(type=="i64")type="i32";setValue(ret+i,curr,type);if(previousType!==type){typeSize=Runtime.getNativeTypeSize(type);previousType=type}i+=typeSize}return ret}Module["allocate"]=allocate;function Pointer_stringify(ptr,length){var hasUtf=false;var t;var i=0;while(1){t=SAFE_HEAP_LOAD(ptr+i|0,1,0,1)|0;if(t>=128)hasUtf=true;else if(t==0&&!length)break;i++;if(length&&i==length)break}if(!length)length=i;var ret="";if(!hasUtf){var MAX_CHUNK=1024;var curr;while(length>0){curr=String.fromCharCode.apply(String,HEAPU8.subarray(ptr,ptr+Math.min(length,MAX_CHUNK)));ret=ret?ret+curr:curr;ptr+=MAX_CHUNK;length-=MAX_CHUNK}return ret}var utf8=new Runtime.UTF8Processor;for(i=0;i<length;i++){t=SAFE_HEAP_LOAD(ptr+i|0,1,0,1)|0;ret+=utf8.processCChar(t)}return ret}Module["Pointer_stringify"]=Pointer_stringify;function UTF16ToString(ptr){var i=0;var str="";while(1){var codeUnit=SAFE_HEAP_LOAD(ptr+i*2|0,2,0,0)|0;if(codeUnit==0)return str;++i;str+=String.fromCharCode(codeUnit)}}Module["UTF16ToString"]=UTF16ToString;function stringToUTF16(str,outPtr){for(var i=0;i<str.length;++i){var codeUnit=str.charCodeAt(i);SAFE_HEAP_STORE(outPtr+i*2|0,codeUnit|0,2,0)|0}SAFE_HEAP_STORE(outPtr+str.length*2|0,0|0,2,0)|0}Module["stringToUTF16"]=stringToUTF16;function UTF32ToString(ptr){var i=0;var str="";while(1){var utf32=SAFE_HEAP_LOAD(ptr+i*4|0,4,0,0)|0;if(utf32==0)return str;++i;if(utf32>=65536){var ch=utf32-65536;str+=String.fromCharCode(55296|ch>>10,56320|ch&1023)}else{str+=String.fromCharCode(utf32)}}}Module["UTF32ToString"]=UTF32ToString;function stringToUTF32(str,outPtr){var iChar=0;for(var iCodeUnit=0;iCodeUnit<str.length;++iCodeUnit){var codeUnit=str.charCodeAt(iCodeUnit);if(codeUnit>=55296&&codeUnit<=57343){var trailSurrogate=str.charCodeAt(++iCodeUnit);codeUnit=65536+((codeUnit&1023)<<10)|trailSurrogate&1023}SAFE_HEAP_STORE(outPtr+iChar*4|0,codeUnit|0,4,0)|0;++iChar}SAFE_HEAP_STORE(outPtr+iChar*4|0,0|0,4,0)|0}Module["stringToUTF32"]=stringToUTF32;function demangle(func){var hasLibcxxabi=!!Module["___cxa_demangle"];if(hasLibcxxabi){try{var buf=_malloc(func.length);writeStringToMemory(func.substr(1),buf);var status=_malloc(4);var ret=Module["___cxa_demangle"](buf,0,0,status);if(getValue(status,"i32")===0&&ret){return Pointer_stringify(ret)}}catch(e){}finally{if(buf)_free(buf);if(status)_free(status);if(ret)_free(ret)}}var i=3;var basicTypes={"v":"void","b":"bool","c":"char","s":"short","i":"int","l":"long","f":"float","d":"double","w":"wchar_t","a":"signed char","h":"unsigned char","t":"unsigned short","j":"unsigned int","m":"unsigned long","x":"long long","y":"unsigned long long","z":"..."};var subs=[];var first=true;function dump(x){if(x)Module.print(x);Module.print(func);var pre="";for(var a=0;a<i;a++)pre+=" ";Module.print(pre+"^")}function parseNested(){i++;if(func[i]==="K")i++;var parts=[];while(func[i]!=="E"){if(func[i]==="S"){i++;var next=func.indexOf("_",i);var num=func.substring(i,next)||0;parts.push(subs[num]||"?");i=next+1;continue}if(func[i]==="C"){parts.push(parts[parts.length-1]);i+=2;continue}var size=parseInt(func.substr(i));var pre=size.toString().length;if(!size||!pre){i--;break}var curr=func.substr(i+pre,size);parts.push(curr);subs.push(curr);i+=pre+size}i++;return parts}function parse(rawList,limit,allowVoid){limit=limit||Infinity;var ret="",list=[];function flushList(){return"("+list.join(", ")+")"}var name;if(func[i]==="N"){name=parseNested().join("::");limit--;if(limit===0)return rawList?[name]:name}else{if(func[i]==="K"||first&&func[i]==="L")i++;var size=parseInt(func.substr(i));if(size){var pre=size.toString().length;name=func.substr(i+pre,size);i+=pre+size}}first=false;if(func[i]==="I"){i++;var iList=parse(true);var iRet=parse(true,1,true);ret+=iRet[0]+" "+name+"<"+iList.join(", ")+">"}else{ret=name}paramLoop:while(i<func.length&&limit-->0){var c=func[i++];if(c in basicTypes){list.push(basicTypes[c])}else{switch(c){case"P":list.push(parse(true,1,true)[0]+"*");break;case"R":list.push(parse(true,1,true)[0]+"&");break;case"L":{i++;var end=func.indexOf("E",i);var size=end-i;list.push(func.substr(i,size));i+=size+2;break};case"A":{var size=parseInt(func.substr(i));i+=size.toString().length;if(func[i]!=="_")throw"?";i++;list.push(parse(true,1,true)[0]+" ["+size+"]");break};case"E":break paramLoop;default:ret+="?"+c;break paramLoop}}}if(!allowVoid&&list.length===1&&list[0]==="void")list=[];if(rawList){if(ret){list.push(ret+"?")}return list}else{return ret+flushList()}}var final=func;try{if(func=="Object._main"||func=="_main"){return"main()"}if(typeof func==="number")func=Pointer_stringify(func);if(func[0]!=="_")return func;if(func[1]!=="_")return func;if(func[2]!=="Z")return func;switch(func[3]){case"n":return"operator new()";case"d":return"operator delete()"}final=parse()}catch(e){final+="?"}if(final.indexOf("?")>=0&&!hasLibcxxabi){Runtime.warnOnce("warning: a problem occurred in builtin C++ name demangling; build with  -s DEMANGLE_SUPPORT=1  to link in libcxxabi demangling")}return final}function demangleAll(text){return text.replace(/__Z[\w\d_]+/g,(function(x){var y=demangle(x);return x===y?x:x+" ["+y+"]"}))}function jsStackTrace(){var err=new Error;if(!err.stack){try{throw new Error(0)}catch(e){err=e}if(!err.stack){return"(no stack trace available)"}}return err.stack.toString()}function stackTrace(){return demangleAll(jsStackTrace())}Module["stackTrace"]=stackTrace;var PAGE_SIZE=4096;function alignMemoryPage(x){return x+4095&-4096}var HEAP;var HEAP8,HEAPU8,HEAP16,HEAPU16,HEAP32,HEAPU32,HEAPF32,HEAPF64;var STATIC_BASE=0,STATICTOP=0,staticSealed=false;var STACK_BASE=0,STACKTOP=0,STACK_MAX=0;var DYNAMIC_BASE=0,DYNAMICTOP=0;function enlargeMemory(){abort("Cannot enlarge memory arrays. Either (1) compile with -s TOTAL_MEMORY=X with X higher than the current value "+TOTAL_MEMORY+", (2) compile with ALLOW_MEMORY_GROWTH which adjusts the size at runtime but prevents some optimizations, or (3) set Module.TOTAL_MEMORY before the program runs.")}var TOTAL_STACK=Module["TOTAL_STACK"]||5242880;var TOTAL_MEMORY=Module["TOTAL_MEMORY"]||16777216;var FAST_MEMORY=Module["FAST_MEMORY"]||2097152;var totalMemory=4096;while(totalMemory<TOTAL_MEMORY||totalMemory<2*TOTAL_STACK){if(totalMemory<16*1024*1024){totalMemory*=2}else{totalMemory+=16*1024*1024}}if(totalMemory!==TOTAL_MEMORY){Module.printErr("increasing TOTAL_MEMORY to "+totalMemory+" to be more reasonable");TOTAL_MEMORY=totalMemory}assert(typeof Int32Array!=="undefined"&&typeof Float64Array!=="undefined"&&!!(new Int32Array(1))["subarray"]&&!!(new Int32Array(1))["set"],"JS engine does not provide full typed array support");var buffer=new ArrayBuffer(TOTAL_MEMORY);HEAP8=new Int8Array(buffer);HEAP16=new Int16Array(buffer);HEAP32=new Int32Array(buffer);HEAPU8=new Uint8Array(buffer);HEAPU16=new Uint16Array(buffer);HEAPU32=new Uint32Array(buffer);HEAPF32=new Float32Array(buffer);HEAPF64=new Float64Array(buffer);HEAP32[0]=255;assert(HEAPU8[0]===255&&HEAPU8[3]===0,"Typed arrays 2 must be run on a little-endian system");Module["HEAP"]=HEAP;Module["HEAP8"]=HEAP8;Module["HEAP16"]=HEAP16;Module["HEAP32"]=HEAP32;Module["HEAPU8"]=HEAPU8;Module["HEAPU16"]=HEAPU16;Module["HEAPU32"]=HEAPU32;Module["HEAPF32"]=HEAPF32;Module["HEAPF64"]=HEAPF64;function callRuntimeCallbacks(callbacks){while(callbacks.length>0){var callback=callbacks.shift();if(typeof callback=="function"){callback();continue}var func=callback.func;if(typeof func==="number"){if(callback.arg===undefined){Runtime.dynCall("v",func)}else{Runtime.dynCall("vi",func,[callback.arg])}}else{func(callback.arg===undefined?null:callback.arg)}}}var __ATPRERUN__=[];var __ATINIT__=[];var __ATMAIN__=[];var __ATEXIT__=[];var __ATPOSTRUN__=[];var runtimeInitialized=false;var runtimeExited=false;function preRun(){if(Module["preRun"]){if(typeof Module["preRun"]=="function")Module["preRun"]=[Module["preRun"]];while(Module["preRun"].length){addOnPreRun(Module["preRun"].shift())}}callRuntimeCallbacks(__ATPRERUN__)}function ensureInitRuntime(){if(runtimeInitialized)return;runtimeInitialized=true;callRuntimeCallbacks(__ATINIT__)}function preMain(){callRuntimeCallbacks(__ATMAIN__)}function exitRuntime(){callRuntimeCallbacks(__ATEXIT__);runtimeExited=true}function postRun(){if(Module["postRun"]){if(typeof Module["postRun"]=="function")Module["postRun"]=[Module["postRun"]];while(Module["postRun"].length){addOnPostRun(Module["postRun"].shift())}}callRuntimeCallbacks(__ATPOSTRUN__)}function addOnPreRun(cb){__ATPRERUN__.unshift(cb)}Module["addOnPreRun"]=Module.addOnPreRun=addOnPreRun;function addOnInit(cb){__ATINIT__.unshift(cb)}Module["addOnInit"]=Module.addOnInit=addOnInit;function addOnPreMain(cb){__ATMAIN__.unshift(cb)}Module["addOnPreMain"]=Module.addOnPreMain=addOnPreMain;function addOnExit(cb){__ATEXIT__.unshift(cb)}Module["addOnExit"]=Module.addOnExit=addOnExit;function addOnPostRun(cb){__ATPOSTRUN__.unshift(cb)}Module["addOnPostRun"]=Module.addOnPostRun=addOnPostRun;function intArrayFromString(stringy,dontAddNull,length){var ret=(new Runtime.UTF8Processor).processJSString(stringy);if(length){ret.length=length}if(!dontAddNull){ret.push(0)}return ret}Module["intArrayFromString"]=intArrayFromString;function intArrayToString(array){var ret=[];for(var i=0;i<array.length;i++){var chr=array[i];if(chr>255){chr&=255}ret.push(String.fromCharCode(chr))}return ret.join("")}Module["intArrayToString"]=intArrayToString;function writeStringToMemory(string,buffer,dontAddNull){var array=intArrayFromString(string,dontAddNull);var i=0;while(i<array.length){var chr=array[i];SAFE_HEAP_STORE(buffer+i|0,chr|0,1,0)|0;i=i+1}}Module["writeStringToMemory"]=writeStringToMemory;function writeArrayToMemory(array,buffer){for(var i=0;i<array.length;i++){SAFE_HEAP_STORE(buffer+i|0,array[i]|0,1,0)|0}}Module["writeArrayToMemory"]=writeArrayToMemory;function writeAsciiToMemory(str,buffer,dontAddNull){for(var i=0;i<str.length;i++){SAFE_HEAP_STORE(buffer+i|0,str.charCodeAt(i)|0,1,0)|0}if(!dontAddNull)SAFE_HEAP_STORE(buffer+str.length|0,0|0,1,0)|0}Module["writeAsciiToMemory"]=writeAsciiToMemory;function unSign(value,bits,ignore){if(value>=0){return value}return bits<=32?2*Math.abs(1<<bits-1)+value:Math.pow(2,bits)+value}function reSign(value,bits,ignore){if(value<=0){return value}var half=bits<=32?Math.abs(1<<bits-1):Math.pow(2,bits-1);if(value>=half&&(bits<=32||value>half)){value=-2*half+value}return value}if(!Math["imul"]||Math["imul"](4294967295,5)!==-5)Math["imul"]=function imul(a,b){var ah=a>>>16;var al=a&65535;var bh=b>>>16;var bl=b&65535;return al*bl+(ah*bl+al*bh<<16)|0};Math.imul=Math["imul"];var Math_abs=Math.abs;var Math_cos=Math.cos;var Math_sin=Math.sin;var Math_tan=Math.tan;var Math_acos=Math.acos;var Math_asin=Math.asin;var Math_atan=Math.atan;var Math_atan2=Math.atan2;var Math_exp=Math.exp;var Math_log=Math.log;var Math_sqrt=Math.sqrt;var Math_ceil=Math.ceil;var Math_floor=Math.floor;var Math_pow=Math.pow;var Math_imul=Math.imul;var Math_fround=Math.fround;var Math_min=Math.min;var runDependencies=0;var runDependencyWatcher=null;var dependenciesFulfilled=null;function addRunDependency(id){runDependencies++;if(Module["monitorRunDependencies"]){Module["monitorRunDependencies"](runDependencies)}}Module["addRunDependency"]=addRunDependency;function removeRunDependency(id){runDependencies--;if(Module["monitorRunDependencies"]){Module["monitorRunDependencies"](runDependencies)}if(runDependencies==0){if(runDependencyWatcher!==null){clearInterval(runDependencyWatcher);runDependencyWatcher=null}if(dependenciesFulfilled){var callback=dependenciesFulfilled;dependenciesFulfilled=null;callback()}}}Module["removeRunDependency"]=removeRunDependency;Module["preloadedImages"]={};Module["preloadedAudios"]={};var memoryInitializer=null;STATIC_BASE=8;STATICTOP=STATIC_BASE+Runtime.alignMemory(32659);__ATINIT__.push();allocate([40,102,101,95,97,100,100,40,121,44,32,119,44,32,120,41,44,32,33,102,101,95,105,115,110,111,110,122,101,114,111,40,121,41,41,0,0,0,0,0,47,104,111,109,101,47,108,117,99,97,115,47,116,104,105,110,45,119,97,108,108,101,116,47,99,114,121,112,116,111,45,111,112,115,46,99,0,0,0,0,103,101,95,102,114,111,109,102,101,95,102,114,111,109,98,121,116,101,115,95,118,97,114,116,105,109,101,0,0,0,0,0,102,101,95,105,115,110,111,110,122,101,114,111,40,114,45,62,88,41,0,0,0,0,0,0,33,102,101,95,105,115,110,111,110,122,101,114,111,40,99,104,101,99,107,95,118,41,0,0,40,40,40,98,32,45,32,49,41,32,38,32,126,98,41,32,124,32,40,40,98,32,45,32,50,41,32,38,32,126,40,98,32,45,32,49,41,41,41,32,61,61,32,40,117,110,115,105,103,110,101,100,32,105,110,116,41,32,45,49,0,0,0,0,102,101,95,99,109,111,118,0,182,120,89,255,133,114,211,0,189,110,21,255,15,10,106,0,41,192,1,0,152,232,121,255,188,60,160,255,153,113,206,255,0,183,226,254,180,13,72,255,176,160,14,254,211,201,134,255,158,24,143,0,127,105,53,0,96,12,189,0,167,215,251,255,159,76,128,254,106,101,225,255,30,252,4,0,146,12,174,0,89,241,178,254,10,229,166,255,123,221,42,254,30,20,212,0,82,128,3,0,48,209,243,0,119,121,64,255,50,227,156,255,0,110,197,1,103,27,144,0,133,59,140,1,189,241,36,255,248,37,195,1,96,220,55,0,183,76,62,255,195,66,61,0,50,76,164,1,225,164,76,255,76,61,163,255,117,62,31,0,81,145,64,255,118,65,14,0,162,115,214,255,6,138,46,0,124,230,244,255,10,138,143,0,52,26,194,0,184,244,76,0,129,143,41,1,190,244,19,255,123,170,122,255,98,129,68,0,121,213,147,0,86,101,30,255,161,103,155,0,140,89,67,255,239,229,190,1,67,11,181,0,198,240,137,254,238,69,188,255,234,113,60,255,37,255,57,255,69,178,182,254,128,208,179,0,118,26,125,254,3,7,214,255,241,50,77,255,85,203,197,255,211,135,250,255,25,48,100,255,187,213,180,254,17,88,105,0,83,209,158,1,5,115,98,0,4,174,60,254,171,55,110,255,217,181,17,255,20,188,170,0,146,156,102,254,87,214,174,255,114,122,155,1,233,44,170,0,127,8,239,1,214,236,234,0,175,5,219,0,49,106,61,255,6,66,208,255,2,106,110,255,81,234,19,255,215,107,192,255,67,151,238,0,19,42,108,255,229,85,113,1,50,68,135,255,17,106,9,0,50,103,1,255,80,1,168,1,35,152,30,255,16,168,185,1,56,89,232,255,101,210,252,0,41,250,71,0,204,170,79,255,14,46,239,255,80,77,239,0,189,214,75,255,17,141,249,0,38,80,76,255,190,85,117,0,86,228,170,0,156,216,208,1,195,207,164,255,150,66,76,255,175,225,16,255,141,80,98,1,76,219,242,0,198,162,114,0,46,218,152,0,155,43,241,254,155,160,104,255,178,9,252,254,100,110,212,0,14,5,167,0,233,239,163,255,28,151,157,1,101,146,10,255,254,158,70,254,71,249,228,0,88,30,50,0,68,58,160,255,191,24,104,1,129,66,129,255,192,50,85,255,8,179,138,255,38,250,201,0,115,80,160,0,131,230,113,0,125,88,147,0,90,68,199,0,253,76,158,0,28,255,118,0,113,250,254,0,66,75,46,0,230,218,43,0,229,120,186,1,148,68,43,0,136,124,238,1,187,107,197,255,84,53,246,255,51,116,254,255,51,187,165,0,2,17,175,0,66,84,160,1,247,58,30,0,35,65,53,254,69,236,191,0,45,134,245,1,163,123,221,0,32,110,20,255,52,23,165,0,186,214,71,0,233,176,96,0,242,239,54,1,57,89,138,0,83,0,84,255,136,160,100,0,92,142,120,254,104,124,190,0,181,177,62,255,250,41,85,0,152,130,42,1,96,252,246,0,151,151,63,254,239,133,62,0,32,56,156,0,45,167,189,255,142,133,179,1,131,86,211,0,187,179,150,254,250,170,14,255,68,113,21,255,222,186,59,255,66,7,241,1,69,6,72,0,86,156,108,254,55,167,89,0,109,52,219,254,13,176,23,255,196,44,106,255,239,149,71,255,164,140,125,255,159,173,1,0,51,41,231,0,145,62,33,0,138,111,93,1,185,83,69,0,144,115,46,0,97,151,16,255,24,228,26,0,49,217,226,0,113,75,234,254,193,153,12,255,182,48,96,255,14,13,26,0,128,195,249,254,69,193,59,0,132,37,81,254,125,106,60,0,214,240,169,1,164,227,66,0,210,163,78,0,37,52,151,0,99,77,26,0,238,156,213,255,213,192,209,1,73,46,84,0,20,65,41,1,54,206,79,0,201,131,146,254,170,111,24,255,177,33,50,254,171,38,203,255,78,247,116,0,209,221,153,0,133,128,178,1,58,44,25,0,201,39,59,1,189,19,252,0,49,229,210,1,117,187,117,0,181,179,184,1,0,114,219,0,48,94,147,0,245,41,56,0,125,13,204,254,244,173,119,0,44,221,32,254,84,234,20,0,249,160,198,1,236,126,234,255,143,62,221,0,129,89,214,255,55,139,5,254,68,20,191,255,14,204,178,1,35,195,217,0,47,51,206,1,38,246,165,0,206,27,6,254,158,87,36,0,217,52,146,255,125,123,215,255,85,60,31,255,171,13,7,0,218,245,88,254,252,35,60,0,55,214,160,255,133,101,56,0,224,32,19,254,147,64,234,0,26,145,162,1,114,118,125,0,248,252,250,0,101,94,196,255,198,141,226,254,51,42,182,0,135,12,9,254,109,172,210,255,197,236,194,1,241,65,154,0,48,156,47,255,153,67,55,255,218,165,34,254,74,180,179,0,218,66,71,1,88,122,99,0,212,181,219,255,92,42,231,255,239,0,154,0,245,77,183,255,94,81,170,1,18,213,216,0,171,93,71,0,52,94,248,0,18,151,161,254,197,209,66,255,174,244,15,254,162,48,183,0,49,61,240,254,182,93,195,0,199,228,6,1,200,5,17,255,137,45,237,255,108,148,4,0,90,79,237,255,39,63,77,255,53,82,207,1,142,22,118,255,101,232,18,1,92,26,67,0,5,200,88,255,33,168,138,255,149,225,72,0,2,209,27,255,44,245,168,1,220,237,17,255,30,211,105,254,141,238,221,0,128,80,245,254,111,254,14,0,222,95,190,1,223,9,241,0,146,76,212,255,108,205,104,255,63,117,153,0,144,69,48,0,35,228,111,0,192,33,193,255,112,214,190,254,115,152,151,0,23,102,88,0,51,74,248,0,226,199,143,254,204,162,101,255,208,97,189,1,245,104,18,0,230,246,30,255,23,148,69,0,110,88,52,254,226,181,89,255,208,47,90,254,114,161,80,255,33,116,248,0,179,152,87,255,69,144,177,1,88,238,26,255,58,32,113,1,1,77,69,0,59,121,52,255,152,238,83,0,52,8,193,0,231,39,233,255,199,34,138,0,222,68,173,0,91,57,242,254,220,210,127,255,192,7,246,254,151,35,187,0,195,236,165,0,111,93,206,0,212,247,133,1,154,133,209,255,155,231,10,0,64,78,38,0,122,249,100,1,30,19,97,255,62,91,249,1,248,133,77,0,197,63,168,254,116,10,82,0,184,236,113,254,212,203,194,255,61,100,252,254,36,5,202,255,119,91,153,255,129,79,29,0,103,103,171,254,237,215,111,255,216,53,69,0,239,240,23,0,194,149,221,255,38,225,222,0,232,255,180,254,118,82,133,255,57,209,177,1,139,232,133,0,158,176,46,254,194,115,46,0,88,247,229,1,28,103,191,0,221,222,175,254,149,235,44,0,151,228,25,254,218,105,103,0,142,85,210,0,149,129,190,255,213,65,94,254,117,134,224,255,82,198,117,0,157,221,220,0,163,101,36,0,197,114,37,0,104,172,166,254,11,182,0,0,81,72,188,255,97,188,16,255,69,6,10,0,199,147,145,255,8,9,115,1,65,214,175,255,217,173,209,0,80,127,166,0,247,229,4,254,167,183,124,255,90,28,204,254,175,59,240,255,11,41,248,1,108,40,51,255,144,177,195,254,150,250,126,0,138,91,65,1,120,60,222,255,245,193,239,0,29,214,189,255,128,2,25,0,80,154,162,0,77,220,107,1,234,205,74,255,54,166,103,255,116,72,9,0,228,94,47,255,30,200,25,255,35,214,89,255,61,176,140,255,83,226,163,255,75,130,172,0,128,38,17,0,95,137,152,255,215,124,159,1,79,93,0,0,148,82,157,254,195,130,251,255,40,202,76,255,251,126,224,0,157,99,62,254,207,7,225,255,96,68,195,0,140,186,157,255,131,19,231,255,42,128,254,0,52,219,61,254,102,203,72,0,141,7,11,255,186,164,213,0,31,122,119,0,133,242,145,0,208,252,232,255,91,213,182,255,143,4,250,254,249,215,74,0,165,30,111,1,171,9,223,0,229,123,34,1,92,130,26,255,77,155,45,1,195,139,28,255,59,224,78,0,136,17,247,0,108,121,32,0,79,250,189,255,96,227,252,254,38,241,62,0,62,174,125,255,155,111,93,255,10,230,206,1,97,197,40,255,0,49,57,254,65,250,13,0,18,251,150,255,220,109,210,255,5,174,166,254,44,129,189,0,235,35,147,255,37,247,141,255,72,141,4,255,103,107,255,0,247,90,4,0,53,44,42,0,2,30,240,0,4,59,63,0,88,78,36,0,113,167,180,0,190,71,193,255,199,158,164,255,58,8,172,0,77,33,12,0,65,63,3,0,153,77,33,255,172,254,102,1,228,221,4,255,87,30,254,1,146,41,86,255,138,204,239,254,108,141,17,255,187,242,135,0,210,208,127,0,68,45,14,254,73,96,62,0,81,60,24,255,170,6,36,255,3,249,26,0,35,213,109,0,22,129,54,255,21,35,225,255,234,61,56,255,58,217,6,0,143,124,88,0,236,126,66,0,209,38,183,255,34,238,6,255,174,145,102,0,95,22,211,0,196,15,153,254,46,84,232,255,117,34,146,1,231,250,74,255,27,134,100,1,92,187,195,255,170,198,112,0,120,28,42,0,209,70,67,0,29,81,31,0,29,168,100,1,169,173,160,0,107,35,117,0,62,96,59,255,81,12,69,1,135,239,190,255,220,252,18,0,163,220,58,255,137,137,188,255,83,102,109,0,96,6,76,0,234,222,210,255,185,174,205,1,60,158,213,255,13,241,214,0,172,129,140,0,93,104,242,0,192,156,251,0,43,117,30,0,225,81,158,0,127,232,218,0,226,28,203,0,233,27,151,255,117,43,5,255,242,14,47,255,33,20,6,0,137,251,44,254,27,31,245,255,183,214,125,254,40,121,149,0,186,158,213,255,89,8,227,0,69,88,0,254,203,135,225,0,201,174,203,0,147,71,184,0,18,121,41,254,94,5,78,0,224,214,240,254,36,5,180,0,251,135,231,1,163,138,212,0,210,249,116,254,88,129,187,0,19,8,49,254,62,14,144,255,159,76,211,0,214,51,82,0,109,117,228,254,103,223,203,255,75,252,15,1,154,71,220,255,23,13,91,1,141,168,96,255,181,182,133,0,250,51,55,0,234,234,212,254,175,63,158,0,39,240,52,1,158,189,36,255,213,40,85,1,32,180,247,255,19,102,26,1,84,24,97,255,69,21,222,0,148,139,122,255,220,213,235,1,232,203,255,0,121,57,147,0,227,7,154,0,53,22,147,1,72,1,225,0,82,134,48,254,83,60,157,255,145,72,169,0,34,103,239,0,198,233,47,0,116,19,4,255,184,106,9,255,183,129,83,0,36,176,230,1,34,103,72,0,219,162,134,0,245,42,158,0,32,149,96,254,165,44,144,0,202,239,72,254,215,150,5,0,42,66,36,1,132,215,175,0,86,174,86,255,26,197,156,255,49,232,135,254,103,182,82,0,253,128,176,1,153,178,122,0,245,250,10,0,236,24,178,0,137,106,132,0,40,29,41,0,50,30,152,255,124,105,38,0,230,191,75,0,143,43,170,0,44,131,20,255,44,13,23,255,237,255,155,1,159,109,100,255,112,181,24,255,104,220,108,0,55,211,131,0,99,12,213,255,152,151,145,255,238,5,159,0,97,155,8,0,33,108,81,0,1,3,103,0,62,109,34,255,250,155,180,0,32,71,195,255,38,70,145,1,159,95,245,0,69,229,101,1,136,28,240,0,79,224,25,0,78,110,121,255,248,168,124,0,187,128,247,0,2,147,235,254,79,11,132,0,70,58,12,1,181,8,163,255,79,137,133,255,37,170,11,255,141,243,85,255,176,231,215,255,204,150,164,255,239,215,39,255,46,87,156,254,8,163,88,255,172,34,232,0,66,44,102,255,27,54,41,254,236,99,87,255,41,123,169,1,52,114,43,0,117,134,40,0,155,134,26,0,231,207,91,254,35,132,38,255,19,102,125,254,36,227,133,255,118,3,113,255,29,13,124,0,152,96,74,1,88,146,206,255,167,191,220,254,162,18,88,255,182,100,23,0,31,117,52,0,81,46,106,1,12,2,7,0,69,80,201,1,209,246,172,0,12,48,141,1,224,211,88,0,116,226,159,0,122,98,130,0,65,236,234,1,225,226,9,255,207,226,123,1,89,214,59,0,112,135,88,1,90,244,203,255,49,11,38,1,129,108,186,0,89,112,15,1,101,46,204,255,127,204,45,254,79,255,221,255,51,73,18,255,127,42,101,255,241,21,202,0,160,227,7,0,105,50,236,0,79,52,197,255,104,202,208,1,180,15,16,0,101,197,78,255,98,77,203,0,41,185,241,1,35,193,124,0,35,155,23,255,207,53,192,0,11,125,163,1,249,158,185,255,4,131,48,0,21,93,111,255,61,121,231,1,69,200,36,255,185,48,185,255,111,238,21,255,39,50,25,255,99,215,163,255,87,212,30,255,164,147,5,255,128,6,35,1,108,223,110,255,194,76,178,0,74,101,180,0,243,47,48,0,174,25,43,255,82,173,253,1,54,114,192,255,40,55,91,0,215,108,176,255,11,56,7,0,224,233,76,0,209,98,202,254,242,25,125,0,44,193,93,254,203,8,177,0,135,176,19,0,112,71,213,255,206,59,176,1,4,67,26,0,14,143,213,254,42,55,208,255,60,67,120,0,193,21,163,0,99,164,115,0,10,20,118,0,156,212,222,254,160,7,217,255,114,245,76,1,117,59,123,0,176,194,86,254,213,15,176,0,78,206,207,254,213,129,59,0,233,251,22,1,96,55,152,255,236,255,15,255,197,89,84,255,93,149,133,0,174,160,113,0,234,99,169,255,152,116,88,0,144,164,83,255,95,29,198,255,34,47,15,255,99,120,134,255,5,236,193,0,249,247,126,255,147,187,30,0,50,230,117,255,108,217,219,255,163,81,166,255,72,25,169,254,155,121,79,255,28,155,89,254,7,126,17,0,147,65,33,1,47,234,253,0,26,51,18,0,105,83,199,255,163,196,230,0,113,248,164,0,226,254,218,0,189,209,203,255,164,247,222,254,255,35,165,0,4,188,243,1,127,179,71,0,37,237,254,255,100,186,240,0,5,57,71,254,103,72,73,255,244,18,81,254,229,210,132,255,238,6,180,255,11,229,174,255,227,221,192,1,17,49,28,0,163,215,196,254,9,118,4,255,51,240,71,0,113,129,109,255,76,240,231,0,188,177,127,0,125,71,44,1,26,175,243,0,94,169,25,254,27,230,29,0,15,139,119,1,168,170,186,255,172,197,76,255,252,75,188,0,137,124,196,0,72,22,96,255,45,151,249,1,220,145,100,0,64,192,159,255,120,239,226,0,129,178,146,0,0,192,125,0,235,138,234,0,183,157,146,0,83,199,192,255,184,172,72,255,73,225,128,0,77,6,250,255,186,65,67,0,104,246,207,0,188,32,138,255,218,24,242,0,67,138,81,254,237,129,121,255,20,207,150,1,41,199,16,255,6,20,128,0,159,118,5,0,181,16,143,255,220,38,15,0,23,64,147,254,73,26,13,0,87,228,57,1,204,124,128,0,43,24,223,0,219,99,199,0,22,75,20,255,19,27,126,0,157,62,215,0,110,29,230,0,179,167,255,1,54,252,190,0,221,204,182,254,179,158,65,255,81,157,3,0,194,218,159,0,170,223,0,0,224,11,32,255,38,197,98,0,168,164,37,0,23,88,7,1,164,186,110,0,96,36,134,0,234,242,229,0,250,121,19,0,242,254,112,255,3,47,94,1,9,239,6,255,81,134,153,254,214,253,168,255,67,124,224,0,245,95,74,0,28,30,44,254,1,109,220,255,178,89,89,0,252,36,76,0,24,198,46,255,76,77,111,0,134,234,136,255,39,94,29,0,185,72,234,255,70,68,135,255,231,102,7,254,77,231,140,0,167,47,58,1,148,97,118,255,16,27,225,1,166,206,143,255,110,178,214,255,180,131,162,0,143,141,225,1,13,218,78,255,114,153,33,1,98,104,204,0,175,114,117,1,167,206,75,0,202,196,83,1,58,64,67,0,138,47,111,1,196,247,128,255,137,224,224,254,158,112,207,0,154,100,255,1,134,37,107,0,198,128,79,255,127,209,155,255,163,254,185,254,60,14,243,0,31,219,112,254,29,217,65,0,200,13,116,254,123,60,196,255,224,59,184,254,242,89,196,0,123,16,75,254,149,16,206,0,69,254,48,1,231,116,223,255,209,160,65,1,200,80,98,0,37,194,184,254,148,63,34,0,139,240,65,255,217,144,132,255,56,38,45,254,199,120,210,0,108,177,166,255,160,222,4,0,220,126,119,254,165,107,160,255,82,220,248,1,241,175,136,0,144,141,23,255,169,138,84,0,160,137,78,255,226,118,80,255,52,27,132,255,63,96,139,255,152,250,39,0,188,155,15,0,232,51,150,254,40,15,232,255,240,229,9,255,137,175,27,255,75,73,97,1,218,212,11,0,135,5,162,1,107,185,213,0,2,249,107,255,40,242,70,0,219,200,25,0,25,157,13,0,67,82,80,255,196,249,23,255,145,20,149,0,50,72,146,0,94,76,148,1,24,251,65,0,31,192,23,0,184,212,201,255,123,233,162,1,247,173,72,0,162,87,219,254,126,134,89,0,159,11,12,254,166,105,29,0,73,27,228,1,113,120,183,255,66,163,109,1,212,143,11,255,159,231,168,1,255,128,90,0,57,14,58,254,89,52,10,255,253,8,163,1,0,145,210,255,10,129,85,1,46,181,27,0,103,136,160,254,126,188,209,255,34,35,111,0,215,219,24,255,212,11,214,254,101,5,118,0,232,197,133,255,223,167,109,255,237,80,86,255,70,139,94,0,158,193,191,1,155,15,51,255,15,190,115,0,78,135,207,255,249,10,27,1,181,125,233,0,95,172,13,254,170,213,161,255,39,236,138,255,95,93,87,255,190,128,95,0,125,15,206,0,166,150,159,0,227,15,158,255,206,158,120,255,42,141,128,0,101,178,120,1,156,109,131,0,218,14,44,254,247,168,206,255,212,112,28,0,112,17,228,255,90,16,37,1,197,222,108,0,254,207,83,255,9,90,243,255,243,244,172,0,26,88,115,255,205,116,122,0,191,230,193,0,180,100,11,1,217,37,96,255,154,78,156,0,235,234,31,255,206,178,178,255,149,192,251,0,182,250,135,0,246,22,105,0,124,193,109,255,2,210,149,255,169,17,170,0,0,96,110,255,117,9,8,1,50,123,40,255,193,189,99,0,34,227,160,0,48,80,70,254,211,51,236,0,45,122,245,254,44,174,8,0,173,37,233,255,158,65,171,0,122,69,215,255,90,80,2,255,131,106,96,254,227,114,135,0,205,49,119,254,176,62,64,255,82,51,17,255,241,20,243,255,130,13,8,254,128,217,243,255,162,27,1,254,90,118,241,0,246,198,246,255,55,16,118,255,200,159,157,0,163,17,1,0,140,107,121,0,85,161,118,255,38,0,149,0,156,47,238,0,9,166,166,1,75,98,181,255,50,74,25,0,66,15,47,0,139,225,159,0,76,3,142,255,14,238,184,0,11,207,53,255,183,192,186,1,171,32,174,255,191,76,221,1,247,170,219,0,25,172,50,254,217,9,233,0,203,126,68,255,183,92,48,0,127,167,183,1,65,49,254,0,16,63,127,1,254,21,170,255,59,224,127,254,22,48,63,255,27,78,130,254,40,195,29,0,250,132,112,254,35,203,144,0,104,169,168,0,207,253,30,255,104,40,38,254,94,228,88,0,206,16,128,255,212,55,122,255,223,22,234,0,223,197,127,0,253,181,181,1,145,102,118,0,236,153,36,255,212,217,72,255,20,38,24,254,138,62,62,0,152,140,4,0,230,220,99,255,1,21,212,255,148,201,231,0,244,123,9,254,0,171,210,0,51,58,37,255,1,255,14,255,244,183,145,254,0,242,166,0,22,74,132,0,121,216,41,0,95,195,114,254,133,24,151,255,156,226,231,255,247,5,77,255,246,148,115,254,225,92,81,255,222,80,246,254,170,123,89,255,74,199,141,0,29,20,8,255,138,136,70,255,93,75,92,0,221,147,49,254,52,126,226,0,229,124,23,0,46,9,181,0,205,64,52,1,131,254,28,0,151,158,212,0,131,64,78,0,206,25,171,0,0,230,139,0,191,253,110,254,103,247,167,0,64,40,40,1,42,165,241,255,59,75,228,254,124,243,189,255,196,92,178,255,130,140,86,255,141,89,56,1,147,198,5,255,203,248,158,254,144,162,141,0,11,172,226,0,130,42,21,255,1,167,143,255,144,36,36,255,48,88,164,254,168,170,220,0,98,71,214,0,91,208,79,0,159,76,201,1,166,42,214,255,69,255,0,255,6,128,125,255,190,1,140,0,146,83,218,255,215,238,72,1,122,127,53,0,189,116,165,255,84,8,66,255,214,3,208,255,213,110,133,0,195,168,44,1,158,231,69,0,162,64,200,254,91,58,104,0,182,58,187,254,249,228,136,0,203,134,76,254,99,221,233,0,75,254,214,254,80,69,154,0,64,152,248,254,236,136,202,255,157,105,153,254,149,175,20,0,22,35,19,255,124,121,233,0,186,250,198,254,132,229,139,0,137,80,174,255,165,125,68,0,144,202,148,254,235,239,248,0,135,184,118,0,101,94,17,255,122,72,70,254,69,130,146,0,127,222,248,1,69,127,118,255,30,82,215,254,188,74,19,255,229,167,194,254,117,25,66,255,65,234,56,254,213,22,156,0,151,59,93,254,45,28,27,255,186,126,164,255,32,6,239,0,127,114,99,1,219,52,2,255,99,96,166,254,62,190,126,255,108,222,168,1,75,226,174,0,230,226,199,0,60,117,218,255,252,248,20,1,214,188,204,0,31,194,134,254,123,69,192,255,169,173,36,254,55,98,91,0,223,42,102,254,137,1,102,0,157,90,25,0,239,122,64,255,252,6,233,0,7,54,20,255,82,116,174,0,135,37,54,255,15,186,125,0,227,112,175,255,100,180,225,255,42,237,244,255,244,173,226,254,248,18,33,0,171,99,150,255,74,235,50,255,117,82,32,254,106,168,237,0,207,109,208,1,228,9,186,0,135,60,169,254,179,92,143,0,244,170,104,255,235,45,124,255,70,99,186,0,117,137,183,0,224,31,215,0,40,9,100,0,26,16,95,1,68,217,87,0,8,151,20,255,26,100,58,255,176,165,203,1,52,118,70,0,7,32,254,254,244,254,245,255,167,144,194,255,125,113,23,255,176,121,181,0,136,84,209,0,138,6,30,255,89,48,28,0,33,155,14,255,25,240,154,0,141,205,109,1,70,115,62,255,20,40,107,254,138,154,199,255,94,223,226,255,157,171,38,0,163,177,25,254,45,118,3,255,14,222,23,1,209,190,81,255,118,123,232,1,13,213,101,255,123,55,123,254,27,246,165,0,50,99,76,255,140,214,32,255,97,65,67,255,24,12,28,0,174,86,78,1,64,247,96,0,160,135,67,0,66,55,243,255,147,204,96,255,26,6,33,255,98,51,83,1,153,213,208,255,2,184,54,255,25,218,11,0,49,67,246,254,18,149,72,255,13,25,72,0,42,79,214,0,42,4,38,1,27,139,144,255,149,187,23,0,18,164,132,0,245,84,184,254,120,198,104,255,126,218,96,0,56,117,234,255,13,29,214,254,68,47,10,255,167,154,132,254,152,38,198,0,66,178,89,255,200,46,171,255,13,99,83,255,210,187,253,255,170,45,42,1,138,209,124,0,214,162,141,0,12,230,156,0,102,36,112,254,3,147,67,0,52,215,123,255,233,171,54,255,98,137,62,0,247,218,39,255,231,218,236,0,247,191,127,0,195,146,84,0,165,176,92,255,19,212,94,255,17,74,227,0,88,40,153,1,198,147,1,255,206,67,245,254,240,3,218,255,61,141,213,255,97,183,106,0,195,232,235,254,95,86,154,0,209,48,205,254,118,209,241,255,240,120,223,1,213,29,159,0,163,127,147,255,13,218,93,0,85,24,68,254,70,20,80,255,189,5,140,1,82,97,254,255,99,99,191,255,132,84,133,255,107,218,116,255,112,122,46,0,105,17,32,0,194,160,63,255,68,222,39,1,216,253,92,0,177,105,205,255,149,201,195,0,42,225,11,255,40,162,115,0,9,7,81,0,165,218,219,0,180,22,0,254,29,146,252,255,146,207,225,1,180,135,96,0,31,163,112,0,177,11,219,255,133,12,193,254,43,78,50,0,65,113,121,1,59,217,6,255,110,94,24,1,112,172,111,0,7,15,96,0,36,85,123,0,71,150,21,255,208,73,188,0,192,11,167,1,213,245,34,0,9,230,92,0,162,142,39,255,215,90,27,0,98,97,89,0,94,79,211,0,90,157,240,0,95,220,126,1,102,176,226,0,36,30,224,254,35,31,127,0,231,232,115,1,85,83,130,0,210,73,245,255,47,143,114,255,68,65,197,0,59,72,62,255,183,133,173,254,93,121,118,255,59,177,81,255,234,69,173,255,205,128,177,0,220,244,51,0,26,244,209,1,73,222,77,255,163,8,96,254,150,149,211,0,158,254,203,1,54,127,139,0,161,224,59,0,4,109,22,255,222,42,45,255,208,146,102,255,236,142,187,0,50,205,245,255,10,74,89,254,48,79,142,0,222,76,130,255,30,166,63,0,236,12,13,255,49,184,244,0,187,113,102,0,218,101,253,0,153,57,182,254,32,150,42,0,25,198,146,1,237,241,56,0,140,68,5,0,91,164,172,255,78,145,186,254,67,52,205,0,219,207,129,1,109,115,17,0,54,143,58,1,21,248,120,255,179,255,30,0,193,236,66,255,1,255,7,255,253,192,48,255,19,69,217,1,3,214,0,255,64,101,146,1,223,125,35,255,235,73,179,255,249,167,226,0,225,175,10,1,97,162,58,0,106,112,171,1,84,172,5,255,133,140,178,255,134,245,142,0,97,90,125,255,186,203,185,255,223,77,23,255,192,92,106,0,15,198,115,255,217,152,248,0,171,178,120,255,228,134,53,0,176,54,193,1,250,251,53,0,213,10,100,1,34,199,106,0,151,31,244,254,172,224,87,255,14,237,23,255,253,85,26,255,127,39,116,255,172,104,100,0,251,14,70,255,212,208,138,255,253,211,250,0,176,49,165,0,15,76,123,255,37,218,160,255,92,135,16,1,10,126,114,255,70,5,224,255,247,249,141,0,68,20,60,1,241,210,189,255,195,217,187,1,151,3,113,0,151,92,174,0,231,62,178,255,219,183,225,0,23,23,33,255,205,181,80,0,57,184,248,255,67,180,1,255,90,123,93,255,39,0,162,255,96,248,52,255,84,66,140,0,34,127,228,255,194,138,7,1,166,110,188,0,21,17,155,1,154,190,198,255,214,80,59,255,18,7,143,0,72,29,226,1,199,217,249,0,232,161,71,1,149,190,201,0,217,175,95,254,113,147,67,255,138,143,199,255,127,204,1,0,29,182,83,1,206,230,155,255,186,204,60,0,10,125,85,255,232,96,25,255,255,89,247,255,213,254,175,1,232,193,81,0,28,43,156,254,12,69,8,0,147,24,248,0,18,198,49,0,134,60,35,0,118,246,18,255,49,88,254,254,228,21,186,255,182,65,112,1,219,22,1,255,22,126,52,255,189,53,49,255,112,25,143,0,38,127,55,255,226,101,163,254,208,133,61,255,137,69,174,1,190,118,145,255,60,98,219,255,217,13,245,255,250,136,10,0,84,254,226,0,201,31,125,1,240,51,251,255,31,131,130,255,2,138,50,255,215,215,177,1,223,12,238,255,252,149,56,255,124,91,68,255,72,126,170,254,119,255,100,0,130,135,232,255,14,79,178,0,250,131,197,0,138,198,208,0,121,216,139,254,119,18,36,255,29,193,122,0,16,42,45,255,213,240,235,1,230,190,169,255,198,35,228,254,110,173,72,0,214,221,241,255,56,148,135,0,192,117,78,254,141,93,207,255,143,65,149,0,21,18,98,255,95,44,244,1,106,191,77,0,254,85,8,254,214,110,176,255,73,173,19,254,160,196,199,255,237,90,144,0,193,172,113,255,200,155,136,254,228,90,221,0,137,49,74,1,164,221,215,255,209,189,5,255,105,236,55,255,42,31,129,1,193,255,236,0,46,217,60,0,138,88,187,255,226,82,236,255,81,69,151,255,142,190,16,1,13,134,8,0,127,122,48,255,81,64,156,0,171,243,139,0,237,35,246,0,122,143,193,254,212,122,146,0,95,41,255,1,87,132,77,0,4,212,31,0,17,31,78,0,39,45,173,254,24,142,217,255,95,9,6,255,227,83,6,0,98,59,130,254,62,30,33,0,8,115,211,1,162,97,128,255,7,184,23,254,116,28,168,255,248,138,151,255,98,244,240,0,186,118,130,0,114,248,235,255,105,173,200,1,160,124,71,255,94,36,164,1,175,65,146,255,238,241,170,254,202,198,197,0,228,71,138,254,45,246,109,255,194,52,158,0,133,187,176,0,83,252,154,254,89,189,221,255,170,73,252,0,148,58,125,0,36,68,51,254,42,69,177,255,168,76,86,255,38,100,204,255,38,53,35,0,175,19,97,0,225,238,253,255,81,81,135,0,210,27,255,254,235,73,107,0,8,207,115,0,82,127,136,0,84,99,21,254,207,19,136,0,100,164,101,0,80,208,77,255,132,207,237,255,15,3,15,255,33,166,110,0,156,95,85,255,37,185,111,1,150,106,35,255,166,151,76,0,114,87,135,255,159,194,64,0,12,122,31,255,232,7,101,254,173,119,98,0,154,71,220,254,191,57,53,255,168,232,160,255,224,32,99,255,218,156,165,0,151,153,163,0,217,13,148,1,197,113,89,0,149,28,161,254,207,23,30,0,105,132,227,255,54,230,94,255,133,173,204,255,92,183,157,255,88,144,252,254,102,33,90,0,159,97,3,0,181,218,155,255,240,114,119,0,106,214,53,255,165,190,115,1,152,91,225,255,88,106,44,255,208,61,113,0,151,52,124,0,191,27,156,255,110,54,236,1,14,30,166,255,39,127,207,1,229,199,28,0,188,228,188,254,100,157,235,0,246,218,183,1,107,22,193,255,206,160,95,0,76,239,147,0,207,161,117,0,51,166,2,255,52,117,10,254,73,56,227,255,152,193,225,0,132,94,136,255,101,191,209,0,32,107,229,255,198,43,180,1,100,210,118,0,114,67,153,255,23,88,26,255,89,154,92,1,220,120,140,255,144,114,207,255,252,115,250,255,34,206,72,0,138,133,127,255,8,178,124,1,87,75,97,0,15,229,92,254,240,67,131,255,118,123,227,254,146,120,104,255,145,213,255,1,129,187,70,255,219,119,54,0,1,19,173,0,45,150,148,1,248,83,72,0,203,233,169,1,142,107,56,0,247,249,38,1,45,242,80,255,30,233,103,0,96,82,70,0,23,201,111,0,81,39,30,255,161,183,78,255,194,234,33,255,68,227,140,254,216,206,116,0,70,27,235,255,104,144,79,0,164,230,93,254,214,135,156,0,154,187,242,254,188,20,131,255,36,109,174,0,159,112,241,0,5,110,149,1,36,165,218,0,166,29,19,1,178,46,73,0,93,43,32,254,248,189,237,0,102,155,141,0,201,93,195,255,241,139,253,255,15,111,98,255,108,65,163,254,155,79,190,255,73,174,193,254,246,40,48,255,107,88,11,254,202,97,85,255,253,204,18,255,113,242,66,0,110,160,194,254,208,18,186,0,81,21,60,0,188,104,167,255,124,166,97,254,210,133,142,0,56,242,137,254,41,111,130,0,111,151,58,1,111,213,141,255,183,172,241,255,38,6,196,255,185,7,123,255,46,11,246,0,245,105,119,1,15,2,161,255,8,206,45,255,18,202,74,255,83,124,115,1,212,141,157,0,83,8,209,254,139,15,232,255,172,54,173,254,50,247,132,0,214,189,213,0,144,184,105,0,223,254,248,0,255,147,240,255,23,188,72,0,7,51,54,0,188,25,180,254,220,180,0,255,83,160,20,0,163,189,243,255,58,209,194,255,87,73,60,0,106,24,49,0,245,249,220,0,22,173,167,0,118,11,195,255,19,126,237,0,110,159,37,255,59,82,47,0,180,187,86,0,188,148,208,1,100,37,133,255,7,112,193,0,129,188,156,255,84,106,129,255,133,225,202,0,14,236,111,255,40,20,101,0,172,172,49,254,51,54,74,255,251,185,184,255,93,155,224,255,180,249,224,1,230,178,146,0,72,57,54,254,178,62,184,0,119,205,72,0,185,239,253,255,61,15,218,0,196,67,56,255,234,32,171,1,46,219,228,0,208,108,234,255,20,63,232,255,165,53,199,1,133,228,5,255,52,205,107,0,74,238,140,255,150,156,219,254,239,172,178,255,251,189,223,254,32,142,211,255,218,15,138,1,241,196,80,0,28,36,98,254,22,234,199,0,61,237,220,255,246,57,37,0,142,17,142,255,157,62,26,0,43,238,95,254,3,217,6,255,213,25,240,1,39,220,174,255,154,205,48,254,19,13,192,255,244,34,54,254,140,16,155,0,240,181,5,254,155,193,60,0,166,128,4,255,36,145,56,255,150,240,219,0,120,51,145,0,82,153,42,1,140,236,146,0,107,92,248,1,189,10,3,0,63,136,242,0,211,39,24,0,19,202,161,1,173,27,186,255,210,204,239,254,41,209,162,255,182,254,159,255,172,116,52,0,195,103,222,254,205,69,59,0,53,22,41,1,218,48,194,0,80,210,242,0,210,188,207,0,187,161,161,254,216,17,1,0,136,225,113,0,250,184,63,0,223,30,98,254,77,168,162,0,59,53,175,0,19,201,10,255,139,224,194,0,147,193,154,255,212,189,12,254,1,200,174,255,50,133,113,1,94,179,90,0,173,182,135,0,94,177,113,0,43,89,215,255,136,252,106,255,123,134,83,254,5,245,66,255,82,49,39,1,220,2,224,0,97,129,177,0,77,59,89,0,61,29,155,1,203,171,220,255,92,78,139,0,145,33,181,255,169,24,141,1,55,150,179,0,139,60,80,255,218,39,97,0,2,147,107,255,60,248,72,0,173,230,47,1,6,83,182,255,16,105,162,254,137,212,81,255,180,184,134,1,39,222,164,255,221,105,251,1,239,112,125,0,63,7,97,0,63,104,227,255,148,58,12,0,90,60,224,255,84,212,252,0,79,215,168,0,248,221,199,1,115,121,1,0,36,172,120,0,32,162,187,255,57,107,49,255,147,42,21,0,106,198,43,1,57,74,87,0,126,203,81,255,129,135,195,0,140,31,177,0,221,139,194,0,3,222,215,0,131,68,231,0,177,86,178,254,124,151,180,0,184,124,38,1,70,163,17,0,249,251,181,1,42,55,227,0,226,161,44,0,23,236,110,0,51,149,142,1,93,5,236,0,218,183,106,254,67,24,77,0,40,245,209,255,222,121,153,0,165,57,30,0,83,125,60,0,70,38,82,1,229,6,188,0,109,222,157,255,55,118,63,255,205,151,186,0,227,33,149,255,254,176,246,1,227,177,227,0,34,106,163,254,176,43,79,0,106,95,78,1,185,241,122,255,185,14,61,0,36,1,202,0,13,178,162,255,247,11,132,0,161,230,92,1,65,1,185,255,212,50,165,1,141,146,64,255,158,242,218,0,21,164,125,0,213,139,122,1,67,71,87,0,203,158,178,1,151,92,43,0,152,111,5,255,39,3,239,255,217,255,250,255,176,63,71,255,74,245,77,1,250,174,18,255,34,49,227,255,246,46,251,255,154,35,48,1,125,157,61,255,106,36,78,255,97,236,153,0,136,187,120,255,113,134,171,255,19,213,217,254,216,94,209,255,252,5,61,0,94,3,202,0,3,26,183,255,64,191,43,255,30,23,21,0,129,141,77,255,102,120,7,1,194,76,140,0,188,175,52,255,17,81,148,0,232,86,55,1,225,48,172,0,134,42,42,255,238,50,47,0,169,18,254,0,20,147,87,255,14,195,239,255,69,247,23,0,238,229,128,255,177,49,112,0,168,98,251,255,121,71,248,0,243,8,145,254,246,227,153,255,219,169,177,254,251,139,165,255,12,163,185,255,164,40,171,255,153,159,27,254,243,109,91,255,222,24,112,1,18,214,231,0,107,157,181,254,195,147,0,255,194,99,104,255,89,140,190,255,177,66,126,254,106,185,66,0,49,218,31,0,252,174,158,0,188,79,230,1,238,41,224,0,212,234,8,1,136,11,181,0,166,117,83,255,68,195,94,0,46,132,201,0,240,152,88,0,164,57,69,254,160,224,42,255,59,215,67,255,119,195,141,255,36,180,121,254,207,47,8,255,174,210,223,0,101,197,68,255,255,82,141,1,250,137,233,0,97,86,133,1,16,80,69,0,132,131,159,0,116,93,100,0,45,141,139,0,152,172,157,255,90,43,91,0,71,153,46,0,39,16,112,255,217,136,97,255,220,198,25,254,177,53,49,0,222,88,134,255,128,15,60,0,207,192,169,255,192,116,209,255,106,78,211,1,200,213,183,255,7,12,122,254,222,203,60,255,33,110,199,254,251,106,117,0,228,225,4,1,120,58,7,255,221,193,84,254,112,133,27,0,189,200,201,255,139,135,150,0,234,55,176,255,61,50,65,0,152,108,169,255,220,85,1,255,112,135,227,0,162,26,186,0,207,96,185,254,244,136,107,0,93,153,50,1,198,97,151,0,110,11,86,255,143,117,174,255,115,212,200,0,5,202,183,0,237,164,10,254,185,239,62,0,236,120,18,254,98,123,99,255,168,201,194,254,46,234,214,0,191,133,49,255,99,169,119,0,190,187,35,1,115,21,45,255,249,131,72,0,112,6,123,255,214,49,181,254,166,233,34,0,92,197,102,254,253,228,205,255,3,59,201,1,42,98,46,0,219,37,35,255,169,195,38,0,94,124,193,1,156,43,223,0,95,72,133,254,120,206,191,0,122,197,239,255,177,187,79,255,254,46,2,1,250,167,190,0,84,129,19,0,203,113,166,255,249,31,189,254,72,157,202,255,208,71,73,255,207,24,72,0,10,16,18,1,210,81,76,255,88,208,192,255,126,243,107,255,238,141,120,255,199,121,234,255,137,12,59,255,36,220,123,255,148,179,60,254,240,12,29,0,66,0,97,1,36,30,38,255,115,1,93,255,96,103,231,255,197,158,59,1,192,164,240,0,202,202,57,255,24,174,48,0,89,77,155,1,42,76,215,0,244,151,233,0,23,48,81,0,239,127,52,254,227,130,37,255,248,116,93,1,124,132,118,0,173,254,192,1,6,235,83,255,110,175,231,1,251,28,182,0,129,249,93,254,84,184,128,0,76,181,62,0,175,128,186,0,100,53,136,254,109,29,226,0,221,233,58,1,20,99,74,0,0,22,160,0,134,13,21,0,9,52,55,255,17,89,140,0,175,34,59,0,84,165,119,255,224,226,234,255,7,72,166,255,123,115,255,1,18,214,246,0,250,7,71,1,217,220,185,0,212,35,76,255,38,125,175,0,189,97,210,0,114,238,44,255,41,188,169,254,45,186,154,0,81,92,22,0,132,160,193,0,121,208,98,255,13,81,44,255,203,156,82,0,71,58,21,255,208,114,191,254,50,38,147,0,154,216,195,0,101,25,18,0,60,250,215,255,233,132,235,255,103,175,142,1,16,14,92,0,141,31,110,254,238,241,45,255,153,217,239,1,97,168,47,255,249,85,16,1,28,175,62,255,57,254,54,0,222,231,126,0,166,45,117,254,18,189,96,255,228,76,50,0,200,244,94,0,198,152,120,1,68,34,69,255,12,65,160,254,101,19,90,0,167,197,120,255,68,54,185,255,41,218,188,0,113,168,48,0,88,105,189,1,26,82,32,255,185,93,164,1,228,240,237,255,66,182,53,0,171,197,92,255,107,9,233,1,199,120,144,255,78,49,10,255,109,170,105,255,90,4,31,255,28,244,113,255,74,58,11,0,62,220,246,255,121,154,200,254,144,210,178,255,126,57,129,1,43,250,14,255,101,111,28,1,47,86,241,255,61,70,150,255,53,73,5,255,30,26,158,0,209,26,86,0,138,237,74,0,164,95,188,0,142,60,29,254,162,116,248,255,187,175,160,0,151,18,16,0,209,111,65,254,203,134,39,255,88,108,49,255,131,26,71,255,221,27,215,254,104,105,93,255,31,236,31,254,135,0,211,255,143,127,110,1,212,73,229,0,233,67,167,254,195,1,208,255,132,17,221,255,51,217,90,0,67,235,50,255,223,210,143,0,179,53,130,1,233,106,198,0,217,173,220,255,112,229,24,255,175,154,93,254,71,203,246,255,48,66,133,255,3,136,230,255,23,221,113,254,235,111,213,0,170,120,95,254,251,221,2,0,45,130,158,254,105,94,217,255,242,52,180,254,213,68,45,255,104,38,28,0,244,158,76,0,161,200,96,255,207,53,13,255,187,67,148,0,170,54,248,0,119,162,178,255,83,20,11,0,42,42,192,1,146,159,163,255,183,232,111,0,77,229,21,255,71,53,143,0,27,76,34,0,246,136,47,255,219,39,182,255,92,224,201,1,19,142,14,255,69,182,241,255,163,118,245,0,9,109,106,1,170,181,247,255,78,47,238,255,84,210,176,255,213,107,139,0,39,38,11,0,72,21,150,0,72,130,69,0,205,77,155,254,142,133,21,0,71,111,172,254,226,42,59,255,179,0,215,1,33,128,241,0,234,252,13,1,184,79,8,0,110,30,73,255,246,141,189,0,170,207,218,1,74,154,69,255,138,246,49,255,155,32,100,0,125,74,105,255,90,85,61,255,35,229,177,255,62,125,193,255,153,86,188,1,73,120,212,0,209,123,246,254,135,209,38,255,151,58,44,1,92,69,214,255,14,12,88,255,252,153,166,255,253,207,112,255,60,78,83,255,227,124,110,0,180,96,252,255,53,117,33,254,164,220,82,255,41,1,27,255,38,164,166,255,164,99,169,254,61,144,70,255,192,166,18,0,107,250,66,0,197,65,50,0,1,179,18,255,255,104,1,255,43,153,35,255,80,111,168,0,110,175,168,0,41,105,45,255,219,14,205,255,164,233,140,254,43,1,118,0,233,67,195,0,178,82,159,255,138,87,122,255,212,238,90,255,144,35,124,254,25,140,164,0,251,215,44,254,133,70,107,255,101,227,80,254,92,169,55,0,215,42,49,0,114,180,85,255,33,232,27,1,172,213,25,0,62,176,123,254,32,133,24,255,225,191,62,0,93,70,153,0,181,42,104,1,22,191,224,255,200,200,140,255,249,234,37,0,149,57,141,0,195,56,208,255,254,130,70,255,32,173,240,255,29,220,199,0,110,100,115,255,132,229,249,0,228,233,223,255,37,216,209,254,178,177,209,255,183,45,165,254,224,97,114,0,137,97,168,255,225,222,172,0,165,13,49,1,210,235,204,255,252,4,28,254,70,160,151,0,232,190,52,254,83,248,93,255,62,215,77,1,175,175,179,255,160,50,66,0,121,48,208,0,63,169,209,255,0,210,200,0,224,187,44,1,73,162,82,0,9,176,143,255,19,76,193,255,29,59,167,1,24,43,154,0,28,190,190,0,141,188,129,0,232,235,203,255,234,0,109,255,54,65,159,0,60,88,232,255,121,253,150,254,252,233,131,255,198,110,41,1,83,77,71,255,200,22,59,254,106,253,242,255,21,12,207,255,237,66,189,0,90,198,202,1,225,172,127,0,53,22,202,0,56,230,132,0,1,86,183,0,109,190,42,0,243,68,174,1,109,228,154,0,200,177,122,1,35,160,183,255,177,48,85,255,90,218,169,255,248,152,78,0,202,254,110,0,6,52,43,0,142,98,65,255,63,145,22,0,70,106,93,0,232,138,107,1,110,179,61,255,211,129,218,1,242,209,92,0,35,90,217,1,182,143,106,255,116,101,217,255,114,250,221,255,173,204,6,0,60,150,163,0,73,172,44,255,239,110,80,255,237,76,153,254,161,140,249,0,149,232,229,0,133,31,40,255,174,164,119,0,113,51,214,0,129,228,2,254,64,34,243,0,107,227,244,255,174,106,200,255,84,153,70,1,50,35,16,0,250,74,216,254,236,189,66,255,153,249,13,0,230,178,4,255,221,41,238,0,118,227,121,255,94,87,140,254,254,119,92,0,73,239,246,254,117,87,128,0,19,211,145,255,177,46,252,0,229,91,246,1,69,128,247,255,202,77,54,1,8,11,9,255,153,96,166,0,217,214,173,255,134,192,2,1,0,207,0,0,189,174,107,1,140,134,100,0,158,193,243,1,182,102,171,0,235,154,51,0,142,5,123,255,60,168,89,1,217,14,92,255,19,214,5,1,211,167,254,0,44,6,202,254,120,18,236,255,15,113,184,255,184,223,139],"i8",ALLOC_NONE,Runtime.GLOBAL_BASE);allocate([40,177,119,254,182,123,90,255,176,165,176,0,247,77,194,0,27,234,120,0,231,0,214,255,59,39,30,0,125,99,145,255,150,68,68,1,141,222,248,0,153,123,210,255,110,127,152,255,229,33,214,1,135,221,197,0,137,97,2,0,12,143,204,255,81,41,188,0,115,79,130,255,94,3,132,0,152,175,187,255,124,141,10,255,126,192,179,255,11,103,198,0,149,6,45,0,219,85,187,1,230,18,178,255,72,182,152,0,3,198,184,255,128,112,224,1,97,161,230,0,254,99,38,255,58,159,197,0,151,66,219,0,59,69,143,255,185,112,249,0,119,136,47,255,123,130,132,0,168,71,95,255,113,176,40,1,232,185,173,0,207,93,117,1,68,157,108,255,102,5,147,254,49,97,33,0,89,65,111,254,247,30,163,255,124,217,221,1,102,250,216,0,198,174,75,254,57,55,18,0,227,5,236,1,229,213,173,0,201,109,218,1,49,233,239,0,30,55,158,1,25,178,106,0,155,111,188,1,94,126,140,0,215,31,238,1,77,240,16,0,213,242,25,1,38,71,168,0,205,186,93,254,49,211,140,255,219,0,180,255,134,118,165,0,160,147,134,255,110,186,35,255,198,243,42,0,243,146,119,0,134,235,163,1,4,241,135,255,193,46,193,254,103,180,79,255,225,4,184,254,242,118,130,0,146,135,176,1,234,111,30,0,69,66,213,254,41,96,123,0,121,94,42,255,178,191,195,255,46,130,42,0,117,84,8,255,233,49,214,254,238,122,109,0,6,71,89,1,236,211,123,0,244,13,48,254,119,148,14,0,114,28,86,255,75,237,25,255,145,229,16,254,129,100,53,255,134,150,120,254,168,157,50,0,23,72,104,255,224,49,14,0,255,123,22,255,151,185,151,255,170,80,184,1,134,182,20,0,41,100,101,1,153,33,16,0,76,154,111,1,86,206,234,255,192,160,164,254,165,123,93,255,1,216,164,254,67,17,175,255,169,11,59,255,158,41,61,255,73,188,14,255,195,6,137,255,22,147,29,255,20,103,3,255,246,130,227,255,122,40,128,0,226,47,24,254,35,36,32,0,152,186,183,255,69,202,20,0,195,133,195,0,222,51,247,0,169,171,94,1,183,0,160,255,64,205,18,1,156,83,15,255,197,58,249,254,251,89,110,255,50,10,88,254,51,43,216,0,98,242,198,1,245,151,113,0,171,236,194,1,197,31,199,255,229,81,38,1,41,59,20,0,253,104,230,0,152,93,14,255,246,242,146,254,214,169,240,255,240,102,108,254,160,167,236,0,154,218,188,0,150,233,202,255,27,19,250,1,2,71,133,255,175,12,63,1,145,183,198,0,104,120,115,255,130,251,247,0,17,212,167,255,62,123,132,255,247,100,189,0,155,223,152,0,143,197,33,0,155,59,44,255,150,93,240,1,127,3,87,255,95,71,207,1,167,85,1,255,188,152,116,255,10,23,23,0,137,195,93,1,54,98,97,0,240,0,168,255,148,188,127,0,134,107,151,0,76,253,171,0,90,132,192,0,146,22,54,0,224,66,54,254,230,186,229,255,39,182,196,0,148,251,130,255,65,131,108,254,128,1,160,0,169,49,167,254,199,254,148,255,251,6,131,0,187,254,129,255,85,82,62,0,178,23,58,255,254,132,5,0,164,213,39,0,134,252,146,254,37,53,81,255,155,134,82,0,205,167,238,255,94,45,180,255,132,40,161,0,254,111,112,1,54,75,217,0,179,230,221,1,235,94,191,255,23,243,48,1,202,145,203,255,39,118,42,255,117,141,253,0,254,0,222,0,43,251,50,0,54,169,234,1,80,68,208,0,148,203,243,254,145,7,135,0,6,254,0,0,252,185,127,0,98,8,129,255,38,35,72,255,211,36,220,1,40,26,89,0,168,64,197,254,3,222,239,255,2,83,215,254,180,159,105,0,58,115,194,0,186,116,106,255,229,247,219,255,129,118,193,0,202,174,183,1,166,161,72,0,201,107,147,254,237,136,74,0,233,230,106,1,105,111,168,0,64,224,30,1,1,229,3,0,102,151,175,255,194,238,228,255,254,250,212,0,187,237,121,0,67,251,96,1,197,30,11,0,183,95,204,0,205,89,138,0,64,221,37,1,255,223,30,255,178,48,211,255,241,200,90,255,167,209,96,255,57,130,221,0,46,114,200,255,61,184,66,0,55,182,24,254,110,182,33,0,171,190,232,255,114,94,31,0,18,221,8,0,47,231,254,0,255,112,83,0,118,15,215,255,173,25,40,254,192,193,31,255,238,21,146,255,171,193,118,255,101,234,53,254,131,212,112,0,89,192,107,1,8,208,27,0,181,217,15,255,231,149,232,0,140,236,126,0,144,9,199,255,12,79,181,254,147,182,202,255,19,109,182,255,49,212,225,0,74,163,203,0,175,233,148,0,26,112,51,0,193,193,9,255,15,135,249,0,150,227,130,0,204,0,219,1,24,242,205,0,238,208,117,255,22,244,112,0,26,229,34,0,37,80,188,255,38,45,206,254,240,90,225,255,29,3,47,255,42,224,76,0,186,243,167,0,32,132,15,255,5,51,125,0,139,135,24,0,6,241,219,0,172,229,133,255,246,214,50,0,231,11,207,255,191,126,83,1,180,163,170,255,245,56,24,1,178,164,211,255,3,16,202,1,98,57,118,255,141,131,89,254,33,51,24,0,243,149,91,255,253,52,14,0,35,169,67,254,49,30,88,255,179,27,36,255,165,140,183,0,58,189,151,0,88,31,0,0,75,169,66,0,66,101,199,255,24,216,199,1,121,196,26,255,14,79,203,254,240,226,81,255,94,28,10,255,83,193,240,255,204,193,131,255,94,15,86,0,218,40,157,0,51,193,209,0,0,242,177,0,102,185,247,0,158,109,116,0,38,135,91,0,223,175,149,0,220,66,1,255,86,60,232,0,25,96,37,255,225,122,162,1,215,187,168,255,158,157,46,0,56,171,162,0,232,240,101,1,122,22,9,0,51,9,21,255,53,25,238,255,217,30,232,254,125,169,148,0,13,232,102,0,148,9,37,0,165,97,141,1,228,131,41,0,222,15,243,255,254,18,17,0,6,60,237,1,106,3,113,0,59,132,189,0,92,112,30,0,105,208,213,0,48,84,179,255,187,121,231,254,27,216,109,255,162,221,107,254,73,239,195,255,250,31,57,255,149,135,89,255,185,23,115,1,3,163,157,255,18,112,250,0,25,57,187,255,161,96,164,0,47,16,243,0,12,141,251,254,67,234,184,255,41,18,161,0,175,6,96,255,160,172,52,254,24,176,183,255,198,193,85,1,124,121,137,255,151,50,114,255,220,203,60,255,207,239,5,1,0,38,107,255,55,238,94,254,70,152,94,0,213,220,77,1,120,17,69,255,85,164,190,255,203,234,81,0,38,49,37,254,61,144,124,0,137,78,49,254,168,247,48,0,95,164,252,0,105,169,135,0,253,228,134,0,64,166,75,0,81,73,20,255,207,210,10,0,234,106,150,255,94,34,90,255,254,159,57,254,220,133,99,0,139,147,180,254,24,23,185,0,41,57,30,255,189,97,76,0,65,187,223,255,224,172,37,255,34,62,95,1,231,144,240,0,77,106,126,254,64,152,91,0,29,98,155,0,226,251,53,255,234,211,5,255,144,203,222,255,164,176,221,254,5,231,24,0,179,122,205,0,36,1,134,255,125,70,151,254,97,228,252,0,172,129,23,254,48,90,209,255,150,224,82,1,84,134,30,0,241,196,46,0,103,113,234,255,46,101,121,254,40,124,250,255,135,45,242,254,9,249,168,255,140,108,131,255,143,163,171,0,50,173,199,255,88,222,142,255,200,95,158,0,142,192,163,255,7,117,135,0,111,124,22,0,236,12,65,254,68,38,65,255,227,174,254,0,244,245,38,0,240,50,208,255,161,63,250,0,60,209,239,0,122,35,19,0,14,33,230,254,2,159,113,0,106,20,127,255,228,205,96,0,137,210,174,254,180,212,144,255,89,98,154,1,34,88,139,0,167,162,112,1,65,110,197,0,241,37,169,0,66,56,131,255,10,201,83,254,133,253,187,255,177,112,45,254,196,251,0,0,196,250,151,255,238,232,214,255,150,209,205,0,28,240,118,0,71,76,83,1,236,99,91,0,42,250,131,1,96,18,64,255,118,222,35,0,113,214,203,255,122,119,184,255,66,19,36,0,204,64,249,0,146,89,139,0,134,62,135,1,104,233,101,0,188,84,26,0,49,249,129,0,208,214,75,255,207,130,77,255,115,175,235,0,171,2,137,255,175,145,186,1,55,245,135,255,154,86,181,1,100,58,246,255,109,199,60,255,82,204,134,255,215,49,230,1,140,229,192,255,222,193,251,255,81,136,15,255,179,149,162,255,23,39,29,255,7,95,75,254,191,81,222,0,241,81,90,255,107,49,201,255,244,211,157,0,222,140,149,255,65,219,56,254,189,246,90,255,178,59,157,1,48,219,52,0,98,34,215,0,28,17,187,255,175,169,24,0,92,79,161,255,236,200,194,1,147,143,234,0,229,225,7,1,197,168,14,0,235,51,53,1,253,120,174,0,197,6,168,255,202,117,171,0,163,21,206,0,114,85,90,255,15,41,10,255,194,19,99,0,65,55,216,254,162,146,116,0,50,206,212,255,64,146,29,255,158,158,131,1,100,165,130,255,172,23,129,255,125,53,9,255,15,193,18,1,26,49,11,255,181,174,201,1,135,201,14,255,100,19,149,0,219,98,79,0,42,99,143,254,96,0,48,255,197,249,83,254,104,149,79,255,235,110,136,254,82,128,44,255,65,41,36,254,88,211,10,0,187,121,187,0,98,134,199,0,171,188,179,254,210,11,238,255,66,123,130,254,52,234,61,0,48,113,23,254,6,86,120,255,119,178,245,0,87,129,201,0,242,141,209,0,202,114,85,0,148,22,161,0,103,195,48,0,25,49,171,255,138,67,130,0,182,73,122,254,148,24,130,0,211,229,154,0,32,155,158,0,84,105,61,0,177,194,9,255,166,89,86,1,54,83,187,0,249,40,117,255,109,3,215,255,53,146,44,1,63,47,179,0,194,216,3,254,14,84,136,0,136,177,13,255,72,243,186,255,117,17,125,255,211,58,211,255,93,79,223,0,90,88,245,255,139,209,111,255,70,222,47,0,10,246,79,255,198,217,178,0,227,225,11,1,78,126,179,255,62,43,126,0,103,148,35,0,129,8,165,254,245,240,148,0,61,51,142,0,81,208,134,0,15,137,115,255,211,119,236,255,159,245,248,255,2,134,136,255,230,139,58,1,160,164,254,0,114,85,141,255,49,166,182,255,144,70,84,1,85,182,7,0,46,53,93,0,9,166,161,255,55,162,178,255,45,184,188,0,146,28,44,254,169,90,49,0,120,178,241,1,14,123,127,255,7,241,199,1,189,66,50,255,198,143,101,254,189,243,135,255,141,24,24,254,75,97,87,0,118,251,154,1,237,54,156,0,171,146,207,255,131,196,246,255,136,64,113,1,151,232,57,0,240,218,115,0,49,61,27,255,64,129,73,1,252,169,27,255,40,132,10,1,90,201,193,255,252,121,240,1,186,206,41,0,43,198,97,0,145,100,183,0,204,216,80,254,172,150,65,0,249,229,196,254,104,123,73,255,77,104,96,254,130,180,8,0,104,123,57,0,220,202,229,255,102,249,211,0,86,14,232,255,182,78,209,0,239,225,164,0,106,13,32,255,120,73,17,255,134,67,233,0,83,254,181,0,183,236,112,1,48,64,131,255,241,216,243,255,65,193,226,0,206,241,100,254,100,134,166,255,237,202,197,0,55,13,81,0,32,124,102,255,40,228,177,0,118,181,31,1,231,160,134,255,119,187,202,0,0,142,60,255,128,38,189,255,166,201,150,0,207,120,26,1,54,184,172,0,12,242,204,254,133,66,230,0,34,38,31,1,184,112,80,0,32,51,165,254,191,243,55,0,58,73,146,254,155,167,205,255,100,104,152,255,197,254,207,255,173,19,247,0,238,10,202,0,239,151,242,0,94,59,39,255,240,29,102,255,10,92,154,255,229,84,219,255,161,129,80,0,208,90,204,1,240,219,174,255,158,102,145,1,53,178,76,255,52,108,168,1,83,222,107,0,211,36,109,0,118,58,56,0,8,29,22,0,237,160,199,0,170,209,157,0,137,71,47,0,143,86,32,0,198,242,2,0,212,48,136,1,92,172,186,0,230,151,105,1,96,191,229,0,138,80,191,254,240,216,130,255,98,43,6,254,168,196,49,0,253,18,91,1,144,73,121,0,61,146,39,1,63,104,24,255,184,165,112,254,126,235,98,0,80,213,98,255,123,60,87,255,82,140,245,1,223,120,173,255,15,198,134,1,206,60,239,0,231,234,92,255,33,238,19,255,165,113,142,1,176,119,38,0,160,43,166,254,239,91,105,0,107,61,194,1,25,4,68,0,15,139,51,0,164,132,106,255,34,116,46,254,168,95,197,0,137,212,23,0,72,156,58,0,137,112,69,254,150,105,154,255,236,201,157,0,23,212,154,255,136,82,227,254,226,59,221,255,95,149,192,0,81,118,52,255,33,43,215,1,14,147,75,255,89,156,121,254,14,18,79,0,147,208,139,1,151,218,62,255,156,88,8,1,210,184,98,255,20,175,123,255,102,83,229,0,220,65,116,1,150,250,4,255,92,142,220,255,34,247,66,255,204,225,179,254,151,81,151,0,71,40,236,255,138,63,62,0,6,79,240,255,183,185,181,0,118,50,27,0,63,227,192,0,123,99,58,1,50,224,155,255,17,225,223,254,220,224,77,255,14,44,123,1,141,128,175,0,248,212,200,0,150,59,183,255,147,97,29,0,150,204,181,0,253,37,71,0,145,85,119,0,154,200,186,0,2,128,249,255,83,24,124,0,14,87,143,0,168,51,245,1,124,151,231,255,208,240,197,1,124,190,185,0,48,58,246,0,20,233,232,0,125,18,98,255,13,254,31,255,245,177,130,255,108,142,35,0,171,125,242,254,140,12,34,255,165,161,162,0,206,205,101,0,247,25,34,1,100,145,57,0,39,70,57,0,118,204,203,255,242,0,162,0,165,244,30,0,198,116,226,0,128,111,153,255,140,54,182,1,60,122,15,255,155,58,57,1,54,50,198,0,171,211,29,255,107,138,167,255,173,107,199,255,109,161,193,0,89,72,242,255,206,115,89,255,250,254,142,254,177,202,94,255,81,89,50,0,7,105,66,255,25,254,255,254,203,64,23,255,79,222,108,255,39,249,75,0,241,124,50,0,239,152,133,0,221,241,105,0,147,151,98,0,213,161,121,254,242,49,137,0,233,37,249,254,42,183,27,0,184,119,230,255,217,32,163,255,208,251,228,1,137,62,131,255,79,64,9,254,94,48,113,0,17,138,50,254,193,255,22,0,247,18,197,1,67,55,104,0,16,205,95,255,48,37,66,0,55,156,63,1,64,82,74,255,200,53,71,254,239,67,125,0,26,224,222,0,223,137,93,255,30,224,202,255,9,220,132,0,198,38,235,1,102,141,86,0,60,43,81,1,136,28,26,0,233,36,8,254,207,242,148,0,164,162,63,0,51,46,224,255,114,48,79,255,9,175,226,0,222,3,193,255,47,160,232,255,255,93,105,254,14,42,230,0,26,138,82,1,208,43,244,0,27,39,38,255,98,208,127,255,64,149,182,255,5,250,209,0,187,60,28,254,49,25,218,255,169,116,205,255,119,18,120,0,156,116,147,255,132,53,109,255,13,10,202,0,110,83,167,0,157,219,137,255,6,3,130,255,50,167,30,255,60,159,47,255,129,128,157,254,94,3,189,0,3,166,68,0,83,223,215,0,150,90,194,1,15,168,65,0,227,83,51,255,205,171,66,255,54,187,60,1,152,102,45,255,119,154,225,0,240,247,136,0,100,197,178,255,139,71,223,255,204,82,16,1,41,206,42,255,156,192,221,255,216,123,244,255,218,218,185,255,187,186,239,255,252,172,160,255,195,52,22,0,144,174,181,254,187,100,115,255,211,78,176,255,27,7,193,0,147,213,104,255,90,201,10,255,80,123,66,1,22,33,186,0,1,7,99,254,30,206,10,0,229,234,5,0,53,30,210,0,138,8,220,254,71,55,167,0,72,225,86,1,118,190,188,0,254,193,101,1,171,249,172,255,94,158,183,254,93,2,108,255,176,93,76,255,73,99,79,255,74,64,129,254,246,46,65,0,99,241,127,254,246,151,102,255,44,53,208,254,59,102,234,0,154,175,164,255,88,242,32,0,111,38,1,0,255,182,190,255,115,176,15,254,169,60,129,0,122,237,241,0,90,76,63,0,62,74,120,255,122,195,110,0,119,4,178,0,222,242,210,0,130,33,46,254,156,40,41,0,167,146,112,1,49,163,111,255,121,176,235,0,76,207,14,255,3,25,198,1,41,235,213,0,85,36,214,1,49,92,109,255,200,24,30,254,168,236,195,0,145,39,124,1,236,195,149,0,90,36,184,255,67,85,170,255,38,35,26,254,131,124,68,255,239,155,35,255,54,201,164,0,196,22,117,255,49,15,205,0,24,224,29,1,126,113,144,0,117,21,182,0,203,159,141,0,223,135,77,0,176,230,176,255,190,229,215,255,99,37,181,255,51,21,138,255,25,189,89,255,49,48,165,254,152,45,247,0,170,108,222,0,80,202,5,0,27,69,103,254,204,22,129,255,180,252,62,254,210,1,91,255,146,110,254,255,219,162,28,0,223,252,213,1,59,8,33,0,206,16,244,0,129,211,48,0,107,160,208,0,112,59,209,0,109,77,216,254,34,21,185,255,246,99,56,255,179,139,19,255,185,29,50,255,84,89,19,0,74,250,98,255,225,42,200,255,192,217,205,255,210,16,167,0,99,132,95,1,43,230,57,0,254,11,203,255,99,188,63,255,119,193,251,254,80,105,54,0,232,181,189,1,183,69,112,255,208,171,165,255,47,109,180,255,123,83,165,0,146,162,52,255,154,11,4,255,151,227,90,255,146,137,97,254,61,233,41,255,94,42,55,255,108,164,236,0,152,68,254,0,10,140,131,255,10,106,79,254,243,158,137,0,67,178,66,254,177,123,198,255,15,62,34,0,197,88,42,255,149,95,177,255,152,0,198,255,149,254,113,255,225,90,163,255,125,217,247,0,18,17,224,0,128,66,120,254,192,25,9,255,50,221,205,0,49,212,70,0,233,255,164,0,2,209,9,0,221,52,219,254,172,224,244,255,94,56,206,1,242,179,2,255,31,91,164,1,230,46,138,255,189,230,220,0,57,47,61,255,111,11,157,0,177,91,152,0,28,230,98,0,97,87,126,0,198,89,145,255,167,79,107,0,249,77,160,1,29,233,230,255,150,21,86,254,60,11,193,0,151,37,36,254,185,150,243,255,228,212,83,1,172,151,180,0,201,169,155,0,244,60,234,0,142,235,4,1,67,218,60,0,192,113,75,1,116,243,207,255,65,172,155,0,81,30,156,255,80,72,33,254,18,231,109,255,142,107,21,254,125,26,132,255,176,16,59,255,150,201,58,0,206,169,201,0,208,121,226,0,40,172,14,255,150,61,94,255,56,57,156,255,141,60,145,255,45,108,149,255,238,145,155,255,209,85,31,254,192,12,210,0,99,98,93,254,152,16,151,0,225,185,220,0,141,235,44,255,160,172,21,254,71,26,31,255,13,64,93,254,28,56,198,0,177,62,248,1,182,8,241,0,166,101,148,255,78,81,133,255,129,222,215,1,188,169,129,255,232,7,97,0,49,112,60,255,217,229,251,0,119,108,138,0,39,19,123,254,131,49,235,0,132,84,145,0,130,230,148,255,25,74,187,0,5,245,54,255,185,219,241,1,18,194,228,255,241,202,102,0,105,113,202,0,155,235,79,0,21,9,178,255,156,1,239,0,200,148,61,0,115,247,210,255,49,221,135,0,58,189,8,1,35,46,9,0,81,65,5,255,52,158,185,255,125,116,46,255,74,140,13,255,210,92,172,254,147,23,71,0,217,224,253,254,115,108,180,255,145,58,48,254,219,177,24,255,156,255,60,1,154,147,242,0,253,134,87,0,53,75,229,0,48,195,222,255,31,175,50,255,156,210,120,255,208,35,222,255,18,248,179,1,2,10,101,255,157,194,248,255,158,204,101,255,104,254,197,255,79,62,4,0,178,172,101,1,96,146,251,255,65,10,156,0,2,137,165,255,116,4,231,0,242,215,1,0,19,35,29,255,43,161,79,0,59,149,246,1,251,66,176,0,200,33,3,255,80,110,142,255,195,161,17,1,228,56,66,255,123,47,145,254,132,4,164,0,67,174,172,0,25,253,114,0,87,97,87,1,250,220,84,0,96,91,200,255,37,125,59,0,19,65,118,0,161,52,241,255,237,172,6,255,176,191,255,255,1,65,130,254,223,190,230,0,101,253,231,255,146,35,109,0,250,29,77,1,49,0,19,0,123,90,155,1,22,86,32,255,218,213,65,0,111,93,127,0,60,93,169,255,8,127,182,0,17,186,14,254,253,137,246,255,213,25,48,254,76,238,0,255,248,92,70,255,99,224,139,0,184,9,255,1,7,164,208,0,205,131,198,1,87,214,199,0,130,214,95,0,221,149,222,0,23,38,171,254,197,110,213,0,43,115,140,254,215,177,118,0,96,52,66,1,117,158,237,0,14,64,182,255,46,63,174,255,158,95,190,255,225,205,177,255,43,5,142,255,172,99,212,255,244,187,147,0,29,51,153,255,228,116,24,254,30,101,207,0,19,246,150,255,134,231,5,0,125,134,226,1,77,65,98,0,236,130,33,255,5,110,62,0,69,108,127,255,7,113,22,0,145,20,83,254,194,161,231,255,131,181,60,0,217,209,177,255,229,148,212,254,3,131,184,0,117,177,187,1,28,14,31,255,176,102,80,0,50,84,151,255,125,31,54,255,21,157,133,255,19,179,139,1,224,232,26,0,34,117,170,255,167,252,171,255,73,141,206,254,129,250,35,0,72,79,236,1,220,229,20,255,41,202,173,255,99,76,238,255,198,22,224,255,108,198,195,255,36,141,96,1,236,158,59,255,106,100,87,0,110,226,2,0,227,234,222,0,154,93,119,255,74,112,164,255,67,91,2,255,21,145,33,255,102,214,137,255,175,230,103,254,163,246,166,0,93,247,116,254,167,224,28,255,220,2,57,1,171,206,84,0,123,228,17,255,27,120,119,0,119,11,147,1,180,47,225,255,104,200,185,254,165,2,114,0,77,78,212,0,45,154,177,255,24,196,121,254,82,157,182,0,90,16,190,1,12,147,197,0,95,239,152,255,11,235,71,0,86,146,119,255,172,134,214,0,60,131,196,0,161,225,129,0,31,130,120,254,95,200,51,0,105,231,210,255,58,9,148,255,43,168,221,255,124,237,142,0,198,211,50,254,46,245,103,0,164,248,84,0,152,70,208,255,180,117,177,0,70,79,185,0,243,74,32,0,149,156,207,0,197,196,161,1,245,53,239,0,15,93,246,254,139,240,49,255,196,88,36,255,162,38,123,0,128,200,157,1,174,76,103,255,173,169,34,254,216,1,171,255,114,51,17,0,136,228,194,0,110,150,56,254,106,246,159,0,19,184,79,255,150,77,240,255,155,80,162,0,0,53,169,255,29,151,86,0,68,94,16,0,92,7,110,254,98,117,149,255,249,77,230,255,253,10,140,0,214,124,92,254,35,118,235,0,89,48,57,1,22,53,166,0,184,144,61,255,179,255,194,0,214,248,61,254,59,110,246,0,121,21,81,254,166,3,228,0,106,64,26,255,69,232,134,255,242,220,53,254,46,220,85,0,113,149,247,255,97,179,103,255,190,127,11,0,135,209,182,0,95,52,129,1,170,144,206,255,122,200,204,255,168,100,146,0,60,144,149,254,70,60,40,0,122,52,177,255,246,211,101,255,174,237,8,0,7,51,120,0,19,31,173,0,126,239,156,255,143,189,203,0,196,128,88,255,233,133,226,255,30,125,173,255,201,108,50,0,123,100,59,255,254,163,3,1,221,148,181,255,214,136,57,254,222,180,137,255,207,88,54,255,28,33,251,255,67,214,52,1,210,208,100,0,81,170,94,0,145,40,53,0,224,111,231,254,35,28,244,255,226,199,195,254,238,17,230,0,217,217,164,254,169,157,221,0,218,46,162,1,199,207,163,255,108,115,162,1,14,96,187,255,118,60,76,0,184,159,152,0,209,231,71,254,42,164,186,255,186,153,51,254,221,171,182,255,162,142,173,0,235,47,193,0,7,139,16,1,95,164,64,255,16,221,166,0,219,197,16,0,132,29,44,255,100,69,117,255,60,235,88,254,40,81,173,0,71,190,61,255,187,88,157,0,231,11,23,0,237,117,164,0,225,168,223,255,154,114,116,255,163,152,242,1,24,32,170,0,125,98,113,254,168,19,76,0,17,157,220,254,155,52,5,0,19,111,161,255,71,90,252,255,173,110,240,0,10,198,121,255,253,255,240,255,66,123,210,0,221,194,215,254,121,163,17,255,225,7,99,0,190,49,182,0,115,9,133,1,232,26,138,255,213,68,132,0,44,119,122,255,179,98,51,0,149,90,106,0,71,50,230,255,10,153,118,255,177,70,25,0,165,87,205,0,55,138,234,0,238,30,97,0,113,155,207,0,98,153,127,0,34,107,219,254,117,114,172,255,76,180,255,254,242,57,179,255,221,34,172,254,56,162,49,255,83,3,255,255,113,221,189,255,188,25,228,254,16,88,89,255,71,28,198,254,22,17,149,255,243,121,254,255,107,202,99,255,9,206,14,1,220,47,153,0,107,137,39,1,97,49,194,255,149,51,197,254,186,58,11,255,107,43,232,1,200,6,14,255,181,133,65,254,221,228,171,255,123,62,231,1,227,234,179,255,34,189,212,254,244,187,249,0,190,13,80,1,130,89,1,0,223,133,173,0,9,222,198,255,66,127,74,0,167,216,93,255,155,168,198,1,66,145,0,0,68,102,46,1,172,90,154,0,216,128,75,255,160,40,51,0,158,17,27,1,124,240,49,0,236,202,176,255,151,124,192,255,38,193,190,0,95,182,61,0,163,147,124,255,255,165,51,255,28,40,17,254,215,96,78,0,86,145,218,254,31,36,202,255,86,9,5,0,111,41,200,255,237,108,97,0,57,62,44,0,117,184,15,1,45,241,116,0,152,1,220,255,157,165,188,0,250,15,131,1,60,44,125,255,65,220,251,255,75,50,184,0,53,90,128,255,231,80,194,255,136,129,127,1,21,18,187,255,45,58,161,255,71,147,34,0,174,249,11,254,35,141,29,0,239,68,177,255,115,110,58,0,238,190,177,1,87,245,166,255,190,49,247,255,146,83,184,255,173,14,39,255,146,215,104,0,142,223,120,0,149,200,155,255,212,207,145,1,16,181,217,0,173,32,87,255,255,35,181,0,119,223,161,1,200,223,94,255,70,6,186,255,192,67,85,255,50,169,152,0,144,26,123,255,56,243,179,254,20,68,136,0,39,140,188,254,253,208,5,255,200,115,135,1,43,172,229,255,156,104,187,0,151,251,167,0,52,135,23,0,151,153,72,0,147,197,107,254,148,158,5,255,238,143,206,0,126,153,137,255,88,152,197,254,7,68,167,0,252,159,165,255,239,78,54,255,24,63,55,255,38,222,94,0,237,183,12,255,206,204,210,0,19,39,246,254,30,74,231,0,135,108,29,1,179,115,0,0,117,118,116,1,132,6,252,255,145,129,161,1,105,67,141,0,82,37,226,255,238,226,228,255,204,214,129,254,162,123,100,255,185,121,234,0,45,108,231,0,66,8,56,255,132,136,128,0,172,224,66,254,175,157,188,0,230,223,226,254,242,219,69,0,184,14,119,1,82,162,56,0,114,123,20,0,162,103,85,255,49,239,99,254,156,135,215,0,111,255,167,254,39,196,214,0,144,38,79,1,249,168,125,0,155,97,156,255,23,52,219,255,150,22,144,0,44,149,165,255,40,127,183,0,196,77,233,255,118,129,210,255,170,135,230,255,214,119,198,0,233,240,35,0,253,52,7,255,117,102,48,255,21,204,154,255,179,136,177,255,23,2,3,1,149,130,89,255,252,17,159,1,70,60,26,0,144,107,17,0,180,190,60,255,56,182,59,255,110,71,54,255,198,18,129,255,149,224,87,255,223,21,152,255,138,22,182,255,250,156,205,0,236,45,208,255,79,148,242,1,101,70,209,0,103,78,174,0,101,144,172,255,152,136,237,1,191,194,136,0,113,80,125,1,152,4,141,0,155,150,53,255,196,116,245,0,239,114,73,254,19,82,17,255,124,125,234,255,40,52,191,0,42,210,158,255,155,132,165,0,178,5,42,1,64,92,40,255,36,85,77,255,178,228,118,0,137,66,96,254,115,226,66,0,110,240,69,254,151,111,80,0,167,174,236,255,227,108,107,255,188,242,65,255,183,81,255,0,57,206,181,255,47,34,181,255,213,240,158,1,71,75,95,0,156,40,24,255,102,210,81,0,171,199,228,255,154,34,41,0,227,175,75,0,21,239,195,0,138,229,95,1,76,192,49,0,117,123,87,1,227,225,130,0,125,62,63,255,2,198,171,0,254,36,13,254,145,186,206,0,148,255,244,255,35,0,166,0,30,150,219,1,92,228,212,0,92,198,60,254,62,133,200,255,201,41,59,0,125,238,109,255,180,163,238,1,140,122,82,0,9,22,88,255,197,157,47,255,153,94,57,0,88,30,182,0,84,161,85,0,178,146,124,0,166,166,7,255,21,208,223,0,156,182,242,0,155,121,185,0,83,156,174,254,154,16,118,255,186,83,232,1,223,58,121,255,29,23,88,0,35,125,127,255,170,5,149,254,164,12,130,255,155,196,29,0,161,96,136,0,7,35,29,1,162,37,251,0,3,46,242,255,0,217,188,0,57,174,226,1,206,233,2,0,57,187,136,254,123,189,9,255,201,117,127,255,186,36,204,0,231,25,216,0,80,78,105,0,19,134,129,255,148,203,68,0,141,81,125,254,248,165,200,255,214,144,135,0,151,55,166,255,38,235,91,0,21,46,154,0,223,254,150,255,35,153,180,255,125,176,29,1,43,98,30,255,216,122,230,255,233,160,12,0,57,185,12,254,240,113,7,255,5,9,16,254,26,91,108,0,109,198,203,0,8,147,40,0,129,134,228,255,124,186,40,255,114,98,132,254,166,132,23,0,99,69,44,0,9,242,238,255,184,53,59,0,132,129,102,255,52,32,243,254,147,223,200,255,123,83,179,254,135,144,201,255,141,37,56,1,151,60,227,255,90,73,156,1,203,172,187,0,80,151,47,255,94,137,231,255,36,191,59,255,225,209,181,255,74,215,213,254,6,118,179,255,153,54,193,1,50,0,231,0,104,157,72,1,140,227,154,255,182,226,16,254,96,225,92,255,115,20,170,254,6,250,78,0,248,75,173,255,53,89,6,255,0,180,118,0,72,173,1,0,64,8,206,1,174,133,223,0,185,62,133,255,214,11,98,0,197,31,208,0,171,167,244,255,22,231,181,1,150,218,185,0,247,169,97,1,165,139,247,255,47,120,149,1,103,248,51,0,60,69,28,254,25,179,196,0,124,7,218,254,58,107,81,0,184,233,156,255,252,74,36,0,118,188,67,0,141,95,53,255,222,94,165,254,46,61,53,0,206,59,115,255,47,236,250,255,74,5,32,1,129,154,238,255,106,32,226,0,121,187,61,255,3,166,241,254,67,170,172,255,29,216,178,255,23,201,252,0,253,110,243,0,200,125,57,0,109,192,96,255,52,115,238,0,38,121,243,255,201,56,33,0,194,118,130,0,75,96,25,255,170,30,230,254,39,63,253,0,36,45,250,255,251,1,239,0,160,212,92,1,45,209,237,0,243,33,87,254,237,84,201,255,212,18,157,254,212,99,127,255,217,98,16,254,139,172,239,0,168,201,130,255,143,193,169,255,238,151,193,1,215,104,41,0,239,61,165,254,2,3,242,0,22,203,177,254,177,204,22,0,149,129,213,254,31,11,41,255,0,159,121,254,160,25,114,255,162,80,200,0,157,151,11,0,154,134,78,1,216,54,252,0,48,103,133,0,105,220,197,0,253,168,77,254,53,179,23,0,24,121,240,1,255,46,96,255,107,60,135,254,98,205,249,255,63,249,119,255,120,59,211,255,114,180,55,254,91,85,237,0,149,212,77,1,56,73,49,0,86,198,150,0,93,209,160,0,69,205,182,255,244,90,43,0,20,36,176,0,122,116,221,0,51,167,39,1,231,1,63,255,13,197,134,0,3,209,34,255,135,59,202,0,167,100,78,0,47,223,76,0,185,60,62,0,178,166,123,1,132,12,161,255,61,174,43,0,195,69,144,0,127,47,191,1,34,44,78,0,57,234,52,1,255,22,40,255,246,94,146,0,83,228,128,0,60,78,224,255,0,96,210,255,153,175,236,0,159,21,73,0,180,115,196,254,131,225,106,0,255,167,134,0,159,8,112,255,120,68,194,255,176,196,198,255,118,48,168,255,93,169,1,0,112,200,102,1,74,24,254,0,19,141,4,254,142,62,63,0,131,179,187,255,77,156,155,255,119,86,164,0,170,208,146,255,208,133,154,255,148,155,58,255,162,120,232,254,252,213,155,0,241,13,42,0,94,50,131,0,179,170,112,0,140,83,151,255,55,119,84,1,140,35,239,255,153,45,67,1,236,175,39,0,54,151,103,255,158,42,65,255,196,239,135,254,86,53,203,0,149,97,47,254,216,35,17,255,70,3,70,1,103,36,90,255,40,26,173,0,184,48,13,0,163,219,217,255,81,6,1,255,221,170,108,254,233,208,93,0,100,201,249,254,86,36,35,255,209,154,30,1,227,201,251,255,2,189,167,254,100,57,3,0,13,128,41,0,197,100,75,0,150,204,235,255,145,174,59,0,120,248,149,255,85,55,225,0,114,210,53,254,199,204,119,0,14,247,74,1,63,251,129,0,67,104,151,1,135,130,80,0,79,89,55,255,117,230,157,255,25,96,143,0,213,145,5,0,69,241,120,1,149,243,95,255,114,42,20,0,131,72,2,0,154,53,20,255,73,62,109,0,196,102,152,0,41,12,204,255,122,38,11,1,250,10,145,0,207,125,148,0,246,244,222,255,41,32,85,1,112,213,126,0,162,249,86,1,71,198,127,255,81,9,21,1,98,39,4,255,204,71,45,1,75,111,137,0,234,59,231,0,32,48,95,255,204,31,114,1,29,196,181,255,51,241,167,254,93,109,142,0,104,144,45,0,235,12,181,255,52,112,164,0,76,254,202,255,174,14,162,0,61,235,147,255,43,64,185,254,233,125,217,0,243,88,167,254,74,49,8,0,156,204,66,0,124,214,123,0,38,221,118,1,146,112,236,0,114,98,177,0,151,89,199,0,87,197,112,0,185,149,161,0,44,96,165,0,248,179,20,255,188,219,216,254,40,62,13,0,243,142,141,0,229,227,206,255,172,202,35,255,117,176,225,255,82,110,38,1,42,245,14,255,20,83,97,0,49,171,10,0,242,119,120,0,25,232,61,0,212,240,147,255,4,115,56,255,145,17,239,254,202,17,251,255,249,18,245,255,99,117,239,0,184,4,179,255,246,237,51,255,37,239,137,255,166,112,166,255,81,188,33,255,185,250,142,255,54,187,173,0,208,112,201,0,246,43,228,1,104,184,88,255,212,52,196,255,51,117,108,255,254,117,155,0,46,91,15,255,87,14,144,255,87,227,204,0,83,26,83,1,159,76,227,0,159,27,213,1,24,151,108,0,117,144,179,254,137,209,82,0,38,159,10,0,115,133,201,0,223,182,156,1,110,196,93,255,57,60,233,0,5,167,105,255,154,197,164,0,96,34,186,255,147,133,37,1,220,99,190,0,1,167,84,255,20,145,171,0,194,197,251,254,95,78,133,255,252,248,243,255,225,93,131,255,187,134,196,255,216,153,170,0,20,118,158,254,140,1,118,0,86,158,15,1,45,211,41,255,147,1,100,254,113,116,76,255,211,127,108,1,103,15,48,0,193,16,102,1,69,51,95,255,107,128,157,0,137,171,233,0,90,124,144,1,106,161,182,0,175,76,236,1,200,141,172,255,163,58,104,0,233,180,52,255,240,253,14,255,162,113,254,255,38,239,138,254,52,46,166,0,241,101,33,254,131,186,156,0,111,208,62,255,124,94,160,255,31,172,254,0,112,174,56,255,188,99,27,255,67,138,251,0,125,58,128,1,156,152,174,255,178,12,247,255,252,84,158,0,82,197,14,254,172,200,83,255,37,39,46,1,106,207,167,0,24,189,34,0,131,178,144,0,206,213,4,0,161,226,210,0,72,51,105,255,97,45,187,255,78,184,223,255,176,29,251,0,79,160,86,255,116,37,178,0,82,77,213,1,82,84,141,255,226,101,212,1,175,88,199,255,245,94,247,1,172,118,109,255,166,185,190,0,131,181,120,0,87,254,93,255,134,240,73,255,32,245,143,255,139,162,103,255,179,98,18,254,217,204,112,0,147,223,120,255,53,10,243,0,166,140,150,0,125,80,200,255,14,109,219,255,91,218,1,255,252,252,47,254,109,156,116,255,115,49,127,1,204,87,211,255,148,202,217,255,26,85,249,255,14,245,134,1,76,89,169,255,242,45,230,0,59,98,172,255,114,73,132,254,78,155,49,255,158,126,84,0,49,175,43,255,16,182,84,255,157,103,35,0,104,193,109,255,67,221,154,0,201,172,1,254,8,162,88,0,165,1,29,255,125,155,229,255,30,154,220,1,103,239,92,0,220,1,109,255,202,198,1,0,94,2,142,1,36,54,44,0,235,226,158,255,170,251,214,255,185,77,9,0,97,74,242,0,219,163,149,255,240,35,118,255,223,114,88,254,192,199,3,0,106,37,24,255,201,161,118,255,97,89,99,1,224,58,103,255,101,199,147,254,222,60,99,0,234,25,59,1,52,135,27,0,102,3,91,254,168,216,235,0,229,232,136,0,104,60,129,0,46,168,238,0,39,191,67,0,75,163,47,0,143,97,98,255,56,216,168,1,168,233,252,255,35,111,22,255,92,84,43,0,26,200,87,1,91,253,152,0,202,56,70,0,142,8,77,0,80,10,175,1,252,199,76,0,22,110,82,255,129,1,194,0,11,128,61,1,87,14,145,255,253,222,190,1,15,72,174,0,85,163,86,254,58,99,44,255,45,24,188,254,26,205,15,0,19,229,210,254,248,67,195,0,99,71,184,0,154,199,37,255,151,243,121,255,38,51,75,255,201,85,130,254,44,65,250,0,57,147,243,254,146,43,59,255,89,28,53,0,33,84,24,255,179,51,18,254,189,70,83,0,11,156,179,1,98,134,119,0,158,111,111,0,119,154,73,255,200,63,140,254,45,13,13,255,154,192,2,254,81,72,42,0,46,160,185,254,44,112,6,0,146,215,149,1,26,176,104,0,68,28,87,1,236,50,153,255,179,128,250,254,206,193,191,255,166,92,137,254,53,40,239,0,210,1,204,254,168,173,35,0,141,243,45,1,36,50,109,255,15,242,194,255,227,159,122,255,176,175,202,254,70,57,72,0,40,223,56,0,208,162,58,255,183,98,93,0,15,111,12,0,30,8,76,255,132,127,246,255,45,242,103,0,69,181,15,255,10,209,30,0,3,179,121,0,241,232,218,1,123,199,88,255,2,210,202,1,188,130,81,255,94,101,208,1,103,36,45,0,76,193,24,1,95,26,241,255,165,162,187,0,36,114,140,0,202,66,5,255,37,56,147,0,152,11,243,1,127,85,232,255,250,135,212,1,185,177,113,0,90,220,75,255,69,248,146,0,50,111,50,0,92,22,80,0,244,36,115,254,163,100,82,255,25,193,6,1,127,61,36,0,253,67,30,254,65,236,170,255,161,17,215,254,63,175,140,0,55,127,4,0,79,112,233,0,109,160,40,0,143,83,7,255,65,26,238,255,217,169,140,255,78,94,189,255,0,147,190,255,147,71,186,254,106,77,127,255,233,157,233,1,135,87,237,255,208,13,236,1,155,109,36,255,180,100,218,0,180,163,18,0,190,110,9,1,17,63,123,255,179,136,180,255,165,123,123,255,144,188,81,254,71,240,108,255,25,112,11,255,227,218,51,255,167,50,234,255,114,79,108,255,31,19,115,255,183,240,99,0,227,87,143,255,72,217,248,255,102,169,95,1,129,149,149,0,238,133,12,1,227,204,35,0,208,115,26,1,102,8,234,0,112,88,143,1,144,249,14,0,240,158,172,254,100,112,119,0,194,141,153,254,40,56,83,255,121,176,46,0,42,53,76,255,158,191,154,0,91,209,92,0,173,13,16,1,5,72,226,255,204,254,149,0,80,184,207,0,100,9,122,254,118,101,171,255,252,203,0,254,160,207,54,0,56,72,249,1,56,140,13,255,10,64,107,254,91,101,52,255,225,181,248,1,139,255,132,0,230,145,17,0,233,56,23,0,119,1,241,255,213,169,151,255,99,99,9,254,185,15,191,255,173,103,109,1,174,13,251,255,178,88,7,254,27,59,68,255,10,33,2,255,248,97,59,0,26,30,146,1,176,147,10,0,95,121,207,1,188,88,24,0,185,94,254,254,115,55,201,0,24,50,70,0,120,53,6,0,142,66,146,0,228,226,249,255,104,192,222,1,173,68,219,0,162,184,36,255,143,102,137,255,157,11,23,0,125,45,98,0,235,93,225,254,56,112,160,255,70,116,243,1,153,249,55,255,129,39,17,1,241,80,244,0,87,69,21,1,94,228,73,255,78,66,65,255,194,227,231,0,61,146,87,255,173,155,23,255,112,116,219,254,216,38,11,255,131,186,133,0,94,212,187,0,100,47,91,0,204,254,175,255,222,18,215,254,173,68,108,255,227,228,79,255,38,221,213,0,163,227,150,254,31,190,18,0,160,179,11,1,10,90,94,255,220,174,88,0,163,211,229,255,199,136,52,0,130,95,221,255,140,188,231,254,139,113,128,255,117,171,236,254,49,220,20,255,59,20,171,255,228,109,188,0,20,225,32,254,195,16,174,0,227,254,136,1,135,39,105,0,150,77,206,255,210,238,226,0,55,212,132,254,239,57,124,0,170,194,93,255,249,16,247,255,24,151,62,255,10,151,10,0,79,139,178,255,120,242,202,0,26,219,213,0,62,125,35,255,144,2,108,255,230,33,83,255,81,45,216,1,224,62,17,0,214,217,125,0,98,153,153,255,179,176,106,254,131,93,138,255,109,62,36,255,178,121,32,255,120,252,70,0,220,248,37,0,204,88,103,1,128,220,251,255,236,227,7,1,106,49,198,255,60,56,107,0,99,114,238,0,220,204,94,1,73,187,1,0,89,154,34,0,78,217,165,255,14,195,249,255,9,230,253,255,205,135,245,0,26,252,7,255,84,205,27,1,134,2,112,0,37,158,32,0,231,91,237,255,191,170,204,255,152,7,222,0,109,192,49,0,193,166,146,255,232,19,181,255,105,142,52,255,103,16,27,1,253,200,165,0,195,217,4,255,52,189,144,255,123,155,160,254,87,130,54,255,78,120,61,255,14,56,41,0,25,41,125,255,87,168,245,0,214,165,70,0,212,169,6,255,219,211,194,254,72,93,164,255,197,33,103,255,43,142,141,0,131,225,172,0,244,105,28,0,68,68,225,0,136,84,13,255,130,57,40,254,139,77,56,0,84,150,53,0,54,95,157,0,144,13,177,254,95,115,186,0,117,23,118,255,244,166,241,255,11,186,135,0,178,106,203,255,97,218,93,0,43,253,45,0,164,152,4,0,139,118,239,0,96,1,24,254,235,153,211,255,168,110,20,255,50,239,176,0,114,41,232,0,193,250,53,0,254,160,111,254,136,122,41,255,97,108,67,0,215,152,23,255,140,209,212,0,42,189,163,0,202,42,50,255,106,106,189,255,190,68,217,255,233,58,117,0,229,220,243,1,197,3,4,0,37,120,54,254,4,156,134,255,36,61,171,254,165,136,100,255,212,232,14,0,90,174,10,0,216,198,65,255,12,3,64,0,116,113,115,255,248,103,8,0,231,125,18,255,160,28,197,0,30,184,35,1,223,73,249,255,123,20,46,254,135,56,37,255,173,13,229,1,119,161,34,255,245,61,73,0,205,125,112,0,137,104,134,0,217,246,30,255,237,142,143,0,65,159,102,255,108,164,190,0,219,117,173,255,34,37,120,254,200,69,80,0,31,124,218,254,74,27,160,255,186,154,199,255,71,199,252,0,104,81,159,1,17,200,39,0,211,61,192,1,26,238,91,0,148,217,12,0,59,91,213,255,11,81,183,255,129,230,122,255,114,203,145,1,119,180,66,255,72,138,180,0,224,149,106,0,119,82,104,255,208,140,43,0,98,9,182,255,205,101,134,255,18,101,38,0,95,197,166,255,203,241,147,0,62,208,145,255,133,246,251,0,2,169,14,0,13,247,184,0,142,7,254,0,36,200,23,255,88,205,223,0,91,129,52,255,21,186,30,0,143,228,210,1,247,234,248,255,230,69,31,254,176,186,135,255,238,205,52,1,139,79,43,0,17,176,217,254,32,243,67,0,242,111,233,0,44,35,9,255,227,114,81,1,4,71,12,255,38,105,191,0,7,117,50,255,81,79,16,0,63,68,65,255,157,36,110,255,77,241,3,255,226,45,251,1,142,25,206,0,120,123,209,1,28,254,238,255,5,128,126,255,91,222,215,255,162,15,191,0,86,240,73,0,135,185,81,254,44,241,163,0,212,219,210,255,112,162,155,0,207,101,118,0,168,72,56,255,196,5,52,0,72,172,242,255,126,22,157,255,146,96,59,255,162,121,152,254,140,16,95,0,195,254,200,254,82,150,162,0,119,43,145,254,204,172,78,255,166,224,159,0,104,19,237,255,245,126,208,255,226,59,213,0,117,217,197,0,152,72,237],"i8",ALLOC_NONE,Runtime.GLOBAL_BASE+10240);allocate([220,31,23,254,14,90,231,255,188,212,64,1,60,101,246,255,85,24,86,0,1,177,109,0,146,83,32,1,75,182,192,0,119,241,224,0,185,237,27,255,184,101,82,1,235,37,77,255,253,134,19,0,232,246,122,0,60,106,179,0,195,11,12,0,109,66,235,1,125,113,59,0,61,40,164,0,175,104,240,0,2,47,187,255,50,12,141,0,194,139,181,255,135,250,104,0,97,92,222,255,217,149,201,255,203,241,118,255,79,151,67,0,122,142,218,255,149,245,239,0,138,42,200,254,80,37,97,255,124,112,167,255,36,138,87,255,130,29,147,255,241,87,78,255,204,97,19,1,177,209,22,255,247,227,127,254,99,119,83,255,212,25,198,1,16,179,179,0,145,77,172,254,89,153,14,255,218,189,167,0,107,233,59,255,35,33,243,254,44,112,112,255,161,127,79,1,204,175,10,0,40,21,138,254,104,116,228,0,199,95,137,255,133,190,168,255,146,165,234,1,183,99,39,0,183,220,54,254,255,222,133,0,162,219,121,254,63,239,6,0,225,102,54,255,251,18,246,0,4,34,129,1,135,36,131,0,206,50,59,1,15,97,183,0,171,216,135,255,101,152,43,255,150,251,91,0,38,145,95,0,34,204,38,254,178,140,83,255,25,129,243,255,76,144,37,0,106,36,26,254,118,144,172,255,68,186,229,255,107,161,213,255,46,163,68,255,149,170,253,0,187,17,15,0,218,160,165,255,171,35,246,1,96,13,19,0,165,203,117,0,214,107,192,255,244,123,177,1,100,3,104,0,178,242,97,255,251,76,130,255,211,77,42,1,250,79,70,255,63,244,80,1,105,101,246,0,61,136,58,1,238,91,213,0,14,59,98,255,167,84,77,0,17,132,46,254,57,175,197,255,185,62,184,0,76,64,207,0,172,175,208,254,175,74,37,0,138,27,211,254,148,125,194,0,10,89,81,0,168,203,101,255,43,213,209,1,235,245,54,0,30,35,226,255,9,126,70,0,226,125,94,254,156,117,20,255,57,248,112,1,230,48,64,255,164,92,166,1,224,214,230,255,36,120,143,0,55,8,43,255,251,1,245,1,106,98,165,0,74,107,106,254,53,4,54,255,90,178,150,1,3,120,123,255,244,5,89,1,114,250,61,255,254,153,82,1,77,15,17,0,57,238,90,1,95,223,230,0,236,52,47,254,103,148,164,255,121,207,36,1,18,16,185,255,75,20,74,0,187,11,101,0,46,48,129,255,22,239,210,255,77,236,129,255,111,77,204,255,61,72,97,255,199,217,251,255,42,215,204,0,133,145,201,255,57,230,146,1,235,100,198,0,146,73,35,254,108,198,20,255,182,79,210,255,82,103,136,0,246,108,176,0,34,17,60,255,19,74,114,254,168,170,78,255,157,239,20,255,149,41,168,0,58,121,28,0,79,179,134,255,231,121,135,255,174,209,98,255,243,122,190,0,171,166,205,0,212,116,48,0,29,108,66,255,162,222,182,1,14,119,21,0,213,39,249,255,254,223,228,255,183,165,198,0,133,190,48,0,124,208,109,255,119,175,85,255,9,209,121,1,48,171,189,255,195,71,134,1,136,219,51,255,182,91,141,254,49,159,72,0,35,118,245,255,112,186,227,255,59,137,31,0,137,44,163,0,114,103,60,254,8,213,150,0,162,10,113,255,194,104,72,0,220,131,116,255,178,79,92,0,203,250,213,254,93,193,189,255,130,255,34,254,212,188,151,0,136,17,20,255,20,101,83,255,212,206,166,0,229,238,73,255,151,74,3,255,168,87,215,0,155,188,133,255,166,129,73,0,240,79,133,255,178,211,81,255,203,72,163,254,193,168,165,0,14,164,199,254,30,255,204,0,65,72,91,1,166,74,102,255,200,42,0,255,194,113,227,255,66,23,208,0,229,216,100,255,24,239,26,0,10,233,62,255,123,10,178,1,26,36,174,255,119,219,199,1,45,163,190,0,16,168,42,0,166,57,198,255,28,26,26,0,126,165,231,0,251,108,100,255,61,229,121,255,58,118,138,0,76,207,17,0,13,34,112,254,89,16,168,0,37,208,105,255,35,201,215,255,40,106,101,254,6,239,114,0,40,103,226,254,246,127,110,255,63,167,58,0,132,240,142,0,5,158,88,255,129,73,158,255,94,89,146,0,230,54,146,0,8,45,173,0,79,169,1,0,115,186,247,0,84,64,131,0,67,224,253,255,207,189,64,0,154,28,81,1,45,184,54,255,87,212,224,255,0,96,73,255,129,33,235,1,52,66,80,255,251,174,155,255,4,179,37,0,234,164,93,254,93,175,253,0,198,69,87,255,224,106,46,0,99,29,210,0,62,188,114,255,44,234,8,0,169,175,247,255,23,109,137,255,229,182,39,0,192,165,94,254,245,101,217,0,191,88,96,0,196,94,99,255,106,238,11,254,53,126,243,0,94,1,101,255,46,147,2,0,201,124,124,255,141,12,218,0,13,166,157,1,48,251,237,255,155,250,124,255,106,148,146,255,182,13,202,0,28,61,167,0,217,152,8,254,220,130,45,255,200,230,255,1,55,65,87,255,93,191,97,254,114,251,14,0,32,105,92,1,26,207,141,0,24,207,13,254,21,50,48,255,186,148,116,255,211,43,225,0,37,34,162,254,164,210,42,255,68,23,96,255,182,214,8,255,245,117,137,255,66,195,50,0,75,12,83,254,80,140,164,0,9,165,36,1,228,110,227,0,241,17,90,1,25,52,212,0,6,223,12,255,139,243,57,0,12,113,75,1,246,183,191,255,213,191,69,255,230,15,142,0,1,195,196,255,138,171,47,255,64,63,106,1,16,169,214,255,207,174,56,1,88,73,133,255,182,133,140,0,177,14,25,255,147,184,53,255,10,227,161,255,120,216,244,255,73,77,233,0,157,238,139,1,59,65,233,0,70,251,216,1,41,184,153,255,32,203,112,0,146,147,253,0,87,101,109,1,44,82,133,255,244,150,53,255,94,152,232,255,59,93,39,255,88,147,220,255,78,81,13,1,32,47,252,255,160,19,114,255,93,107,39,255,118,16,211,1,185,119,209,255,227,219,127,254,88,105,236,255,162,110,23,255,36,166,110,255,91,236,221,255,66,234,116,0,111,19,244,254,10,233,26,0,32,183,6,254,2,191,242,0,218,156,53,254,41,60,70,255,168,236,111,0,121,185,126,255,238,142,207,255,55,126,52,0,220,129,208,254,80,204,164,255,67,23,144,254,218,40,108,255,127,202,164,0,203,33,3,255,2,158,0,0,37,96,188,255,192,49,74,0,109,4,0,0,111,167,10,254,91,218,135,255,203,66,173,255,150,194,226,0,201,253,6,255,174,102,121,0,205,191,110,0,53,194,4,0,81,40,45,254,35,102,143,255,12,108,198,255,16,27,232,255,252,71,186,1,176,110,114,0,142,3,117,1,113,77,142,0,19,156,197,1,92,47,252,0,53,232,22,1,54,18,235,0,46,35,189,255,236,212,129,0,2,96,208,254,200,238,199,255,59,175,164,255,146,43,231,0,194,217,52,255,3,223,12,0,138,54,178,254,85,235,207,0,232,207,34,0,49,52,50,255,166,113,89,255,10,45,216,255,62,173,28,0,111,165,246,0,118,115,91,255,128,84,60,0,167,144,203,0,87,13,243,0,22,30,228,1,177,113,146,255,129,170,230,254,252,153,129,255,145,225,43,0,70,231,5,255,122,105,126,254,86,246,148,255,110,37,154,254,209,3,91,0,68,145,62,0,228,16,165,255,55,221,249,254,178,210,91,0,83,146,226,254,69,146,186,0,93,210,104,254,16,25,173,0,231,186,38,0,189,122,140,255,251,13,112,255,105,110,93,0,251,72,170,0,192,23,223,255,24,3,202,1,225,93,228,0,153,147,199,254,109,170,22,0,248,101,246,255,178,124,12,255,178,254,102,254,55,4,65,0,125,214,180,0,183,96,147,0,45,117,23,254,132,191,249,0,143,176,203,254,136,183,54,255,146,234,177,0,146,101,86,255,44,123,143,1,33,209,152,0,192,90,41,254,83,15,125,255,213,172,82,0,215,169,144,0,16,13,34,0,32,209,100,255,84,18,249,1,197,17,236,255,217,186,230,0,49,160,176,255,111,118,97,255,237,104,235,0,79,59,92,254,69,249,11,255,35,172,74,1,19,118,68,0,222,124,165,255,180,66,35,255,86,174,246,0,43,74,111,255,126,144,86,255,228,234,91,0,242,213,24,254,69,44,235,255,220,180,35,0,8,248,7,255,102,47,92,255,240,205,102,255,113,230,171,1,31,185,201,255,194,246,70,255,122,17,187,0,134,70,199,255,149,3,150,255,117,63,103,0,65,104,123,255,212,54,19,1,6,141,88,0,83,134,243,255,136,53,103,0,169,27,180,0,177,49,24,0,111,54,167,0,195,61,215,255,31,1,108,1,60,42,70,0,185,3,162,255,194,149,40,255,246,127,38,254,190,119,38,255,61,119,8,1,96,161,219,255,42,203,221,1,177,242,164,255,245,159,10,0,116,196,0,0,5,93,205,254,128,127,179,0,125,237,246,255,149,162,217,255,87,37,20,254,140,238,192,0,9,9,193,0,97,1,226,0,29,38,10,0,0,136,63,255,229,72,210,254,38,134,92,255,78,218,208,1,104,36,84,255,12,5,193,255,242,175,61,255,191,169,46,1,179,147,147,255,113,190,139,254,125,172,31,0,3,75,252,254,215,36,15,0,193,27,24,1,255,69,149,255,110,129,118,0,203,93,249,0,138,137,64,254,38,70,6,0,153,116,222,0,161,74,123,0,193,99,79,255,118,59,94,255,61,12,43,1,146,177,157,0,46,147,191,0,16,255,38,0,11,51,31,1,60,58,98,255,111,194,77,1,154,91,244,0,140,40,144,1,173,10,251,0,203,209,50,254,108,130,78,0,228,180,90,0,174,7,250,0,31,174,60,0,41,171,30,0,116,99,82,255,118,193,139,255,187,173,198,254,218,111,56,0,185,123,216,0,249,158,52,0,52,180,93,255,201,9,91,255,56,45,166,254,132,155,203,255,58,232,110,0,52,211,89,255,253,0,162,1,9,87,183,0,145,136,44,1,94,122,245,0,85,188,171,1,147,92,198,0,0,8,104,0,30,95,174,0,221,230,52,1,247,247,235,255,137,174,53,255,35,21,204,255,71,227,214,1,232,82,194,0,11,48,227,255,170,73,184,255,198,251,252,254,44,112,34,0,131,101,131,255,72,168,187,0,132,135,125,255,138,104,97,255,238,184,168,255,243,104,84,255,135,216,226,255,139,144,237,0,188,137,150,1,80,56,140,255,86,169,167,255,194,78,25,255,220,17,180,255,17,13,193,0,117,137,212,255,141,224,151,0,49,244,175,0,193,99,175,255,19,99,154,1,255,65,62,255,156,210,55,255,242,244,3,255,250,14,149,0,158,88,217,255,157,207,134,254,251,232,28,0,46,156,251,255,171,56,184,255,239,51,234,0,142,138,131,255,25,254,243,1,10,201,194,0,63,97,75,0,210,239,162,0,192,200,31,1,117,214,243,0,24,71,222,254,54,40,232,255,76,183,111,254,144,14,87,255,214,79,136,255,216,196,212,0,132,27,140,254,131,5,253,0,124,108,19,255,28,215,75,0,76,222,55,254,233,182,63,0,68,171,191,254,52,111,222,255,10,105,77,255,80,170,235,0,143,24,88,255,45,231,121,0,148,129,224,1,61,246,84,0,253,46,219,255,239,76,33,0,49,148,18,254,230,37,69,0,67,134,22,254,142,155,94,0,31,157,211,254,213,42,30,255,4,228,247,254,252,176,13,255,39,0,31,254,241,244,255,255,170,45,10,254,253,222,249,0,222,114,132,0,255,47,6,255,180,163,179,1,84,94,151,255,89,209,82,254,229,52,169,255,213,236,0,1,214,56,228,255,135,119,151,255,112,201,193,0,83,160,53,254,6,151,66,0,18,162,17,0,233,97,91,0,131,5,78,1,181,120,53,255,117,95,63,255,237,117,185,0,191,126,136,255,144,119,233,0,183,57,97,1,47,201,187,255,167,165,119,1,45,100,126,0,21,98,6,254,145,150,95,255,120,54,152,0,209,98,104,0,143,111,30,254,184,148,249,0,235,216,46,0,248,202,148,255,57,95,22,0,242,225,163,0,233,247,232,255,71,171,19,255,103,244,49,255,84,103,93,255,68,121,244,1,82,224,13,0,41,79,43,255,249,206,167,255,215,52,21,254,192,32,22,255,247,111,60,0,101,74,38,255,22,91,84,254,29,28,13,255,198,231,215,254,244,154,200,0,223,137,237,0,211,132,14,0,95,64,206,255,17,62,247,255,233,131,121,1,93,23,77,0,205,204,52,254,81,189,136,0,180,219,138,1,143,18,94,0,204,43,140,254,188,175,219,0,111,98,143,255,151,63,162,255,211,50,71,254,19,146,53,0,146,45,83,254,178,82,238,255,16,133,84,255,226,198,93,255,201,97,20,255,120,118,35,255,114,50,231,255,162,229,156,255,211,26,12,0,114,39,115,255,206,212,134,0,197,217,160,255,116,129,94,254,199,215,219,255,75,223,249,1,253,116,181,255,232,215,104,255,228,130,246,255,185,117,86,0,14,5,8,0,239,29,61,1,237,87,133,255,125,146,137,254,204,168,223,0,46,168,245,0,154,105,22,0,220,212,161,255,107,69,24,255,137,218,181,255,241,84,198,255,130,122,211,255,141,8,153,255,190,177,118,0,96,89,178,0,255,16,48,254,122,96,105,255,117,54,232,255,34,126,105,255,204,67,166,0,232,52,138,255,211,147,12,0,25,54,7,0,44,15,215,254,51,236,45,0,190,68,129,1,106,147,225,0,28,93,45,254,236,141,15,255,17,61,161,0,220,115,192,0,236,145,24,254,111,168,169,0,224,58,63,255,127,164,188,0,82,234,75,1,224,158,134,0,209,68,110,1,217,166,217,0,70,225,166,1,187,193,143,255,16,7,88,255,10,205,140,0,117,192,156,1,17,56,38,0,27,124,108,1,171,215,55,255,95,253,212,0,155,135,168,255,246,178,153,254,154,68,74,0,232,61,96,254,105,132,59,0,33,76,199,1,189,176,130,255,9,104,25,254,75,198,102,255,233,1,112,0,108,220,20,255,114,230,70,0,140,194,133,255,57,158,164,254,146,6,80,255,169,196,97,1,85,183,130,0,70,158,222,1,59,237,234,255,96,25,26,255,232,175,97,255,11,121,248,254,88,35,194,0,219,180,252,254,74,8,227,0,195,227,73,1,184,110,161,255,49,233,164,1,128,53,47,0,82,14,121,255,193,190,58,0,48,174,117,255,132,23,32,0,40,10,134,1,22,51,25,255,240,11,176,255,110,57,146,0,117,143,239,1,157,101,118,255,54,84,76,0,205,184,18,255,47,4,72,255,78,112,85,255,193,50,66,1,93,16,52,255,8,105,134,0,12,109,72,255,58,156,251,0,144,35,204,0,44,160,117,254,50,107,194,0,1,68,165,255,111,110,162,0,158,83,40,254,76,214,234,0,58,216,205,255,171,96,147,255,40,227,114,1,176,227,241,0,70,249,183,1,136,84,139,255,60,122,247,254,143,9,117,255,177,174,137,254,73,247,143,0,236,185,126,255,62,25,247,255,45,64,56,255,161,244,6,0,34,57,56,1,105,202,83,0,128,147,208,0,6,103,10,255,74,138,65,255,97,80,100,255,214,174,33,255,50,134,74,255,110,151,130,254,111,84,172,0,84,199,75,254,248,59,112,255,8,216,178,1,9,183,95,0,238,27,8,254,170,205,220,0,195,229,135,0,98,76,237,255,226,91,26,1,82,219,39,255,225,190,199,1,217,200,121,255,81,179,8,255,140,65,206,0,178,207,87,254,250,252,46,255,104,89,110,1,253,189,158,255,144,214,158,255,160,245,54,255,53,183,92,1,21,200,194,255,146,33,113,1,209,1,255,0,235,106,43,255,167,52,232,0,157,229,221,0,51,30,25,0,250,221,27,1,65,147,87,255,79,123,196,0,65,196,223,255,76,44,17,1,85,241,68,0,202,183,249,255,65,212,212,255,9,33,154,1,71,59,80,0,175,194,59,255,141,72,9,0,100,160,244,0,230,208,56,0,59,25,75,254,80,194,194,0,18,3,200,254,160,159,115,0,132,143,247,1,111,93,57,255,58,237,11,1,134,222,135,255,122,163,108,1,123,43,190,255,251,189,206,254,80,182,72,255,208,246,224,1,17,60,9,0,161,207,38,0,141,109,91,0,216,15,211,255,136,78,110,0,98,163,104,255,21,80,121,255,173,178,183,1,127,143,4,0,104,60,82,254,214,16,13,255,96,238,33,1,158,148,230,255,127,129,62,255,51,255,210,255,62,141,236,254,157,55,224,255,114,39,244,0,192,188,250,255,228,76,53,0,98,84,81,255,173,203,61,254,147,50,55,255,204,235,191,0,52,197,244,0,88,43,211,254,27,191,119,0,188,231,154,0,66,81,161,0,92,193,160,1,250,227,120,0,123,55,226,0,184,17,72,0,133,168,10,254,22,135,156,255,41,25,103,255,48,202,58,0,186,149,81,255,188,134,239,0,235,181,189,254,217,139,188,255,74,48,82,0,46,218,229,0,189,253,251,0,50,229,12,255,211,141,191,1,128,244,25,255,169,231,122,254,86,47,189,255,132,183,23,255,37,178,150,255,51,137,253,0,200,78,31,0,22,105,50,0,130,60,0,0,132,163,91,254,23,231,187,0,192,79,239,0,157,102,164,255,192,82,20,1,24,181,103,255,240,9,234,0,1,123,164,255,133,233,0,255,202,242,242,0,60,186,245,0,241,16,199,255,224,116,158,254,191,125,91,255,224,86,207,0,121,37,231,255,227,9,198,255,15,153,239,255,121,232,217,254,75,112,82,0,95,12,57,254,51,214,105,255,148,220,97,1,199,98,36,0,156,209,12,254,10,212,52,0,217,180,55,254,212,170,232,255,216,20,84,255,157,250,135,0,157,99,127,254,1,206,41,0,149,36,70,1,54,196,201,255,87,116,0,254,235,171,150,0,27,163,234,0,202,135,180,0,208,95,0,254,123,156,93,0,183,62,75,0,137,235,182,0,204,225,255,255,214,139,210,255,2,115,8,255,29,12,111,0,52,156,1,0,253,21,251,255,37,165,31,254,12,130,211,0,106,18,53,254,42,99,154,0,14,217,61,254,216,11,92,255,200,197,112,254,147,38,199,0,36,252,120,254,107,169,77,0,1,123,159,255,207,75,102,0,163,175,196,0,44,1,240,0,120,186,176,254,13,98,76,255,237,124,241,255,232,146,188,255,200,96,224,0,204,31,41,0,208,200,13,0,21,225,96,255,175,156,196,0,247,208,126,0,62,184,244,254,2,171,81,0,85,115,158,0,54,64,45,255,19,138,114,0,135,71,205,0,227,47,147,1,218,231,66,0,253,209,28,0,244,15,173,255,6,15,118,254,16,150,208,255,185,22,50,255,86,112,207,255,75,113,215,1,63,146,43,255,4,225,19,254,227,23,62,255,14,255,214,254,45,8,205,255,87,197,151,254,210,82,215,255,245,248,247,255,128,248,70,0,225,247,87,0,90,120,70,0,213,245,92,0,13,133,226,0,47,181,5,1,92,163,105,255,6,30,133,254,232,178,61,255,230,149,24,255,18,49,158,0,228,100,61,254,116,243,251,255,77,75,92,1,81,219,147,255,76,163,254,254,141,213,246,0,232,37,152,254,97,44,100,0,201,37,50,1,212,244,57,0,174,171,183,255,249,74,112,0,166,156,30,0,222,221,97,255,243,93,73,254,251,101,100,255,216,217,93,255,254,138,187,255,142,190,52,255,59,203,177,255,200,94,52,0,115,114,158,255,165,152,104,1,126,99,226,255,118,157,244,1,107,200,16,0,193,90,229,0,121,6,88,0,156,32,93,254,125,241,211,255,14,237,157,255,165,154,21,255,184,224,22,255,250,24,152,255,113,77,31,0,247,171,23,255,237,177,204,255,52,137,145,255,194,182,114,0,224,234,149,0,10,111,103,1,201,129,4,0,238,142,78,0,52,6,40,255,110,213,165,254,60,207,253,0,62,215,69,0,96,97,0,255,49,45,202,0,120,121,22,255,235,139,48,1,198,45,34,255,182,50,27,1,131,210,91,255,46,54,128,0,175,123,105,255,198,141,78,254,67,244,239,255,245,54,103,254,78,38,242,255,2,92,249,254,251,174,87,255,139,63,144,0,24,108,27,255,34,102,18,1,34,22,152,0,66,229,118,254,50,143,99,0,144,169,149,1,118,30,152,0,178,8,121,1,8,159,18,0,90,101,230,255,129,29,119,0,68,36,11,1,232,183,55,0,23,255,96,255,161,41,193,255,63,139,222,0,15,179,243,0,255,100,15,255,82,53,135,0,137,57,149,1,99,240,170,255,22,230,228,254,49,180,82,255,61,82,43,0,110,245,217,0,199,125,61,0,46,253,52,0,141,197,219,0,211,159,193,0,55,121,105,254,183,20,129,0,169,119,170,255,203,178,139,255,135,40,182,255,172,13,202,255,65,178,148,0,8,207,43,0,122,53,127,1,74,161,48,0,227,214,128,254,86,11,243,255,100,86,7,1,245,68,134,255,61,43,21,1,152,84,94,255,190,60,250,254,239,118,232,255,214,136,37,1,113,76,107,255,93,104,100,1,144,206,23,255,110,150,154,1,228,103,185,0,218,49,50,254,135,77,139,255,185,1,78,0,0,161,148,255,97,29,233,255,207,148,149,255,160,168,0,0,91,128,171,255,6,28,19,254,11,111,247,0,39,187,150,255,138,232,149,0,117,62,68,255,63,216,188,255,235,234,32,254,29,57,160,255,25,12,241,1,169,60,191,0,32,131,141,255,237,159,123,255,94,197,94,254,116,254,3,255,92,179,97,254,121,97,92,255,170,112,14,0,21,149,248,0,248,227,3,0,80,96,109,0,75,192,74,1,12,90,226,255,161,106,68,1,208,114,127,255,114,42,255,254,74,26,74,255,247,179,150,254,121,140,60,0,147,70,200,255,214,40,161,255,161,188,201,255,141,65,135,255,242,115,252,0,62,47,202,0,180,149,255,254,130,55,237,0,165,17,186,255,10,169,194,0,156,109,218,255,112,140,123,255,104,128,223,254,177,142,108,255,121,37,219,255,128,77,18,255,111,108,23,1,91,192,75,0,174,245,22,255,4,236,62,255,43,64,153,1,227,173,254,0,237,122,132,1,127,89,186,255,142,82,128,254,252,84,174,0,90,179,177,1,243,214,87,255,103,60,162,255,208,130,14,255,11,130,139,0,206,129,219,255,94,217,157,255,239,230,230,255,116,115,159,254,164,107,95,0,51,218,2,1,216,125,198,255,140,202,128,254,11,95,68,255,55,9,93,254,174,153,6,255,204,172,96,0,69,160,110,0,213,38,49,254,27,80,213,0,118,125,114,0,70,70,67,255,15,142,73,255,131,122,185,255,243,20,50,254,130,237,40,0,210,159,140,1,197,151,65,255,84,153,66,0,195,126,90,0,16,238,236,1,118,187,102,255,3,24,133,255,187,69,230,0,56,197,92,1,213,69,94,255,80,138,229,1,206,7,230,0,222,111,230,1,91,233,119,255,9,89,7,1,2,98,1,0,148,74,133,255,51,246,180,255,228,177,112,1,58,189,108,255,194,203,237,254,21,209,195,0,147,10,35,1,86,157,226,0,31,163,139,254,56,7,75,255,62,90,116,0,181,60,169,0,138,162,212,254,81,167,31,0,205,90,112,255,33,112,227,0,83,151,117,1,177,224,73,255,174,144,217,255,230,204,79,255,22,77,232,255,114,78,234,0,224,57,126,254,9,49,141,0,242,147,165,1,104,182,140,255,167,132,12,1,123,68,127,0,225,87,39,1,251,108,8,0,198,193,143,1,121,135,207,255,172,22,70,0,50,68,116,255,101,175,40,255,248,105,233,0,166,203,7,0,110,197,218,0,215,254,26,254,168,226,253,0,31,143,96,0,11,103,41,0,183,129,203,254,100,247,74,255,213,126,132,0,210,147,44,0,199,234,27,1,148,47,181,0,155,91,158,1,54,105,175,255,2,78,145,254,102,154,95,0,128,207,127,254,52,124,236,255,130,84,71,0,221,243,211,0,152,170,207,0,222,106,199,0,183,84,94,254,92,200,56,255,138,182,115,1,142,96,146,0,133,136,228,0,97,18,150,0,55,251,66,0,140,102,4,0,202,103,151,0,30,19,248,255,51,184,207,0,202,198,89,0,55,197,225,254,169,95,249,255,66,65,68,255,188,234,126,0,166,223,100,1,112,239,244,0,144,23,194,0,58,39,182,0,244,44,24,254,175,68,179,255,152,118,154,1,176,162,130,0,217,114,204,254,173,126,78,255,33,222,30,255,36,2,91,255,2,143,243,0,9,235,215,0,3,171,151,1,24,215,245,255,168,47,164,254,241,146,207,0,69,129,180,0,68,243,113,0,144,53,72,254,251,45,14,0,23,110,168,0,68,68,79,255,110,70,95,254,174,91,144,255,33,206,95,255,137,41,7,255,19,187,153,254,35,255,112,255,9,145,185,254,50,157,37,0,11,112,49,1,102,8,190,255,234,243,169,1,60,85,23,0,74,39,189,0,116,49,239,0,173,213,210,0,46,161,108,255,159,150,37,0,196,120,185,255,34,98,6,255,153,195,62,255,97,230,71,255,102,61,76,0,26,212,236,255,164,97,16,0,198,59,146,0,163,23,196,0,56,24,61,0,181,98,193,0,251,147,229,255,98,189,24,255,46,54,206,255,234,82,246,0,183,103,38,1,109,62,204,0,10,240,224,0,146,22,117,255,142,154,120,0,69,212,35,0,208,99,118,1,121,255,3,255,72,6,194,0,117,17,197,255,125,15,23,0,154,79,153,0,214,94,197,255,185,55,147,255,62,254,78,254,127,82,153,0,110,102,63,255,108,82,161,255,105,187,212,1,80,138,39,0,60,255,93,255,72,12,186,0,210,251,31,1,190,167,144,255,228,44,19,254,128,67,232,0,214,249,107,254,136,145,86,255,132,46,176,0,189,187,227,255,208,22,140,0,217,211,116,0,50,81,186,254,139,250,31,0,30,64,198,1,135,155,100,0,160,206,23,254,187,162,211,255,16,188,63,0,254,208,49,0,85,84,191,0,241,192,242,255,153,126,145,1,234,162,162,255,230,97,216,1,64,135,126,0,190,148,223,1,52,0,43,255,28,39,189,1,64,136,238,0,175,196,185,0,98,226,213,255,127,159,244,1,226,175,60,0,160,233,142,1,180,243,207,255,69,152,89,1,31,101,21,0,144,25,164,254,139,191,209,0,91,25,121,0,32,147,5,0,39,186,123,255,63,115,230,255,93,167,198,255,143,213,220,255,179,156,19,255,25,66,122,0,214,160,217,255,2,45,62,255,106,79,146,254,51,137,99,255,87,100,231,255,175,145,232,255,101,184,1,255,174,9,125,0,82,37,161,1,36,114,141,255,48,222,142,255,245,186,154,0,5,174,221,254,63,114,155,255,135,55,160,1,80,31,135,0,126,250,179,1,236,218,45,0,20,28,145,1,16,147,73,0,249,189,132,1,17,189,192,255,223,142,198,255,72,20,15,255,250,53,237,254,15,11,18,0,27,211,113,254,213,107,56,255,174,147,146,255,96,126,48,0,23,193,109,1,37,162,94,0,199,157,249,254,24,128,187,255,205,49,178,254,93,164,42,255,43,119,235,1,88,183,237,255,218,210,1,255,107,254,42,0,230,10,99,255,162,0,226,0,219,237,91,0,129,178,203,0,208,50,95,254,206,208,95,255,247,191,89,254,110,234,79,255,165,61,243,0,20,122,112,255,246,246,185,254,103,4,123,0,233,99,230,1,219,91,252,255,199,222,22,255,179,245,233,255,211,241,234,0,111,250,192,255,85,84,136,0,101,58,50,255,131,173,156,254,119,45,51,255,118,233,16,254,242,90,214,0,94,159,219,1,3,3,234,255,98,76,92,254,80,54,230,0,5,228,231,254,53,24,223,255,113,56,118,1,20,132,1,255,171,210,236,0,56,241,158,255,186,115,19,255,8,229,174,0,48,44,0,1,114,114,166,255,6,73,226,255,205,89,244,0,137,227,75,1,248,173,56,0,74,120,246,254,119,3,11,255,81,120,198,255,136,122,98,255,146,241,221,1,109,194,78,255,223,241,70,1,214,200,169,255,97,190,47,255,47,103,174,255,99,92,72,254,118,233,180,255,193,35,233,254,26,229,32,255,222,252,198,0,204,43,71,255,199,84,172,0,134,102,190,0,111,238,97,254,230,40,230,0,227,205,64,254,200,12,225,0,166,25,222,0,113,69,51,255,143,159,24,0,167,184,74,0,29,224,116,254,158,208,233,0,193,116,126,255,212,11,133,255,22,58,140,1,204,36,51,255,232,30,43,0,235,70,181,255,64,56,146,254,169,18,84,255,226,1,13,255,200,50,176,255,52,213,245,254,168,209,97,0,191,71,55,0,34,78,156,0,232,144,58,1,185,74,189,0,186,142,149,254,64,69,127,255,161,203,147,255,176,151,191,0,136,231,203,254,163,182,137,0,161,126,251,254,233,32,66,0,68,207,66,0,30,28,37,0,93,114,96,1,254,92,247,255,44,171,69,0,202,119,11,255,188,118,50,1,255,83,136,255,71,82,26,0,70,227,2,0,32,235,121,1,181,41,154,0,71,134,229,254,202,255,36,0,41,152,5,0,154,63,73,255,34,182,124,0,121,221,150,255,26,204,213,1,41,172,87,0,90,157,146,255,109,130,20,0,71,107,200,255,243,102,189,0,1,195,145,254,46,88,117,0,8,206,227,0,191,110,253,255,109,128,20,254,134,85,51,255,137,177,112,1,216,34,22,255,131,16,208,255,121,149,170,0,114,19,23,1,166,80,31,255,113,240,122,0,232,179,250,0,68,110,180,254,210,170,119,0,223,108,164,255,207,79,233,255,27,229,226,254,209,98,81,255,79,68,7,0,131,185,100,0,170,29,162,255,17,162,107,255,57,21,11,1,100,200,181,255,127,65,166,1,165,134,204,0,104,167,168,0,1,164,79,0,146,135,59,1,70,50,128,255,102,119,13,254,227,6,135,0,162,142,179,255,160,100,222,0,27,224,219,1,158,93,195,255,234,141,137,0,16,24,125,255,238,206,47,255,97,17,98,255,116,110,12,255,96,115,77,0,91,227,232,255,248,254,79,255,92,229,6,254,88,198,139,0,206,75,129,0,250,77,206,255,141,244,123,1,138,69,220,0,32,151,6,1,131,167,22,255,237,68,167,254,199,189,150,0,163,171,138,255,51,188,6,255,95,29,137,254,148,226,179,0,181,107,208,255,134,31,82,255,151,101,45,255,129,202,225,0,224,72,147,0,48,138,151,255,195,64,206,254,237,218,158,0,106,29,137,254,253,189,233,255,103,15,17,255,194,97,255,0,178,45,169,254,198,225,155,0,39,48,117,255,135,106,115,0,97,38,181,0,150,47,65,255,83,130,229,254,246,38,129,0,92,239,154,254,91,99,127,0,161,111,33,255,238,217,242,255,131,185,195,255,213,191,158,255,41,150,218,0,132,169,131,0,89,84,252,1,171,70,128,255,163,248,203,254,1,50,180,255,124,76,85,1,251,111,80,0,99,66,239,255,154,237,182,255,221,126,133,254,74,204,99,255,65,147,119,255,99,56,167,255,79,248,149,255,116,155,228,255,237,43,14,254,69,137,11,255,22,250,241,1,91,122,143,255,205,249,243,0,212,26,60,255,48,182,176,1,48,23,191,255,203,121,152,254,45,74,213,255,62,90,18,254,245,163,230,255,185,106,116,255,83,35,159,0,12,33,2,255,80,34,62,0,16,87,174,255,173,101,85,0,202,36,81,254,160,69,204,255,64,225,187,0,58,206,94,0,86,144,47,0,229,86,245,0,63,145,190,1,37,5,39,0,109,251,26,0,137,147,234,0,162,121,145,255,144,116,206,255,197,232,185,255,183,190,140,255,73,12,254,255,139,20,242,255,170,90,239,255,97,66,187,255,245,181,135,254,222,136,52,0,245,5,51,254,203,47,78,0,152,101,216,0,73,23,125,0,254,96,33,1,235,210,73,255,43,209,88,1,7,129,109,0,122,104,228,254,170,242,203,0,242,204,135,255,202,28,233,255,65,6,127,0,159,144,71,0,100,140,95,0,78,150,13,0,251,107,118,1,182,58,125,255,1,38,108,255,141,189,209,255,8,155,125,1,113,163,91,255,121,79,190,255,134,239,108,255,76,47,248,0,163,228,239,0,17,111,10,0,88,149,75,255,215,235,239,0,167,159,24,255,47,151,108,255,107,209,188,0,233,231,99,254,28,202,148,255,174,35,138,255,110,24,68,255,2,69,181,0,107,102,82,0,102,237,7,0,92,36,237,255,221,162,83,1,55,202,6,255,135,234,135,255,24,250,222,0,65,94,168,254,245,248,210,255,167,108,201,254,255,161,111,0,205,8,254,0,136,13,116,0,100,176,132,255,43,215,126,255,177,133,130,255,158,79,148,0,67,224,37,1,12,206,21,255,62,34,110,1,237,104,175,255,80,132,111,255,142,174,72,0,84,229,180,254,105,179,140,0,64,248,15,255,233,138,16,0,245,67,123,254,218,121,212,255,63,95,218,1,213,133,137,255,143,182,82,255,48,28,11,0,244,114,141,1,209,175,76,255,157,181,150,255,186,229,3,255,164,157,111,1,231,189,139,0,119,202,190,255,218,106,64,255,68,235,63,254,96,26,172,255,187,47,11,1,215,18,251,255,81,84,89,0,68,58,128,0,94,113,5,1,92,129,208,255,97,15,83,254,9,28,188,0,239,9,164,0,60,205,152,0,192,163,98,255,184,18,60,0,217,182,139,0,109,59,120,255,4,192,251,0,169,210,240,255,37,172,92,254,148,211,245,255,179,65,52,0,253,13,115,0,185,174,206,1,114,188,149,255,237,90,173,0,43,199,192,255,88,108,113,0,52,35,76,0,66,25,148,255,221,4,7,255,151,241,114,255,190,209,232,0,98,50,199,0,151,150,213,255,18,74,36,1,53,40,7,0,19,135,65,255,26,172,69,0,174,237,85,0,99,95,41,0,3,56,16,0,39,160,177,255,200,106,218,254,185,68,84,255,91,186,61,254,67,143,141,255,13,244,166,255,99,114,198,0,199,110,163,255,193,18,186,0,124,239,246,1,110,68,22,0,2,235,46,1,212,60,107,0,105,42,105,1,14,230,152,0,7,5,131,0,141,104,154,255,213,3,6,0,131,228,162,255,179,100,28,1,231,123,85,255,206,14,223,1,253,96,230,0,38,152,149,1,98,137,122,0,214,205,3,255,226,152,179,255,6,133,137,0,158,69,140,255,113,162,154,255,180,243,172,255,27,189,115,255,143,46,220,255,213,134,225,255,126,29,69,0,188,43,137,1,242,70,9,0,90,204,255,255,231,170,147,0,23,56,19,254,56,125,157,255,48,179,218,255,79,182,253,255,38,212,191,1,41,235,124,0,96,151,28,0,135,148,190,0,205,249,39,254,52,96,136,255,212,44,136,255,67,209,131,255,252,130,23,255,219,128,20,255,198,129,118,0,108,101,11,0,178,5,146,1,62,7,100,255,181,236,94,254,28,26,164,0,76,22,112,255,120,102,79,0,202,192,229,1,200,176,215,0,41,64,244,255,206,184,78,0,167,45,63,1,160,35,0,255,59,12,142,255,204,9,144,255,219,94,229,1,122,27,112,0,189,105,109,255,64,208,74,255,251,127,55,1,2,226,198,0,44,76,209,0,151,152,77,255,210,23,46,1,201,171,69,255,44,211,231,0,190,37,224,255,245,196,62,255,169,181,222,255,34,211,17,0,119,241,197,255,229,35,152,1,21,69,40,255,178,226,161,0,148,179,193,0,219,194,254,1,40,206,51,255,231,92,250,1,67,153,170,0,21,148,241,0,170,69,82,255,121,18,231,255,92,114,3,0,184,62,230,0,225,201,87,255,146,96,162,255,181,242,220,0,173,187,221,1,226,62,170,255,56,126,217,1,117,13,227,255,179,44,239,0,157,141,155,255,144,221,83,0,235,209,208,0,42,17,165,1,251,81,133,0,124,245,201,254,97,211,24,255,83,214,166,0,154,36,9,255,248,47,127,0,90,219,140,255,161,217,38,254,212,147,63,255,66,84,148,1,207,3,1,0,230,134,89,1,127,78,122,255,224,155,1,255,82,136,74,0,178,156,208,255,186,25,49,255,222,3,210,1,229,150,190,255,85,162,52,255,41,84,141,255,73,123,84,254,93,17,150,0,119,19,28,1,32,22,215,255,28,23,204,255,142,241,52,255,228,52,125,0,29,76,207,0,215,167,250,254,175,164,230,0,55,207,105,1,109,187,245,255,161,44,220,1,41,101,128,255,167,16,94,0,93,214,107,255,118,72,0,254,80,61,234,255,121,175,125,0,139,169,251,0,97,39,147,254,250,196,49,255,165,179,110,254,223,70,187,255,22,142,125,1,154,179,138,255,118,176,42,1,10,174,153,0,156,92,102,0,168,13,161,255,143,16,32,0,250,197,180,255,203,163,44,1,87,32,36,0,161,153,20,255,123,252,15,0,25,227,80,0,60,88,142,0,17,22,201,1,154,205,77,255,39,63,47,0,8,122,141,0,128,23,182,254,204,39,19,255,4,112,29,255,23,36,140,255,210,234,116,254,53,50,63,255,121,171,104,255,160,219,94,0,87,82,14,254,231,42,5,0,165,139,127,254,86,78,38,0,130,60,66,254,203,30,45,255,46,196,122,1,249,53,162,255,136,143,103,254,215,210,114,0,231,7,160,254,169,152,42,255,111,45,246,0,142,131,135,255,131,71,204,255,36,226,11,0,0,28,242,255,225,138,213,255,247,46,216,254,245,3,183,0,108,252,74,1,206,26,48,255,205,54,246,255,211,198,36,255,121,35,50,0,52,216,202,255,38,139,129,254,242,73,148,0,67,231,141,255,42,47,204,0,78,116,25,1,4,225,191,255,6,147,228,0,58,88,177,0,122,165,229,255,252,83,201,255,224,167,96,1,177,184,158,255,242,105,179,1,248,198,240,0,133,66,203,1,254,36,47,0,45,24,115,255,119,62,254,0,196,225,186,254,123,141,172,0,26,85,41,255,226,111,183,0,213,231,151,0,4,59,7,255,238,138,148,0,66,147,33,255,31,246,141,255,209,141,116,255,104,112,31,0,88,161,172,0,83,215,230,254,47,111,151,0,45,38,52,1,132,45,204,0,138,128,109,254,233,117,134,255,243,190,173,254,241,236,240,0,82,127,236,254,40,223,161,255,110,182,225,255,123,174,239,0,135,242,145,1,51,209,154,0,150,3,115,254,217,164,252,255,55,156,69,1,84,94,255,255,232,73,45,1,20,19,212,255,96,197,59,254,96,251,33,0,38,199,73,1,64,172,247,255,117,116,56,255,228,17,18,0,62,138,103,1,246,229,164,255,244,118,201,254,86,32,159,255,109,34,137,1,85,211,186,0,10,193,193,254,122,194,177,0,122,238,102,255,162,218,171,0,108,217,161,1,158,170,34,0,176,47,155,1,181,228,11,255,8,156,0,0,16,75,93,0,206,98,255,1,58,154,35,0,12,243,184,254,67,117,66,255,230,229,123,0,201,42,110,0,134,228,178,254,186,108,118,255,58,19,154,255,82,169,62,255,114,143,115,1,239,196,50,255,173,48,193,255,147,2,84,255,150,134,147,254,95,232,73,0,109,227,52,254,191,137,10,0,40,204,30,254,76,52,97,255,164,235,126,0,254,124,188,0,74,182,21,1,121,29,35,255,241,30,7,254,85,218,214,255,7,84,150,254,81,27,117,255,160,159,152,254,66,24,221,255,227,10,60,1,141,135,102,0,208,189,150,1,117,179,92,0,132,22,136,255,120,199,28,0,21,129,79,254,182,9,65,0,218,163,169,0,246,147,198,255,107,38,144,1,78,175,205,255,214,5,250,254,47,88,29,255,164,47,204,255,43,55,6,255,131,134,207,254,116,100,214,0,96,140,75,1,106,220,144,0,195,32,28,1,172,81,5,255,199,179,52,255,37,84,203,0,170,112,174,0,11,4,91,0,69,244,27,1,117,131,92,0,33,152,175,255,140,153,107,255,251,135,43,254,87,138,4,255,198,234,147,254,121,152,84,255,205,101,155,1,157,9,25,0,72,106,17,254,108,153,0,255,189,229,186,0,193,8,176,255,174,149,209,0,238,130,29,0,233,214,126,1,61,226,102,0,57,163,4,1,198,111,51,255,45,79,78,1,115,210,10,255,218,9,25,255,158,139,198,255,211,82,187,254,80,133,83,0,157,129,230,1,243,133,134,255,40,136,16,0,77,107,79,255,183,85,92,1,177,204,202,0,163,71,147,255,152,69,190,0,172,51,188,1,250,210,172,255,211,242,113,1,89,89,26,255,64,66,111,254,116,152,42,0,161,39,27,255,54,80,254,0,106,209,115,1,103,124,97,0,221,230,98,255,31,231,6,0,178,192,120,254,15,217,203,255,124,158,79,0,112,145,247,0,92,250,48,1,163,181,193,255,37,47,142,254,144,189,165,255,46,146,240,0,6,75,128,0,41,157,200,254,87,121,213,0,1,113,236,0,5,45,250,0,144,12,82,0,31,108,231,0,225,239,119,255,167,7,189,255,187,228,132,255,110,189,34,0,94,44,204,1,162,52,197,0,78,188,241,254,57,20,141,0,244,146,47,1,206,100,51,0,125,107,148,254,27,195,77,0,152,253,90,1,7,143,144,255,51,37,31,0,34,119,38,255,7,197,118,0,153,188,211,0,151,20,116,254,245,65,52,255,180,253,110,1,47,177,209,0,161,99,17,255,118,222,202,0,125,179,252,1,123,54,126,255,145,57,191,0,55,186,121,0,10,243,138,0,205,211,229,255,125,156,241,254,148,156,185,255,227,19,188,255,124,41,32,255,31,34,206,254,17,57,83,0,204,22,37,255,42,96,98,0,119,102,184,1,3,190,28,0,110,82,218,255,200,204,192,255,201,145,118,0,117,204,146,0,132,32,98,1,192,194,121,0,106,161,248,1,237,88,124,0,23,212,26,0,205,171,90,255,248,48,216,1,141,37,230,255,124,203,0,254,158,168,30,255,214,248,21,0,112,187,7,255,75,133,239,255,74,227,243,255,250,147,70,0,214,120,162,0,167,9,179,255,22,158,18,0,218,77,209,1,97,109,81,255,244,33,179,255,57,52,57,255,65,172,210,255,249,71,209,255,142,169,238,0,158,189,153,255,174,254,103,254,98,33,14,0,141,76,230,255,113,139,52,255,15,58,212,0,168,215,201,255,248,204,215,1,223,68,160,255,57,154,183,254,47,231,121,0,106,166,137,0,81,136,138,0,165,43,51,0,231,139,61,0,57,95,59,254,118,98,25,255,151,63,236,1,94,190,250,255,169,185,114,1,5,250,58,255,75,105,97,1,215,223,134,0,113,99,163,1,128,62,112,0,99,106,147,0,163,195,10,0,33,205,182,0,214,14,174,255,129,38,231,255,53,182,223,0,98,42,159,255,247,13,40,0,188,210,177,1,6,21,0,255,255,61,148,254,137,45,129,255,89,26,116,254,126,38,114,0,251,50,242,254,121,134,128,255,204,249,167,254,165,235,215,0,202,177,243,0,133,141,62,0,240,130,190,1,110,175,255,0,0,20,146,1,37,210,121,255,7,39,130,0,142,250,84,255,141,200,207,0,9,95,104,255,11,244,174,0,134,232,126,0,167,1,123,254,16,193,149,255,232,233,239,1,213,70,112,255,252,116,160,254,242,222,220,255,205,85,227,0,7,185,58,0,118,247,63,1,116,77,177,255,62,245,200,254,63,18,37,255,107,53,232,254,50,221,211,0,162,219,7,254,2,94,43,0,182,62,182,254,160,78,200,255,135,140,170,0,235,184,228,0,175,53,138,254,80,58,77,255,152,201,2,1,63,196,34,0,5,30,184,0,171,176,154,0,121,59,206,0,38,99,39,0,172,80,77,254,0,134,151,0,186,33,241,254,94,253,223,255,44,114,252,0,108,126,57,255,201,40,13,255,39,229,27,255,39,239,23,1,151,121,51,255,153,150,248,0,10,234,174,255,118,246,4,254,200,245,38,0,69,161,242,1,16,178,150,0,113,56,130,0,171,31,105,0,26,88,108,255,49,42,106,0,251,169,66,0,69,93,149,0,20,57,254,0,164,25,111,0,90,188,90,255,204,4,197,0,40,213,50,1,212,96,132,255,88,138,180,254,228,146,124,255,184,246,247,0,65,117,86,255,253,102,210,254,254,121,36,0,137,115,3,255,60,24,216,0,134,18,29,0,59,226,97,0,176,142,71,0,7,209,161,0,189,84,51,254,155,250,72,0,213,84,235,255,45,222,224,0,238,148,143,255,170,42,53,255,78,167,117,0,186,0,40,255,125,177,103,255,69,225,66,0,227,7,88,1,75,172,6,0,169,45,227,1,16,36,70,255,50,2,9,255,139,193,22,0,143,183,231,254,218,69,50,0,236,56,161,1,213,131,42,0,138,145,44,254,136,229,40,255,49,63,35,255,61,145,245,255,101,192,2,254,232,167,113,0,152,104,38,1,121,185,218,0,121,139,211,254,119,240,35,0,65,189,217,254,187,179,162,255,160,187,230,0,62,248,14,255,60,78,97,0,255,247,163,255,225,59,91,255,107,71,58,255,241,47,33,1,50,117,236,0,219,177,63,254,244,90,179,0,35,194,215,255,189,67,50,255,23,135,129,0,104,189,37,255,185,57,194,0,35,62,231,255,220,248,108,0,12,231,178,0,143,80,91,1,131,93,101,255,144,39,2,1,255,250,178],"i8",ALLOC_NONE,Runtime.GLOBAL_BASE+20480);allocate([5,17,236,254,139,32,46,0,204,188,38,254,245,115,52,255,191,113,73,254,191,108,69,255,22,69,245,1,23,203,178,0,170,99,170,0,65,248,111,0,37,108,153,255,64,37,69,0,0,88,62,254,89,148,144,255,191,68,224,1,241,39,53,0,41,203,237,255,145,126,194,255,221,42,253,255,25,99,151,0,97,253,223,1,74,115,49,255,6,175,72,255,59,176,203,0,124,183,249,1,228,228,99,0,129,12,207,254,168,192,195,255,204,176,16,254,152,234,171,0,77,37,85,255,33,120,135,255,142,194,227,1,31,214,58,0,213,187,125,255,232,46,60,255,190,116,42,254,151,178,19,255,51,62,237,254,204,236,193,0,194,232,60,0,172,34,157,255,189,16,184,254,103,3,95,255,141,233,36,254,41,25,11,255,21,195,166,0,118,245,45,0,67,213,149,255,159,12,18,255,187,164,227,1,160,25,5,0,12,78,195,1,43,197,225,0,48,142,41,254,196,155,60,255,223,199,18,1,145,136,156,0,252,117,169,254,145,226,238,0,239,23,107,0,109,181,188,255,230,112,49,254,73,170,237,255,231,183,227,255,80,220,20,0,194,107,127,1,127,205,101,0,46,52,197,1,210,171,36,255,88,3,90,255,56,151,141,0,96,187,255,255,42,78,200,0,254,70,70,1,244,125,168,0,204,68,138,1,124,215,70,0,102,66,200,254,17,52,228,0,117,220,143,254,203,248,123,0,56,18,174,255,186,151,164,255,51,232,208,1,160,228,43,255,249,29,25,1,68,190,63,0,133,59,140,1,189,241,36,255,248,37,195,1,96,220,55,0,183,76,62,255,195,66,61,0,50,76,164,1,225,164,76,255,76,61,163,255,117,62,31,0,81,145,64,255,118,65,14,0,162,115,214,255,6,138,46,0,124,230,244,255,10,138,143,0,52,26,194,0,184,244,76,0,129,143,41,1,190,244,19,255,123,170,122,255,98,129,68,0,121,213,147,0,86,101,30,255,161,103,155,0,140,89,67,255,239,229,190,1,67,11,181,0,198,240,137,254,238,69,188,255,67,151,238,0,19,42,108,255,229,85,113,1,50,68,135,255,17,106,9,0,50,103,1,255,80,1,168,1,35,152,30,255,16,168,185,1,56,89,232,255,101,210,252,0,41,250,71,0,204,170,79,255,14,46,239,255,80,77,239,0,189,214,75,255,17,141,249,0,38,80,76,255,190,85,117,0,86,228,170,0,156,216,208,1,195,207,164,255,150,66,76,255,175,225,16,255,141,80,98,1,76,219,242,0,198,162,114,0,46,218,152,0,155,43,241,254,155,160,104,255,51,187,165,0,2,17,175,0,66,84,160,1,247,58,30,0,35,65,53,254,69,236,191,0,45,134,245,1,163,123,221,0,32,110,20,255,52,23,165,0,186,214,71,0,233,176,96,0,242,239,54,1,57,89,138,0,83,0,84,255,136,160,100,0,92,142,120,254,104,124,190,0,181,177,62,255,250,41,85,0,152,130,42,1,96,252,246,0,151,151,63,254,239,133,62,0,32,56,156,0,45,167,189,255,142,133,179,1,131,86,211,0,187,179,150,254,250,170,14,255,210,163,78,0,37,52,151,0,99,77,26,0,238,156,213,255,213,192,209,1,73,46,84,0,20,65,41,1,54,206,79,0,201,131,146,254,170,111,24,255,177,33,50,254,171,38,203,255,78,247,116,0,209,221,153,0,133,128,178,1,58,44,25,0,201,39,59,1,189,19,252,0,49,229,210,1,117,187,117,0,181,179,184,1,0,114,219,0,48,94,147,0,245,41,56,0,125,13,204,254,244,173,119,0,44,221,32,254,84,234,20,0,249,160,198,1,236,126,234,255,47,99,168,254,170,226,153,255,102,179,216,0,226,141,122,255,122,66,153,254,182,245,134,0,227,228,25,1,214,57,235,255,216,173,56,255,181,231,210,0,119,128,157,255,129,95,136,255,110,126,51,0,2,169,183,255,7,130,98,254,69,176,94,255,116,4,227,1,217,242,145,255,202,173,31,1,105,1,39,255,46,175,69,0,228,47,58,255,215,224,69,254,207,56,69,255,16,254,139,255,23,207,212,255,202,20,126,255,95,213,96,255,9,176,33,0,200,5,207,255,241,42,128,254,35,33,192,255,248,229,196,1,129,17,120,0,251,103,151,255,7,52,112,255,140,56,66,255,40,226,245,255,217,70,37,254,172,214,9,255,72,67,134,1,146,192,214,255,44,38,112,0,68,184,75,255,206,90,251,0,149,235,141,0,181,170,58,0,116,244,239,0,92,157,2,0,102,173,98,0,233,137,96,1,127,49,203,0,5,155,148,0,23,148,9,255,211,122,12,0,34,134,26,255,219,204,136,0,134,8,41,255,224,83,43,254,85,25,247,0,109,127,0,254,169,136,48,0,238,119,219,255,231,173,213,0,206,18,254,254,8,186,7,255,126,9,7,1,111,42,72,0,111,52,236,254,96,63,141,0,147,191,127,254,205,78,192,255,14,106,237,1,187,219,76,0,175,243,187,254,105,89,173,0,85,25,89,1,162,243,148,0,2,118,209,254,33,158,9,0,139,163,46,255,93,70,40,0,108,42,142,254,111,252,142,255,155,223,144,0,51,229,167,255,73,252,155,255,94,116,12,255,152,160,218,255,156,238,37,255,179,234,207,255,197,0,179,255,154,164,141,0,225,196,104,0,10,35,25,254,209,212,242,255,97,253,222,254,184,101,229,0,222,18,127,1,164,136,135,255,30,207,140,254,146,97,243,0,129,192,26,254,201,84,33,255,111,10,78,255,147,81,178,255,4,4,24,0,161,238,215,255,6,141,33,0,53,215,14,255,41,181,208,255,231,139,157,0,179,203,221,255,255,185,113,0,189,226,172,255,113,66,214,255,202,62,45,255,102,64,8,255,78,174,16,254,133,117,68,255,220,227,61,255,55,242,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,250,146,248,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,66,28,254,77,93,218,255,85,164,113,254,84,201,69,255,19,80,70,255,228,25,251,255,161,155,226,0,21,228,98,255,98,173,253,254,240,199,249,255,243,154,124,0,216,32,153,255,92,250,251,254,184,34,48,0,13,120,71,1,190,95,22,0,224,219,40,254,59,210,158,255,163,69,160,0,120,24,52,255,121,44,48,255,198,97,223,0,3,43,69,0,178,44,117,0,253,147,0,1,237,162,13,255,32,32,163,254,19,247,29,255,33,76,209,0,68,40,157,255,134,145,179,254,238,64,70,255,168,48,73,1,250,9,69,0,240,27,185,255,47,67,247,0,63,68,122,0,216,36,127,255,126,6,49,0,204,15,105,0,1,0,0,0,0,0,0,0,130,128,0,0,0,0,0,0,138,128,0,0,0,0,0,128,0,128,0,128,0,0,0,128,139,128,0,0,0,0,0,0,1,0,0,128,0,0,0,0,129,128,0,128,0,0,0,128,9,128,0,0,0,0,0,128,138,0,0,0,0,0,0,0,136,0,0,0,0,0,0,0,9,128,0,128,0,0,0,0,10,0,0,128,0,0,0,0,139,128,0,128,0,0,0,0,139,0,0,0,0,0,0,128,137,128,0,0,0,0,0,128,3,128,0,0,0,0,0,128,2,128,0,0,0,0,0,128,128,0,0,0,0,0,0,128,10,128,0,0,0,0,0,0,10,0,0,128,0,0,0,128,129,128,0,128,0,0,0,128,128,128,0,0,0,0,0,128,1,0,0,128,0,0,0,0,8,128,0,128,0,0,0,128,1,0,0,0,3,0,0,0,6,0,0,0,10,0,0,0,15,0,0,0,21,0,0,0,28,0,0,0,36,0,0,0,45,0,0,0,55,0,0,0,2,0,0,0,14,0,0,0,27,0,0,0,41,0,0,0,56,0,0,0,8,0,0,0,25,0,0,0,43,0,0,0,62,0,0,0,18,0,0,0,39,0,0,0,61,0,0,0,20,0,0,0,44,0,0,0,10,0,0,0,7,0,0,0,11,0,0,0,17,0,0,0,18,0,0,0,3,0,0,0,5,0,0,0,16,0,0,0,8,0,0,0,21,0,0,0,24,0,0,0,4,0,0,0,15,0,0,0,23,0,0,0,19,0,0,0,13,0,0,0,12,0,0,0,2,0,0,0,20,0,0,0,14,0,0,0,22,0,0,0,9,0,0,0,6,0,0,0,1,0,0,0],"i8",ALLOC_NONE,Runtime.GLOBAL_BASE+30720);var tempDoublePtr=Runtime.alignMemory(allocate(12,"i8",ALLOC_STATIC),8);assert(tempDoublePtr%8==0);function copyTempFloat(ptr){HEAP8[tempDoublePtr]=HEAP8[ptr];HEAP8[tempDoublePtr+1]=HEAP8[ptr+1];HEAP8[tempDoublePtr+2]=HEAP8[ptr+2];HEAP8[tempDoublePtr+3]=HEAP8[ptr+3]}function copyTempDouble(ptr){HEAP8[tempDoublePtr]=HEAP8[ptr];HEAP8[tempDoublePtr+1]=HEAP8[ptr+1];HEAP8[tempDoublePtr+2]=HEAP8[ptr+2];HEAP8[tempDoublePtr+3]=HEAP8[ptr+3];HEAP8[tempDoublePtr+4]=HEAP8[ptr+4];HEAP8[tempDoublePtr+5]=HEAP8[ptr+5];HEAP8[tempDoublePtr+6]=HEAP8[ptr+6];HEAP8[tempDoublePtr+7]=HEAP8[ptr+7]}Module["_bitshift64Ashr"]=_bitshift64Ashr;function _malloc(bytes){var ptr=Runtime.dynamicAlloc(bytes+8);return ptr+8&4294967288}Module["_malloc"]=_malloc;Module["_i64Subtract"]=_i64Subtract;function ___assert_fail(condition,filename,line,func){ABORT=true;throw"Assertion failed: "+Pointer_stringify(condition)+", at: "+[filename?Pointer_stringify(filename):"unknown filename",line,func?Pointer_stringify(func):"unknown function"]+" at "+stackTrace()}Module["_i64Add"]=_i64Add;Module["_memset"]=_memset;Module["_bitshift64Lshr"]=_bitshift64Lshr;function _free(){}Module["_free"]=_free;Module["_bitshift64Shl"]=_bitshift64Shl;var ERRNO_CODES={EPERM:1,ENOENT:2,ESRCH:3,EINTR:4,EIO:5,ENXIO:6,E2BIG:7,ENOEXEC:8,EBADF:9,ECHILD:10,EAGAIN:11,EWOULDBLOCK:11,ENOMEM:12,EACCES:13,EFAULT:14,ENOTBLK:15,EBUSY:16,EEXIST:17,EXDEV:18,ENODEV:19,ENOTDIR:20,EISDIR:21,EINVAL:22,ENFILE:23,EMFILE:24,ENOTTY:25,ETXTBSY:26,EFBIG:27,ENOSPC:28,ESPIPE:29,EROFS:30,EMLINK:31,EPIPE:32,EDOM:33,ERANGE:34,ENOMSG:42,EIDRM:43,ECHRNG:44,EL2NSYNC:45,EL3HLT:46,EL3RST:47,ELNRNG:48,EUNATCH:49,ENOCSI:50,EL2HLT:51,EDEADLK:35,ENOLCK:37,EBADE:52,EBADR:53,EXFULL:54,ENOANO:55,EBADRQC:56,EBADSLT:57,EDEADLOCK:35,EBFONT:59,ENOSTR:60,ENODATA:61,ETIME:62,ENOSR:63,ENONET:64,ENOPKG:65,EREMOTE:66,ENOLINK:67,EADV:68,ESRMNT:69,ECOMM:70,EPROTO:71,EMULTIHOP:72,EDOTDOT:73,EBADMSG:74,ENOTUNIQ:76,EBADFD:77,EREMCHG:78,ELIBACC:79,ELIBBAD:80,ELIBSCN:81,ELIBMAX:82,ELIBEXEC:83,ENOSYS:38,ENOTEMPTY:39,ENAMETOOLONG:36,ELOOP:40,EOPNOTSUPP:95,EPFNOSUPPORT:96,ECONNRESET:104,ENOBUFS:105,EAFNOSUPPORT:97,EPROTOTYPE:91,ENOTSOCK:88,ENOPROTOOPT:92,ESHUTDOWN:108,ECONNREFUSED:111,EADDRINUSE:98,ECONNABORTED:103,ENETUNREACH:101,ENETDOWN:100,ETIMEDOUT:110,EHOSTDOWN:112,EHOSTUNREACH:113,EINPROGRESS:115,EALREADY:114,EDESTADDRREQ:89,EMSGSIZE:90,EPROTONOSUPPORT:93,ESOCKTNOSUPPORT:94,EADDRNOTAVAIL:99,ENETRESET:102,EISCONN:106,ENOTCONN:107,ETOOMANYREFS:109,EUSERS:87,EDQUOT:122,ESTALE:116,ENOTSUP:95,ENOMEDIUM:123,EILSEQ:84,EOVERFLOW:75,ECANCELED:125,ENOTRECOVERABLE:131,EOWNERDEAD:130,ESTRPIPE:86};var ERRNO_MESSAGES={0:"Success",1:"Not super-user",2:"No such file or directory",3:"No such process",4:"Interrupted system call",5:"I/O error",6:"No such device or address",7:"Arg list too long",8:"Exec format error",9:"Bad file number",10:"No children",11:"No more processes",12:"Not enough core",13:"Permission denied",14:"Bad address",15:"Block device required",16:"Mount device busy",17:"File exists",18:"Cross-device link",19:"No such device",20:"Not a directory",21:"Is a directory",22:"Invalid argument",23:"Too many open files in system",24:"Too many open files",25:"Not a typewriter",26:"Text file busy",27:"File too large",28:"No space left on device",29:"Illegal seek",30:"Read only file system",31:"Too many links",32:"Broken pipe",33:"Math arg out of domain of func",34:"Math result not representable",35:"File locking deadlock error",36:"File or path name too long",37:"No record locks available",38:"Function not implemented",39:"Directory not empty",40:"Too many symbolic links",42:"No message of desired type",43:"Identifier removed",44:"Channel number out of range",45:"Level 2 not synchronized",46:"Level 3 halted",47:"Level 3 reset",48:"Link number out of range",49:"Protocol driver not attached",50:"No CSI structure available",51:"Level 2 halted",52:"Invalid exchange",53:"Invalid request descriptor",54:"Exchange full",55:"No anode",56:"Invalid request code",57:"Invalid slot",59:"Bad font file fmt",60:"Device not a stream",61:"No data (for no delay io)",62:"Timer expired",63:"Out of streams resources",64:"Machine is not on the network",65:"Package not installed",66:"The object is remote",67:"The link has been severed",68:"Advertise error",69:"Srmount error",70:"Communication error on send",71:"Protocol error",72:"Multihop attempted",73:"Cross mount point (not really error)",74:"Trying to read unreadable message",75:"Value too large for defined data type",76:"Given log. name not unique",77:"f.d. invalid for this operation",78:"Remote address changed",79:"Can   access a needed shared lib",80:"Accessing a corrupted shared lib",81:".lib section in a.out corrupted",82:"Attempting to link in too many libs",83:"Attempting to exec a shared library",84:"Illegal byte sequence",86:"Streams pipe error",87:"Too many users",88:"Socket operation on non-socket",89:"Destination address required",90:"Message too long",91:"Protocol wrong type for socket",92:"Protocol not available",93:"Unknown protocol",94:"Socket type not supported",95:"Not supported",96:"Protocol family not supported",97:"Address family not supported by protocol family",98:"Address already in use",99:"Address not available",100:"Network interface is not configured",101:"Network is unreachable",102:"Connection reset by network",103:"Connection aborted",104:"Connection reset by peer",105:"No buffer space available",106:"Socket is already connected",107:"Socket is not connected",108:"Can't send after socket shutdown",109:"Too many references",110:"Connection timed out",111:"Connection refused",112:"Host is down",113:"Host is unreachable",114:"Socket already connected",115:"Connection already in progress",116:"Stale file handle",122:"Quota exceeded",123:"No medium (in tape drive)",125:"Operation canceled",130:"Previous owner died",131:"State not recoverable"};var ___errno_state=0;function ___setErrNo(value){SAFE_HEAP_STORE(___errno_state|0,value|0,4,0)|0;return value}var TTY={ttys:[],init:(function(){}),shutdown:(function(){}),register:(function(dev,ops){TTY.ttys[dev]={input:[],output:[],ops:ops};FS.registerDevice(dev,TTY.stream_ops)}),stream_ops:{open:(function(stream){var tty=TTY.ttys[stream.node.rdev];if(!tty){throw new FS.ErrnoError(ERRNO_CODES.ENODEV)}stream.tty=tty;stream.seekable=false}),close:(function(stream){if(stream.tty.output.length){stream.tty.ops.put_char(stream.tty,10)}}),read:(function(stream,buffer,offset,length,pos){if(!stream.tty||!stream.tty.ops.get_char){throw new FS.ErrnoError(ERRNO_CODES.ENXIO)}var bytesRead=0;for(var i=0;i<length;i++){var result;try{result=stream.tty.ops.get_char(stream.tty)}catch(e){throw new FS.ErrnoError(ERRNO_CODES.EIO)}if(result===undefined&&bytesRead===0){throw new FS.ErrnoError(ERRNO_CODES.EAGAIN)}if(result===null||result===undefined)break;bytesRead++;buffer[offset+i]=result}if(bytesRead){stream.node.timestamp=Date.now()}return bytesRead}),write:(function(stream,buffer,offset,length,pos){if(!stream.tty||!stream.tty.ops.put_char){throw new FS.ErrnoError(ERRNO_CODES.ENXIO)}for(var i=0;i<length;i++){try{stream.tty.ops.put_char(stream.tty,buffer[offset+i])}catch(e){throw new FS.ErrnoError(ERRNO_CODES.EIO)}}if(length){stream.node.timestamp=Date.now()}return i})},default_tty_ops:{get_char:(function(tty){if(!tty.input.length){var result=null;if(ENVIRONMENT_IS_NODE){result=process["stdin"]["read"]();if(!result){if(process["stdin"]["_readableState"]&&process["stdin"]["_readableState"]["ended"]){return null}return undefined}}else if(typeof window!="undefined"&&typeof window.prompt=="function"){result=window.prompt("Input: ");if(result!==null){result+="\n"}}else if(typeof readline=="function"){result=readline();if(result!==null){result+="\n"}}if(!result){return null}tty.input=intArrayFromString(result,true)}return tty.input.shift()}),put_char:(function(tty,val){if(val===null||val===10){Module["print"](tty.output.join(""));tty.output=[]}else{tty.output.push(TTY.utf8.processCChar(val))}})},default_tty1_ops:{put_char:(function(tty,val){if(val===null||val===10){Module["printErr"](tty.output.join(""));tty.output=[]}else{tty.output.push(TTY.utf8.processCChar(val))}})}};var MEMFS={ops_table:null,mount:(function(mount){return MEMFS.createNode(null,"/",16384|511,0)}),createNode:(function(parent,name,mode,dev){if(FS.isBlkdev(mode)||FS.isFIFO(mode)){throw new FS.ErrnoError(ERRNO_CODES.EPERM)}if(!MEMFS.ops_table){MEMFS.ops_table={dir:{node:{getattr:MEMFS.node_ops.getattr,setattr:MEMFS.node_ops.setattr,lookup:MEMFS.node_ops.lookup,mknod:MEMFS.node_ops.mknod,rename:MEMFS.node_ops.rename,unlink:MEMFS.node_ops.unlink,rmdir:MEMFS.node_ops.rmdir,readdir:MEMFS.node_ops.readdir,symlink:MEMFS.node_ops.symlink},stream:{llseek:MEMFS.stream_ops.llseek}},file:{node:{getattr:MEMFS.node_ops.getattr,setattr:MEMFS.node_ops.setattr},stream:{llseek:MEMFS.stream_ops.llseek,read:MEMFS.stream_ops.read,write:MEMFS.stream_ops.write,allocate:MEMFS.stream_ops.allocate,mmap:MEMFS.stream_ops.mmap}},link:{node:{getattr:MEMFS.node_ops.getattr,setattr:MEMFS.node_ops.setattr,readlink:MEMFS.node_ops.readlink},stream:{}},chrdev:{node:{getattr:MEMFS.node_ops.getattr,setattr:MEMFS.node_ops.setattr},stream:FS.chrdev_stream_ops}}}var node=FS.createNode(parent,name,mode,dev);if(FS.isDir(node.mode)){node.node_ops=MEMFS.ops_table.dir.node;node.stream_ops=MEMFS.ops_table.dir.stream;node.contents={}}else if(FS.isFile(node.mode)){node.node_ops=MEMFS.ops_table.file.node;node.stream_ops=MEMFS.ops_table.file.stream;node.usedBytes=0;node.contents=null}else if(FS.isLink(node.mode)){node.node_ops=MEMFS.ops_table.link.node;node.stream_ops=MEMFS.ops_table.link.stream}else if(FS.isChrdev(node.mode)){node.node_ops=MEMFS.ops_table.chrdev.node;node.stream_ops=MEMFS.ops_table.chrdev.stream}node.timestamp=Date.now();if(parent){parent.contents[name]=node}return node}),getFileDataAsRegularArray:(function(node){if(node.contents&&node.contents.subarray){var arr=[];for(var i=0;i<node.usedBytes;++i)arr.push(node.contents[i]);return arr}return node.contents}),getFileDataAsTypedArray:(function(node){if(node.contents&&node.contents.subarray)return node.contents.subarray(0,node.usedBytes);return new Uint8Array(node.contents)}),expandFileStorage:(function(node,newCapacity){if(node.contents&&node.contents.subarray&&newCapacity>node.contents.length){node.contents=MEMFS.getFileDataAsRegularArray(node);node.usedBytes=node.contents.length}if(!node.contents||node.contents.subarray){var prevCapacity=node.contents?node.contents.buffer.byteLength:0;if(prevCapacity>=newCapacity)return;var CAPACITY_DOUBLING_MAX=1024*1024;newCapacity=Math.max(newCapacity,prevCapacity*(prevCapacity<CAPACITY_DOUBLING_MAX?2:1.125)|0);if(prevCapacity!=0)newCapacity=Math.max(newCapacity,256);var oldContents=node.contents;node.contents=new Uint8Array(newCapacity);if(node.usedBytes>0)node.contents.set(oldContents.subarray(0,node.usedBytes),0);return}if(!node.contents&&newCapacity>0)node.contents=[];while(node.contents.length<newCapacity)node.contents.push(0)}),resizeFileStorage:(function(node,newSize){if(node.usedBytes==newSize)return;if(newSize==0){node.contents=null;node.usedBytes=0;return}if(!node.contents||node.contents.subarray){var oldContents=node.contents;node.contents=new Uint8Array(new ArrayBuffer(newSize));if(oldContents){node.contents.set(oldContents.subarray(0,Math.min(newSize,node.usedBytes)))}node.usedBytes=newSize;return}if(!node.contents)node.contents=[];if(node.contents.length>newSize)node.contents.length=newSize;else while(node.contents.length<newSize)node.contents.push(0);node.usedBytes=newSize}),node_ops:{getattr:(function(node){var attr={};attr.dev=FS.isChrdev(node.mode)?node.id:1;attr.ino=node.id;attr.mode=node.mode;attr.nlink=1;attr.uid=0;attr.gid=0;attr.rdev=node.rdev;if(FS.isDir(node.mode)){attr.size=4096}else if(FS.isFile(node.mode)){attr.size=node.usedBytes}else if(FS.isLink(node.mode)){attr.size=node.link.length}else{attr.size=0}attr.atime=new Date(node.timestamp);attr.mtime=new Date(node.timestamp);attr.ctime=new Date(node.timestamp);attr.blksize=4096;attr.blocks=Math.ceil(attr.size/attr.blksize);return attr}),setattr:(function(node,attr){if(attr.mode!==undefined){node.mode=attr.mode}if(attr.timestamp!==undefined){node.timestamp=attr.timestamp}if(attr.size!==undefined){MEMFS.resizeFileStorage(node,attr.size)}}),lookup:(function(parent,name){throw FS.genericErrors[ERRNO_CODES.ENOENT]}),mknod:(function(parent,name,mode,dev){return MEMFS.createNode(parent,name,mode,dev)}),rename:(function(old_node,new_dir,new_name){if(FS.isDir(old_node.mode)){var new_node;try{new_node=FS.lookupNode(new_dir,new_name)}catch(e){}if(new_node){for(var i in new_node.contents){throw new FS.ErrnoError(ERRNO_CODES.ENOTEMPTY)}}}delete old_node.parent.contents[old_node.name];old_node.name=new_name;new_dir.contents[new_name]=old_node;old_node.parent=new_dir}),unlink:(function(parent,name){delete parent.contents[name]}),rmdir:(function(parent,name){var node=FS.lookupNode(parent,name);for(var i in node.contents){throw new FS.ErrnoError(ERRNO_CODES.ENOTEMPTY)}delete parent.contents[name]}),readdir:(function(node){var entries=[".",".."];for(var key in node.contents){if(!node.contents.hasOwnProperty(key)){continue}entries.push(key)}return entries}),symlink:(function(parent,newname,oldpath){var node=MEMFS.createNode(parent,newname,511|40960,0);node.link=oldpath;return node}),readlink:(function(node){if(!FS.isLink(node.mode)){throw new FS.ErrnoError(ERRNO_CODES.EINVAL)}return node.link})},stream_ops:{read:(function(stream,buffer,offset,length,position){var contents=stream.node.contents;if(position>=stream.node.usedBytes)return 0;var size=Math.min(stream.node.usedBytes-position,length);assert(size>=0);if(size>8&&contents.subarray){buffer.set(contents.subarray(position,position+size),offset)}else{for(var i=0;i<size;i++)buffer[offset+i]=contents[position+i]}return size}),write:(function(stream,buffer,offset,length,position,canOwn){if(!length)return 0;var node=stream.node;node.timestamp=Date.now();if(buffer.subarray&&(!node.contents||node.contents.subarray)){if(canOwn){node.contents=buffer.subarray(offset,offset+length);node.usedBytes=length;return length}else if(node.usedBytes===0&&position===0){node.contents=new Uint8Array(buffer.subarray(offset,offset+length));node.usedBytes=length;return length}else if(position+length<=node.usedBytes){node.contents.set(buffer.subarray(offset,offset+length),position);return length}}MEMFS.expandFileStorage(node,position+length);if(node.contents.subarray&&buffer.subarray)node.contents.set(buffer.subarray(offset,offset+length),position);else for(var i=0;i<length;i++){node.contents[position+i]=buffer[offset+i]}node.usedBytes=Math.max(node.usedBytes,position+length);return length}),llseek:(function(stream,offset,whence){var position=offset;if(whence===1){position+=stream.position}else if(whence===2){if(FS.isFile(stream.node.mode)){position+=stream.node.usedBytes}}if(position<0){throw new FS.ErrnoError(ERRNO_CODES.EINVAL)}stream.ungotten=[];stream.position=position;return position}),allocate:(function(stream,offset,length){MEMFS.expandFileStorage(stream.node,offset+length);stream.node.usedBytes=Math.max(stream.node.usedBytes,offset+length)}),mmap:(function(stream,buffer,offset,length,position,prot,flags){if(!FS.isFile(stream.node.mode)){throw new FS.ErrnoError(ERRNO_CODES.ENODEV)}var ptr;var allocated;var contents=stream.node.contents;if(!(flags&2)&&(contents.buffer===buffer||contents.buffer===buffer.buffer)){allocated=false;ptr=contents.byteOffset}else{if(position>0||position+length<stream.node.usedBytes){if(contents.subarray){contents=contents.subarray(position,position+length)}else{contents=Array.prototype.slice.call(contents,position,position+length)}}allocated=true;ptr=_malloc(length);if(!ptr){throw new FS.ErrnoError(ERRNO_CODES.ENOMEM)}buffer.set(contents,ptr)}return{ptr:ptr,allocated:allocated}})}};var IDBFS={dbs:{},indexedDB:(function(){if(typeof indexedDB!=="undefined")return indexedDB;var ret=null;if(typeof window==="object")ret=window.indexedDB||window.mozIndexedDB||window.webkitIndexedDB||window.msIndexedDB;assert(ret,"IDBFS used, but indexedDB not supported");return ret}),DB_VERSION:21,DB_STORE_NAME:"FILE_DATA",mount:(function(mount){return MEMFS.mount.apply(null,arguments)}),syncfs:(function(mount,populate,callback){IDBFS.getLocalSet(mount,(function(err,local){if(err)return callback(err);IDBFS.getRemoteSet(mount,(function(err,remote){if(err)return callback(err);var src=populate?remote:local;var dst=populate?local:remote;IDBFS.reconcile(src,dst,callback)}))}))}),getDB:(function(name,callback){var db=IDBFS.dbs[name];if(db){return callback(null,db)}var req;try{req=IDBFS.indexedDB().open(name,IDBFS.DB_VERSION)}catch(e){return callback(e)}req.onupgradeneeded=(function(e){var db=e.target.result;var transaction=e.target.transaction;var fileStore;if(db.objectStoreNames.contains(IDBFS.DB_STORE_NAME)){fileStore=transaction.objectStore(IDBFS.DB_STORE_NAME)}else{fileStore=db.createObjectStore(IDBFS.DB_STORE_NAME)}fileStore.createIndex("timestamp","timestamp",{unique:false})});req.onsuccess=(function(){db=req.result;IDBFS.dbs[name]=db;callback(null,db)});req.onerror=(function(){callback(this.error)})}),getLocalSet:(function(mount,callback){var entries={};function isRealDir(p){return p!=="."&&p!==".."}function toAbsolute(root){return(function(p){return PATH.join2(root,p)})}var check=FS.readdir(mount.mountpoint).filter(isRealDir).map(toAbsolute(mount.mountpoint));while(check.length){var path=check.pop();var stat;try{stat=FS.stat(path)}catch(e){return callback(e)}if(FS.isDir(stat.mode)){check.push.apply(check,FS.readdir(path).filter(isRealDir).map(toAbsolute(path)))}entries[path]={timestamp:stat.mtime}}return callback(null,{type:"local",entries:entries})}),getRemoteSet:(function(mount,callback){var entries={};IDBFS.getDB(mount.mountpoint,(function(err,db){if(err)return callback(err);var transaction=db.transaction([IDBFS.DB_STORE_NAME],"readonly");transaction.onerror=(function(){callback(this.error)});var store=transaction.objectStore(IDBFS.DB_STORE_NAME);var index=store.index("timestamp");index.openKeyCursor().onsuccess=(function(event){var cursor=event.target.result;if(!cursor){return callback(null,{type:"remote",db:db,entries:entries})}entries[cursor.primaryKey]={timestamp:cursor.key};cursor.continue()})}))}),loadLocalEntry:(function(path,callback){var stat,node;try{var lookup=FS.lookupPath(path);node=lookup.node;stat=FS.stat(path)}catch(e){return callback(e)}if(FS.isDir(stat.mode)){return callback(null,{timestamp:stat.mtime,mode:stat.mode})}else if(FS.isFile(stat.mode)){node.contents=MEMFS.getFileDataAsTypedArray(node);return callback(null,{timestamp:stat.mtime,mode:stat.mode,contents:node.contents})}else{return callback(new Error("node type not supported"))}}),storeLocalEntry:(function(path,entry,callback){try{if(FS.isDir(entry.mode)){FS.mkdir(path,entry.mode)}else if(FS.isFile(entry.mode)){FS.writeFile(path,entry.contents,{encoding:"binary",canOwn:true})}else{return callback(new Error("node type not supported"))}FS.utime(path,entry.timestamp,entry.timestamp)}catch(e){return callback(e)}callback(null)}),removeLocalEntry:(function(path,callback){try{var lookup=FS.lookupPath(path);var stat=FS.stat(path);if(FS.isDir(stat.mode)){FS.rmdir(path)}else if(FS.isFile(stat.mode)){FS.unlink(path)}}catch(e){return callback(e)}callback(null)}),loadRemoteEntry:(function(store,path,callback){var req=store.get(path);req.onsuccess=(function(event){callback(null,event.target.result)});req.onerror=(function(){callback(this.error)})}),storeRemoteEntry:(function(store,path,entry,callback){var req=store.put(entry,path);req.onsuccess=(function(){callback(null)});req.onerror=(function(){callback(this.error)})}),removeRemoteEntry:(function(store,path,callback){var req=store.delete(path);req.onsuccess=(function(){callback(null)});req.onerror=(function(){callback(this.error)})}),reconcile:(function(src,dst,callback){var total=0;var create=[];Object.keys(src.entries).forEach((function(key){var e=src.entries[key];var e2=dst.entries[key];if(!e2||e.timestamp>e2.timestamp){create.push(key);total++}}));var remove=[];Object.keys(dst.entries).forEach((function(key){var e=dst.entries[key];var e2=src.entries[key];if(!e2){remove.push(key);total++}}));if(!total){return callback(null)}var errored=false;var completed=0;var db=src.type==="remote"?src.db:dst.db;var transaction=db.transaction([IDBFS.DB_STORE_NAME],"readwrite");var store=transaction.objectStore(IDBFS.DB_STORE_NAME);function done(err){if(err){if(!done.errored){done.errored=true;return callback(err)}return}if(++completed>=total){return callback(null)}}transaction.onerror=(function(){done(this.error)});create.sort().forEach((function(path){if(dst.type==="local"){IDBFS.loadRemoteEntry(store,path,(function(err,entry){if(err)return done(err);IDBFS.storeLocalEntry(path,entry,done)}))}else{IDBFS.loadLocalEntry(path,(function(err,entry){if(err)return done(err);IDBFS.storeRemoteEntry(store,path,entry,done)}))}}));remove.sort().reverse().forEach((function(path){if(dst.type==="local"){IDBFS.removeLocalEntry(path,done)}else{IDBFS.removeRemoteEntry(store,path,done)}}))})};var NODEFS={isWindows:false,staticInit:(function(){NODEFS.isWindows=!!process.platform.match(/^win/)}),mount:(function(mount){assert(ENVIRONMENT_IS_NODE);return NODEFS.createNode(null,"/",NODEFS.getMode(mount.opts.root),0)}),createNode:(function(parent,name,mode,dev){if(!FS.isDir(mode)&&!FS.isFile(mode)&&!FS.isLink(mode)){throw new FS.ErrnoError(ERRNO_CODES.EINVAL)}var node=FS.createNode(parent,name,mode);node.node_ops=NODEFS.node_ops;node.stream_ops=NODEFS.stream_ops;return node}),getMode:(function(path){var stat;try{stat=fs.lstatSync(path);if(NODEFS.isWindows){stat.mode=stat.mode|(stat.mode&146)>>1}}catch(e){if(!e.code)throw e;throw new FS.ErrnoError(ERRNO_CODES[e.code])}return stat.mode}),realPath:(function(node){var parts=[];while(node.parent!==node){parts.push(node.name);node=node.parent}parts.push(node.mount.opts.root);parts.reverse();return PATH.join.apply(null,parts)}),flagsToPermissionStringMap:{0:"r",1:"r+",2:"r+",64:"r",65:"r+",66:"r+",129:"rx+",193:"rx+",514:"w+",577:"w",578:"w+",705:"wx",706:"wx+",1024:"a",1025:"a",1026:"a+",1089:"a",1090:"a+",1153:"ax",1154:"ax+",1217:"ax",1218:"ax+",4096:"rs",4098:"rs+"},flagsToPermissionString:(function(flags){if(flags in NODEFS.flagsToPermissionStringMap){return NODEFS.flagsToPermissionStringMap[flags]}else{return flags}}),node_ops:{getattr:(function(node){var path=NODEFS.realPath(node);var stat;try{stat=fs.lstatSync(path)}catch(e){if(!e.code)throw e;throw new FS.ErrnoError(ERRNO_CODES[e.code])}if(NODEFS.isWindows&&!stat.blksize){stat.blksize=4096}if(NODEFS.isWindows&&!stat.blocks){stat.blocks=(stat.size+stat.blksize-1)/stat.blksize|0}return{dev:stat.dev,ino:stat.ino,mode:stat.mode,nlink:stat.nlink,uid:stat.uid,gid:stat.gid,rdev:stat.rdev,size:stat.size,atime:stat.atime,mtime:stat.mtime,ctime:stat.ctime,blksize:stat.blksize,blocks:stat.blocks}}),setattr:(function(node,attr){var path=NODEFS.realPath(node);try{if(attr.mode!==undefined){fs.chmodSync(path,attr.mode);node.mode=attr.mode}if(attr.timestamp!==undefined){var date=new Date(attr.timestamp);fs.utimesSync(path,date,date)}if(attr.size!==undefined){fs.truncateSync(path,attr.size)}}catch(e){if(!e.code)throw e;throw new FS.ErrnoError(ERRNO_CODES[e.code])}}),lookup:(function(parent,name){var path=PATH.join2(NODEFS.realPath(parent),name);var mode=NODEFS.getMode(path);return NODEFS.createNode(parent,name,mode)}),mknod:(function(parent,name,mode,dev){var node=NODEFS.createNode(parent,name,mode,dev);var path=NODEFS.realPath(node);try{if(FS.isDir(node.mode)){fs.mkdirSync(path,node.mode)}else{fs.writeFileSync(path,"",{mode:node.mode})}}catch(e){if(!e.code)throw e;throw new FS.ErrnoError(ERRNO_CODES[e.code])}return node}),rename:(function(oldNode,newDir,newName){var oldPath=NODEFS.realPath(oldNode);var newPath=PATH.join2(NODEFS.realPath(newDir),newName);try{fs.renameSync(oldPath,newPath)}catch(e){if(!e.code)throw e;throw new FS.ErrnoError(ERRNO_CODES[e.code])}}),unlink:(function(parent,name){var path=PATH.join2(NODEFS.realPath(parent),name);try{fs.unlinkSync(path)}catch(e){if(!e.code)throw e;throw new FS.ErrnoError(ERRNO_CODES[e.code])}}),rmdir:(function(parent,name){var path=PATH.join2(NODEFS.realPath(parent),name);try{fs.rmdirSync(path)}catch(e){if(!e.code)throw e;throw new FS.ErrnoError(ERRNO_CODES[e.code])}}),readdir:(function(node){var path=NODEFS.realPath(node);try{return fs.readdirSync(path)}catch(e){if(!e.code)throw e;throw new FS.ErrnoError(ERRNO_CODES[e.code])}}),symlink:(function(parent,newName,oldPath){var newPath=PATH.join2(NODEFS.realPath(parent),newName);try{fs.symlinkSync(oldPath,newPath)}catch(e){if(!e.code)throw e;throw new FS.ErrnoError(ERRNO_CODES[e.code])}}),readlink:(function(node){var path=NODEFS.realPath(node);try{return fs.readlinkSync(path)}catch(e){if(!e.code)throw e;throw new FS.ErrnoError(ERRNO_CODES[e.code])}})},stream_ops:{open:(function(stream){var path=NODEFS.realPath(stream.node);try{if(FS.isFile(stream.node.mode)){stream.nfd=fs.openSync(path,NODEFS.flagsToPermissionString(stream.flags))}}catch(e){if(!e.code)throw e;throw new FS.ErrnoError(ERRNO_CODES[e.code])}}),close:(function(stream){try{if(FS.isFile(stream.node.mode)&&stream.nfd){fs.closeSync(stream.nfd)}}catch(e){if(!e.code)throw e;throw new FS.ErrnoError(ERRNO_CODES[e.code])}}),read:(function(stream,buffer,offset,length,position){var nbuffer=new Buffer(length);var res;try{res=fs.readSync(stream.nfd,nbuffer,0,length,position)}catch(e){throw new FS.ErrnoError(ERRNO_CODES[e.code])}if(res>0){for(var i=0;i<res;i++){buffer[offset+i]=nbuffer[i]}}return res}),write:(function(stream,buffer,offset,length,position){var nbuffer=new Buffer(buffer.subarray(offset,offset+length));var res;try{res=fs.writeSync(stream.nfd,nbuffer,0,length,position)}catch(e){throw new FS.ErrnoError(ERRNO_CODES[e.code])}return res}),llseek:(function(stream,offset,whence){var position=offset;if(whence===1){position+=stream.position}else if(whence===2){if(FS.isFile(stream.node.mode)){try{var stat=fs.fstatSync(stream.nfd);position+=stat.size}catch(e){throw new FS.ErrnoError(ERRNO_CODES[e.code])}}}if(position<0){throw new FS.ErrnoError(ERRNO_CODES.EINVAL)}stream.position=position;return position})}};var _stdin=allocate(1,"i32*",ALLOC_STATIC);var _stdout=allocate(1,"i32*",ALLOC_STATIC);var _stderr=allocate(1,"i32*",ALLOC_STATIC);function _fflush(stream){}var FS={root:null,mounts:[],devices:[null],streams:[],nextInode:1,nameTable:null,currentPath:"/",initialized:false,ignorePermissions:true,trackingDelegate:{},tracking:{openFlags:{READ:1,WRITE:2}},ErrnoError:null,genericErrors:{},handleFSError:(function(e){if(!(e instanceof FS.ErrnoError))throw e+" : "+stackTrace();return ___setErrNo(e.errno)}),lookupPath:(function(path,opts){path=PATH.resolve(FS.cwd(),path);opts=opts||{};if(!path)return{path:"",node:null};var defaults={follow_mount:true,recurse_count:0};for(var key in defaults){if(opts[key]===undefined){opts[key]=defaults[key]}}if(opts.recurse_count>8){throw new FS.ErrnoError(ERRNO_CODES.ELOOP)}var parts=PATH.normalizeArray(path.split("/").filter((function(p){return!!p})),false);var current=FS.root;var current_path="/";for(var i=0;i<parts.length;i++){var islast=i===parts.length-1;if(islast&&opts.parent){break}current=FS.lookupNode(current,parts[i]);current_path=PATH.join2(current_path,parts[i]);if(FS.isMountpoint(current)){if(!islast||islast&&opts.follow_mount){current=current.mounted.root}}if(!islast||opts.follow){var count=0;while(FS.isLink(current.mode)){var link=FS.readlink(current_path);current_path=PATH.resolve(PATH.dirname(current_path),link);var lookup=FS.lookupPath(current_path,{recurse_count:opts.recurse_count});current=lookup.node;if(count++>40){throw new FS.ErrnoError(ERRNO_CODES.ELOOP)}}}}return{path:current_path,node:current}}),getPath:(function(node){var path;while(true){if(FS.isRoot(node)){var mount=node.mount.mountpoint;if(!path)return mount;return mount[mount.length-1]!=="/"?mount+"/"+path:mount+path}path=path?node.name+"/"+path:node.name;node=node.parent}}),hashName:(function(parentid,name){var hash=0;for(var i=0;i<name.length;i++){hash=(hash<<5)-hash+name.charCodeAt(i)|0}return(parentid+hash>>>0)%FS.nameTable.length}),hashAddNode:(function(node){var hash=FS.hashName(node.parent.id,node.name);node.name_next=FS.nameTable[hash];FS.nameTable[hash]=node}),hashRemoveNode:(function(node){var hash=FS.hashName(node.parent.id,node.name);if(FS.nameTable[hash]===node){FS.nameTable[hash]=node.name_next}else{var current=FS.nameTable[hash];while(current){if(current.name_next===node){current.name_next=node.name_next;break}current=current.name_next}}}),lookupNode:(function(parent,name){var err=FS.mayLookup(parent);if(err){throw new FS.ErrnoError(err)}var hash=FS.hashName(parent.id,name);for(var node=FS.nameTable[hash];node;node=node.name_next){var nodeName=node.name;if(node.parent.id===parent.id&&nodeName===name){return node}}return FS.lookup(parent,name)}),createNode:(function(parent,name,mode,rdev){if(!FS.FSNode){FS.FSNode=(function(parent,name,mode,rdev){if(!parent){parent=this}this.parent=parent;this.mount=parent.mount;this.mounted=null;this.id=FS.nextInode++;this.name=name;this.mode=mode;this.node_ops={};this.stream_ops={};this.rdev=rdev});FS.FSNode.prototype={};var readMode=292|73;var writeMode=146;Object.defineProperties(FS.FSNode.prototype,{read:{get:(function(){return(this.mode&readMode)===readMode}),set:(function(val){val?this.mode|=readMode:this.mode&=~readMode})},write:{get:(function(){return(this.mode&writeMode)===writeMode}),set:(function(val){val?this.mode|=writeMode:this.mode&=~writeMode})},isFolder:{get:(function(){return FS.isDir(this.mode)})},isDevice:{get:(function(){return FS.isChrdev(this.mode)})}})}var node=new FS.FSNode(parent,name,mode,rdev);FS.hashAddNode(node);return node}),destroyNode:(function(node){FS.hashRemoveNode(node)}),isRoot:(function(node){return node===node.parent}),isMountpoint:(function(node){return!!node.mounted}),isFile:(function(mode){return(mode&61440)===32768}),isDir:(function(mode){return(mode&61440)===16384}),isLink:(function(mode){return(mode&61440)===40960}),isChrdev:(function(mode){return(mode&61440)===8192}),isBlkdev:(function(mode){return(mode&61440)===24576}),isFIFO:(function(mode){return(mode&61440)===4096}),isSocket:(function(mode){return(mode&49152)===49152}),flagModes:{"r":0,"rs":1052672,"r+":2,"w":577,"wx":705,"xw":705,"w+":578,"wx+":706,"xw+":706,"a":1089,"ax":1217,"xa":1217,"a+":1090,"ax+":1218,"xa+":1218},modeStringToFlags:(function(str){var flags=FS.flagModes[str];if(typeof flags==="undefined"){throw new Error("Unknown file open mode: "+str)}return flags}),flagsToPermissionString:(function(flag){var accmode=flag&2097155;var perms=["r","w","rw"][accmode];if(flag&512){perms+="w"}return perms}),nodePermissions:(function(node,perms){if(FS.ignorePermissions){return 0}if(perms.indexOf("r")!==-1&&!(node.mode&292)){return ERRNO_CODES.EACCES}else if(perms.indexOf("w")!==-1&&!(node.mode&146)){return ERRNO_CODES.EACCES}else if(perms.indexOf("x")!==-1&&!(node.mode&73)){return ERRNO_CODES.EACCES}return 0}),mayLookup:(function(dir){var err=FS.nodePermissions(dir,"x");if(err)return err;if(!dir.node_ops.lookup)return ERRNO_CODES.EACCES;return 0}),mayCreate:(function(dir,name){try{var node=FS.lookupNode(dir,name);return ERRNO_CODES.EEXIST}catch(e){}return FS.nodePermissions(dir,"wx")}),mayDelete:(function(dir,name,isdir){var node;try{node=FS.lookupNode(dir,name)}catch(e){return e.errno}var err=FS.nodePermissions(dir,"wx");if(err){return err}if(isdir){if(!FS.isDir(node.mode)){return ERRNO_CODES.ENOTDIR}if(FS.isRoot(node)||FS.getPath(node)===FS.cwd()){return ERRNO_CODES.EBUSY}}else{if(FS.isDir(node.mode)){return ERRNO_CODES.EISDIR}}return 0}),mayOpen:(function(node,flags){if(!node){return ERRNO_CODES.ENOENT}if(FS.isLink(node.mode)){return ERRNO_CODES.ELOOP}else if(FS.isDir(node.mode)){if((flags&2097155)!==0||flags&512){return ERRNO_CODES.EISDIR}}return FS.nodePermissions(node,FS.flagsToPermissionString(flags))}),MAX_OPEN_FDS:4096,nextfd:(function(fd_start,fd_end){fd_start=fd_start||0;fd_end=fd_end||FS.MAX_OPEN_FDS;for(var fd=fd_start;fd<=fd_end;fd++){if(!FS.streams[fd]){return fd}}throw new FS.ErrnoError(ERRNO_CODES.EMFILE)}),getStream:(function(fd){return FS.streams[fd]}),createStream:(function(stream,fd_start,fd_end){if(!FS.FSStream){FS.FSStream=(function(){});FS.FSStream.prototype={};Object.defineProperties(FS.FSStream.prototype,{object:{get:(function(){return this.node}),set:(function(val){this.node=val})},isRead:{get:(function(){return(this.flags&2097155)!==1})},isWrite:{get:(function(){return(this.flags&2097155)!==0})},isAppend:{get:(function(){return this.flags&1024})}})}var newStream=new FS.FSStream;for(var p in stream){newStream[p]=stream[p]}stream=newStream;var fd=FS.nextfd(fd_start,fd_end);stream.fd=fd;FS.streams[fd]=stream;return stream}),closeStream:(function(fd){FS.streams[fd]=null}),getStreamFromPtr:(function(ptr){return FS.streams[ptr-1]}),getPtrForStream:(function(stream){return stream?stream.fd+1:0}),chrdev_stream_ops:{open:(function(stream){var device=FS.getDevice(stream.node.rdev);stream.stream_ops=device.stream_ops;if(stream.stream_ops.open){stream.stream_ops.open(stream)}}),llseek:(function(){throw new FS.ErrnoError(ERRNO_CODES.ESPIPE)})},major:(function(dev){return dev>>8}),minor:(function(dev){return dev&255}),makedev:(function(ma,mi){return ma<<8|mi}),registerDevice:(function(dev,ops){FS.devices[dev]={stream_ops:ops}}),getDevice:(function(dev){return FS.devices[dev]}),getMounts:(function(mount){var mounts=[];var check=[mount];while(check.length){var m=check.pop();mounts.push(m);check.push.apply(check,m.mounts)}return mounts}),syncfs:(function(populate,callback){if(typeof populate==="function"){callback=populate;populate=false}var mounts=FS.getMounts(FS.root.mount);var completed=0;function done(err){if(err){if(!done.errored){done.errored=true;return callback(err)}return}if(++completed>=mounts.length){callback(null)}}mounts.forEach((function(mount){if(!mount.type.syncfs){return done(null)}mount.type.syncfs(mount,populate,done)}))}),mount:(function(type,opts,mountpoint){var root=mountpoint==="/";var pseudo=!mountpoint;var node;if(root&&FS.root){throw new FS.ErrnoError(ERRNO_CODES.EBUSY)}else if(!root&&!pseudo){var lookup=FS.lookupPath(mountpoint,{follow_mount:false});mountpoint=lookup.path;node=lookup.node;if(FS.isMountpoint(node)){throw new FS.ErrnoError(ERRNO_CODES.EBUSY)}if(!FS.isDir(node.mode)){throw new FS.ErrnoError(ERRNO_CODES.ENOTDIR)}}var mount={type:type,opts:opts,mountpoint:mountpoint,mounts:[]};var mountRoot=type.mount(mount);mountRoot.mount=mount;mount.root=mountRoot;if(root){FS.root=mountRoot}else if(node){node.mounted=mount;if(node.mount){node.mount.mounts.push(mount)}}return mountRoot}),unmount:(function(mountpoint){var lookup=FS.lookupPath(mountpoint,{follow_mount:false});if(!FS.isMountpoint(lookup.node)){throw new FS.ErrnoError(ERRNO_CODES.EINVAL)}var node=lookup.node;var mount=node.mounted;var mounts=FS.getMounts(mount);Object.keys(FS.nameTable).forEach((function(hash){var current=FS.nameTable[hash];while(current){var next=current.name_next;if(mounts.indexOf(current.mount)!==-1){FS.destroyNode(current)}current=next}}));node.mounted=null;var idx=node.mount.mounts.indexOf(mount);assert(idx!==-1);node.mount.mounts.splice(idx,1)}),lookup:(function(parent,name){return parent.node_ops.lookup(parent,name)}),mknod:(function(path,mode,dev){var lookup=FS.lookupPath(path,{parent:true});var parent=lookup.node;var name=PATH.basename(path);if(!name||name==="."||name===".."){throw new FS.ErrnoError(ERRNO_CODES.EINVAL)}var err=FS.mayCreate(parent,name);if(err){throw new FS.ErrnoError(err)}if(!parent.node_ops.mknod){throw new FS.ErrnoError(ERRNO_CODES.EPERM)}return parent.node_ops.mknod(parent,name,mode,dev)}),create:(function(path,mode){mode=mode!==undefined?mode:438;mode&=4095;mode|=32768;return FS.mknod(path,mode,0)}),mkdir:(function(path,mode){mode=mode!==undefined?mode:511;mode&=511|512;mode|=16384;return FS.mknod(path,mode,0)}),mkdev:(function(path,mode,dev){if(typeof dev==="undefined"){dev=mode;mode=438}mode|=8192;return FS.mknod(path,mode,dev)}),symlink:(function(oldpath,newpath){if(!PATH.resolve(oldpath)){throw new FS.ErrnoError(ERRNO_CODES.ENOENT)}var lookup=FS.lookupPath(newpath,{parent:true});var parent=lookup.node;if(!parent){throw new FS.ErrnoError(ERRNO_CODES.ENOENT)}var newname=PATH.basename(newpath);var err=FS.mayCreate(parent,newname);if(err){throw new FS.ErrnoError(err)}if(!parent.node_ops.symlink){throw new FS.ErrnoError(ERRNO_CODES.EPERM)}return parent.node_ops.symlink(parent,newname,oldpath)}),rename:(function(old_path,new_path){var old_dirname=PATH.dirname(old_path);var new_dirname=PATH.dirname(new_path);var old_name=PATH.basename(old_path);var new_name=PATH.basename(new_path);var lookup,old_dir,new_dir;try{lookup=FS.lookupPath(old_path,{parent:true});old_dir=lookup.node;lookup=FS.lookupPath(new_path,{parent:true});new_dir=lookup.node}catch(e){throw new FS.ErrnoError(ERRNO_CODES.EBUSY)}if(!old_dir||!new_dir)throw new FS.ErrnoError(ERRNO_CODES.ENOENT);if(old_dir.mount!==new_dir.mount){throw new FS.ErrnoError(ERRNO_CODES.EXDEV)}var old_node=FS.lookupNode(old_dir,old_name);var relative=PATH.relative(old_path,new_dirname);if(relative.charAt(0)!=="."){throw new FS.ErrnoError(ERRNO_CODES.EINVAL)}relative=PATH.relative(new_path,old_dirname);if(relative.charAt(0)!=="."){throw new FS.ErrnoError(ERRNO_CODES.ENOTEMPTY)}var new_node;try{new_node=FS.lookupNode(new_dir,new_name)}catch(e){}if(old_node===new_node){return}var isdir=FS.isDir(old_node.mode);var err=FS.mayDelete(old_dir,old_name,isdir);if(err){throw new FS.ErrnoError(err)}err=new_node?FS.mayDelete(new_dir,new_name,isdir):FS.mayCreate(new_dir,new_name);if(err){throw new FS.ErrnoError(err)}if(!old_dir.node_ops.rename){throw new FS.ErrnoError(ERRNO_CODES.EPERM)}if(FS.isMountpoint(old_node)||new_node&&FS.isMountpoint(new_node)){throw new FS.ErrnoError(ERRNO_CODES.EBUSY)}if(new_dir!==old_dir){err=FS.nodePermissions(old_dir,"w");if(err){throw new FS.ErrnoError(err)}}try{if(FS.trackingDelegate["willMovePath"]){FS.trackingDelegate["willMovePath"](old_path,new_path)}}catch(e){console.log("FS.trackingDelegate['willMovePath']('"+old_path+"', '"+new_path+"') threw an exception: "+e.message)}FS.hashRemoveNode(old_node);try{old_dir.node_ops.rename(old_node,new_dir,new_name)}catch(e){throw e}finally{FS.hashAddNode(old_node)}try{if(FS.trackingDelegate["onMovePath"])FS.trackingDelegate["onMovePath"](old_path,new_path)}catch(e){console.log("FS.trackingDelegate['onMovePath']('"+old_path+"', '"+new_path+"') threw an exception: "+e.message)}}),rmdir:(function(path){var lookup=FS.lookupPath(path,{parent:true});var parent=lookup.node;var name=PATH.basename(path);var node=FS.lookupNode(parent,name);var err=FS.mayDelete(parent,name,true);if(err){throw new FS.ErrnoError(err)}if(!parent.node_ops.rmdir){throw new FS.ErrnoError(ERRNO_CODES.EPERM)}if(FS.isMountpoint(node)){throw new FS.ErrnoError(ERRNO_CODES.EBUSY)}try{if(FS.trackingDelegate["willDeletePath"]){FS.trackingDelegate["willDeletePath"](path)}}catch(e){console.log("FS.trackingDelegate['willDeletePath']('"+path+"') threw an exception: "+e.message)}parent.node_ops.rmdir(parent,name);FS.destroyNode(node);try{if(FS.trackingDelegate["onDeletePath"])FS.trackingDelegate["onDeletePath"](path)}catch(e){console.log("FS.trackingDelegate['onDeletePath']('"+path+"') threw an exception: "+e.message)}}),readdir:(function(path){var lookup=FS.lookupPath(path,{follow:true});var node=lookup.node;if(!node.node_ops.readdir){throw new FS.ErrnoError(ERRNO_CODES.ENOTDIR)}return node.node_ops.readdir(node)}),unlink:(function(path){var lookup=FS.lookupPath(path,{parent:true});var parent=lookup.node;var name=PATH.basename(path);var node=FS.lookupNode(parent,name);var err=FS.mayDelete(parent,name,false);if(err){if(err===ERRNO_CODES.EISDIR)err=ERRNO_CODES.EPERM;throw new FS.ErrnoError(err)}if(!parent.node_ops.unlink){throw new FS.ErrnoError(ERRNO_CODES.EPERM)}if(FS.isMountpoint(node)){throw new FS.ErrnoError(ERRNO_CODES.EBUSY)}try{if(FS.trackingDelegate["willDeletePath"]){FS.trackingDelegate["willDeletePath"](path)}}catch(e){console.log("FS.trackingDelegate['willDeletePath']('"+path+"') threw an exception: "+e.message)}parent.node_ops.unlink(parent,name);FS.destroyNode(node);try{if(FS.trackingDelegate["onDeletePath"])FS.trackingDelegate["onDeletePath"](path)}catch(e){console.log("FS.trackingDelegate['onDeletePath']('"+path+"') threw an exception: "+e.message)}}),readlink:(function(path){var lookup=FS.lookupPath(path);var link=lookup.node;if(!link){throw new FS.ErrnoError(ERRNO_CODES.ENOENT)}if(!link.node_ops.readlink){throw new FS.ErrnoError(ERRNO_CODES.EINVAL)}return link.node_ops.readlink(link)}),stat:(function(path,dontFollow){var lookup=FS.lookupPath(path,{follow:!dontFollow});var node=lookup.node;if(!node){throw new FS.ErrnoError(ERRNO_CODES.ENOENT)}if(!node.node_ops.getattr){throw new FS.ErrnoError(ERRNO_CODES.EPERM)}return node.node_ops.getattr(node)}),lstat:(function(path){return FS.stat(path,true)}),chmod:(function(path,mode,dontFollow){var node;if(typeof path==="string"){var lookup=FS.lookupPath(path,{follow:!dontFollow});node=lookup.node}else{node=path}if(!node.node_ops.setattr){throw new FS.ErrnoError(ERRNO_CODES.EPERM)}node.node_ops.setattr(node,{mode:mode&4095|node.mode&~4095,timestamp:Date.now()})}),lchmod:(function(path,mode){FS.chmod(path,mode,true)}),fchmod:(function(fd,mode){var stream=FS.getStream(fd);if(!stream){throw new FS.ErrnoError(ERRNO_CODES.EBADF)}FS.chmod(stream.node,mode)}),chown:(function(path,uid,gid,dontFollow){var node;if(typeof path==="string"){var lookup=FS.lookupPath(path,{follow:!dontFollow});node=lookup.node}else{node=path}if(!node.node_ops.setattr){throw new FS.ErrnoError(ERRNO_CODES.EPERM)}node.node_ops.setattr(node,{timestamp:Date.now()})}),lchown:(function(path,uid,gid){FS.chown(path,uid,gid,true)}),fchown:(function(fd,uid,gid){var stream=FS.getStream(fd);if(!stream){throw new FS.ErrnoError(ERRNO_CODES.EBADF)}FS.chown(stream.node,uid,gid)}),truncate:(function(path,len){if(len<0){throw new FS.ErrnoError(ERRNO_CODES.EINVAL)}var node;if(typeof path==="string"){var lookup=FS.lookupPath(path,{follow:true});node=lookup.node}else{node=path}if(!node.node_ops.setattr){throw new FS.ErrnoError(ERRNO_CODES.EPERM)}if(FS.isDir(node.mode)){throw new FS.ErrnoError(ERRNO_CODES.EISDIR)}if(!FS.isFile(node.mode)){throw new FS.ErrnoError(ERRNO_CODES.EINVAL)}var err=FS.nodePermissions(node,"w");if(err){throw new FS.ErrnoError(err)}node.node_ops.setattr(node,{size:len,timestamp:Date.now()})}),ftruncate:(function(fd,len){var stream=FS.getStream(fd);if(!stream){throw new FS.ErrnoError(ERRNO_CODES.EBADF)}if((stream.flags&2097155)===0){throw new FS.ErrnoError(ERRNO_CODES.EINVAL)}FS.truncate(stream.node,len)}),utime:(function(path,atime,mtime){var lookup=FS.lookupPath(path,{follow:true});var node=lookup.node;node.node_ops.setattr(node,{timestamp:Math.max(atime,mtime)})}),open:(function(path,flags,mode,fd_start,fd_end){if(path===""){throw new FS.ErrnoError(ERRNO_CODES.ENOENT)}flags=typeof flags==="string"?FS.modeStringToFlags(flags):flags;mode=typeof mode==="undefined"?438:mode;if(flags&64){mode=mode&4095|32768}else{mode=0}var node;if(typeof path==="object"){node=path}else{path=PATH.normalize(path);try{var lookup=FS.lookupPath(path,{follow:!(flags&131072)});node=lookup.node}catch(e){}}var created=false;if(flags&64){if(node){if(flags&128){throw new FS.ErrnoError(ERRNO_CODES.EEXIST)}}else{node=FS.mknod(path,mode,0);created=true}}if(!node){throw new FS.ErrnoError(ERRNO_CODES.ENOENT)}if(FS.isChrdev(node.mode)){flags&=~512}if(!created){var err=FS.mayOpen(node,flags);if(err){throw new FS.ErrnoError(err)}}if(flags&512){FS.truncate(node,0)}flags&=~(128|512);var stream=FS.createStream({node:node,path:FS.getPath(node),flags:flags,seekable:true,position:0,stream_ops:node.stream_ops,ungotten:[],error:false},fd_start,fd_end);if(stream.stream_ops.open){stream.stream_ops.open(stream)}if(Module["logReadFiles"]&&!(flags&1)){if(!FS.readFiles)FS.readFiles={};if(!(path in FS.readFiles)){FS.readFiles[path]=1;Module["printErr"]("read file: "+path)}}try{if(FS.trackingDelegate["onOpenFile"]){var trackingFlags=0;if((flags&2097155)!==1){trackingFlags|=FS.tracking.openFlags.READ}if((flags&2097155)!==0){trackingFlags|=FS.tracking.openFlags.WRITE}FS.trackingDelegate["onOpenFile"](path,trackingFlags)}}catch(e){console.log("FS.trackingDelegate['onOpenFile']('"+path+"', flags) threw an exception: "+e.message)}return stream}),close:(function(stream){try{if(stream.stream_ops.close){stream.stream_ops.close(stream)}}catch(e){throw e}finally{FS.closeStream(stream.fd)}}),llseek:(function(stream,offset,whence){if(!stream.seekable||!stream.stream_ops.llseek){throw new FS.ErrnoError(ERRNO_CODES.ESPIPE)}return stream.stream_ops.llseek(stream,offset,whence)}),read:(function(stream,buffer,offset,length,position){if(length<0||position<0){throw new FS.ErrnoError(ERRNO_CODES.EINVAL)}if((stream.flags&2097155)===1){throw new FS.ErrnoError(ERRNO_CODES.EBADF)}if(FS.isDir(stream.node.mode)){throw new FS.ErrnoError(ERRNO_CODES.EISDIR)}if(!stream.stream_ops.read){throw new FS.ErrnoError(ERRNO_CODES.EINVAL)}var seeking=true;if(typeof position==="undefined"){position=stream.position;seeking=false}else if(!stream.seekable){throw new FS.ErrnoError(ERRNO_CODES.ESPIPE)}var bytesRead=stream.stream_ops.read(stream,buffer,offset,length,position);if(!seeking)stream.position+=bytesRead;return bytesRead}),write:(function(stream,buffer,offset,length,position,canOwn){if(length<0||position<0){throw new FS.ErrnoError(ERRNO_CODES.EINVAL)}if((stream.flags&2097155)===0){throw new FS.ErrnoError(ERRNO_CODES.EBADF)}if(FS.isDir(stream.node.mode)){throw new FS.ErrnoError(ERRNO_CODES.EISDIR)}if(!stream.stream_ops.write){throw new FS.ErrnoError(ERRNO_CODES.EINVAL)}if(stream.flags&1024){FS.llseek(stream,0,2)}var seeking=true;if(typeof position==="undefined"){position=stream.position;seeking=false}else if(!stream.seekable){throw new FS.ErrnoError(ERRNO_CODES.ESPIPE)}var bytesWritten=stream.stream_ops.write(stream,buffer,offset,length,position,canOwn);if(!seeking)stream.position+=bytesWritten;try{if(stream.path&&FS.trackingDelegate["onWriteToFile"])FS.trackingDelegate["onWriteToFile"](stream.path)}catch(e){console.log("FS.trackingDelegate['onWriteToFile']('"+path+"') threw an exception: "+e.message)}return bytesWritten}),allocate:(function(stream,offset,length){if(offset<0||length<=0){throw new FS.ErrnoError(ERRNO_CODES.EINVAL)}if((stream.flags&2097155)===0){throw new FS.ErrnoError(ERRNO_CODES.EBADF)}if(!FS.isFile(stream.node.mode)&&!FS.isDir(node.mode)){throw new FS.ErrnoError(ERRNO_CODES.ENODEV)}if(!stream.stream_ops.allocate){throw new FS.ErrnoError(ERRNO_CODES.EOPNOTSUPP)}stream.stream_ops.allocate(stream,offset,length)}),mmap:(function(stream,buffer,offset,length,position,prot,flags){if((stream.flags&2097155)===1){throw new FS.ErrnoError(ERRNO_CODES.EACCES)}if(!stream.stream_ops.mmap){throw new FS.ErrnoError(ERRNO_CODES.ENODEV)}return stream.stream_ops.mmap(stream,buffer,offset,length,position,prot,flags)}),ioctl:(function(stream,cmd,arg){if(!stream.stream_ops.ioctl){throw new FS.ErrnoError(ERRNO_CODES.ENOTTY)}return stream.stream_ops.ioctl(stream,cmd,arg)}),readFile:(function(path,opts){opts=opts||{};opts.flags=opts.flags||"r";opts.encoding=opts.encoding||"binary";if(opts.encoding!=="utf8"&&opts.encoding!=="binary"){throw new Error('Invalid encoding type "'+opts.encoding+'"')}var ret;var stream=FS.open(path,opts.flags);var stat=FS.stat(path);var length=stat.size;var buf=new Uint8Array(length);FS.read(stream,buf,0,length,0);if(opts.encoding==="utf8"){ret="";var utf8=new Runtime.UTF8Processor;for(var i=0;i<length;i++){ret+=utf8.processCChar(buf[i])}}else if(opts.encoding==="binary"){ret=buf}FS.close(stream);return ret}),writeFile:(function(path,data,opts){opts=opts||{};opts.flags=opts.flags||"w";opts.encoding=opts.encoding||"utf8";if(opts.encoding!=="utf8"&&opts.encoding!=="binary"){throw new Error('Invalid encoding type "'+opts.encoding+'"')}var stream=FS.open(path,opts.flags,opts.mode);if(opts.encoding==="utf8"){var utf8=new Runtime.UTF8Processor;var buf=new Uint8Array(utf8.processJSString(data));FS.write(stream,buf,0,buf.length,0,opts.canOwn)}else if(opts.encoding==="binary"){FS.write(stream,data,0,data.length,0,opts.canOwn)}FS.close(stream)}),cwd:(function(){return FS.currentPath}),chdir:(function(path){var lookup=FS.lookupPath(path,{follow:true});if(!FS.isDir(lookup.node.mode)){throw new FS.ErrnoError(ERRNO_CODES.ENOTDIR)}var err=FS.nodePermissions(lookup.node,"x");if(err){throw new FS.ErrnoError(err)}FS.currentPath=lookup.path}),createDefaultDirectories:(function(){FS.mkdir("/tmp");FS.mkdir("/home");FS.mkdir("/home/web_user")}),createDefaultDevices:(function(){FS.mkdir("/dev");FS.registerDevice(FS.makedev(1,3),{read:(function(){return 0}),write:(function(){return 0})});FS.mkdev("/dev/null",FS.makedev(1,3));TTY.register(FS.makedev(5,0),TTY.default_tty_ops);TTY.register(FS.makedev(6,0),TTY.default_tty1_ops);FS.mkdev("/dev/tty",FS.makedev(5,0));FS.mkdev("/dev/tty1",FS.makedev(6,0));var random_device;if(typeof crypto!=="undefined"){var randomBuffer=new Uint8Array(1);random_device=(function(){crypto.getRandomValues(randomBuffer);return randomBuffer[0]})}else if(ENVIRONMENT_IS_NODE){random_device=(function(){return require("crypto").randomBytes(1)[0]})}else{random_device=(function(){return Math.floor(Math.random()*256)})}FS.createDevice("/dev","random",random_device);FS.createDevice("/dev","urandom",random_device);FS.mkdir("/dev/shm");FS.mkdir("/dev/shm/tmp")}),createStandardStreams:(function(){if(Module["stdin"]){FS.createDevice("/dev","stdin",Module["stdin"])}else{FS.symlink("/dev/tty","/dev/stdin")}if(Module["stdout"]){FS.createDevice("/dev","stdout",null,Module["stdout"])}else{FS.symlink("/dev/tty","/dev/stdout")}if(Module["stderr"]){FS.createDevice("/dev","stderr",null,Module["stderr"])}else{FS.symlink("/dev/tty1","/dev/stderr")}var stdin=FS.open("/dev/stdin","r");SAFE_HEAP_STORE(_stdin|0,FS.getPtrForStream(stdin)|0,4,0)|0;assert(stdin.fd===0,"invalid handle for stdin ("+stdin.fd+")");var stdout=FS.open("/dev/stdout","w");SAFE_HEAP_STORE(_stdout|0,FS.getPtrForStream(stdout)|0,4,0)|0;assert(stdout.fd===1,"invalid handle for stdout ("+stdout.fd+")");var stderr=FS.open("/dev/stderr","w");SAFE_HEAP_STORE(_stderr|0,FS.getPtrForStream(stderr)|0,4,0)|0;assert(stderr.fd===2,"invalid handle for stderr ("+stderr.fd+")")}),ensureErrnoError:(function(){if(FS.ErrnoError)return;FS.ErrnoError=function ErrnoError(errno){this.errno=errno;for(var key in ERRNO_CODES){if(ERRNO_CODES[key]===errno){this.code=key;break}}this.message=ERRNO_MESSAGES[errno]};FS.ErrnoError.prototype=new Error;FS.ErrnoError.prototype.constructor=FS.ErrnoError;[ERRNO_CODES.ENOENT].forEach((function(code){FS.genericErrors[code]=new FS.ErrnoError(code);FS.genericErrors[code].stack="<generic error, no stack>"}))}),staticInit:(function(){FS.ensureErrnoError();FS.nameTable=new Array(4096);FS.mount(MEMFS,{},"/");FS.createDefaultDirectories();FS.createDefaultDevices()}),init:(function(input,output,error){assert(!FS.init.initialized,"FS.init was previously called. If you want to initialize later with custom parameters, remove any earlier calls (note that one is automatically added to the generated code)");FS.init.initialized=true;FS.ensureErrnoError();Module["stdin"]=input||Module["stdin"];Module["stdout"]=output||Module["stdout"];Module["stderr"]=error||Module["stderr"];FS.createStandardStreams()}),quit:(function(){FS.init.initialized=false;for(var i=0;i<FS.streams.length;i++){var stream=FS.streams[i];if(!stream){continue}FS.close(stream)}}),getMode:(function(canRead,canWrite){var mode=0;if(canRead)mode|=292|73;if(canWrite)mode|=146;return mode}),joinPath:(function(parts,forceRelative){var path=PATH.join.apply(null,parts);if(forceRelative&&path[0]=="/")path=path.substr(1);return path}),absolutePath:(function(relative,base){return PATH.resolve(base,relative)}),standardizePath:(function(path){return PATH.normalize(path)}),findObject:(function(path,dontResolveLastLink){var ret=FS.analyzePath(path,dontResolveLastLink);if(ret.exists){return ret.object}else{___setErrNo(ret.error);return null}}),analyzePath:(function(path,dontResolveLastLink){try{var lookup=FS.lookupPath(path,{follow:!dontResolveLastLink});path=lookup.path}catch(e){}var ret={isRoot:false,exists:false,error:0,name:null,path:null,object:null,parentExists:false,parentPath:null,parentObject:null};try{var lookup=FS.lookupPath(path,{parent:true});ret.parentExists=true;ret.parentPath=lookup.path;ret.parentObject=lookup.node;ret.name=PATH.basename(path);lookup=FS.lookupPath(path,{follow:!dontResolveLastLink});ret.exists=true;ret.path=lookup.path;ret.object=lookup.node;ret.name=lookup.node.name;ret.isRoot=lookup.path==="/"}catch(e){ret.error=e.errno}return ret}),createFolder:(function(parent,name,canRead,canWrite){var path=PATH.join2(typeof parent==="string"?parent:FS.getPath(parent),name);var mode=FS.getMode(canRead,canWrite);return FS.mkdir(path,mode)}),createPath:(function(parent,path,canRead,canWrite){parent=typeof parent==="string"?parent:FS.getPath(parent);var parts=path.split("/").reverse();while(parts.length){var part=parts.pop();if(!part)continue;var current=PATH.join2(parent,part);try{FS.mkdir(current)}catch(e){}parent=current}return current}),createFile:(function(parent,name,properties,canRead,canWrite){var path=PATH.join2(typeof parent==="string"?parent:FS.getPath(parent),name);var mode=FS.getMode(canRead,canWrite);return FS.create(path,mode)}),createDataFile:(function(parent,name,data,canRead,canWrite,canOwn){var path=name?PATH.join2(typeof parent==="string"?parent:FS.getPath(parent),name):parent;var mode=FS.getMode(canRead,canWrite);var node=FS.create(path,mode);if(data){if(typeof data==="string"){var arr=new Array(data.length);for(var i=0,len=data.length;i<len;++i)arr[i]=data.charCodeAt(i);data=arr}FS.chmod(node,mode|146);var stream=FS.open(node,"w");FS.write(stream,data,0,data.length,0,canOwn);FS.close(stream);FS.chmod(node,mode)}return node}),createDevice:(function(parent,name,input,output){var path=PATH.join2(typeof parent==="string"?parent:FS.getPath(parent),name);var mode=FS.getMode(!!input,!!output);if(!FS.createDevice.major)FS.createDevice.major=64;var dev=FS.makedev(FS.createDevice.major++,0);FS.registerDevice(dev,{open:(function(stream){stream.seekable=false}),close:(function(stream){if(output&&output.buffer&&output.buffer.length){output(10)}}),read:(function(stream,buffer,offset,length,pos){var bytesRead=0;for(var i=0;i<length;i++){var result;try{result=input()}catch(e){throw new FS.ErrnoError(ERRNO_CODES.EIO)}if(result===undefined&&bytesRead===0){throw new FS.ErrnoError(ERRNO_CODES.EAGAIN)}if(result===null||result===undefined)break;bytesRead++;buffer[offset+i]=result}if(bytesRead){stream.node.timestamp=Date.now()}return bytesRead}),write:(function(stream,buffer,offset,length,pos){for(var i=0;i<length;i++){try{output(buffer[offset+i])}catch(e){throw new FS.ErrnoError(ERRNO_CODES.EIO)}}if(length){stream.node.timestamp=Date.now()}return i})});return FS.mkdev(path,mode,dev)}),createLink:(function(parent,name,target,canRead,canWrite){var path=PATH.join2(typeof parent==="string"?parent:FS.getPath(parent),name);return FS.symlink(target,path)}),forceLoadFile:(function(obj){if(obj.isDevice||obj.isFolder||obj.link||obj.contents)return true;var success=true;if(typeof XMLHttpRequest!=="undefined"){throw new Error("Lazy loading should have been performed (contents set) in createLazyFile, but it was not. Lazy loading only works in web workers. Use --embed-file or --preload-file in emcc on the main thread.")}else if(Module["read"]){try{obj.contents=intArrayFromString(Module["read"](obj.url),true);obj.usedBytes=obj.contents.length}catch(e){success=false}}else{throw new Error("Cannot load without read() or XMLHttpRequest.")}if(!success)___setErrNo(ERRNO_CODES.EIO);return success}),createLazyFile:(function(parent,name,url,canRead,canWrite){function LazyUint8Array(){this.lengthKnown=false;this.chunks=[]}LazyUint8Array.prototype.get=function LazyUint8Array_get(idx){if(idx>this.length-1||idx<0){return undefined}var chunkOffset=idx%this.chunkSize;var chunkNum=Math.floor(idx/this.chunkSize);return this.getter(chunkNum)[chunkOffset]};LazyUint8Array.prototype.setDataGetter=function LazyUint8Array_setDataGetter(getter){this.getter=getter};LazyUint8Array.prototype.cacheLength=function LazyUint8Array_cacheLength(){var xhr=new XMLHttpRequest;xhr.open("HEAD",url,false);xhr.send(null);if(!(xhr.status>=200&&xhr.status<300||xhr.status===304))throw new Error("Couldn't load "+url+". Status: "+xhr.status);var datalength=Number(xhr.getResponseHeader("Content-length"));var header;var hasByteServing=(header=xhr.getResponseHeader("Accept-Ranges"))&&header==="bytes";var chunkSize=1024*1024;if(!hasByteServing)chunkSize=datalength;var doXHR=(function(from,to){if(from>to)throw new Error("invalid range ("+from+", "+to+") or no bytes requested!");if(to>datalength-1)throw new Error("only "+datalength+" bytes available! programmer error!");var xhr=new XMLHttpRequest;xhr.open("GET",url,false);if(datalength!==chunkSize)xhr.setRequestHeader("Range","bytes="+from+"-"+to);if(typeof Uint8Array!="undefined")xhr.responseType="arraybuffer";if(xhr.overrideMimeType){xhr.overrideMimeType("text/plain; charset=x-user-defined")}xhr.send(null);if(!(xhr.status>=200&&xhr.status<300||xhr.status===304))throw new Error("Couldn't load "+url+". Status: "+xhr.status);if(xhr.response!==undefined){return new Uint8Array(xhr.response||[])}else{return intArrayFromString(xhr.responseText||"",true)}});var lazyArray=this;lazyArray.setDataGetter((function(chunkNum){var start=chunkNum*chunkSize;var end=(chunkNum+1)*chunkSize-1;end=Math.min(end,datalength-1);if(typeof lazyArray.chunks[chunkNum]==="undefined"){lazyArray.chunks[chunkNum]=doXHR(start,end)}if(typeof lazyArray.chunks[chunkNum]==="undefined")throw new Error("doXHR failed!");return lazyArray.chunks[chunkNum]}));this._length=datalength;this._chunkSize=chunkSize;this.lengthKnown=true};if(typeof XMLHttpRequest!=="undefined"){if(!ENVIRONMENT_IS_WORKER)throw"Cannot do synchronous binary XHRs outside webworkers in modern browsers. Use --embed-file or --preload-file in emcc";var lazyArray=new LazyUint8Array;Object.defineProperty(lazyArray,"length",{get:(function(){if(!this.lengthKnown){this.cacheLength()}return this._length})});Object.defineProperty(lazyArray,"chunkSize",{get:(function(){if(!this.lengthKnown){this.cacheLength()}return this._chunkSize})});var properties={isDevice:false,contents:lazyArray}}else{var properties={isDevice:false,url:url}}var node=FS.createFile(parent,name,properties,canRead,canWrite);if(properties.contents){node.contents=properties.contents}else if(properties.url){node.contents=null;node.url=properties.url}Object.defineProperty(node,"usedBytes",{get:(function(){return this.contents.length})});var stream_ops={};var keys=Object.keys(node.stream_ops);keys.forEach((function(key){var fn=node.stream_ops[key];stream_ops[key]=function forceLoadLazyFile(){if(!FS.forceLoadFile(node)){throw new FS.ErrnoError(ERRNO_CODES.EIO)}return fn.apply(null,arguments)}}));stream_ops.read=function stream_ops_read(stream,buffer,offset,length,position){if(!FS.forceLoadFile(node)){throw new FS.ErrnoError(ERRNO_CODES.EIO)}var contents=stream.node.contents;if(position>=contents.length)return 0;var size=Math.min(contents.length-position,length);assert(size>=0);if(contents.slice){for(var i=0;i<size;i++){buffer[offset+i]=contents[position+i]}}else{for(var i=0;i<size;i++){buffer[offset+i]=contents.get(position+i)}}return size};node.stream_ops=stream_ops;return node}),createPreloadedFile:(function(parent,name,url,canRead,canWrite,onload,onerror,dontCreateFile,canOwn){Browser.init();var fullname=name?PATH.resolve(PATH.join2(parent,name)):parent;function processData(byteArray){function finish(byteArray){if(!dontCreateFile){FS.createDataFile(parent,name,byteArray,canRead,canWrite,canOwn)}if(onload)onload();removeRunDependency("cp "+fullname)}var handled=false;Module["preloadPlugins"].forEach((function(plugin){if(handled)return;if(plugin["canHandle"](fullname)){plugin["handle"](byteArray,fullname,finish,(function(){if(onerror)onerror();removeRunDependency("cp "+fullname)}));handled=true}}));if(!handled)finish(byteArray)}addRunDependency("cp "+fullname);if(typeof url=="string"){Browser.asyncLoad(url,(function(byteArray){processData(byteArray)}),onerror)}else{processData(url)}}),indexedDB:(function(){return window.indexedDB||window.mozIndexedDB||window.webkitIndexedDB||window.msIndexedDB}),DB_NAME:(function(){return"EM_FS_"+window.location.pathname}),DB_VERSION:20,DB_STORE_NAME:"FILE_DATA",saveFilesToDB:(function(paths,onload,onerror){onload=onload||(function(){});onerror=onerror||(function(){});var indexedDB=FS.indexedDB();try{var openRequest=indexedDB.open(FS.DB_NAME(),FS.DB_VERSION)}catch(e){return onerror(e)}openRequest.onupgradeneeded=function openRequest_onupgradeneeded(){console.log("creating db");var db=openRequest.result;db.createObjectStore(FS.DB_STORE_NAME)};openRequest.onsuccess=function openRequest_onsuccess(){var db=openRequest.result;var transaction=db.transaction([FS.DB_STORE_NAME],"readwrite");var files=transaction.objectStore(FS.DB_STORE_NAME);var ok=0,fail=0,total=paths.length;function finish(){if(fail==0)onload();else onerror()}paths.forEach((function(path){var putRequest=files.put(FS.analyzePath(path).object.contents,path);putRequest.onsuccess=function putRequest_onsuccess(){ok++;if(ok+fail==total)finish()};putRequest.onerror=function putRequest_onerror(){fail++;if(ok+fail==total)finish()}}));transaction.onerror=onerror};openRequest.onerror=onerror}),loadFilesFromDB:(function(paths,onload,onerror){onload=onload||(function(){});onerror=onerror||(function(){});var indexedDB=FS.indexedDB();try{var openRequest=indexedDB.open(FS.DB_NAME(),FS.DB_VERSION)}catch(e){return onerror(e)}openRequest.onupgradeneeded=onerror;openRequest.onsuccess=function openRequest_onsuccess(){var db=openRequest.result;try{var transaction=db.transaction([FS.DB_STORE_NAME],"readonly")}catch(e){onerror(e);return}var files=transaction.objectStore(FS.DB_STORE_NAME);var ok=0,fail=0,total=paths.length;function finish(){if(fail==0)onload();else onerror()}paths.forEach((function(path){var getRequest=files.get(path);getRequest.onsuccess=function getRequest_onsuccess(){if(FS.analyzePath(path).exists){FS.unlink(path)}FS.createDataFile(PATH.dirname(path),PATH.basename(path),getRequest.result,true,true,true);ok++;if(ok+fail==total)finish()};getRequest.onerror=function getRequest_onerror(){fail++;if(ok+fail==total)finish()}}));transaction.onerror=onerror};openRequest.onerror=onerror})};var PATH={splitPath:(function(filename){var splitPathRe=/^(\/?|)([\s\S]*?)((?:\.{1,2}|[^\/]+?|)(\.[^.\/]*|))(?:[\/]*)$/;return splitPathRe.exec(filename).slice(1)}),normalizeArray:(function(parts,allowAboveRoot){var up=0;for(var i=parts.length-1;i>=0;i--){var last=parts[i];if(last==="."){parts.splice(i,1)}else if(last===".."){parts.splice(i,1);up++}else if(up){parts.splice(i,1);up--}}if(allowAboveRoot){for(;up--;up){parts.unshift("..")}}return parts}),normalize:(function(path){var isAbsolute=path.charAt(0)==="/",trailingSlash=path.substr(-1)==="/";path=PATH.normalizeArray(path.split("/").filter((function(p){return!!p})),!isAbsolute).join("/");if(!path&&!isAbsolute){path="."}if(path&&trailingSlash){path+="/"}return(isAbsolute?"/":"")+path}),dirname:(function(path){var result=PATH.splitPath(path),root=result[0],dir=result[1];if(!root&&!dir){return"."}if(dir){dir=dir.substr(0,dir.length-1)}return root+dir}),basename:(function(path){if(path==="/")return"/";var lastSlash=path.lastIndexOf("/");if(lastSlash===-1)return path;return path.substr(lastSlash+1)}),extname:(function(path){return PATH.splitPath(path)[3]}),join:(function(){var paths=Array.prototype.slice.call(arguments,0);return PATH.normalize(paths.join("/"))}),join2:(function(l,r){return PATH.normalize(l+"/"+r)}),resolve:(function(){var resolvedPath="",resolvedAbsolute=false;for(var i=arguments.length-1;i>=-1&&!resolvedAbsolute;i--){var path=i>=0?arguments[i]:FS.cwd();if(typeof path!=="string"){throw new TypeError("Arguments to path.resolve must be strings")}else if(!path){return""}resolvedPath=path+"/"+resolvedPath;resolvedAbsolute=path.charAt(0)==="/"}resolvedPath=PATH.normalizeArray(resolvedPath.split("/").filter((function(p){return!!p})),!resolvedAbsolute).join("/");return(resolvedAbsolute?"/":"")+resolvedPath||"."}),relative:(function(from,to){from=PATH.resolve(from).substr(1);to=PATH.resolve(to).substr(1);function trim(arr){var start=0;for(;start<arr.length;start++){if(arr[start]!=="")break}var end=arr.length-1;for(;end>=0;end--){if(arr[end]!=="")break}if(start>end)return[];return arr.slice(start,end-start+1)}var fromParts=trim(from.split("/"));var toParts=trim(to.split("/"));var length=Math.min(fromParts.length,toParts.length);var samePartsLength=length;for(var i=0;i<length;i++){if(fromParts[i]!==toParts[i]){samePartsLength=i;break}}var outputParts=[];for(var i=samePartsLength;i<fromParts.length;i++){outputParts.push("..")}outputParts=outputParts.concat(toParts.slice(samePartsLength));return outputParts.join("/")})};var Browser={mainLoop:{scheduler:null,method:"",shouldPause:false,paused:false,queue:[],pause:(function(){Browser.mainLoop.shouldPause=true}),resume:(function(){if(Browser.mainLoop.paused){Browser.mainLoop.paused=false;Browser.mainLoop.scheduler()}Browser.mainLoop.shouldPause=false}),updateStatus:(function(){if(Module["setStatus"]){var message=Module["statusMessage"]||"Please wait...";var remaining=Browser.mainLoop.remainingBlockers;var expected=Browser.mainLoop.expectedBlockers;if(remaining){if(remaining<expected){Module["setStatus"](message+" ("+(expected-remaining)+"/"+expected+")")}else{Module["setStatus"](message)}}else{Module["setStatus"]("")}}}),runIter:(function(func){if(ABORT)return;if(Module["preMainLoop"]){var preRet=Module["preMainLoop"]();if(preRet===false){return}}try{func()}catch(e){if(e instanceof ExitStatus){return}else{if(e&&typeof e==="object"&&e.stack)Module.printErr("exception thrown: "+[e,e.stack]);throw e}}if(Module["postMainLoop"])Module["postMainLoop"]()})},isFullScreen:false,pointerLock:false,moduleContextCreatedCallbacks:[],workers:[],init:(function(){if(!Module["preloadPlugins"])Module["preloadPlugins"]=[];if(Browser.initted)return;Browser.initted=true;try{new Blob;Browser.hasBlobConstructor=true}catch(e){Browser.hasBlobConstructor=false;console.log("warning: no blob constructor, cannot create blobs with mimetypes")}Browser.BlobBuilder=typeof MozBlobBuilder!="undefined"?MozBlobBuilder:typeof WebKitBlobBuilder!="undefined"?WebKitBlobBuilder:!Browser.hasBlobConstructor?console.log("warning: no BlobBuilder"):null;Browser.URLObject=typeof window!="undefined"?window.URL?window.URL:window.webkitURL:undefined;if(!Module.noImageDecoding&&typeof Browser.URLObject==="undefined"){console.log("warning: Browser does not support creating object URLs. Built-in browser image decoding will not be available.");Module.noImageDecoding=true}var imagePlugin={};imagePlugin["canHandle"]=function imagePlugin_canHandle(name){return!Module.noImageDecoding&&/\.(jpg|jpeg|png|bmp)$/i.test(name)};imagePlugin["handle"]=function imagePlugin_handle(byteArray,name,onload,onerror){var b=null;if(Browser.hasBlobConstructor){try{b=new Blob([byteArray],{type:Browser.getMimetype(name)});if(b.size!==byteArray.length){b=new Blob([(new Uint8Array(byteArray)).buffer],{type:Browser.getMimetype(name)})}}catch(e){Runtime.warnOnce("Blob constructor present but fails: "+e+"; falling back to blob builder")}}if(!b){var bb=new Browser.BlobBuilder;bb.append((new Uint8Array(byteArray)).buffer);b=bb.getBlob()}var url=Browser.URLObject.createObjectURL(b);var img=new Image;img.onload=function img_onload(){assert(img.complete,"Image "+name+" could not be decoded");var canvas=document.createElement("canvas");canvas.width=img.width;canvas.height=img.height;var ctx=canvas.getContext("2d");ctx.drawImage(img,0,0);Module["preloadedImages"][name]=canvas;Browser.URLObject.revokeObjectURL(url);if(onload)onload(byteArray)};img.onerror=function img_onerror(event){console.log("Image "+url+" could not be decoded");if(onerror)onerror()};img.src=url};Module["preloadPlugins"].push(imagePlugin);var audioPlugin={};audioPlugin["canHandle"]=function audioPlugin_canHandle(name){return!Module.noAudioDecoding&&name.substr(-4)in{".ogg":1,".wav":1,".mp3":1}};audioPlugin["handle"]=function audioPlugin_handle(byteArray,name,onload,onerror){var done=false;function finish(audio){if(done)return;done=true;Module["preloadedAudios"][name]=audio;if(onload)onload(byteArray)}function fail(){if(done)return;done=true;Module["preloadedAudios"][name]=new Audio;if(onerror)onerror()}if(Browser.hasBlobConstructor){try{var b=new Blob([byteArray],{type:Browser.getMimetype(name)})}catch(e){return fail()}var url=Browser.URLObject.createObjectURL(b);var audio=new Audio;audio.addEventListener("canplaythrough",(function(){finish(audio)}),false);audio.onerror=function audio_onerror(event){if(done)return;console.log("warning: browser could not fully decode audio "+name+", trying slower base64 approach");function encode64(data){var BASE="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";var PAD="=";var ret="";var leftchar=0;var leftbits=0;for(var i=0;i<data.length;i++){leftchar=leftchar<<8|data[i];leftbits+=8;while(leftbits>=6){var curr=leftchar>>leftbits-6&63;leftbits-=6;ret+=BASE[curr]}}if(leftbits==2){ret+=BASE[(leftchar&3)<<4];ret+=PAD+PAD}else if(leftbits==4){ret+=BASE[(leftchar&15)<<2];ret+=PAD}return ret}audio.src="data:audio/x-"+name.substr(-3)+";base64,"+encode64(byteArray);finish(audio)};audio.src=url;Browser.safeSetTimeout((function(){finish(audio)}),1e4)}else{return fail()}};Module["preloadPlugins"].push(audioPlugin);var canvas=Module["canvas"];function pointerLockChange(){Browser.pointerLock=document["pointerLockElement"]===canvas||document["mozPointerLockElement"]===canvas||document["webkitPointerLockElement"]===canvas||document["msPointerLockElement"]===canvas}if(canvas){canvas.requestPointerLock=canvas["requestPointerLock"]||canvas["mozRequestPointerLock"]||canvas["webkitRequestPointerLock"]||canvas["msRequestPointerLock"]||(function(){});canvas.exitPointerLock=document["exitPointerLock"]||document["mozExitPointerLock"]||document["webkitExitPointerLock"]||document["msExitPointerLock"]||(function(){});canvas.exitPointerLock=canvas.exitPointerLock.bind(document);document.addEventListener("pointerlockchange",pointerLockChange,false);document.addEventListener("mozpointerlockchange",pointerLockChange,false);document.addEventListener("webkitpointerlockchange",pointerLockChange,false);document.addEventListener("mspointerlockchange",pointerLockChange,false);if(Module["elementPointerLock"]){canvas.addEventListener("click",(function(ev){if(!Browser.pointerLock&&canvas.requestPointerLock){canvas.requestPointerLock();ev.preventDefault()}}),false)}}}),createContext:(function(canvas,useWebGL,setInModule,webGLContextAttributes){if(useWebGL&&Module.ctx&&canvas==Module.canvas)return Module.ctx;var ctx;var contextHandle;if(useWebGL){var contextAttributes={antialias:false,alpha:false};if(webGLContextAttributes){for(var attribute in webGLContextAttributes){contextAttributes[attribute]=webGLContextAttributes[attribute]}}contextHandle=GL.createContext(canvas,contextAttributes);ctx=GL.getContext(contextHandle).GLctx;canvas.style.backgroundColor="black"}else{ctx=canvas.getContext("2d")}if(!ctx)return null;if(setInModule){if(!useWebGL)assert(typeof GLctx==="undefined","cannot set in module if GLctx is used, but we are a non-GL context that would replace it");Module.ctx=ctx;if(useWebGL)GL.makeContextCurrent(contextHandle);Module.useWebGL=useWebGL;Browser.moduleContextCreatedCallbacks.forEach((function(callback){callback()}));Browser.init()}return ctx}),destroyContext:(function(canvas,useWebGL,setInModule){}),fullScreenHandlersInstalled:false,lockPointer:undefined,resizeCanvas:undefined,requestFullScreen:(function(lockPointer,resizeCanvas){Browser.lockPointer=lockPointer;Browser.resizeCanvas=resizeCanvas;if(typeof Browser.lockPointer==="undefined")Browser.lockPointer=true;if(typeof Browser.resizeCanvas==="undefined")Browser.resizeCanvas=false;var canvas=Module["canvas"];function fullScreenChange(){Browser.isFullScreen=false;var canvasContainer=canvas.parentNode;if((document["webkitFullScreenElement"]||document["webkitFullscreenElement"]||document["mozFullScreenElement"]||document["mozFullscreenElement"]||document["fullScreenElement"]||document["fullscreenElement"]||document["msFullScreenElement"]||document["msFullscreenElement"]||document["webkitCurrentFullScreenElement"])===canvasContainer){canvas.cancelFullScreen=document["cancelFullScreen"]||document["mozCancelFullScreen"]||document["webkitCancelFullScreen"]||document["msExitFullscreen"]||document["exitFullscreen"]||(function(){});canvas.cancelFullScreen=canvas.cancelFullScreen.bind(document);if(Browser.lockPointer)canvas.requestPointerLock();Browser.isFullScreen=true;if(Browser.resizeCanvas)Browser.setFullScreenCanvasSize()}else{canvasContainer.parentNode.insertBefore(canvas,canvasContainer);canvasContainer.parentNode.removeChild(canvasContainer);if(Browser.resizeCanvas)Browser.setWindowedCanvasSize()}if(Module["onFullScreen"])Module["onFullScreen"](Browser.isFullScreen);Browser.updateCanvasDimensions(canvas)}if(!Browser.fullScreenHandlersInstalled){Browser.fullScreenHandlersInstalled=true;document.addEventListener("fullscreenchange",fullScreenChange,false);document.addEventListener("mozfullscreenchange",fullScreenChange,false);document.addEventListener("webkitfullscreenchange",fullScreenChange,false);document.addEventListener("MSFullscreenChange",fullScreenChange,false)}var canvasContainer=document.createElement("div");canvas.parentNode.insertBefore(canvasContainer,canvas);canvasContainer.appendChild(canvas);canvasContainer.requestFullScreen=canvasContainer["requestFullScreen"]||canvasContainer["mozRequestFullScreen"]||canvasContainer["msRequestFullscreen"]||(canvasContainer["webkitRequestFullScreen"]?(function(){canvasContainer["webkitRequestFullScreen"](Element["ALLOW_KEYBOARD_INPUT"])}):null);canvasContainer.requestFullScreen()}),nextRAF:0,fakeRequestAnimationFrame:(function(func){var now=Date.now();if(Browser.nextRAF===0){Browser.nextRAF=now+1e3/60}else{while(now+2>=Browser.nextRAF){Browser.nextRAF+=1e3/60}}var delay=Math.max(Browser.nextRAF-now,0);setTimeout(func,delay)}),requestAnimationFrame:function requestAnimationFrame(func){if(typeof window==="undefined"){Browser.fakeRequestAnimationFrame(func)}else{if(!window.requestAnimationFrame){window.requestAnimationFrame=window["requestAnimationFrame"]||window["mozRequestAnimationFrame"]||window["webkitRequestAnimationFrame"]||window["msRequestAnimationFrame"]||window["oRequestAnimationFrame"]||Browser.fakeRequestAnimationFrame}window.requestAnimationFrame(func)}},safeCallback:(function(func){return(function(){if(!ABORT)return func.apply(null,arguments)})}),safeRequestAnimationFrame:(function(func){return Browser.requestAnimationFrame((function(){if(!ABORT)func()}))}),safeSetTimeout:(function(func,timeout){Module["noExitRuntime"]=true;return setTimeout((function(){if(!ABORT)func()}),timeout)}),safeSetInterval:(function(func,timeout){Module["noExitRuntime"]=true;return setInterval((function(){if(!ABORT)func()}),timeout)}),getMimetype:(function(name){return{"jpg":"image/jpeg","jpeg":"image/jpeg","png":"image/png","bmp":"image/bmp","ogg":"audio/ogg","wav":"audio/wav","mp3":"audio/mpeg"}[name.substr(name.lastIndexOf(".")+1)]}),getUserMedia:(function(func){if(!window.getUserMedia){window.getUserMedia=navigator["getUserMedia"]||navigator["mozGetUserMedia"]}window.getUserMedia(func)}),getMovementX:(function(event){return event["movementX"]||event["mozMovementX"]||event["webkitMovementX"]||0}),getMovementY:(function(event){return event["movementY"]||event["mozMovementY"]||event["webkitMovementY"]||0}),getMouseWheelDelta:(function(event){var delta=0;switch(event.type){case"DOMMouseScroll":delta=event.detail;break;case"mousewheel":delta=-event.wheelDelta;break;case"wheel":delta=event.deltaY;break;default:throw"unrecognized mouse wheel event: "+event.type}return Math.max(-1,Math.min(1,delta))}),mouseX:0,mouseY:0,mouseMovementX:0,mouseMovementY:0,touches:{},lastTouches:{},calculateMouseEvent:(function(event){if(Browser.pointerLock){if(event.type!="mousemove"&&"mozMovementX"in event){Browser.mouseMovementX=Browser.mouseMovementY=0}else{Browser.mouseMovementX=Browser.getMovementX(event);Browser.mouseMovementY=Browser.getMovementY(event)}if(typeof SDL!="undefined"){Browser.mouseX=SDL.mouseX+Browser.mouseMovementX;Browser.mouseY=SDL.mouseY+Browser.mouseMovementY}else{Browser.mouseX+=Browser.mouseMovementX;Browser.mouseY+=Browser.mouseMovementY}}else{var rect=Module["canvas"].getBoundingClientRect();var cw=Module["canvas"].width;var ch=Module["canvas"].height;var scrollX=typeof window.scrollX!=="undefined"?window.scrollX:window.pageXOffset;var scrollY=typeof window.scrollY!=="undefined"?window.scrollY:window.pageYOffset;if(event.type==="touchstart"||event.type==="touchend"||event.type==="touchmove"){var touch=event.touch;if(touch===undefined){return}var adjustedX=touch.pageX-(scrollX+rect.left);var adjustedY=touch.pageY-(scrollY+rect.top);adjustedX=adjustedX*(cw/rect.width);adjustedY=adjustedY*(ch/rect.height);var coords={x:adjustedX,y:adjustedY};if(event.type==="touchstart"){Browser.lastTouches[touch.identifier]=coords;Browser.touches[touch.identifier]=coords}else if(event.type==="touchend"||event.type==="touchmove"){Browser.lastTouches[touch.identifier]=Browser.touches[touch.identifier];Browser.touches[touch.identifier]={x:adjustedX,y:adjustedY}}return}var x=event.pageX-(scrollX+rect.left);var y=event.pageY-(scrollY+rect.top);x=x*(cw/rect.width);y=y*(ch/rect.height);Browser.mouseMovementX=x-Browser.mouseX;Browser.mouseMovementY=y-Browser.mouseY;Browser.mouseX=x;Browser.mouseY=y}}),xhrLoad:(function(url,onload,onerror){var xhr=new XMLHttpRequest;xhr.open("GET",url,true);xhr.responseType="arraybuffer";xhr.onload=function xhr_onload(){if(xhr.status==200||xhr.status==0&&xhr.response){onload(xhr.response)}else{onerror()}};xhr.onerror=onerror;xhr.send(null)}),asyncLoad:(function(url,onload,onerror,noRunDep){Browser.xhrLoad(url,(function(arrayBuffer){assert(arrayBuffer,'Loading data file "'+url+'" failed (no arrayBuffer).');onload(new Uint8Array(arrayBuffer));if(!noRunDep)removeRunDependency("al "+url)}),(function(event){if(onerror){onerror()}else{throw'Loading data file "'+url+'" failed.'}}));if(!noRunDep)addRunDependency("al "+url)}),resizeListeners:[],updateResizeListeners:(function(){var canvas=Module["canvas"];Browser.resizeListeners.forEach((function(listener){listener(canvas.width,canvas.height)}))}),setCanvasSize:(function(width,height,noUpdates){var canvas=Module["canvas"];Browser.updateCanvasDimensions(canvas,width,height);if(!noUpdates)Browser.updateResizeListeners()}),windowedWidth:0,windowedHeight:0,setFullScreenCanvasSize:(function(){if(typeof SDL!="undefined"){var flags=SAFE_HEAP_LOAD(SDL.screen+Runtime.QUANTUM_SIZE*0|0,4,0,1)|0;flags=flags|8388608;SAFE_HEAP_STORE(SDL.screen+Runtime.QUANTUM_SIZE*0|0,flags|0,4,0)|0}Browser.updateResizeListeners()}),setWindowedCanvasSize:(function(){if(typeof SDL!="undefined"){var flags=SAFE_HEAP_LOAD(SDL.screen+Runtime.QUANTUM_SIZE*0|0,4,0,1)|0;flags=flags&~8388608;SAFE_HEAP_STORE(SDL.screen+Runtime.QUANTUM_SIZE*0|0,flags|0,4,0)|0}Browser.updateResizeListeners()}),updateCanvasDimensions:(function(canvas,wNative,hNative){if(wNative&&hNative){canvas.widthNative=wNative;canvas.heightNative=hNative}else{wNative=canvas.widthNative;hNative=canvas.heightNative}var w=wNative;var h=hNative;if(Module["forcedAspectRatio"]&&Module["forcedAspectRatio"]>0){if(w/h<Module["forcedAspectRatio"]){w=Math.round(h*Module["forcedAspectRatio"])}else{h=Math.round(w/Module["forcedAspectRatio"])}}if((document["webkitFullScreenElement"]||document["webkitFullscreenElement"]||document["mozFullScreenElement"]||document["mozFullscreenElement"]||document["fullScreenElement"]||document["fullscreenElement"]||document["msFullScreenElement"]||document["msFullscreenElement"]||document["webkitCurrentFullScreenElement"])===canvas.parentNode&&typeof screen!="undefined"){var factor=Math.min(screen.width/w,screen.height/h);w=Math.round(w*factor);h=Math.round(h*factor)}if(Browser.resizeCanvas){if(canvas.width!=w)canvas.width=w;if(canvas.height!=h)canvas.height=h;if(typeof canvas.style!="undefined"){canvas.style.removeProperty("width");canvas.style.removeProperty("height")}}else{if(canvas.width!=wNative)canvas.width=wNative;if(canvas.height!=hNative)canvas.height=hNative;if(typeof canvas.style!="undefined"){if(w!=wNative||h!=hNative){canvas.style.setProperty("width",w+"px","important");canvas.style.setProperty("height",h+"px","important")}else{canvas.style.removeProperty("width");canvas.style.removeProperty("height")}}}})};Module["_strlen"]=_strlen;function _emscripten_memcpy_big(dest,src,num){HEAPU8.set(HEAPU8.subarray(src,src+num),dest);return dest}Module["_memcpy"]=_memcpy;Module["requestFullScreen"]=function Module_requestFullScreen(lockPointer,resizeCanvas){Browser.requestFullScreen(lockPointer,resizeCanvas)};Module["requestAnimationFrame"]=function Module_requestAnimationFrame(func){Browser.requestAnimationFrame(func)};Module["setCanvasSize"]=function Module_setCanvasSize(width,height,noUpdates){Browser.setCanvasSize(width,height,noUpdates)};Module["pauseMainLoop"]=function Module_pauseMainLoop(){Browser.mainLoop.pause()};Module["resumeMainLoop"]=function Module_resumeMainLoop(){Browser.mainLoop.resume()};Module["getUserMedia"]=function Module_getUserMedia(){Browser.getUserMedia()};FS.staticInit();__ATINIT__.unshift({func:(function(){if(!Module["noFSInit"]&&!FS.init.initialized)FS.init()})});__ATMAIN__.push({func:(function(){FS.ignorePermissions=false})});__ATEXIT__.push({func:(function(){FS.quit()})});Module["FS_createFolder"]=FS.createFolder;Module["FS_createPath"]=FS.createPath;Module["FS_createDataFile"]=FS.createDataFile;Module["FS_createPreloadedFile"]=FS.createPreloadedFile;Module["FS_createLazyFile"]=FS.createLazyFile;Module["FS_createLink"]=FS.createLink;Module["FS_createDevice"]=FS.createDevice;___errno_state=Runtime.staticAlloc(4);SAFE_HEAP_STORE(___errno_state|0,0|0,4,0)|0;__ATINIT__.unshift({func:(function(){TTY.init()})});__ATEXIT__.push({func:(function(){TTY.shutdown()})});TTY.utf8=new Runtime.UTF8Processor;if(ENVIRONMENT_IS_NODE){var fs=require("fs");NODEFS.staticInit()}STACK_BASE=STACKTOP=Runtime.alignMemory(STATICTOP);staticSealed=true;STACK_MAX=STACK_BASE+5242880;DYNAMIC_BASE=DYNAMICTOP=Runtime.alignMemory(STACK_MAX);assert(DYNAMIC_BASE<TOTAL_MEMORY,"TOTAL_MEMORY not big enough for stack");var ctlz_i8=allocate([8,7,6,6,5,5,5,5,4,4,4,4,4,4,4,4,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],"i8",ALLOC_DYNAMIC);var cttz_i8=allocate([8,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,4,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,5,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,4,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,6,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,4,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,5,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,4,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,7,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,4,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,5,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,4,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,6,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,4,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,5,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,4,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0],"i8",ALLOC_DYNAMIC);var Math_min=Math.min;function asmPrintInt(x,y){Module.print("int "+x+","+y)}function asmPrintFloat(x,y){Module.print("float "+x+","+y)}var asm=(function(global,env,buffer) {
// EMSCRIPTEN_START_ASM
"use asm";var a=new global.Int8Array(buffer);var b=new global.Int16Array(buffer);var c=new global.Int32Array(buffer);var d=new global.Uint8Array(buffer);var e=new global.Uint16Array(buffer);var f=new global.Uint32Array(buffer);var g=new global.Float32Array(buffer);var h=new global.Float64Array(buffer);var i=env.STACKTOP|0;var j=env.STACK_MAX|0;var k=env.tempDoublePtr|0;var l=env.ABORT|0;var m=env.cttz_i8|0;var n=env.ctlz_i8|0;var o=0;var p=0;var q=0;var r=0;var s=+env.NaN,t=+env.Infinity;var u=0,v=0,w=0,x=0,y=0.0,z=0,A=0,B=0,C=0.0;var D=0;var E=0;var F=0;var G=0;var H=0;var I=0;var J=0;var K=0;var L=0;var M=0;var N=global.Math.floor;var O=global.Math.abs;var P=global.Math.sqrt;var Q=global.Math.pow;var R=global.Math.cos;var S=global.Math.sin;var T=global.Math.tan;var U=global.Math.acos;var V=global.Math.asin;var W=global.Math.atan;var X=global.Math.atan2;var Y=global.Math.exp;var Z=global.Math.log;var _=global.Math.ceil;var $=global.Math.imul;var aa=env.abort;var ba=env.assert;var ca=env.asmPrintInt;var da=env.asmPrintFloat;var ea=env.min;var fa=env.SAFE_HEAP_LOAD;var ga=env.SAFE_HEAP_STORE;var ha=env.SAFE_FT_MASK;var ia=env._free;var ja=env.___setErrNo;var ka=env._malloc;var la=env._emscripten_memcpy_big;var ma=env._fflush;var na=env.___assert_fail;var oa=0.0;
// EMSCRIPTEN_START_FUNCS
function pa(a){a=a|0;var b=0;b=i;i=i+a|0;i=i+7&-8;return b|0}function qa(){return i|0}function ra(a){a=a|0;i=a}function sa(a,b){a=a|0;b=b|0;if((o|0)==0){o=a;p=b}}function ta(a){a=a|0;ga(k>>0|0,fa(a>>0|0,1,0,0)|0|0,1,0);ga(k+1>>0|0,fa(a+1>>0|0,1,0,0)|0|0,1,0);ga(k+2>>0|0,fa(a+2>>0|0,1,0,0)|0|0,1,0);ga(k+3>>0|0,fa(a+3>>0|0,1,0,0)|0|0,1,0)}function ua(a){a=a|0;ga(k>>0|0,fa(a>>0|0,1,0,0)|0|0,1,0);ga(k+1>>0|0,fa(a+1>>0|0,1,0,0)|0|0,1,0);ga(k+2>>0|0,fa(a+2>>0|0,1,0,0)|0|0,1,0);ga(k+3>>0|0,fa(a+3>>0|0,1,0,0)|0|0,1,0);ga(k+4>>0|0,fa(a+4>>0|0,1,0,0)|0|0,1,0);ga(k+5>>0|0,fa(a+5>>0|0,1,0,0)|0|0,1,0);ga(k+6>>0|0,fa(a+6>>0|0,1,0,0)|0|0,1,0);ga(k+7>>0|0,fa(a+7>>0|0,1,0,0)|0|0,1,0)}function va(a){a=a|0;D=a}function wa(){return D|0}function xa(a,b,c){a=a|0;b=b|0;c=c|0;var d=0,e=0,f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0,P=0,Q=0,R=0,S=0,T=0,U=0,V=0,W=0,X=0,Y=0,Z=0,_=0,$=0,aa=0,ba=0,ca=0,da=0,ea=0,ha=0,ia=0,ja=0,ka=0;d=i;Y=b+40|0;j=b+44|0;m=b+48|0;p=b+52|0;s=b+56|0;v=b+60|0;y=b+64|0;B=b+68|0;E=b+72|0;F=b+76|0;V=b+4|0;S=b+8|0;Q=b+12|0;h=b+16|0;n=b+20|0;r=b+24|0;w=b+28|0;A=b+32|0;P=b+36|0;ja=(fa(V|0,4,0,0)|0|0)+(fa(j|0,4,0,0)|0|0)|0;ia=(fa(S|0,4,0,0)|0|0)+(fa(m|0,4,0,0)|0|0)|0;ha=(fa(Q|0,4,0,0)|0|0)+(fa(p|0,4,0,0)|0|0)|0;ea=(fa(h|0,4,0,0)|0|0)+(fa(s|0,4,0,0)|0|0)|0;da=(fa(n|0,4,0,0)|0|0)+(fa(v|0,4,0,0)|0|0)|0;ca=(fa(r|0,4,0,0)|0|0)+(fa(y|0,4,0,0)|0|0)|0;ba=(fa(w|0,4,0,0)|0|0)+(fa(B|0,4,0,0)|0|0)|0;aa=(fa(A|0,4,0,0)|0|0)+(fa(E|0,4,0,0)|0|0)|0;$=(fa(P|0,4,0,0)|0|0)+(fa(F|0,4,0,0)|0|0)|0;ga(a|0,(fa(b|0,4,0,0)|0|0)+(fa(Y|0,4,0,0)|0|0)|0,4,0);ka=a+4|0;ga(ka|0,ja|0,4,0);ja=a+8|0;ga(ja|0,ia|0,4,0);ia=a+12|0;ga(ia|0,ha|0,4,0);ha=a+16|0;ga(ha|0,ea|0,4,0);ea=a+20|0;ga(ea|0,da|0,4,0);da=a+24|0;ga(da|0,ca|0,4,0);ca=a+28|0;ga(ca|0,ba|0,4,0);ba=a+32|0;ga(ba|0,aa|0,4,0);aa=a+36|0;ga(aa|0,$|0,4,0);$=a+40|0;V=(fa(j|0,4,0,0)|0|0)-(fa(V|0,4,0,0)|0|0)|0;S=(fa(m|0,4,0,0)|0|0)-(fa(S|0,4,0,0)|0|0)|0;Q=(fa(p|0,4,0,0)|0|0)-(fa(Q|0,4,0,0)|0|0)|0;h=(fa(s|0,4,0,0)|0|0)-(fa(h|0,4,0,0)|0|0)|0;n=(fa(v|0,4,0,0)|0|0)-(fa(n|0,4,0,0)|0|0)|0;r=(fa(y|0,4,0,0)|0|0)-(fa(r|0,4,0,0)|0|0)|0;w=(fa(B|0,4,0,0)|0|0)-(fa(w|0,4,0,0)|0|0)|0;A=(fa(E|0,4,0,0)|0|0)-(fa(A|0,4,0,0)|0|0)|0;P=(fa(F|0,4,0,0)|0|0)-(fa(P|0,4,0,0)|0|0)|0;ga($|0,(fa(Y|0,4,0,0)|0|0)-(fa(b|0,4,0,0)|0|0)|0,4,0);Y=a+44|0;ga(Y|0,V|0,4,0);V=a+48|0;ga(V|0,S|0,4,0);S=a+52|0;ga(S|0,Q|0,4,0);Q=a+56|0;ga(Q|0,h|0,4,0);h=a+60|0;ga(h|0,n|0,4,0);n=a+64|0;ga(n|0,r|0,4,0);r=a+68|0;ga(r|0,w|0,4,0);w=a+72|0;ga(w|0,A|0,4,0);A=a+76|0;ga(A|0,P|0,4,0);P=a+80|0;ya(P,a,c);ya($,$,c+40|0);F=a+120|0;ya(F,c+120|0,b+120|0);ya(a,b+80|0,c+80|0);E=(fa(a|0,4,0,0)|0)<<1;B=(fa(ka|0,4,0,0)|0)<<1;y=(fa(ja|0,4,0,0)|0)<<1;v=(fa(ia|0,4,0,0)|0)<<1;s=(fa(ha|0,4,0,0)|0)<<1;p=(fa(ea|0,4,0,0)|0)<<1;m=(fa(da|0,4,0,0)|0)<<1;j=(fa(ca|0,4,0,0)|0)<<1;f=(fa(ba|0,4,0,0)|0)<<1;c=(fa(aa|0,4,0,0)|0)<<1;Z=fa(P|0,4,0,0)|0|0;O=a+84|0;W=fa(O|0,4,0,0)|0|0;N=a+88|0;T=fa(N|0,4,0,0)|0|0;M=a+92|0;b=fa(M|0,4,0,0)|0|0;L=a+96|0;g=fa(L|0,4,0,0)|0|0;K=a+100|0;l=fa(K|0,4,0,0)|0|0;J=a+104|0;q=fa(J|0,4,0,0)|0|0;I=a+108|0;u=fa(I|0,4,0,0)|0|0;H=a+112|0;z=fa(H|0,4,0,0)|0|0;G=a+116|0;D=fa(G|0,4,0,0)|0|0;_=fa($|0,4,0,0)|0|0;X=fa(Y|0,4,0,0)|0|0;U=fa(V|0,4,0,0)|0|0;R=fa(S|0,4,0,0)|0|0;e=fa(Q|0,4,0,0)|0|0;k=fa(h|0,4,0,0)|0|0;o=fa(n|0,4,0,0)|0|0;t=fa(r|0,4,0,0)|0|0;x=fa(w|0,4,0,0)|0|0;C=fa(A|0,4,0,0)|0|0;ga(a|0,Z-_|0,4,0);ga(ka|0,W-X|0,4,0);ga(ja|0,T-U|0,4,0);ga(ia|0,b-R|0,4,0);ga(ha|0,g-e|0,4,0);ga(ea|0,l-k|0,4,0);ga(da|0,q-o|0,4,0);ga(ca|0,u-t|0,4,0);ga(ba|0,z-x|0,4,0);ga(aa|0,D-C|0,4,0);ga($|0,_+Z|0,4,0);ga(Y|0,X+W|0,4,0);ga(V|0,U+T|0,4,0);ga(S|0,R+b|0,4,0);ga(Q|0,e+g|0,4,0);ga(h|0,k+l|0,4,0);ga(n|0,o+q|0,4,0);ga(r|0,t+u|0,4,0);ga(w|0,x+z|0,4,0);ga(A|0,C+D|0,4,0);D=fa(F|0,4,0,0)|0|0;C=a+124|0;A=fa(C|0,4,0,0)|0|0;z=a+128|0;x=fa(z|0,4,0,0)|0|0;w=a+132|0;u=fa(w|0,4,0,0)|0|0;t=a+136|0;r=fa(t|0,4,0,0)|0|0;q=a+140|0;o=fa(q|0,4,0,0)|0|0;n=a+144|0;l=fa(n|0,4,0,0)|0|0;k=a+148|0;h=fa(k|0,4,0,0)|0|0;g=a+152|0;e=fa(g|0,4,0,0)|0|0;a=a+156|0;b=fa(a|0,4,0,0)|0|0;ga(P|0,D+E|0,4,0);ga(O|0,A+B|0,4,0);ga(N|0,x+y|0,4,0);ga(M|0,u+v|0,4,0);ga(L|0,r+s|0,4,0);ga(K|0,o+p|0,4,0);ga(J|0,l+m|0,4,0);ga(I|0,h+j|0,4,0);ga(H|0,e+f|0,4,0);ga(G|0,b+c|0,4,0);ga(F|0,E-D|0,4,0);ga(C|0,B-A|0,4,0);ga(z|0,y-x|0,4,0);ga(w|0,v-u|0,4,0);ga(t|0,s-r|0,4,0);ga(q|0,p-o|0,4,0);ga(n|0,m-l|0,4,0);ga(k|0,j-h|0,4,0);ga(g|0,f-e|0,4,0);ga(a|0,c-b|0,4,0);i=d;return}function ya(a,b,c){a=a|0;b=b|0;c=c|0;var d=0,e=0,f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0,P=0,Q=0,R=0,S=0,T=0,U=0,V=0,W=0,X=0,Y=0,Z=0,_=0,$=0,aa=0,ba=0,ca=0,da=0,ea=0,ha=0,ia=0,ja=0,ka=0,la=0,ma=0,na=0,oa=0,pa=0,qa=0,ra=0,sa=0,ta=0,ua=0,va=0,wa=0,xa=0,ya=0,za=0,Aa=0,Ba=0,Ca=0,Da=0,Ea=0,Fa=0,Ga=0,Ha=0,Ia=0,Ja=0,Ka=0,La=0,Ma=0,Na=0,Oa=0,Pa=0,Qa=0,Ra=0,Sa=0,Ta=0,Ua=0,Va=0,Wa=0,Xa=0,Ya=0,Za=0,_a=0,$a=0,ab=0,bb=0,cb=0,db=0,eb=0,ib=0,jb=0,lb=0,mb=0,nb=0,ob=0,pb=0,qb=0,rb=0,tb=0,ub=0,vb=0,wb=0,xb=0,yb=0,zb=0,Ab=0,Bb=0,Cb=0,Db=0,Eb=0,Fb=0,Gb=0,Hb=0,Ib=0,Jb=0,Kb=0,Lb=0,Mb=0,Nb=0,Ob=0,Pb=0,Qb=0,Rb=0,Sb=0,Tb=0,Ub=0,Vb=0,Wb=0,Xb=0,Yb=0,Zb=0,_b=0,$b=0,ac=0,bc=0,cc=0,dc=0,ec=0,fc=0,gc=0,hc=0,ic=0,jc=0,kc=0,lc=0,mc=0,nc=0,oc=0,pc=0,qc=0,rc=0,sc=0,tc=0,uc=0,vc=0,wc=0,xc=0,yc=0,zc=0,Ac=0,Bc=0,Cc=0,Dc=0,Ec=0,Fc=0,Gc=0,Hc=0,Ic=0,Jc=0,Kc=0,Lc=0,Mc=0,Nc=0,Oc=0,Pc=0,Qc=0,Rc=0,Sc=0,Tc=0,Uc=0,Vc=0,Wc=0,Xc=0,Yc=0,Zc=0,_c=0;d=i;m=fa(b|0,4,0,0)|0|0;t=fa(b+4|0,4,0,0)|0|0;k=fa(b+8|0,4,0,0)|0|0;Zb=fa(b+12|0,4,0,0)|0|0;e=fa(b+16|0,4,0,0)|0|0;Ca=fa(b+20|0,4,0,0)|0|0;Ba=fa(b+24|0,4,0,0)|0|0;Hb=fa(b+28|0,4,0,0)|0|0;h=fa(b+32|0,4,0,0)|0|0;ja=fa(b+36|0,4,0,0)|0|0;I=fa(c|0,4,0,0)|0|0;K=fa(c+4|0,4,0,0)|0|0;G=fa(c+8|0,4,0,0)|0|0;E=fa(c+12|0,4,0,0)|0|0;B=fa(c+16|0,4,0,0)|0|0;z=fa(c+20|0,4,0,0)|0|0;x=fa(c+24|0,4,0,0)|0|0;v=fa(c+28|0,4,0,0)|0|0;l=fa(c+32|0,4,0,0)|0|0;u=fa(c+36|0,4,0,0)|0|0;Wc=K*19|0;jc=G*19|0;zb=E*19|0;Ka=B*19|0;rc=z*19|0;Lb=x*19|0;Wa=v*19|0;_c=l*19|0;Yc=u*19|0;q=t<<1;f=Zb<<1;N=Ca<<1;j=Hb<<1;b=ja<<1;p=((m|0)<0)<<31>>31;J=((I|0)<0)<<31>>31;Uc=sb(I|0,J|0,m|0,p|0)|0;Tc=D;L=((K|0)<0)<<31>>31;Ec=sb(K|0,L|0,m|0,p|0)|0;Dc=D;H=((G|0)<0)<<31>>31;Cb=sb(G|0,H|0,m|0,p|0)|0;Bb=D;F=((E|0)<0)<<31>>31;Na=sb(E|0,F|0,m|0,p|0)|0;Ma=D;C=((B|0)<0)<<31>>31;uc=sb(B|0,C|0,m|0,p|0)|0;tc=D;A=((z|0)<0)<<31>>31;Ob=sb(z|0,A|0,m|0,p|0)|0;Nb=D;y=((x|0)<0)<<31>>31;Za=sb(x|0,y|0,m|0,p|0)|0;Ya=D;w=((v|0)<0)<<31>>31;ma=sb(v|0,w|0,m|0,p|0)|0;la=D;Xc=((l|0)<0)<<31>>31;Q=sb(l|0,Xc|0,m|0,p|0)|0;P=D;p=sb(u|0,((u|0)<0)<<31>>31|0,m|0,p|0)|0;m=D;u=((t|0)<0)<<31>>31;lc=sb(I|0,J|0,t|0,u|0)|0;mc=D;o=((q|0)<0)<<31>>31;Gb=sb(K|0,L|0,q|0,o|0)|0;Fb=D;Pa=sb(G|0,H|0,t|0,u|0)|0;Oa=D;wc=sb(E|0,F|0,q|0,o|0)|0;vc=D;Qb=sb(B|0,C|0,t|0,u|0)|0;Pb=D;$a=sb(z|0,A|0,q|0,o|0)|0;_a=D;oa=sb(x|0,y|0,t|0,u|0)|0;na=D;S=sb(v|0,w|0,q|0,o|0)|0;R=D;u=sb(l|0,Xc|0,t|0,u|0)|0;t=D;Xc=((Yc|0)<0)<<31>>31;o=sb(Yc|0,Xc|0,q|0,o|0)|0;q=D;l=((k|0)<0)<<31>>31;Eb=sb(I|0,J|0,k|0,l|0)|0;Db=D;Ta=sb(K|0,L|0,k|0,l|0)|0;Sa=D;yc=sb(G|0,H|0,k|0,l|0)|0;xc=D;Sb=sb(E|0,F|0,k|0,l|0)|0;Rb=D;bb=sb(B|0,C|0,k|0,l|0)|0;ab=D;qa=sb(z|0,A|0,k|0,l|0)|0;pa=D;U=sb(x|0,y|0,k|0,l|0)|0;T=D;w=sb(v|0,w|0,k|0,l|0)|0;v=D;Zc=((_c|0)<0)<<31>>31;Gc=sb(_c|0,Zc|0,k|0,l|0)|0;Fc=D;l=sb(Yc|0,Xc|0,k|0,l|0)|0;k=D;_b=((Zb|0)<0)<<31>>31;Ra=sb(I|0,J|0,Zb|0,_b|0)|0;Qa=D;ia=((f|0)<0)<<31>>31;Cc=sb(K|0,L|0,f|0,ia|0)|0;Bc=D;Ub=sb(G|0,H|0,Zb|0,_b|0)|0;Tb=D;db=sb(E|0,F|0,f|0,ia|0)|0;cb=D;sa=sb(B|0,C|0,Zb|0,_b|0)|0;ra=D;W=sb(z|0,A|0,f|0,ia|0)|0;V=D;y=sb(x|0,y|0,Zb|0,_b|0)|0;x=D;Xa=((Wa|0)<0)<<31>>31;Ic=sb(Wa|0,Xa|0,f|0,ia|0)|0;Hc=D;_b=sb(_c|0,Zc|0,Zb|0,_b|0)|0;Zb=D;ia=sb(Yc|0,Xc|0,f|0,ia|0)|0;f=D;O=((e|0)<0)<<31>>31;Ac=sb(I|0,J|0,e|0,O|0)|0;zc=D;Yb=sb(K|0,L|0,e|0,O|0)|0;Xb=D;ib=sb(G|0,H|0,e|0,O|0)|0;eb=D;ua=sb(E|0,F|0,e|0,O|0)|0;ta=D;Y=sb(B|0,C|0,e|0,O|0)|0;X=D;A=sb(z|0,A|0,e|0,O|0)|0;z=D;Mb=((Lb|0)<0)<<31>>31;Kc=sb(Lb|0,Mb|0,e|0,O|0)|0;Jc=D;ac=sb(Wa|0,Xa|0,e|0,O|0)|0;$b=D;pb=sb(_c|0,Zc|0,e|0,O|0)|0;ob=D;O=sb(Yc|0,Xc|0,e|0,O|0)|0;e=D;Da=((Ca|0)<0)<<31>>31;Wb=sb(I|0,J|0,Ca|0,Da|0)|0;Vb=D;c=((N|0)<0)<<31>>31;nb=sb(K|0,L|0,N|0,c|0)|0;mb=D;wa=sb(G|0,H|0,Ca|0,Da|0)|0;va=D;_=sb(E|0,F|0,N|0,c|0)|0;Z=D;C=sb(B|0,C|0,Ca|0,Da|0)|0;B=D;sc=((rc|0)<0)<<31>>31;Mc=sb(rc|0,sc|0,N|0,c|0)|0;Lc=D;cc=sb(Lb|0,Mb|0,Ca|0,Da|0)|0;bc=D;rb=sb(Wa|0,Xa|0,N|0,c|0)|0;qb=D;Da=sb(_c|0,Zc|0,Ca|0,Da|0)|0;Ca=D;c=sb(Yc|0,Xc|0,N|0,c|0)|0;N=D;g=((Ba|0)<0)<<31>>31;lb=sb(I|0,J|0,Ba|0,g|0)|0;jb=D;Aa=sb(K|0,L|0,Ba|0,g|0)|0;za=D;aa=sb(G|0,H|0,Ba|0,g|0)|0;$=D;F=sb(E|0,F|0,Ba|0,g|0)|0;E=D;La=((Ka|0)<0)<<31>>31;Oc=sb(Ka|0,La|0,Ba|0,g|0)|0;Nc=D;ec=sb(rc|0,sc|0,Ba|0,g|0)|0;dc=D;ub=sb(Lb|0,Mb|0,Ba|0,g|0)|0;tb=D;Fa=sb(Wa|0,Xa|0,Ba|0,g|0)|0;Ea=D;n=sb(_c|0,Zc|0,Ba|0,g|0)|0;s=D;g=sb(Yc|0,Xc|0,Ba|0,g|0)|0;Ba=D;Ib=((Hb|0)<0)<<31>>31;ya=sb(I|0,J|0,Hb|0,Ib|0)|0;xa=D;ha=((j|0)<0)<<31>>31;ea=sb(K|0,L|0,j|0,ha|0)|0;da=D;H=sb(G|0,H|0,Hb|0,Ib|0)|0;G=D;Ab=((zb|0)<0)<<31>>31;Qc=sb(zb|0,Ab|0,j|0,ha|0)|0;Pc=D;gc=sb(Ka|0,La|0,Hb|0,Ib|0)|0;fc=D;wb=sb(rc|0,sc|0,j|0,ha|0)|0;vb=D;Ha=sb(Lb|0,Mb|0,Hb|0,Ib|0)|0;Ga=D;oc=sb(Wa|0,Xa|0,j|0,ha|0)|0;nc=D;Ib=sb(_c|0,Zc|0,Hb|0,Ib|0)|0;Hb=D;ha=sb(Yc|0,Xc|0,j|0,ha|0)|0;j=D;M=((h|0)<0)<<31>>31;ca=sb(I|0,J|0,h|0,M|0)|0;ba=D;L=sb(K|0,L|0,h|0,M|0)|0;K=D;kc=((jc|0)<0)<<31>>31;Sc=sb(jc|0,kc|0,h|0,M|0)|0;Rc=D;ic=sb(zb|0,Ab|0,h|0,M|0)|0;hc=D;yb=sb(Ka|0,La|0,h|0,M|0)|0;xb=D;Ja=sb(rc|0,sc|0,h|0,M|0)|0;Ia=D;qc=sb(Lb|0,Mb|0,h|0,M|0)|0;pc=D;Kb=sb(Wa|0,Xa|0,h|0,M|0)|0;Jb=D;Va=sb(_c|0,Zc|0,h|0,M|0)|0;Ua=D;M=sb(Yc|0,Xc|0,h|0,M|0)|0;h=D;ka=((ja|0)<0)<<31>>31;J=sb(I|0,J|0,ja|0,ka|0)|0;I=D;r=((b|0)<0)<<31>>31;Wc=sb(Wc|0,((Wc|0)<0)<<31>>31|0,b|0,r|0)|0;Vc=D;kc=sb(jc|0,kc|0,ja|0,ka|0)|0;jc=D;Ab=sb(zb|0,Ab|0,b|0,r|0)|0;zb=D;La=sb(Ka|0,La|0,ja|0,ka|0)|0;Ka=D;sc=sb(rc|0,sc|0,b|0,r|0)|0;rc=D;Mb=sb(Lb|0,Mb|0,ja|0,ka|0)|0;Lb=D;Xa=sb(Wa|0,Xa|0,b|0,r|0)|0;Wa=D;ka=sb(_c|0,Zc|0,ja|0,ka|0)|0;ja=D;r=sb(Yc|0,Xc|0,b|0,r|0)|0;b=D;Tc=hb(Wc|0,Vc|0,Uc|0,Tc|0)|0;Rc=hb(Tc|0,D|0,Sc|0,Rc|0)|0;Pc=hb(Rc|0,D|0,Qc|0,Pc|0)|0;Nc=hb(Pc|0,D|0,Oc|0,Nc|0)|0;Lc=hb(Nc|0,D|0,Mc|0,Lc|0)|0;Jc=hb(Lc|0,D|0,Kc|0,Jc|0)|0;Hc=hb(Jc|0,D|0,Ic|0,Hc|0)|0;Fc=hb(Hc|0,D|0,Gc|0,Fc|0)|0;q=hb(Fc|0,D|0,o|0,q|0)|0;o=D;mc=hb(Ec|0,Dc|0,lc|0,mc|0)|0;lc=D;zc=hb(Cc|0,Bc|0,Ac|0,zc|0)|0;xc=hb(zc|0,D|0,yc|0,xc|0)|0;vc=hb(xc|0,D|0,wc|0,vc|0)|0;tc=hb(vc|0,D|0,uc|0,tc|0)|0;rc=hb(tc|0,D|0,sc|0,rc|0)|0;pc=hb(rc|0,D|0,qc|0,pc|0)|0;nc=hb(pc|0,D|0,oc|0,nc|0)|0;s=hb(nc|0,D|0,n|0,s|0)|0;N=hb(s|0,D|0,c|0,N|0)|0;c=D;s=hb(q|0,o|0,33554432,0)|0;s=fb(s|0,D|0,26)|0;n=D;jc=hb(mc|0,lc|0,kc|0,jc|0)|0;hc=hb(jc|0,D|0,ic|0,hc|0)|0;fc=hb(hc|0,D|0,gc|0,fc|0)|0;dc=hb(fc|0,D|0,ec|0,dc|0)|0;bc=hb(dc|0,D|0,cc|0,bc|0)|0;$b=hb(bc|0,D|0,ac|0,$b|0)|0;Zb=hb($b|0,D|0,_b|0,Zb|0)|0;k=hb(Zb|0,D|0,l|0,k|0)|0;k=hb(k|0,D|0,s|0,n|0)|0;l=D;n=kb(s|0,n|0,26)|0;n=gb(q|0,o|0,n|0,D|0)|0;o=D;q=hb(N|0,c|0,33554432,0)|0;q=fb(q|0,D|0,26)|0;s=D;Vb=hb(Yb|0,Xb|0,Wb|0,Vb|0)|0;Tb=hb(Vb|0,D|0,Ub|0,Tb|0)|0;Rb=hb(Tb|0,D|0,Sb|0,Rb|0)|0;Pb=hb(Rb|0,D|0,Qb|0,Pb|0)|0;Nb=hb(Pb|0,D|0,Ob|0,Nb|0)|0;Lb=hb(Nb|0,D|0,Mb|0,Lb|0)|0;Jb=hb(Lb|0,D|0,Kb|0,Jb|0)|0;Hb=hb(Jb|0,D|0,Ib|0,Hb|0)|0;Ba=hb(Hb|0,D|0,g|0,Ba|0)|0;Ba=hb(Ba|0,D|0,q|0,s|0)|0;g=D;s=kb(q|0,s|0,26)|0;s=gb(N|0,c|0,s|0,D|0)|0;c=D;N=hb(k|0,l|0,16777216,0)|0;N=fb(N|0,D|0,25)|0;q=D;Db=hb(Gb|0,Fb|0,Eb|0,Db|0)|0;Bb=hb(Db|0,D|0,Cb|0,Bb|0)|0;zb=hb(Bb|0,D|0,Ab|0,zb|0)|0;xb=hb(zb|0,D|0,yb|0,xb|0)|0;vb=hb(xb|0,D|0,wb|0,vb|0)|0;tb=hb(vb|0,D|0,ub|0,tb|0)|0;qb=hb(tb|0,D|0,rb|0,qb|0)|0;ob=hb(qb|0,D|0,pb|0,ob|0)|0;f=hb(ob|0,D|0,ia|0,f|0)|0;f=hb(f|0,D|0,N|0,q|0)|0;ia=D;q=kb(N|0,q|0,25)|0;q=gb(k|0,l|0,q|0,D|0)|0;l=D;k=hb(Ba|0,g|0,16777216,0)|0;k=fb(k|0,D|0,25)|0;N=D;jb=hb(nb|0,mb|0,lb|0,jb|0)|0;eb=hb(jb|0,D|0,ib|0,eb|0)|0;cb=hb(eb|0,D|0,db|0,cb|0)|0;ab=hb(cb|0,D|0,bb|0,ab|0)|0;_a=hb(ab|0,D|0,$a|0,_a|0)|0;Ya=hb(_a|0,D|0,Za|0,Ya|0)|0;Wa=hb(Ya|0,D|0,Xa|0,Wa|0)|0;Ua=hb(Wa|0,D|0,Va|0,Ua|0)|0;j=hb(Ua|0,D|0,ha|0,j|0)|0;j=hb(j|0,D|0,k|0,N|0)|0;ha=D;N=kb(k|0,N|0,25)|0;N=gb(Ba|0,g|0,N|0,D|0)|0;g=D;Ba=hb(f|0,ia|0,33554432,0)|0;Ba=fb(Ba|0,D|0,26)|0;k=D;Qa=hb(Ta|0,Sa|0,Ra|0,Qa|0)|0;Oa=hb(Qa|0,D|0,Pa|0,Oa|0)|0;Ma=hb(Oa|0,D|0,Na|0,Ma|0)|0;Ka=hb(Ma|0,D|0,La|0,Ka|0)|0;Ia=hb(Ka|0,D|0,Ja|0,Ia|0)|0;Ga=hb(Ia|0,D|0,Ha|0,Ga|0)|0;Ea=hb(Ga|0,D|0,Fa|0,Ea|0)|0;Ca=hb(Ea|0,D|0,Da|0,Ca|0)|0;e=hb(Ca|0,D|0,O|0,e|0)|0;e=hb(e|0,D|0,Ba|0,k|0)|0;O=D;k=kb(Ba|0,k|0,26)|0;k=gb(f|0,ia|0,k|0,D|0)|0;ia=hb(j|0,ha|0,33554432,0)|0;ia=fb(ia|0,D|0,26)|0;f=D;xa=hb(Aa|0,za|0,ya|0,xa|0)|0;va=hb(xa|0,D|0,wa|0,va|0)|0;ta=hb(va|0,D|0,ua|0,ta|0)|0;ra=hb(ta|0,D|0,sa|0,ra|0)|0;pa=hb(ra|0,D|0,qa|0,pa|0)|0;na=hb(pa|0,D|0,oa|0,na|0)|0;la=hb(na|0,D|0,ma|0,la|0)|0;ja=hb(la|0,D|0,ka|0,ja|0)|0;h=hb(ja|0,D|0,M|0,h|0)|0;h=hb(h|0,D|0,ia|0,f|0)|0;M=D;f=kb(ia|0,f|0,26)|0;f=gb(j|0,ha|0,f|0,D|0)|0;ha=hb(e|0,O|0,16777216,0)|0;ha=fb(ha|0,D|0,25)|0;j=D;c=hb(ha|0,j|0,s|0,c|0)|0;s=D;j=kb(ha|0,j|0,25)|0;j=gb(e|0,O|0,j|0,D|0)|0;O=hb(h|0,M|0,16777216,0)|0;O=fb(O|0,D|0,25)|0;e=D;ba=hb(ea|0,da|0,ca|0,ba|0)|0;$=hb(ba|0,D|0,aa|0,$|0)|0;Z=hb($|0,D|0,_|0,Z|0)|0;X=hb(Z|0,D|0,Y|0,X|0)|0;V=hb(X|0,D|0,W|0,V|0)|0;T=hb(V|0,D|0,U|0,T|0)|0;R=hb(T|0,D|0,S|0,R|0)|0;P=hb(R|0,D|0,Q|0,P|0)|0;b=hb(P|0,D|0,r|0,b|0)|0;b=hb(b|0,D|0,O|0,e|0)|0;r=D;e=kb(O|0,e|0,25)|0;e=gb(h|0,M|0,e|0,D|0)|0;M=hb(c|0,s|0,33554432,0)|0;M=fb(M|0,D|0,26)|0;h=D;g=hb(N|0,g|0,M|0,h|0)|0;h=kb(M|0,h|0,26)|0;h=gb(c|0,s|0,h|0,D|0)|0;s=hb(b|0,r|0,33554432,0)|0;s=fb(s|0,D|0,26)|0;c=D;I=hb(L|0,K|0,J|0,I|0)|0;G=hb(I|0,D|0,H|0,G|0)|0;E=hb(G|0,D|0,F|0,E|0)|0;B=hb(E|0,D|0,C|0,B|0)|0;z=hb(B|0,D|0,A|0,z|0)|0;x=hb(z|0,D|0,y|0,x|0)|0;v=hb(x|0,D|0,w|0,v|0)|0;t=hb(v|0,D|0,u|0,t|0)|0;m=hb(t|0,D|0,p|0,m|0)|0;m=hb(m|0,D|0,s|0,c|0)|0;p=D;c=kb(s|0,c|0,26)|0;c=gb(b|0,r|0,c|0,D|0)|0;r=hb(m|0,p|0,16777216,0)|0;r=fb(r|0,D|0,25)|0;b=D;s=sb(r|0,b|0,19,0)|0;o=hb(s|0,D|0,n|0,o|0)|0;n=D;b=kb(r|0,b|0,25)|0;b=gb(m|0,p|0,b|0,D|0)|0;p=hb(o|0,n|0,33554432,0)|0;p=fb(p|0,D|0,26)|0;m=D;l=hb(q|0,l|0,p|0,m|0)|0;m=kb(p|0,m|0,26)|0;m=gb(o|0,n|0,m|0,D|0)|0;ga(a|0,m|0,4,0);ga(a+4|0,l|0,4,0);ga(a+8|0,k|0,4,0);ga(a+12|0,j|0,4,0);ga(a+16|0,h|0,4,0);ga(a+20|0,g|0,4,0);ga(a+24|0,f|0,4,0);ga(a+28|0,e|0,4,0);ga(a+32|0,c|0,4,0);ga(a+36|0,b|0,4,0);i=d;return}function za(a,b){a=a|0;b=b|0;var c=0,d=0,e=0,f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0;c=i;i=i+608|0;g=c+480|0;e=c+320|0;m=c+160|0;d=c;Aa(a,b);q=fa(b+4|0,4,0,0)|0|0;p=fa(b+8|0,4,0,0)|0|0;o=fa(b+12|0,4,0,0)|0|0;n=fa(b+16|0,4,0,0)|0|0;l=fa(b+20|0,4,0,0)|0|0;f=fa(b+24|0,4,0,0)|0|0;j=fa(b+28|0,4,0,0)|0|0;k=fa(b+32|0,4,0,0)|0|0;h=fa(b+36|0,4,0,0)|0|0;ga(g|0,fa(b|0,4,0,0)|0|0,4,0);ga(g+4|0,q|0,4,0);ga(g+8|0,p|0,4,0);ga(g+12|0,o|0,4,0);ga(g+16|0,n|0,4,0);ga(g+20|0,l|0,4,0);ga(g+24|0,f|0,4,0);ga(g+28|0,j|0,4,0);ga(g+32|0,k|0,4,0);ga(g+36|0,h|0,4,0);h=fa(b+44|0,4,0,0)|0|0;k=fa(b+48|0,4,0,0)|0|0;j=fa(b+52|0,4,0,0)|0|0;f=fa(b+56|0,4,0,0)|0|0;l=fa(b+60|0,4,0,0)|0|0;n=fa(b+64|0,4,0,0)|0|0;o=fa(b+68|0,4,0,0)|0|0;p=fa(b+72|0,4,0,0)|0|0;q=fa(b+76|0,4,0,0)|0|0;ga(g+40|0,fa(b+40|0,4,0,0)|0|0,4,0);ga(g+44|0,h|0,4,0);ga(g+48|0,k|0,4,0);ga(g+52|0,j|0,4,0);ga(g+56|0,f|0,4,0);ga(g+60|0,l|0,4,0);ga(g+64|0,n|0,4,0);ga(g+68|0,o|0,4,0);ga(g+72|0,p|0,4,0);ga(g+76|0,q|0,4,0);q=fa(b+84|0,4,0,0)|0|0;p=fa(b+88|0,4,0,0)|0|0;o=fa(b+92|0,4,0,0)|0|0;n=fa(b+96|0,4,0,0)|0|0;l=fa(b+100|0,4,0,0)|0|0;f=fa(b+104|0,4,0,0)|0|0;j=fa(b+108|0,4,0,0)|0|0;k=fa(b+112|0,4,0,0)|0|0;h=fa(b+116|0,4,0,0)|0|0;ga(g+80|0,fa(b+80|0,4,0,0)|0|0,4,0);ga(g+84|0,q|0,4,0);ga(g+88|0,p|0,4,0);ga(g+92|0,o|0,4,0);ga(g+96|0,n|0,4,0);ga(g+100|0,l|0,4,0);ga(g+104|0,f|0,4,0);ga(g+108|0,j|0,4,0);ga(g+112|0,k|0,4,0);ga(g+116|0,h|0,4,0);Ea(e,g);g=e+120|0;ya(m,e,g);b=e+40|0;h=e+80|0;ya(m+40|0,b,h);ya(m+80|0,h,g);ya(m+120|0,e,b);xa(e,m,a);ya(d,e,g);k=d+40|0;ya(k,b,h);j=d+80|0;ya(j,h,g);f=d+120|0;ya(f,e,b);l=a+160|0;Aa(l,d);xa(e,m,l);ya(d,e,g);ya(k,b,h);ya(j,h,g);ya(f,e,b);l=a+320|0;Aa(l,d);xa(e,m,l);ya(d,e,g);ya(k,b,h);ya(j,h,g);ya(f,e,b);l=a+480|0;Aa(l,d);xa(e,m,l);ya(d,e,g);ya(k,b,h);ya(j,h,g);ya(f,e,b);l=a+640|0;Aa(l,d);xa(e,m,l);ya(d,e,g);ya(k,b,h);ya(j,h,g);ya(f,e,b);l=a+800|0;Aa(l,d);xa(e,m,l);ya(d,e,g);ya(k,b,h);ya(j,h,g);ya(f,e,b);l=a+960|0;Aa(l,d);xa(e,m,l);ya(d,e,g);ya(k,b,h);ya(j,h,g);ya(f,e,b);Aa(a+1120|0,d);i=c;return}function Aa(a,b){a=a|0;b=b|0;var c=0,d=0,e=0,f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0;c=i;n=b+40|0;w=b+44|0;v=b+48|0;u=b+52|0;t=b+56|0;s=b+60|0;r=b+64|0;q=b+68|0;p=b+72|0;o=b+76|0;d=b+4|0;e=b+8|0;f=b+12|0;g=b+16|0;h=b+20|0;j=b+24|0;k=b+28|0;l=b+32|0;m=b+36|0;F=(fa(d|0,4,0,0)|0|0)+(fa(w|0,4,0,0)|0|0)|0;E=(fa(e|0,4,0,0)|0|0)+(fa(v|0,4,0,0)|0|0)|0;D=(fa(f|0,4,0,0)|0|0)+(fa(u|0,4,0,0)|0|0)|0;C=(fa(g|0,4,0,0)|0|0)+(fa(t|0,4,0,0)|0|0)|0;B=(fa(h|0,4,0,0)|0|0)+(fa(s|0,4,0,0)|0|0)|0;A=(fa(j|0,4,0,0)|0|0)+(fa(r|0,4,0,0)|0|0)|0;z=(fa(k|0,4,0,0)|0|0)+(fa(q|0,4,0,0)|0|0)|0;y=(fa(l|0,4,0,0)|0|0)+(fa(p|0,4,0,0)|0|0)|0;x=(fa(m|0,4,0,0)|0|0)+(fa(o|0,4,0,0)|0|0)|0;ga(a|0,(fa(b|0,4,0,0)|0|0)+(fa(n|0,4,0,0)|0|0)|0,4,0);ga(a+4|0,F|0,4,0);ga(a+8|0,E|0,4,0);ga(a+12|0,D|0,4,0);ga(a+16|0,C|0,4,0);ga(a+20|0,B|0,4,0);ga(a+24|0,A|0,4,0);ga(a+28|0,z|0,4,0);ga(a+32|0,y|0,4,0);ga(a+36|0,x|0,4,0);d=(fa(w|0,4,0,0)|0|0)-(fa(d|0,4,0,0)|0|0)|0;e=(fa(v|0,4,0,0)|0|0)-(fa(e|0,4,0,0)|0|0)|0;f=(fa(u|0,4,0,0)|0|0)-(fa(f|0,4,0,0)|0|0)|0;g=(fa(t|0,4,0,0)|0|0)-(fa(g|0,4,0,0)|0|0)|0;h=(fa(s|0,4,0,0)|0|0)-(fa(h|0,4,0,0)|0|0)|0;j=(fa(r|0,4,0,0)|0|0)-(fa(j|0,4,0,0)|0|0)|0;k=(fa(q|0,4,0,0)|0|0)-(fa(k|0,4,0,0)|0|0)|0;l=(fa(p|0,4,0,0)|0|0)-(fa(l|0,4,0,0)|0|0)|0;m=(fa(o|0,4,0,0)|0|0)-(fa(m|0,4,0,0)|0|0)|0;ga(a+40|0,(fa(n|0,4,0,0)|0|0)-(fa(b|0,4,0,0)|0|0)|0,4,0);ga(a+44|0,d|0,4,0);ga(a+48|0,e|0,4,0);ga(a+52|0,f|0,4,0);ga(a+56|0,g|0,4,0);ga(a+60|0,h|0,4,0);ga(a+64|0,j|0,4,0);ga(a+68|0,k|0,4,0);ga(a+72|0,l|0,4,0);ga(a+76|0,m|0,4,0);m=fa(b+84|0,4,0,0)|0|0;l=fa(b+88|0,4,0,0)|0|0;k=fa(b+92|0,4,0,0)|0|0;j=fa(b+96|0,4,0,0)|0|0;h=fa(b+100|0,4,0,0)|0|0;g=fa(b+104|0,4,0,0)|0|0;f=fa(b+108|0,4,0,0)|0|0;e=fa(b+112|0,4,0,0)|0|0;d=fa(b+116|0,4,0,0)|0|0;ga(a+80|0,fa(b+80|0,4,0,0)|0|0,4,0);ga(a+84|0,m|0,4,0);ga(a+88|0,l|0,4,0);ga(a+92|0,k|0,4,0);ga(a+96|0,j|0,4,0);ga(a+100|0,h|0,4,0);ga(a+104|0,g|0,4,0);ga(a+108|0,f|0,4,0);ga(a+112|0,e|0,4,0);ga(a+116|0,d|0,4,0);ya(a+120|0,b+120|0,320);i=c;return}function Ba(a,b){a=a|0;b=b|0;var c=0,d=0,e=0,f=0;c=i;e=b+120|0;ya(a,b,e);d=b+40|0;f=b+80|0;ya(a+40|0,d,f);ya(a+80|0,f,e);ya(a+120|0,b,d);i=c;return}function Ca(a,b,c,d){a=a|0;b=b|0;c=c|0;d=d|0;var e=0,f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0,P=0,Q=0,R=0,S=0,T=0,U=0,V=0,W=0,X=0,Y=0,Z=0,_=0,$=0,aa=0,ba=0,ca=0,da=0,ea=0,ha=0,ia=0,ja=0,ka=0,la=0,ma=0,na=0,oa=0,pa=0,qa=0,ra=0,sa=0,ta=0,ua=0,va=0,wa=0,Aa=0,Ba=0,Ca=0,Ha=0,Ia=0,Ja=0,Ka=0,La=0,Ma=0,Na=0,Oa=0,Pa=0,Qa=0,Ra=0,Sa=0,Ta=0,Ua=0,Va=0,Wa=0,Xa=0,Ya=0,Za=0,_a=0,$a=0,ab=0,bb=0,cb=0,db=0,eb=0,fb=0,gb=0,hb=0,ib=0,jb=0,kb=0;g=i;i=i+2112|0;e=g+1856|0;f=g+1600|0;k=g+320|0;h=g+160|0;j=g;Da(e,b);Da(f,d);za(k,c);l=a+0|0;b=l+40|0;do{ga(l|0,0|0,4,0);l=l+4|0}while((l|0)<(b|0));c=a+40|0;ga(c|0,1|0,4,0);l=a+44|0;b=l+36|0;do{ga(l|0,0|0,4,0);l=l+4|0}while((l|0)<(b|0));d=a+80|0;ga(d|0,1|0,4,0);l=a+84|0;b=l+36|0;do{ga(l|0,0|0,4,0);l=l+4|0}while((l|0)<(b|0));Ia=255;while(1){if((fa(e+Ia>>0|0,1,0,0)|0|0)!=0){break}b=Ia+ -1|0;if((fa(f+Ia>>0|0,1,0,0)|0|0)!=0){break}if((Ia|0)>0){Ia=b}else{Ia=b;break}}if(!((Ia|0)>-1)){i=g;return}t=h+120|0;w=j+40|0;u=h+40|0;v=h+80|0;x=j+80|0;y=j+120|0;z=j+44|0;A=j+48|0;B=j+52|0;C=j+56|0;D=j+60|0;E=j+64|0;F=j+68|0;G=j+72|0;H=j+76|0;I=j+4|0;J=j+8|0;K=j+12|0;L=j+16|0;M=j+20|0;N=j+24|0;O=j+28|0;P=j+32|0;Q=j+36|0;R=h+4|0;S=h+8|0;n=h+12|0;U=h+16|0;V=h+20|0;W=h+24|0;X=h+28|0;Y=h+32|0;Z=h+36|0;_=h+44|0;$=h+48|0;aa=h+52|0;ba=h+56|0;ca=h+60|0;da=h+64|0;ea=h+68|0;ha=h+72|0;ia=h+76|0;ja=j+84|0;ka=j+88|0;la=j+92|0;ma=j+96|0;na=j+100|0;oa=j+104|0;pa=j+108|0;qa=j+112|0;ra=j+116|0;sa=h+84|0;ta=h+88|0;ua=h+92|0;va=h+96|0;wa=h+100|0;Aa=h+104|0;Ba=h+108|0;Ca=h+112|0;Ha=h+116|0;T=h+124|0;s=h+128|0;r=h+132|0;q=h+136|0;p=h+140|0;m=h+144|0;l=h+148|0;b=h+152|0;o=h+156|0;while(1){Ea(h,a);Ja=fa(e+Ia>>0|0,1,0,0)|0|0;if(!(Ja<<24>>24>0)){if(Ja<<24>>24<0){ya(j,h,t);ya(w,u,v);ya(x,v,t);ya(y,h,u);Fa(h,j,k+(((Ja<<24>>24|0)/-2|0)*160|0)|0)}}else{ya(j,h,t);ya(w,u,v);ya(x,v,t);ya(y,h,u);xa(h,j,k+(((Ja<<24>>24|0)/2|0)*160|0)|0)}Ja=fa(f+Ia>>0|0,1,0,0)|0|0;if(!(Ja<<24>>24>0)){if(Ja<<24>>24<0){ya(j,h,t);ya(w,u,v);ya(x,v,t);ya(y,h,u);$a=(Ja<<24>>24|0)/-2|0;kb=fa(w|0,4,0,0)|0|0;Ya=fa(z|0,4,0,0)|0|0;Qa=fa(A|0,4,0,0)|0|0;bb=fa(B|0,4,0,0)|0|0;fb=fa(C|0,4,0,0)|0|0;jb=fa(D|0,4,0,0)|0|0;La=fa(E|0,4,0,0)|0|0;Pa=fa(F|0,4,0,0)|0|0;Ta=fa(G|0,4,0,0)|0|0;Xa=fa(H|0,4,0,0)|0|0;ab=fa(j|0,4,0,0)|0|0;Ua=fa(I|0,4,0,0)|0|0;Ma=fa(J|0,4,0,0)|0|0;db=fa(K|0,4,0,0)|0|0;hb=fa(L|0,4,0,0)|0|0;Ja=fa(M|0,4,0,0)|0|0;Na=fa(N|0,4,0,0)|0|0;Ra=fa(O|0,4,0,0)|0|0;Va=fa(P|0,4,0,0)|0|0;Za=fa(Q|0,4,0,0)|0|0;ga(h|0,ab+kb|0,4,0);ga(R|0,Ua+Ya|0,4,0);ga(S|0,Ma+Qa|0,4,0);ga(n|0,db+bb|0,4,0);ga(U|0,hb+fb|0,4,0);ga(V|0,Ja+jb|0,4,0);ga(W|0,Na+La|0,4,0);ga(X|0,Ra+Pa|0,4,0);ga(Y|0,Va+Ta|0,4,0);ga(Z|0,Za+Xa|0,4,0);ga(u|0,kb-ab|0,4,0);ga(_|0,Ya-Ua|0,4,0);ga($|0,Qa-Ma|0,4,0);ga(aa|0,bb-db|0,4,0);ga(ba|0,fb-hb|0,4,0);ga(ca|0,jb-Ja|0,4,0);ga(da|0,La-Na|0,4,0);ga(ea|0,Pa-Ra|0,4,0);ga(ha|0,Ta-Va|0,4,0);ga(ia|0,Xa-Za|0,4,0);ya(v,h,31120+($a*120|0)|0);ya(u,u,31080+($a*120|0)|0);ya(t,31160+($a*120|0)|0,y);$a=(fa(x|0,4,0,0)|0)<<1;Za=(fa(ja|0,4,0,0)|0)<<1;Xa=(fa(ka|0,4,0,0)|0)<<1;Va=(fa(la|0,4,0,0)|0)<<1;Ta=(fa(ma|0,4,0,0)|0)<<1;Ra=(fa(na|0,4,0,0)|0)<<1;Pa=(fa(oa|0,4,0,0)|0)<<1;Na=(fa(pa|0,4,0,0)|0)<<1;La=(fa(qa|0,4,0,0)|0)<<1;Ja=(fa(ra|0,4,0,0)|0)<<1;jb=fa(v|0,4,0,0)|0|0;hb=fa(sa|0,4,0,0)|0|0;fb=fa(ta|0,4,0,0)|0|0;db=fa(ua|0,4,0,0)|0|0;bb=fa(va|0,4,0,0)|0|0;Ma=fa(wa|0,4,0,0)|0|0;Qa=fa(Aa|0,4,0,0)|0|0;Ua=fa(Ba|0,4,0,0)|0|0;Ya=fa(Ca|0,4,0,0)|0|0;ab=fa(Ha|0,4,0,0)|0|0;kb=fa(u|0,4,0,0)|0|0;ib=fa(_|0,4,0,0)|0|0;gb=fa($|0,4,0,0)|0|0;eb=fa(aa|0,4,0,0)|0|0;cb=fa(ba|0,4,0,0)|0|0;Ka=fa(ca|0,4,0,0)|0|0;Oa=fa(da|0,4,0,0)|0|0;Sa=fa(ea|0,4,0,0)|0|0;Wa=fa(ha|0,4,0,0)|0|0;_a=fa(ia|0,4,0,0)|0|0;ga(h|0,jb-kb|0,4,0);ga(R|0,hb-ib|0,4,0);ga(S|0,fb-gb|0,4,0);ga(n|0,db-eb|0,4,0);ga(U|0,bb-cb|0,4,0);ga(V|0,Ma-Ka|0,4,0);ga(W|0,Qa-Oa|0,4,0);ga(X|0,Ua-Sa|0,4,0);ga(Y|0,Ya-Wa|0,4,0);ga(Z|0,ab-_a|0,4,0);ga(u|0,kb+jb|0,4,0);ga(_|0,ib+hb|0,4,0);ga($|0,gb+fb|0,4,0);ga(aa|0,eb+db|0,4,0);ga(ba|0,cb+bb|0,4,0);ga(ca|0,Ka+Ma|0,4,0);ga(da|0,Oa+Qa|0,4,0);ga(ea|0,Sa+Ua|0,4,0);ga(ha|0,Wa+Ya|0,4,0);ga(ia|0,_a+ab|0,4,0);ab=fa(t|0,4,0,0)|0|0;_a=fa(T|0,4,0,0)|0|0;Ya=fa(s|0,4,0,0)|0|0;Wa=fa(r|0,4,0,0)|0|0;Ua=fa(q|0,4,0,0)|0|0;Sa=fa(p|0,4,0,0)|0|0;Qa=fa(m|0,4,0,0)|0|0;Oa=fa(l|0,4,0,0)|0|0;Ma=fa(b|0,4,0,0)|0|0;Ka=fa(o|0,4,0,0)|0|0;ga(v|0,$a-ab|0,4,0);ga(sa|0,Za-_a|0,4,0);ga(ta|0,Xa-Ya|0,4,0);ga(ua|0,Va-Wa|0,4,0);ga(va|0,Ta-Ua|0,4,0);ga(wa|0,Ra-Sa|0,4,0);ga(Aa|0,Pa-Qa|0,4,0);ga(Ba|0,Na-Oa|0,4,0);ga(Ca|0,La-Ma|0,4,0);ga(Ha|0,Ja-Ka|0,4,0);ga(t|0,ab+$a|0,4,0);ga(T|0,_a+Za|0,4,0);ga(s|0,Ya+Xa|0,4,0);ga(r|0,Wa+Va|0,4,0);ga(q|0,Ua+Ta|0,4,0);ga(p|0,Sa+Ra|0,4,0);ga(m|0,Qa+Pa|0,4,0);ga(l|0,Oa+Na|0,4,0);ga(b|0,Ma+La|0,4,0);ga(o|0,Ka+Ja|0,4,0)}}else{ya(j,h,t);ya(w,u,v);ya(x,v,t);ya(y,h,u);Ga(h,j,31080+(((Ja<<24>>24|0)/2|0)*120|0)|0)}ya(a,h,t);ya(c,u,v);ya(d,v,t);if((Ia|0)>0){Ia=Ia+ -1|0}else{break}}i=g;return}function Da(a,b){a=a|0;b=b|0;var c=0,d=0,e=0,f=0,g=0,h=0,j=0,k=0;c=i;d=0;do{ga(a+d>>0|0,(fa(b+(d>>3)>>0|0,1,0,1)|0|0)>>>(d&7)&1|0,1,0);d=d+1|0}while((d|0)!=256);b=0;do{d=a+b|0;a:do{if((fa(d>>0|0,1,0,0)|0|0)!=0){e=1;do{f=e+b|0;if((f|0)>=256){break a}h=a+f|0;j=fa(h>>0|0,1,0,0)|0|0;b:do{if(!(j<<24>>24==0)){g=fa(d>>0|0,1,0,0)|0|0;k=j<<24>>24<<e;j=g+k|0;if((j|0)<16){ga(d>>0|0,j|0,1,0);ga(h>>0|0,0|0,1,0);break}g=g-k|0;if(!((g|0)>-16)){break a}ga(d>>0|0,g|0,1,0);while(1){g=a+f|0;if((fa(g>>0|0,1,0,0)|0|0)==0){break}ga(g>>0|0,0|0,1,0);f=f+1|0;if((f|0)>=256){break b}}ga(g>>0|0,1|0,1,0)}}while(0);e=e+1|0}while((e|0)<7)}}while(0);b=b+1|0}while((b|0)!=256);i=c;return}function Ea(a,b){a=a|0;b=b|0;var c=0,d=0,e=0,f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0,P=0,Q=0,R=0,S=0,T=0,U=0,V=0,W=0,X=0,Y=0,Z=0,_=0,$=0,aa=0,ba=0,ca=0,da=0,ea=0,ha=0,ia=0,ja=0,ka=0,la=0;c=i;i=i+48|0;H=c;Ja(a,b);R=a+80|0;ka=b+40|0;Ja(R,ka);v=a+120|0;La(v,b+80|0);la=a+40|0;ja=(fa(b+44|0,4,0,0)|0|0)+(fa(b+4|0,4,0,0)|0|0)|0;ia=(fa(b+48|0,4,0,0)|0|0)+(fa(b+8|0,4,0,0)|0|0)|0;ha=(fa(b+52|0,4,0,0)|0|0)+(fa(b+12|0,4,0,0)|0|0)|0;ea=(fa(b+56|0,4,0,0)|0|0)+(fa(b+16|0,4,0,0)|0|0)|0;da=(fa(b+60|0,4,0,0)|0|0)+(fa(b+20|0,4,0,0)|0|0)|0;ca=(fa(b+64|0,4,0,0)|0|0)+(fa(b+24|0,4,0,0)|0|0)|0;ba=(fa(b+68|0,4,0,0)|0|0)+(fa(b+28|0,4,0,0)|0|0)|0;aa=(fa(b+72|0,4,0,0)|0|0)+(fa(b+32|0,4,0,0)|0|0)|0;$=(fa(b+76|0,4,0,0)|0|0)+(fa(b+36|0,4,0,0)|0|0)|0;ga(la|0,(fa(ka|0,4,0,0)|0|0)+(fa(b|0,4,0,0)|0|0)|0,4,0);ka=a+44|0;ga(ka|0,ja|0,4,0);ja=a+48|0;ga(ja|0,ia|0,4,0);ia=a+52|0;ga(ia|0,ha|0,4,0);ha=a+56|0;ga(ha|0,ea|0,4,0);ea=a+60|0;ga(ea|0,da|0,4,0);da=a+64|0;ga(da|0,ca|0,4,0);ca=a+68|0;ga(ca|0,ba|0,4,0);ba=a+72|0;ga(ba|0,aa|0,4,0);aa=a+76|0;ga(aa|0,$|0,4,0);Ja(H,la);$=fa(R|0,4,0,0)|0|0;Q=a+84|0;_=fa(Q|0,4,0,0)|0|0;P=a+88|0;Z=fa(P|0,4,0,0)|0|0;O=a+92|0;Y=fa(O|0,4,0,0)|0|0;N=a+96|0;X=fa(N|0,4,0,0)|0|0;M=a+100|0;W=fa(M|0,4,0,0)|0|0;L=a+104|0;V=fa(L|0,4,0,0)|0|0;K=a+108|0;U=fa(K|0,4,0,0)|0|0;J=a+112|0;T=fa(J|0,4,0,0)|0|0;I=a+116|0;S=fa(I|0,4,0,0)|0|0;u=fa(a|0,4,0,0)|0|0;F=a+4|0;s=fa(F|0,4,0,0)|0|0;D=a+8|0;q=fa(D|0,4,0,0)|0|0;B=a+12|0;o=fa(B|0,4,0,0)|0|0;z=a+16|0;m=fa(z|0,4,0,0)|0|0;x=a+20|0;k=fa(x|0,4,0,0)|0|0;e=a+24|0;h=fa(e|0,4,0,0)|0|0;j=a+28|0;f=fa(j|0,4,0,0)|0|0;n=a+32|0;d=fa(n|0,4,0,0)|0|0;r=a+36|0;b=fa(r|0,4,0,0)|0|0;G=u+$|0;E=s+_|0;C=q+Z|0;A=o+Y|0;y=m+X|0;w=k+W|0;g=h+V|0;l=f+U|0;p=d+T|0;t=b+S|0;ga(la|0,G|0,4,0);ga(ka|0,E|0,4,0);ga(ja|0,C|0,4,0);ga(ia|0,A|0,4,0);ga(ha|0,y|0,4,0);ga(ea|0,w|0,4,0);ga(da|0,g|0,4,0);ga(ca|0,l|0,4,0);ga(ba|0,p|0,4,0);ga(aa|0,t|0,4,0);u=$-u|0;s=_-s|0;q=Z-q|0;o=Y-o|0;m=X-m|0;k=W-k|0;h=V-h|0;f=U-f|0;d=T-d|0;b=S-b|0;ga(R|0,u|0,4,0);ga(Q|0,s|0,4,0);ga(P|0,q|0,4,0);ga(O|0,o|0,4,0);ga(N|0,m|0,4,0);ga(M|0,k|0,4,0);ga(L|0,h|0,4,0);ga(K|0,f|0,4,0);ga(J|0,d|0,4,0);ga(I|0,b|0,4,0);E=(fa(H+4|0,4,0,0)|0|0)-E|0;C=(fa(H+8|0,4,0,0)|0|0)-C|0;A=(fa(H+12|0,4,0,0)|0|0)-A|0;y=(fa(H+16|0,4,0,0)|0|0)-y|0;w=(fa(H+20|0,4,0,0)|0|0)-w|0;g=(fa(H+24|0,4,0,0)|0|0)-g|0;l=(fa(H+28|0,4,0,0)|0|0)-l|0;p=(fa(H+32|0,4,0,0)|0|0)-p|0;t=(fa(H+36|0,4,0,0)|0|0)-t|0;ga(a|0,(fa(H|0,4,0,0)|0|0)-G|0,4,0);ga(F|0,E|0,4,0);ga(D|0,C|0,4,0);ga(B|0,A|0,4,0);ga(z|0,y|0,4,0);ga(x|0,w|0,4,0);ga(e|0,g|0,4,0);ga(j|0,l|0,4,0);ga(n|0,p|0,4,0);ga(r|0,t|0,4,0);t=a+124|0;r=a+128|0;p=a+132|0;n=a+136|0;l=a+140|0;j=a+144|0;g=a+148|0;e=a+152|0;a=a+156|0;s=(fa(t|0,4,0,0)|0|0)-s|0;q=(fa(r|0,4,0,0)|0|0)-q|0;o=(fa(p|0,4,0,0)|0|0)-o|0;m=(fa(n|0,4,0,0)|0|0)-m|0;k=(fa(l|0,4,0,0)|0|0)-k|0;h=(fa(j|0,4,0,0)|0|0)-h|0;f=(fa(g|0,4,0,0)|0|0)-f|0;d=(fa(e|0,4,0,0)|0|0)-d|0;b=(fa(a|0,4,0,0)|0|0)-b|0;ga(v|0,(fa(v|0,4,0,0)|0|0)-u|0,4,0);ga(t|0,s|0,4,0);ga(r|0,q|0,4,0);ga(p|0,o|0,4,0);ga(n|0,m|0,4,0);ga(l|0,k|0,4,0);ga(j|0,h|0,4,0);ga(g|0,f|0,4,0);ga(e|0,d|0,4,0);ga(a|0,b|0,4,0);i=c;return}function Fa(a,b,c){a=a|0;b=b|0;c=c|0;var d=0,e=0,f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0,P=0,Q=0,R=0,S=0,T=0,U=0,V=0,W=0,X=0,Y=0,Z=0,_=0,$=0,aa=0,ba=0,ca=0,da=0,ea=0,ha=0,ia=0,ja=0,ka=0;d=i;Y=b+40|0;h=b+44|0;l=b+48|0;o=b+52|0;r=b+56|0;u=b+60|0;x=b+64|0;A=b+68|0;D=b+72|0;F=b+76|0;V=b+4|0;S=b+8|0;Q=b+12|0;j=b+16|0;n=b+20|0;s=b+24|0;w=b+28|0;B=b+32|0;P=b+36|0;ja=(fa(V|0,4,0,0)|0|0)+(fa(h|0,4,0,0)|0|0)|0;ia=(fa(S|0,4,0,0)|0|0)+(fa(l|0,4,0,0)|0|0)|0;ha=(fa(Q|0,4,0,0)|0|0)+(fa(o|0,4,0,0)|0|0)|0;ea=(fa(j|0,4,0,0)|0|0)+(fa(r|0,4,0,0)|0|0)|0;da=(fa(n|0,4,0,0)|0|0)+(fa(u|0,4,0,0)|0|0)|0;ca=(fa(s|0,4,0,0)|0|0)+(fa(x|0,4,0,0)|0|0)|0;ba=(fa(w|0,4,0,0)|0|0)+(fa(A|0,4,0,0)|0|0)|0;aa=(fa(B|0,4,0,0)|0|0)+(fa(D|0,4,0,0)|0|0)|0;$=(fa(P|0,4,0,0)|0|0)+(fa(F|0,4,0,0)|0|0)|0;ga(a|0,(fa(b|0,4,0,0)|0|0)+(fa(Y|0,4,0,0)|0|0)|0,4,0);ka=a+4|0;ga(ka|0,ja|0,4,0);ja=a+8|0;ga(ja|0,ia|0,4,0);ia=a+12|0;ga(ia|0,ha|0,4,0);ha=a+16|0;ga(ha|0,ea|0,4,0);ea=a+20|0;ga(ea|0,da|0,4,0);da=a+24|0;ga(da|0,ca|0,4,0);ca=a+28|0;ga(ca|0,ba|0,4,0);ba=a+32|0;ga(ba|0,aa|0,4,0);aa=a+36|0;ga(aa|0,$|0,4,0);$=a+40|0;V=(fa(h|0,4,0,0)|0|0)-(fa(V|0,4,0,0)|0|0)|0;S=(fa(l|0,4,0,0)|0|0)-(fa(S|0,4,0,0)|0|0)|0;Q=(fa(o|0,4,0,0)|0|0)-(fa(Q|0,4,0,0)|0|0)|0;j=(fa(r|0,4,0,0)|0|0)-(fa(j|0,4,0,0)|0|0)|0;n=(fa(u|0,4,0,0)|0|0)-(fa(n|0,4,0,0)|0|0)|0;s=(fa(x|0,4,0,0)|0|0)-(fa(s|0,4,0,0)|0|0)|0;w=(fa(A|0,4,0,0)|0|0)-(fa(w|0,4,0,0)|0|0)|0;B=(fa(D|0,4,0,0)|0|0)-(fa(B|0,4,0,0)|0|0)|0;P=(fa(F|0,4,0,0)|0|0)-(fa(P|0,4,0,0)|0|0)|0;ga($|0,(fa(Y|0,4,0,0)|0|0)-(fa(b|0,4,0,0)|0|0)|0,4,0);Y=a+44|0;ga(Y|0,V|0,4,0);V=a+48|0;ga(V|0,S|0,4,0);S=a+52|0;ga(S|0,Q|0,4,0);Q=a+56|0;ga(Q|0,j|0,4,0);j=a+60|0;ga(j|0,n|0,4,0);n=a+64|0;ga(n|0,s|0,4,0);s=a+68|0;ga(s|0,w|0,4,0);w=a+72|0;ga(w|0,B|0,4,0);B=a+76|0;ga(B|0,P|0,4,0);P=a+80|0;ya(P,a,c+40|0);ya($,$,c);F=a+120|0;ya(F,c+120|0,b+120|0);ya(a,b+80|0,c+80|0);D=(fa(a|0,4,0,0)|0)<<1;A=(fa(ka|0,4,0,0)|0)<<1;x=(fa(ja|0,4,0,0)|0)<<1;u=(fa(ia|0,4,0,0)|0)<<1;r=(fa(ha|0,4,0,0)|0)<<1;o=(fa(ea|0,4,0,0)|0)<<1;l=(fa(da|0,4,0,0)|0)<<1;h=(fa(ca|0,4,0,0)|0)<<1;e=(fa(ba|0,4,0,0)|0)<<1;b=(fa(aa|0,4,0,0)|0)<<1;Z=fa(P|0,4,0,0)|0|0;O=a+84|0;W=fa(O|0,4,0,0)|0|0;N=a+88|0;T=fa(N|0,4,0,0)|0|0;M=a+92|0;c=fa(M|0,4,0,0)|0|0;L=a+96|0;g=fa(L|0,4,0,0)|0|0;K=a+100|0;m=fa(K|0,4,0,0)|0|0;J=a+104|0;q=fa(J|0,4,0,0)|0|0;I=a+108|0;v=fa(I|0,4,0,0)|0|0;H=a+112|0;z=fa(H|0,4,0,0)|0|0;G=a+116|0;E=fa(G|0,4,0,0)|0|0;_=fa($|0,4,0,0)|0|0;X=fa(Y|0,4,0,0)|0|0;U=fa(V|0,4,0,0)|0|0;R=fa(S|0,4,0,0)|0|0;f=fa(Q|0,4,0,0)|0|0;k=fa(j|0,4,0,0)|0|0;p=fa(n|0,4,0,0)|0|0;t=fa(s|0,4,0,0)|0|0;y=fa(w|0,4,0,0)|0|0;C=fa(B|0,4,0,0)|0|0;ga(a|0,Z-_|0,4,0);ga(ka|0,W-X|0,4,0);ga(ja|0,T-U|0,4,0);ga(ia|0,c-R|0,4,0);ga(ha|0,g-f|0,4,0);ga(ea|0,m-k|0,4,0);ga(da|0,q-p|0,4,0);ga(ca|0,v-t|0,4,0);ga(ba|0,z-y|0,4,0);ga(aa|0,E-C|0,4,0);ga($|0,_+Z|0,4,0);ga(Y|0,X+W|0,4,0);ga(V|0,U+T|0,4,0);ga(S|0,R+c|0,4,0);ga(Q|0,f+g|0,4,0);ga(j|0,k+m|0,4,0);ga(n|0,p+q|0,4,0);ga(s|0,t+v|0,4,0);ga(w|0,y+z|0,4,0);ga(B|0,C+E|0,4,0);E=fa(F|0,4,0,0)|0|0;C=a+124|0;B=fa(C|0,4,0,0)|0|0;z=a+128|0;y=fa(z|0,4,0,0)|0|0;w=a+132|0;v=fa(w|0,4,0,0)|0|0;t=a+136|0;s=fa(t|0,4,0,0)|0|0;q=a+140|0;p=fa(q|0,4,0,0)|0|0;n=a+144|0;m=fa(n|0,4,0,0)|0|0;k=a+148|0;j=fa(k|0,4,0,0)|0|0;g=a+152|0;f=fa(g|0,4,0,0)|0|0;a=a+156|0;c=fa(a|0,4,0,0)|0|0;ga(P|0,D-E|0,4,0);ga(O|0,A-B|0,4,0);ga(N|0,x-y|0,4,0);ga(M|0,u-v|0,4,0);ga(L|0,r-s|0,4,0);ga(K|0,o-p|0,4,0);ga(J|0,l-m|0,4,0);ga(I|0,h-j|0,4,0);ga(H|0,e-f|0,4,0);ga(G|0,b-c|0,4,0);ga(F|0,E+D|0,4,0);ga(C|0,B+A|0,4,0);ga(z|0,y+x|0,4,0);ga(w|0,v+u|0,4,0);ga(t|0,s+r|0,4,0);ga(q|0,p+o|0,4,0);ga(n|0,m+l|0,4,0);ga(k|0,j+h|0,4,0);ga(g|0,f+e|0,4,0);ga(a|0,c+b|0,4,0);i=d;return}function Ga(a,b,c){a=a|0;b=b|0;c=c|0;var d=0,e=0,f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0,P=0,Q=0,R=0,S=0,T=0,U=0,V=0,W=0,X=0,Y=0,Z=0,_=0,$=0,aa=0,ba=0,ca=0,da=0,ea=0,ha=0,ia=0,ja=0,ka=0;d=i;Y=b+40|0;j=b+44|0;m=b+48|0;p=b+52|0;s=b+56|0;v=b+60|0;y=b+64|0;B=b+68|0;E=b+72|0;F=b+76|0;V=b+4|0;S=b+8|0;Q=b+12|0;h=b+16|0;n=b+20|0;r=b+24|0;w=b+28|0;A=b+32|0;P=b+36|0;ja=(fa(V|0,4,0,0)|0|0)+(fa(j|0,4,0,0)|0|0)|0;ia=(fa(S|0,4,0,0)|0|0)+(fa(m|0,4,0,0)|0|0)|0;ha=(fa(Q|0,4,0,0)|0|0)+(fa(p|0,4,0,0)|0|0)|0;ea=(fa(h|0,4,0,0)|0|0)+(fa(s|0,4,0,0)|0|0)|0;da=(fa(n|0,4,0,0)|0|0)+(fa(v|0,4,0,0)|0|0)|0;ca=(fa(r|0,4,0,0)|0|0)+(fa(y|0,4,0,0)|0|0)|0;ba=(fa(w|0,4,0,0)|0|0)+(fa(B|0,4,0,0)|0|0)|0;aa=(fa(A|0,4,0,0)|0|0)+(fa(E|0,4,0,0)|0|0)|0;$=(fa(P|0,4,0,0)|0|0)+(fa(F|0,4,0,0)|0|0)|0;ga(a|0,(fa(b|0,4,0,0)|0|0)+(fa(Y|0,4,0,0)|0|0)|0,4,0);ka=a+4|0;ga(ka|0,ja|0,4,0);ja=a+8|0;ga(ja|0,ia|0,4,0);ia=a+12|0;ga(ia|0,ha|0,4,0);ha=a+16|0;ga(ha|0,ea|0,4,0);ea=a+20|0;ga(ea|0,da|0,4,0);da=a+24|0;ga(da|0,ca|0,4,0);ca=a+28|0;ga(ca|0,ba|0,4,0);ba=a+32|0;ga(ba|0,aa|0,4,0);aa=a+36|0;ga(aa|0,$|0,4,0);$=a+40|0;V=(fa(j|0,4,0,0)|0|0)-(fa(V|0,4,0,0)|0|0)|0;S=(fa(m|0,4,0,0)|0|0)-(fa(S|0,4,0,0)|0|0)|0;Q=(fa(p|0,4,0,0)|0|0)-(fa(Q|0,4,0,0)|0|0)|0;h=(fa(s|0,4,0,0)|0|0)-(fa(h|0,4,0,0)|0|0)|0;n=(fa(v|0,4,0,0)|0|0)-(fa(n|0,4,0,0)|0|0)|0;r=(fa(y|0,4,0,0)|0|0)-(fa(r|0,4,0,0)|0|0)|0;w=(fa(B|0,4,0,0)|0|0)-(fa(w|0,4,0,0)|0|0)|0;A=(fa(E|0,4,0,0)|0|0)-(fa(A|0,4,0,0)|0|0)|0;P=(fa(F|0,4,0,0)|0|0)-(fa(P|0,4,0,0)|0|0)|0;ga($|0,(fa(Y|0,4,0,0)|0|0)-(fa(b|0,4,0,0)|0|0)|0,4,0);Y=a+44|0;ga(Y|0,V|0,4,0);V=a+48|0;ga(V|0,S|0,4,0);S=a+52|0;ga(S|0,Q|0,4,0);Q=a+56|0;ga(Q|0,h|0,4,0);h=a+60|0;ga(h|0,n|0,4,0);n=a+64|0;ga(n|0,r|0,4,0);r=a+68|0;ga(r|0,w|0,4,0);w=a+72|0;ga(w|0,A|0,4,0);A=a+76|0;ga(A|0,P|0,4,0);P=a+80|0;ya(P,a,c);ya($,$,c+40|0);F=a+120|0;ya(F,c+80|0,b+120|0);E=(fa(b+80|0,4,0,0)|0)<<1;B=(fa(b+84|0,4,0,0)|0)<<1;y=(fa(b+88|0,4,0,0)|0)<<1;v=(fa(b+92|0,4,0,0)|0)<<1;s=(fa(b+96|0,4,0,0)|0)<<1;p=(fa(b+100|0,4,0,0)|0)<<1;m=(fa(b+104|0,4,0,0)|0)<<1;j=(fa(b+108|0,4,0,0)|0)<<1;f=(fa(b+112|0,4,0,0)|0)<<1;b=(fa(b+116|0,4,0,0)|0)<<1;Z=fa(P|0,4,0,0)|0|0;O=a+84|0;W=fa(O|0,4,0,0)|0|0;N=a+88|0;T=fa(N|0,4,0,0)|0|0;M=a+92|0;c=fa(M|0,4,0,0)|0|0;L=a+96|0;g=fa(L|0,4,0,0)|0|0;K=a+100|0;l=fa(K|0,4,0,0)|0|0;J=a+104|0;q=fa(J|0,4,0,0)|0|0;I=a+108|0;u=fa(I|0,4,0,0)|0|0;H=a+112|0;z=fa(H|0,4,0,0)|0|0;G=a+116|0;D=fa(G|0,4,0,0)|0|0;_=fa($|0,4,0,0)|0|0;X=fa(Y|0,4,0,0)|0|0;U=fa(V|0,4,0,0)|0|0;R=fa(S|0,4,0,0)|0|0;e=fa(Q|0,4,0,0)|0|0;k=fa(h|0,4,0,0)|0|0;o=fa(n|0,4,0,0)|0|0;t=fa(r|0,4,0,0)|0|0;x=fa(w|0,4,0,0)|0|0;C=fa(A|0,4,0,0)|0|0;ga(a|0,Z-_|0,4,0);ga(ka|0,W-X|0,4,0);ga(ja|0,T-U|0,4,0);ga(ia|0,c-R|0,4,0);ga(ha|0,g-e|0,4,0);ga(ea|0,l-k|0,4,0);ga(da|0,q-o|0,4,0);ga(ca|0,u-t|0,4,0);ga(ba|0,z-x|0,4,0);ga(aa|0,D-C|0,4,0);ga($|0,_+Z|0,4,0);ga(Y|0,X+W|0,4,0);ga(V|0,U+T|0,4,0);ga(S|0,R+c|0,4,0);ga(Q|0,e+g|0,4,0);ga(h|0,k+l|0,4,0);ga(n|0,o+q|0,4,0);ga(r|0,t+u|0,4,0);ga(w|0,x+z|0,4,0);ga(A|0,C+D|0,4,0);D=fa(F|0,4,0,0)|0|0;C=a+124|0;A=fa(C|0,4,0,0)|0|0;z=a+128|0;x=fa(z|0,4,0,0)|0|0;w=a+132|0;u=fa(w|0,4,0,0)|0|0;t=a+136|0;r=fa(t|0,4,0,0)|0|0;q=a+140|0;o=fa(q|0,4,0,0)|0|0;n=a+144|0;l=fa(n|0,4,0,0)|0|0;k=a+148|0;h=fa(k|0,4,0,0)|0|0;g=a+152|0;e=fa(g|0,4,0,0)|0|0;a=a+156|0;c=fa(a|0,4,0,0)|0|0;ga(P|0,D+E|0,4,0);ga(O|0,A+B|0,4,0);ga(N|0,x+y|0,4,0);ga(M|0,u+v|0,4,0);ga(L|0,r+s|0,4,0);ga(K|0,o+p|0,4,0);ga(J|0,l+m|0,4,0);ga(I|0,h+j|0,4,0);ga(H|0,e+f|0,4,0);ga(G|0,c+b|0,4,0);ga(F|0,E-D|0,4,0);ga(C|0,B-A|0,4,0);ga(z|0,y-x|0,4,0);ga(w|0,v-u|0,4,0);ga(t|0,s-r|0,4,0);ga(q|0,p-o|0,4,0);ga(n|0,m-l|0,4,0);ga(k|0,j-h|0,4,0);ga(g|0,f-e|0,4,0);ga(a|0,b-c|0,4,0);i=d;return}function Ha(a,b){a=a|0;b=b|0;var c=0,d=0,e=0;c=i;d=b+120|0;ya(a,b,d);e=b+80|0;ya(a+40|0,b+40|0,e);ya(a+80|0,e,d);i=c;return}function Ia(a,b){a=a|0;b=b|0;var c=0,d=0,e=0,f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0,P=0,Q=0,R=0,S=0,T=0,U=0,V=0,W=0,X=0,Y=0,Z=0,_=0,$=0,aa=0,ba=0,ca=0,da=0,ea=0,ha=0,ia=0,ja=0,ka=0,la=0,ma=0,na=0,oa=0,pa=0;h=i;i=i+192|0;f=h+160|0;c=h+120|0;t=h+80|0;d=h+40|0;e=h;k=fa(b>>0|0,1,0,1)|0|0;m=kb(fa(b+1>>0|0,1,0,1)|0|0|0,0,8)|0;l=D;oa=kb(fa(b+2>>0|0,1,0,1)|0|0|0,0,16)|0;l=l|D;B=kb(fa(b+3>>0|0,1,0,1)|0|0|0,0,24)|0;B=m|k|oa|B;l=l|D;oa=fa(b+6>>0|0,1,0,0)|0|0;k=fa(b+4>>0|0,1,0,1)|0|0;m=kb(fa(b+5>>0|0,1,0,1)|0|0|0,0,8)|0;pa=D;oa=kb(oa&255|0,0,16)|0;oa=m|k|oa;pa=pa|D;k=kb(oa|0,pa|0,6)|0;m=D;n=fa(b+9>>0|0,1,0,0)|0|0;ma=fa(b+7>>0|0,1,0,1)|0|0;o=kb(fa(b+8>>0|0,1,0,1)|0|0|0,0,8)|0;p=D;n=kb(n&255|0,0,16)|0;n=o|ma|n;p=p|D;ma=fa(b+12>>0|0,1,0,0)|0|0;o=fa(b+10>>0|0,1,0,1)|0|0;A=kb(fa(b+11>>0|0,1,0,1)|0|0|0,0,8)|0;na=D;ma=kb(ma&255|0,0,16)|0;ma=A|o|ma;na=na|D;o=kb(ma|0,na|0,3)|0;A=D;z=fa(b+15>>0|0,1,0,0)|0|0;ka=fa(b+13>>0|0,1,0,1)|0|0;u=kb(fa(b+14>>0|0,1,0,1)|0|0|0,0,8)|0;x=D;z=kb(z&255|0,0,16)|0;z=u|ka|z;x=x|D;ka=fa(b+16>>0|0,1,0,1)|0|0;u=kb(fa(b+17>>0|0,1,0,1)|0|0|0,0,8)|0;w=D;j=kb(fa(b+18>>0|0,1,0,1)|0|0|0,0,16)|0;w=w|D;y=kb(fa(b+19>>0|0,1,0,1)|0|0|0,0,24)|0;y=u|ka|j|y;w=w|D;j=fa(b+22>>0|0,1,0,0)|0|0;ka=fa(b+20>>0|0,1,0,1)|0|0;u=kb(fa(b+21>>0|0,1,0,1)|0|0|0,0,8)|0;s=D;j=kb(j&255|0,0,16)|0;j=u|ka|j;s=s|D;ka=fa(b+25>>0|0,1,0,0)|0|0;u=fa(b+23>>0|0,1,0,1)|0|0;r=kb(fa(b+24>>0|0,1,0,1)|0|0|0,0,8)|0;la=D;ka=kb(ka&255|0,0,16)|0;ka=r|u|ka;la=la|D;u=kb(ka|0,la|0,5)|0;r=D;q=fa(b+28>>0|0,1,0,0)|0|0;g=fa(b+26>>0|0,1,0,1)|0|0;ja=kb(fa(b+27>>0|0,1,0,1)|0|0|0,0,8)|0;v=D;q=kb(q&255|0,0,16)|0;q=ja|g|q;v=v|D;g=b+31|0;ja=fa(g>>0|0,1,0,0)|0|0;ia=fa(b+29>>0|0,1,0,1)|0|0;ha=kb(fa(b+30>>0|0,1,0,1)|0|0|0,0,8)|0;b=D;ja=kb(ja&255|0,0,16)|0;b=kb(ha|ia|ja|0,b|D|0,2)|0;b=b&33554428;if((b|0)==33554428&0==0&((q|0)==16777215&(v|0)==0)&((ka|0)==16777215&(la|0)==0)&((j|0)==16777215&(s|0)==0)&((y|0)==-1&(w|0)==0)&((z|0)==16777215&(x|0)==0)&((ma|0)==16777215&(na|0)==0)&((n|0)==16777215&(p|0)==0)&((oa|0)==16777215&(pa|0)==0)&(l>>>0>0|(l|0)==0&B>>>0>4294967276)){pa=-1;i=h;return pa|0}ba=kb(n|0,p|0,5)|0;oa=D;pa=kb(z|0,x|0,2)|0;da=D;ca=kb(j|0,s|0,7)|0;ia=D;j=kb(q|0,v|0,4)|0;ja=D;ha=hb(b|0,0,16777216,0)|0;ha=jb(ha|0,D|0,25)|0;ea=D;ma=sb(ha|0,ea|0,19,0)|0;ma=hb(ma|0,D|0,B|0,l|0)|0;$=D;ea=kb(ha|0,ea|0,25)|0;ha=D;la=hb(k|0,m|0,16777216,0)|0;la=jb(la|0,D|0,25)|0;Y=D;oa=hb(ba|0,oa|0,la|0,Y|0)|0;ba=D;Y=kb(la|0,Y|0,25)|0;Y=gb(k|0,m|0,Y|0,D|0)|0;la=D;na=hb(o|0,A|0,16777216,0)|0;na=jb(na|0,D|0,25)|0;_=D;k=hb(pa|0,da|0,na|0,_|0)|0;da=D;_=kb(na|0,_|0,25)|0;na=D;pa=hb(y|0,w|0,16777216,0)|0;pa=jb(pa|0,D|0,25)|0;aa=D;v=hb(ca|0,ia|0,pa|0,aa|0)|0;ia=D;aa=kb(pa|0,aa|0,25)|0;pa=D;l=hb(u|0,r|0,16777216,0)|0;l=jb(l|0,D|0,25)|0;ca=D;ja=hb(j|0,ja|0,l|0,ca|0)|0;j=D;ca=kb(l|0,ca|0,25)|0;l=D;Z=hb(ma|0,$|0,33554432,0)|0;Z=fb(Z|0,D|0,26)|0;ka=D;la=hb(Y|0,la|0,Z|0,ka|0)|0;ka=kb(Z|0,ka|0,26)|0;ka=gb(ma|0,$|0,ka|0,D|0)|0;$=hb(oa|0,ba|0,33554432,0)|0;$=fb($|0,D|0,26)|0;ma=D;Z=hb($|0,ma|0,o|0,A|0)|0;na=gb(Z|0,D|0,_|0,na|0)|0;ma=kb($|0,ma|0,26)|0;ma=gb(oa|0,ba|0,ma|0,D|0)|0;ba=hb(k|0,da|0,33554432,0)|0;ba=fb(ba|0,D|0,26)|0;oa=D;$=hb(ba|0,oa|0,y|0,w|0)|0;pa=gb($|0,D|0,aa|0,pa|0)|0;oa=kb(ba|0,oa|0,26)|0;oa=gb(k|0,da|0,oa|0,D|0)|0;da=hb(v|0,ia|0,33554432,0)|0;da=fb(da|0,D|0,26)|0;k=D;u=hb(da|0,k|0,u|0,r|0)|0;l=gb(u|0,D|0,ca|0,l|0)|0;k=kb(da|0,k|0,26)|0;k=gb(v|0,ia|0,k|0,D|0)|0;ia=hb(ja|0,j|0,33554432,0)|0;ia=fb(ia|0,D|0,26)|0;v=D;u=hb(b|0,0,ia|0,v|0)|0;u=gb(u|0,D|0,ea|0,ha|0)|0;v=kb(ia|0,v|0,26)|0;v=gb(ja|0,j|0,v|0,D|0)|0;j=a+40|0;ga(j|0,ka|0,4,0);ga(a+44|0,la|0,4,0);ga(a+48|0,ma|0,4,0);ga(a+52|0,na|0,4,0);ga(a+56|0,oa|0,4,0);ga(a+60|0,pa|0,4,0);ga(a+64|0,k|0,4,0);ga(a+68|0,l|0,4,0);ga(a+72|0,v|0,4,0);ga(a+76|0,u|0,4,0);u=a+80|0;ga(u|0,1|0,4,0);v=a+84|0;l=v+0|0;k=l+36|0;do{ga(l|0,0|0,4,0);l=l+4|0}while((l|0)<(k|0));Ja(c,j);ya(t,c,240);r=c+4|0;s=c+8|0;k=c+12|0;l=c+16|0;m=c+20|0;n=c+24|0;o=c+28|0;p=c+32|0;q=c+36|0;E=fa(u|0,4,0,0)|0|0;oa=fa(v|0,4,0,0)|0|0;ca=fa(a+88|0,4,0,0)|0|0;I=fa(a+92|0,4,0,0)|0|0;G=fa(a+96|0,4,0,0)|0|0;C=fa(a+100|0,4,0,0)|0|0;B=fa(a+104|0,4,0,0)|0|0;z=fa(a+108|0,4,0,0)|0|0;x=fa(a+112|0,4,0,0)|0|0;v=fa(a+116|0,4,0,0)|0|0;w=(fa(r|0,4,0,0)|0|0)-oa|0;y=(fa(s|0,4,0,0)|0|0)-ca|0;A=(fa(k|0,4,0,0)|0|0)-I|0;b=(fa(l|0,4,0,0)|0|0)-G|0;F=(fa(m|0,4,0,0)|0|0)-C|0;H=(fa(n|0,4,0,0)|0|0)-B|0;V=(fa(o|0,4,0,0)|0|0)-z|0;pa=(fa(p|0,4,0,0)|0|0)-x|0;J=(fa(q|0,4,0,0)|0|0)-v|0;ga(c|0,(fa(c|0,4,0,0)|0|0)-E|0,4,0);ga(r|0,w|0,4,0);ga(s|0,y|0,4,0);ga(k|0,A|0,4,0);ga(l|0,b|0,4,0);ga(m|0,F|0,4,0);ga(n|0,H|0,4,0);ga(o|0,V|0,4,0);ga(p|0,pa|0,4,0);ga(q|0,J|0,4,0);J=t+4|0;pa=t+8|0;V=t+12|0;H=t+16|0;F=t+20|0;b=t+24|0;A=t+28|0;y=t+32|0;w=t+36|0;oa=oa+(fa(J|0,4,0,0)|0|0)|0;ca=ca+(fa(pa|0,4,0,0)|0|0)|0;I=I+(fa(V|0,4,0,0)|0|0)|0;G=G+(fa(H|0,4,0,0)|0|0)|0;C=C+(fa(F|0,4,0,0)|0|0)|0;B=B+(fa(b|0,4,0,0)|0|0)|0;z=z+(fa(A|0,4,0,0)|0|0)|0;x=x+(fa(y|0,4,0,0)|0|0)|0;v=v+(fa(w|0,4,0,0)|0|0)|0;ga(t|0,E+(fa(t|0,4,0,0)|0|0)|0,4,0);ga(J|0,oa|0,4,0);ga(pa|0,ca|0,4,0);ga(V|0,I|0,4,0);ga(H|0,G|0,4,0);ga(F|0,C|0,4,0);ga(b|0,B|0,4,0);ga(A|0,z|0,4,0);ga(y|0,x|0,4,0);ga(w|0,v|0,4,0);Ka(a,c,t);Ja(d,a);ya(d,d,t);v=d+4|0;w=d+8|0;x=d+12|0;y=d+16|0;z=d+20|0;A=d+24|0;B=d+28|0;b=d+32|0;C=d+36|0;F=(fa(v|0,4,0,0)|0|0)-(fa(r|0,4,0,0)|0|0)|0;G=(fa(w|0,4,0,0)|0|0)-(fa(s|0,4,0,0)|0|0)|0;H=(fa(x|0,4,0,0)|0|0)-(fa(k|0,4,0,0)|0|0)|0;I=(fa(y|0,4,0,0)|0|0)-(fa(l|0,4,0,0)|0|0)|0;V=(fa(z|0,4,0,0)|0|0)-(fa(m|0,4,0,0)|0|0)|0;ca=(fa(A|0,4,0,0)|0|0)-(fa(n|0,4,0,0)|0|0)|0;pa=(fa(B|0,4,0,0)|0|0)-(fa(o|0,4,0,0)|0|0)|0;oa=(fa(b|0,4,0,0)|0|0)-(fa(p|0,4,0,0)|0|0)|0;J=(fa(C|0,4,0,0)|0|0)-(fa(q|0,4,0,0)|0|0)|0;ga(e|0,(fa(d|0,4,0,0)|0|0)-(fa(c|0,4,0,0)|0|0)|0,4,0);E=e+4|0;ga(E|0,F|0,4,0);F=e+8|0;ga(F|0,G|0,4,0);G=e+12|0;ga(G|0,H|0,4,0);H=e+16|0;ga(H|0,I|0,4,0);I=e+20|0;ga(I|0,V|0,4,0);V=e+24|0;ga(V|0,ca|0,4,0);ca=e+28|0;ga(ca|0,pa|0,4,0);pa=e+32|0;ga(pa|0,oa|0,4,0);oa=e+36|0;ga(oa|0,J|0,4,0);Oa(f,e);J=f+1|0;K=f+2|0;L=f+3|0;M=f+4|0;N=f+5|0;O=f+6|0;P=f+7|0;Q=f+8|0;R=f+9|0;S=f+10|0;T=f+11|0;U=f+12|0;u=f+13|0;W=f+14|0;X=f+15|0;Y=f+16|0;Z=f+17|0;_=f+18|0;$=f+19|0;aa=f+20|0;ba=f+21|0;t=f+22|0;da=f+23|0;ea=f+24|0;ha=f+25|0;ia=f+26|0;ja=f+27|0;ka=f+28|0;la=f+29|0;ma=f+30|0;na=f+31|0;do{if(!((((fa(J>>0|0,1,0,0)|0|(fa(f>>0|0,1,0,0)|0)|(fa(K>>0|0,1,0,0)|0)|(fa(L>>0|0,1,0,0)|0)|(fa(M>>0|0,1,0,0)|0)|(fa(N>>0|0,1,0,0)|0)|(fa(O>>0|0,1,0,0)|0)|(fa(P>>0|0,1,0,0)|0)|(fa(Q>>0|0,1,0,0)|0)|(fa(R>>0|0,1,0,0)|0)|(fa(S>>0|0,1,0,0)|0)|(fa(T>>0|0,1,0,0)|0)|(fa(U>>0|0,1,0,0)|0)|(fa(u>>0|0,1,0,0)|0)|(fa(W>>0|0,1,0,0)|0)|(fa(X>>0|0,1,0,0)|0)|(fa(Y>>0|0,1,0,0)|0)|(fa(Z>>0|0,1,0,0)|0)|(fa(_>>0|0,1,0,0)|0)|(fa($>>0|0,1,0,0)|0)|(fa(aa>>0|0,1,0,0)|0)|(fa(ba>>0|0,1,0,0)|0)|(fa(t>>0|0,1,0,0)|0)|(fa(da>>0|0,1,0,0)|0)|(fa(ea>>0|0,1,0,0)|0)|(fa(ha>>0|0,1,0,0)|0)|(fa(ia>>0|0,1,0,0)|0)|(fa(ja>>0|0,1,0,0)|0)|(fa(ka>>0|0,1,0,0)|0)|(fa(la>>0|0,1,0,0)|0)|(fa(ma>>0|0,1,0,0)|0)|(fa(na>>0|0,1,0,0)|0))&255)+ -1&-256|0)==-256)){v=(fa(r|0,4,0,0)|0|0)+(fa(v|0,4,0,0)|0|0)|0;w=(fa(s|0,4,0,0)|0|0)+(fa(w|0,4,0,0)|0|0)|0;x=(fa(k|0,4,0,0)|0|0)+(fa(x|0,4,0,0)|0|0)|0;y=(fa(l|0,4,0,0)|0|0)+(fa(y|0,4,0,0)|0|0)|0;z=(fa(m|0,4,0,0)|0|0)+(fa(z|0,4,0,0)|0|0)|0;A=(fa(n|0,4,0,0)|0|0)+(fa(A|0,4,0,0)|0|0)|0;B=(fa(o|0,4,0,0)|0|0)+(fa(B|0,4,0,0)|0|0)|0;b=(fa(p|0,4,0,0)|0|0)+(fa(b|0,4,0,0)|0|0)|0;C=(fa(q|0,4,0,0)|0|0)+(fa(C|0,4,0,0)|0|0)|0;ga(e|0,(fa(c|0,4,0,0)|0|0)+(fa(d|0,4,0,0)|0|0)|0,4,0);ga(E|0,v|0,4,0);ga(F|0,w|0,4,0);ga(G|0,x|0,4,0);ga(H|0,y|0,4,0);ga(I|0,z|0,4,0);ga(V|0,A|0,4,0);ga(ca|0,B|0,4,0);ga(pa|0,b|0,4,0);ga(oa|0,C|0,4,0);Oa(f,e);if((((fa(J>>0|0,1,0,0)|0|(fa(f>>0|0,1,0,0)|0)|(fa(K>>0|0,1,0,0)|0)|(fa(L>>0|0,1,0,0)|0)|(fa(M>>0|0,1,0,0)|0)|(fa(N>>0|0,1,0,0)|0)|(fa(O>>0|0,1,0,0)|0)|(fa(P>>0|0,1,0,0)|0)|(fa(Q>>0|0,1,0,0)|0)|(fa(R>>0|0,1,0,0)|0)|(fa(S>>0|0,1,0,0)|0)|(fa(T>>0|0,1,0,0)|0)|(fa(U>>0|0,1,0,0)|0)|(fa(u>>0|0,1,0,0)|0)|(fa(W>>0|0,1,0,0)|0)|(fa(X>>0|0,1,0,0)|0)|(fa(Y>>0|0,1,0,0)|0)|(fa(Z>>0|0,1,0,0)|0)|(fa(_>>0|0,1,0,0)|0)|(fa($>>0|0,1,0,0)|0)|(fa(aa>>0|0,1,0,0)|0)|(fa(ba>>0|0,1,0,0)|0)|(fa(t>>0|0,1,0,0)|0)|(fa(da>>0|0,1,0,0)|0)|(fa(ea>>0|0,1,0,0)|0)|(fa(ha>>0|0,1,0,0)|0)|(fa(ia>>0|0,1,0,0)|0)|(fa(ja>>0|0,1,0,0)|0)|(fa(ka>>0|0,1,0,0)|0)|(fa(la>>0|0,1,0,0)|0)|(fa(ma>>0|0,1,0,0)|0)|(fa(na>>0|0,1,0,0)|0))&255)+ -1&-256|0)==-256){ya(a,a,280);break}else{pa=-1;i=h;return pa|0}}}while(0);Oa(f,a);do{if(((fa(f>>0|0,1,0,0)|0)&1|0)!=((fa(g>>0|0,1,0,1)|0|0)>>>7|0)){Oa(f,a);if((((fa(J>>0|0,1,0,0)|0|(fa(f>>0|0,1,0,0)|0)|(fa(K>>0|0,1,0,0)|0)|(fa(L>>0|0,1,0,0)|0)|(fa(M>>0|0,1,0,0)|0)|(fa(N>>0|0,1,0,0)|0)|(fa(O>>0|0,1,0,0)|0)|(fa(P>>0|0,1,0,0)|0)|(fa(Q>>0|0,1,0,0)|0)|(fa(R>>0|0,1,0,0)|0)|(fa(S>>0|0,1,0,0)|0)|(fa(T>>0|0,1,0,0)|0)|(fa(U>>0|0,1,0,0)|0)|(fa(u>>0|0,1,0,0)|0)|(fa(W>>0|0,1,0,0)|0)|(fa(X>>0|0,1,0,0)|0)|(fa(Y>>0|0,1,0,0)|0)|(fa(Z>>0|0,1,0,0)|0)|(fa(_>>0|0,1,0,0)|0)|(fa($>>0|0,1,0,0)|0)|(fa(aa>>0|0,1,0,0)|0)|(fa(ba>>0|0,1,0,0)|0)|(fa(t>>0|0,1,0,0)|0)|(fa(da>>0|0,1,0,0)|0)|(fa(ea>>0|0,1,0,0)|0)|(fa(ha>>0|0,1,0,0)|0)|(fa(ia>>0|0,1,0,0)|0)|(fa(ja>>0|0,1,0,0)|0)|(fa(ka>>0|0,1,0,0)|0)|(fa(la>>0|0,1,0,0)|0)|(fa(ma>>0|0,1,0,0)|0)|(fa(na>>0|0,1,0,0)|0))&255)+ -1&-256|0)==-256){pa=-1;i=h;return pa|0}else{Y=a+4|0;_=a+8|0;aa=a+12|0;ca=a+16|0;ea=a+20|0;ia=a+24|0;ka=a+28|0;ma=a+32|0;oa=a+36|0;Z=0-(fa(Y|0,4,0,0)|0|0)|0;$=0-(fa(_|0,4,0,0)|0|0)|0;ba=0-(fa(aa|0,4,0,0)|0|0)|0;da=0-(fa(ca|0,4,0,0)|0|0)|0;ha=0-(fa(ea|0,4,0,0)|0|0)|0;ja=0-(fa(ia|0,4,0,0)|0|0)|0;la=0-(fa(ka|0,4,0,0)|0|0)|0;na=0-(fa(ma|0,4,0,0)|0|0)|0;pa=0-(fa(oa|0,4,0,0)|0|0)|0;ga(a|0,0-(fa(a|0,4,0,0)|0|0)|0,4,0);ga(Y|0,Z|0,4,0);ga(_|0,$|0,4,0);ga(aa|0,ba|0,4,0);ga(ca|0,da|0,4,0);ga(ea|0,ha|0,4,0);ga(ia|0,ja|0,4,0);ga(ka|0,la|0,4,0);ga(ma|0,na|0,4,0);ga(oa|0,pa|0,4,0);break}}}while(0);ya(a+120|0,a,j);pa=0;i=h;return pa|0}function Ja(a,b){a=a|0;b=b|0;var c=0,d=0,e=0,f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0,P=0,Q=0,R=0,S=0,T=0,U=0,V=0,W=0,X=0,Y=0,Z=0,_=0,$=0,aa=0,ba=0,ca=0,da=0,ea=0,ha=0,ia=0,ja=0,ka=0,la=0,ma=0,na=0,oa=0,pa=0,qa=0,ra=0,sa=0,ta=0,ua=0,va=0,wa=0,xa=0,ya=0,za=0,Aa=0,Ba=0,Ca=0,Da=0,Ea=0,Fa=0,Ga=0,Ha=0,Ia=0,Ja=0,Ka=0,La=0,Ma=0,Na=0,Oa=0,Pa=0,Qa=0,Ra=0,Sa=0,Ta=0,Ua=0,Va=0,Wa=0,Xa=0,Ya=0,Za=0,_a=0,$a=0,ab=0,bb=0,cb=0,db=0,eb=0,ib=0,jb=0,lb=0,mb=0,nb=0;c=i;eb=fa(b|0,4,0,0)|0|0;xa=fa(b+4|0,4,0,0)|0|0;k=fa(b+8|0,4,0,0)|0|0;oa=fa(b+12|0,4,0,0)|0|0;e=fa(b+16|0,4,0,0)|0|0;jb=fa(b+20|0,4,0,0)|0|0;Z=fa(b+24|0,4,0,0)|0|0;Oa=fa(b+28|0,4,0,0)|0|0;h=fa(b+32|0,4,0,0)|0|0;b=fa(b+36|0,4,0,0)|0|0;m=eb<<1;q=xa<<1;_a=k<<1;f=oa<<1;qa=e<<1;C=jb<<1;n=Z<<1;j=Oa<<1;Na=jb*38|0;ua=Z*19|0;ya=Oa*38|0;ea=h*19|0;nb=b*38|0;ib=((eb|0)<0)<<31>>31;ib=sb(eb|0,ib|0,eb|0,ib|0)|0;eb=D;p=((m|0)<0)<<31>>31;wa=((xa|0)<0)<<31>>31;La=sb(m|0,p|0,xa|0,wa|0)|0;Ka=D;l=((k|0)<0)<<31>>31;Za=sb(k|0,l|0,m|0,p|0)|0;Ya=D;pa=((oa|0)<0)<<31>>31;Xa=sb(oa|0,pa|0,m|0,p|0)|0;Wa=D;E=((e|0)<0)<<31>>31;Ra=sb(e|0,E|0,m|0,p|0)|0;Qa=D;lb=((jb|0)<0)<<31>>31;Ba=sb(jb|0,lb|0,m|0,p|0)|0;Aa=D;g=((Z|0)<0)<<31>>31;ja=sb(Z|0,g|0,m|0,p|0)|0;ia=D;Pa=((Oa|0)<0)<<31>>31;S=sb(Oa|0,Pa|0,m|0,p|0)|0;R=D;B=((h|0)<0)<<31>>31;G=sb(h|0,B|0,m|0,p|0)|0;F=D;r=((b|0)<0)<<31>>31;p=sb(b|0,r|0,m|0,p|0)|0;m=D;o=((q|0)<0)<<31>>31;wa=sb(q|0,o|0,xa|0,wa|0)|0;xa=D;ca=sb(q|0,o|0,k|0,l|0)|0;da=D;Q=((f|0)<0)<<31>>31;Va=sb(f|0,Q|0,q|0,o|0)|0;Ua=D;Fa=sb(e|0,E|0,q|0,o|0)|0;Ea=D;d=((C|0)<0)<<31>>31;la=sb(C|0,d|0,q|0,o|0)|0;ka=D;U=sb(Z|0,g|0,q|0,o|0)|0;T=D;P=((j|0)<0)<<31>>31;I=sb(j|0,P|0,q|0,o|0)|0;H=D;u=sb(h|0,B|0,q|0,o|0)|0;t=D;mb=((nb|0)<0)<<31>>31;o=sb(nb|0,mb|0,q|0,o|0)|0;q=D;Ta=sb(k|0,l|0,k|0,l|0)|0;Sa=D;$a=((_a|0)<0)<<31>>31;Da=sb(_a|0,$a|0,oa|0,pa|0)|0;Ca=D;na=sb(e|0,E|0,_a|0,$a|0)|0;ma=D;Y=sb(jb|0,lb|0,_a|0,$a|0)|0;X=D;O=sb(Z|0,g|0,_a|0,$a|0)|0;N=D;w=sb(Oa|0,Pa|0,_a|0,$a|0)|0;v=D;ha=((ea|0)<0)<<31>>31;$a=sb(ea|0,ha|0,_a|0,$a|0)|0;_a=D;l=sb(nb|0,mb|0,k|0,l|0)|0;k=D;pa=sb(f|0,Q|0,oa|0,pa|0)|0;oa=D;W=sb(f|0,Q|0,e|0,E|0)|0;V=D;K=sb(C|0,d|0,f|0,Q|0)|0;J=D;A=sb(Z|0,g|0,f|0,Q|0)|0;z=D;za=((ya|0)<0)<<31>>31;bb=sb(ya|0,za|0,f|0,Q|0)|0;ab=D;Ha=sb(ea|0,ha|0,f|0,Q|0)|0;Ga=D;Q=sb(nb|0,mb|0,f|0,Q|0)|0;f=D;M=sb(e|0,E|0,e|0,E|0)|0;L=D;ra=((qa|0)<0)<<31>>31;y=sb(qa|0,ra|0,jb|0,lb|0)|0;x=D;va=((ua|0)<0)<<31>>31;db=sb(ua|0,va|0,qa|0,ra|0)|0;cb=D;Ja=sb(ya|0,za|0,e|0,E|0)|0;Ia=D;ra=sb(ea|0,ha|0,qa|0,ra|0)|0;qa=D;E=sb(nb|0,mb|0,e|0,E|0)|0;e=D;lb=sb(Na|0,((Na|0)<0)<<31>>31|0,jb|0,lb|0)|0;jb=D;Na=sb(ua|0,va|0,C|0,d|0)|0;Ma=D;ta=sb(ya|0,za|0,C|0,d|0)|0;sa=D;$=sb(ea|0,ha|0,C|0,d|0)|0;_=D;d=sb(nb|0,mb|0,C|0,d|0)|0;C=D;va=sb(ua|0,va|0,Z|0,g|0)|0;ua=D;ba=sb(ya|0,za|0,Z|0,g|0)|0;aa=D;n=sb(ea|0,ha|0,n|0,((n|0)<0)<<31>>31|0)|0;s=D;g=sb(nb|0,mb|0,Z|0,g|0)|0;Z=D;Pa=sb(ya|0,za|0,Oa|0,Pa|0)|0;Oa=D;za=sb(ea|0,ha|0,j|0,P|0)|0;ya=D;P=sb(nb|0,mb|0,j|0,P|0)|0;j=D;ha=sb(ea|0,ha|0,h|0,B|0)|0;ea=D;B=sb(nb|0,mb|0,h|0,B|0)|0;h=D;r=sb(nb|0,mb|0,b|0,r|0)|0;b=D;eb=hb(lb|0,jb|0,ib|0,eb|0)|0;cb=hb(eb|0,D|0,db|0,cb|0)|0;ab=hb(cb|0,D|0,bb|0,ab|0)|0;_a=hb(ab|0,D|0,$a|0,_a|0)|0;q=hb(_a|0,D|0,o|0,q|0)|0;o=D;xa=hb(Za|0,Ya|0,wa|0,xa|0)|0;wa=D;da=hb(Xa|0,Wa|0,ca|0,da|0)|0;ca=D;Sa=hb(Va|0,Ua|0,Ta|0,Sa|0)|0;Qa=hb(Sa|0,D|0,Ra|0,Qa|0)|0;Oa=hb(Qa|0,D|0,Pa|0,Oa|0)|0;s=hb(Oa|0,D|0,n|0,s|0)|0;C=hb(s|0,D|0,d|0,C|0)|0;d=D;s=hb(q|0,o|0,33554432,0)|0;s=fb(s|0,D|0,26)|0;n=D;Ka=hb(Na|0,Ma|0,La|0,Ka|0)|0;Ia=hb(Ka|0,D|0,Ja|0,Ia|0)|0;Ga=hb(Ia|0,D|0,Ha|0,Ga|0)|0;k=hb(Ga|0,D|0,l|0,k|0)|0;k=hb(k|0,D|0,s|0,n|0)|0;l=D;n=kb(s|0,n|0,26)|0;n=gb(q|0,o|0,n|0,D|0)|0;o=D;q=hb(C|0,d|0,33554432,0)|0;q=fb(q|0,D|0,26)|0;s=D;Ca=hb(Fa|0,Ea|0,Da|0,Ca|0)|0;Aa=hb(Ca|0,D|0,Ba|0,Aa|0)|0;ya=hb(Aa|0,D|0,za|0,ya|0)|0;Z=hb(ya|0,D|0,g|0,Z|0)|0;Z=hb(Z|0,D|0,q|0,s|0)|0;g=D;s=kb(q|0,s|0,26)|0;s=gb(C|0,d|0,s|0,D|0)|0;d=D;C=hb(k|0,l|0,16777216,0)|0;C=fb(C|0,D|0,25)|0;q=D;ua=hb(xa|0,wa|0,va|0,ua|0)|0;sa=hb(ua|0,D|0,ta|0,sa|0)|0;qa=hb(sa|0,D|0,ra|0,qa|0)|0;f=hb(qa|0,D|0,Q|0,f|0)|0;f=hb(f|0,D|0,C|0,q|0)|0;Q=D;q=kb(C|0,q|0,25)|0;q=gb(k|0,l|0,q|0,D|0)|0;l=D;k=hb(Z|0,g|0,16777216,0)|0;k=fb(k|0,D|0,25)|0;C=D;ma=hb(pa|0,oa|0,na|0,ma|0)|0;ka=hb(ma|0,D|0,la|0,ka|0)|0;ia=hb(ka|0,D|0,ja|0,ia|0)|0;ea=hb(ia|0,D|0,ha|0,ea|0)|0;j=hb(ea|0,D|0,P|0,j|0)|0;j=hb(j|0,D|0,k|0,C|0)|0;P=D;C=kb(k|0,C|0,25)|0;C=gb(Z|0,g|0,C|0,D|0)|0;g=D;Z=hb(f|0,Q|0,33554432,0)|0;Z=fb(Z|0,D|0,26)|0;k=D;aa=hb(da|0,ca|0,ba|0,aa|0)|0;_=hb(aa|0,D|0,$|0,_|0)|0;e=hb(_|0,D|0,E|0,e|0)|0;e=hb(e|0,D|0,Z|0,k|0)|0;E=D;k=kb(Z|0,k|0,26)|0;k=gb(f|0,Q|0,k|0,D|0)|0;Q=hb(j|0,P|0,33554432,0)|0;Q=fb(Q|0,D|0,26)|0;f=D;V=hb(Y|0,X|0,W|0,V|0)|0;T=hb(V|0,D|0,U|0,T|0)|0;R=hb(T|0,D|0,S|0,R|0)|0;h=hb(R|0,D|0,B|0,h|0)|0;h=hb(h|0,D|0,Q|0,f|0)|0;B=D;f=kb(Q|0,f|0,26)|0;f=gb(j|0,P|0,f|0,D|0)|0;P=hb(e|0,E|0,16777216,0)|0;P=fb(P|0,D|0,25)|0;j=D;d=hb(P|0,j|0,s|0,d|0)|0;s=D;j=kb(P|0,j|0,25)|0;j=gb(e|0,E|0,j|0,D|0)|0;E=hb(h|0,B|0,16777216,0)|0;E=fb(E|0,D|0,25)|0;e=D;L=hb(O|0,N|0,M|0,L|0)|0;J=hb(L|0,D|0,K|0,J|0)|0;H=hb(J|0,D|0,I|0,H|0)|0;F=hb(H|0,D|0,G|0,F|0)|0;b=hb(F|0,D|0,r|0,b|0)|0;b=hb(b|0,D|0,E|0,e|0)|0;r=D;e=kb(E|0,e|0,25)|0;e=gb(h|0,B|0,e|0,D|0)|0;B=hb(d|0,s|0,33554432,0)|0;B=fb(B|0,D|0,26)|0;h=D;g=hb(C|0,g|0,B|0,h|0)|0;h=kb(B|0,h|0,26)|0;h=gb(d|0,s|0,h|0,D|0)|0;s=hb(b|0,r|0,33554432,0)|0;s=fb(s|0,D|0,26)|0;d=D;x=hb(A|0,z|0,y|0,x|0)|0;v=hb(x|0,D|0,w|0,v|0)|0;t=hb(v|0,D|0,u|0,t|0)|0;m=hb(t|0,D|0,p|0,m|0)|0;m=hb(m|0,D|0,s|0,d|0)|0;p=D;d=kb(s|0,d|0,26)|0;d=gb(b|0,r|0,d|0,D|0)|0;r=hb(m|0,p|0,16777216,0)|0;r=fb(r|0,D|0,25)|0;b=D;s=sb(r|0,b|0,19,0)|0;o=hb(s|0,D|0,n|0,o|0)|0;n=D;b=kb(r|0,b|0,25)|0;b=gb(m|0,p|0,b|0,D|0)|0;p=hb(o|0,n|0,33554432,0)|0;p=fb(p|0,D|0,26)|0;m=D;l=hb(q|0,l|0,p|0,m|0)|0;m=kb(p|0,m|0,26)|0;m=gb(o|0,n|0,m|0,D|0)|0;ga(a|0,m|0,4,0);ga(a+4|0,l|0,4,0);ga(a+8|0,k|0,4,0);ga(a+12|0,j|0,4,0);ga(a+16|0,h|0,4,0);ga(a+20|0,g|0,4,0);ga(a+24|0,f|0,4,0);ga(a+28|0,e|0,4,0);ga(a+32|0,d|0,4,0);ga(a+36|0,b|0,4,0);i=c;return}function Ka(a,b,c){a=a|0;b=b|0;c=c|0;var d=0,e=0,f=0,g=0,h=0,j=0;g=i;i=i+208|0;f=g+160|0;e=g+120|0;h=g+80|0;d=g+40|0;j=g;Ja(f,c);ya(f,f,c);Ja(e,f);ya(e,e,c);ya(e,e,b);Ja(h,e);Ja(d,h);Ja(d,d);ya(d,e,d);ya(h,h,d);Ja(h,h);ya(h,d,h);Ja(d,h);Ja(d,d);Ja(d,d);Ja(d,d);Ja(d,d);ya(h,d,h);Ja(d,h);Ja(d,d);Ja(d,d);Ja(d,d);Ja(d,d);Ja(d,d);Ja(d,d);Ja(d,d);Ja(d,d);Ja(d,d);ya(d,d,h);Ja(j,d);Ja(j,j);Ja(j,j);Ja(j,j);Ja(j,j);Ja(j,j);Ja(j,j);Ja(j,j);Ja(j,j);Ja(j,j);Ja(j,j);Ja(j,j);Ja(j,j);Ja(j,j);Ja(j,j);Ja(j,j);Ja(j,j);Ja(j,j);Ja(j,j);Ja(j,j);ya(d,j,d);Ja(d,d);Ja(d,d);Ja(d,d);Ja(d,d);Ja(d,d);Ja(d,d);Ja(d,d);Ja(d,d);Ja(d,d);Ja(d,d);ya(h,d,h);Ja(d,h);c=0;do{Ja(d,d);c=c+1|0}while((c|0)!=49);ya(d,d,h);Ja(j,d);c=0;do{Ja(j,j);c=c+1|0}while((c|0)!=99);ya(d,j,d);j=0;do{Ja(d,d);j=j+1|0}while((j|0)!=50);ya(h,d,h);Ja(h,h);Ja(h,h);ya(h,h,e);ya(h,h,f);ya(a,h,b);i=g;return}function La(a,b){a=a|0;b=b|0;var c=0,d=0,e=0,f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0,P=0,Q=0,R=0,S=0,T=0,U=0,V=0,W=0,X=0,Y=0,Z=0,_=0,$=0,aa=0,ba=0,ca=0,da=0,ea=0,ha=0,ia=0,ja=0,ka=0,la=0,ma=0,na=0,oa=0,pa=0,qa=0,ra=0,sa=0,ta=0,ua=0,va=0,wa=0,xa=0,ya=0,za=0,Aa=0,Ba=0,Ca=0,Da=0,Ea=0,Fa=0,Ga=0,Ha=0,Ia=0,Ja=0,Ka=0,La=0,Ma=0,Na=0,Oa=0,Pa=0,Qa=0,Ra=0,Sa=0,Ta=0,Ua=0,Va=0,Wa=0,Xa=0,Ya=0,Za=0,_a=0,$a=0,ab=0,bb=0,cb=0,db=0,eb=0,ib=0,jb=0,lb=0,mb=0,nb=0;c=i;eb=fa(b|0,4,0,0)|0|0;Oa=fa(b+4|0,4,0,0)|0|0;k=fa(b+8|0,4,0,0)|0|0;ea=fa(b+12|0,4,0,0)|0|0;e=fa(b+16|0,4,0,0)|0|0;jb=fa(b+20|0,4,0,0)|0|0;y=fa(b+24|0,4,0,0)|0|0;sa=fa(b+28|0,4,0,0)|0|0;h=fa(b+32|0,4,0,0)|0|0;b=fa(b+36|0,4,0,0)|0|0;m=eb<<1;o=Oa<<1;_a=k<<1;f=ea<<1;Ia=e<<1;d=jb<<1;ra=y<<1;j=sa<<1;Za=jb*38|0;Ma=y*19|0;ia=sa*38|0;Y=h*19|0;nb=b*38|0;ib=((eb|0)<0)<<31>>31;ib=sb(eb|0,ib|0,eb|0,ib|0)|0;eb=D;p=((m|0)<0)<<31>>31;Pa=((Oa|0)<0)<<31>>31;Xa=sb(m|0,p|0,Oa|0,Pa|0)|0;Wa=D;l=((k|0)<0)<<31>>31;Ra=sb(k|0,l|0,m|0,p|0)|0;Qa=D;ha=((ea|0)<0)<<31>>31;Ha=sb(ea|0,ha|0,m|0,p|0)|0;Ga=D;v=((e|0)<0)<<31>>31;va=sb(e|0,v|0,m|0,p|0)|0;ua=D;lb=((jb|0)<0)<<31>>31;la=sb(jb|0,lb|0,m|0,p|0)|0;ka=D;g=((y|0)<0)<<31>>31;$=sb(y|0,g|0,m|0,p|0)|0;_=D;ta=((sa|0)<0)<<31>>31;R=sb(sa|0,ta|0,m|0,p|0)|0;Q=D;t=((h|0)<0)<<31>>31;H=sb(h|0,t|0,m|0,p|0)|0;G=D;r=((b|0)<0)<<31>>31;p=sb(b|0,r|0,m|0,p|0)|0;m=D;q=((o|0)<0)<<31>>31;Pa=sb(o|0,q|0,Oa|0,Pa|0)|0;Oa=D;Fa=sb(o|0,q|0,k|0,l|0)|0;Ea=D;x=((f|0)<0)<<31>>31;za=sb(f|0,x|0,o|0,q|0)|0;ya=D;pa=sb(e|0,v|0,o|0,q|0)|0;oa=D;u=((d|0)<0)<<31>>31;ba=sb(d|0,u|0,o|0,q|0)|0;aa=D;T=sb(y|0,g|0,o|0,q|0)|0;S=D;w=((j|0)<0)<<31>>31;J=sb(j|0,w|0,o|0,q|0)|0;I=D;n=sb(h|0,t|0,o|0,q|0)|0;s=D;mb=((nb|0)<0)<<31>>31;q=sb(nb|0,mb|0,o|0,q|0)|0;o=D;xa=sb(k|0,l|0,k|0,l|0)|0;wa=D;$a=((_a|0)<0)<<31>>31;na=sb(_a|0,$a|0,ea|0,ha|0)|0;ma=D;da=sb(e|0,v|0,_a|0,$a|0)|0;ca=D;X=sb(jb|0,lb|0,_a|0,$a|0)|0;W=D;P=sb(y|0,g|0,_a|0,$a|0)|0;O=D;A=sb(sa|0,ta|0,_a|0,$a|0)|0;z=D;Z=((Y|0)<0)<<31>>31;$a=sb(Y|0,Z|0,_a|0,$a|0)|0;_a=D;l=sb(nb|0,mb|0,k|0,l|0)|0;k=D;ha=sb(f|0,x|0,ea|0,ha|0)|0;ea=D;V=sb(f|0,x|0,e|0,v|0)|0;U=D;L=sb(d|0,u|0,f|0,x|0)|0;K=D;F=sb(y|0,g|0,f|0,x|0)|0;E=D;ja=((ia|0)<0)<<31>>31;bb=sb(ia|0,ja|0,f|0,x|0)|0;ab=D;Ta=sb(Y|0,Z|0,f|0,x|0)|0;Sa=D;x=sb(nb|0,mb|0,f|0,x|0)|0;f=D;N=sb(e|0,v|0,e|0,v|0)|0;M=D;Ja=((Ia|0)<0)<<31>>31;C=sb(Ia|0,Ja|0,jb|0,lb|0)|0;B=D;Na=((Ma|0)<0)<<31>>31;db=sb(Ma|0,Na|0,Ia|0,Ja|0)|0;cb=D;Va=sb(ia|0,ja|0,e|0,v|0)|0;Ua=D;Ja=sb(Y|0,Z|0,Ia|0,Ja|0)|0;Ia=D;v=sb(nb|0,mb|0,e|0,v|0)|0;e=D;lb=sb(Za|0,((Za|0)<0)<<31>>31|0,jb|0,lb|0)|0;jb=D;Za=sb(Ma|0,Na|0,d|0,u|0)|0;Ya=D;La=sb(ia|0,ja|0,d|0,u|0)|0;Ka=D;Ba=sb(Y|0,Z|0,d|0,u|0)|0;Aa=D;u=sb(nb|0,mb|0,d|0,u|0)|0;d=D;Na=sb(Ma|0,Na|0,y|0,g|0)|0;Ma=D;Da=sb(ia|0,ja|0,y|0,g|0)|0;Ca=D;ra=sb(Y|0,Z|0,ra|0,((ra|0)<0)<<31>>31|0)|0;qa=D;g=sb(nb|0,mb|0,y|0,g|0)|0;y=D;ta=sb(ia|0,ja|0,sa|0,ta|0)|0;sa=D;ja=sb(Y|0,Z|0,j|0,w|0)|0;ia=D;w=sb(nb|0,mb|0,j|0,w|0)|0;j=D;Z=sb(Y|0,Z|0,h|0,t|0)|0;Y=D;t=sb(nb|0,mb|0,h|0,t|0)|0;h=D;r=sb(nb|0,mb|0,b|0,r|0)|0;b=D;eb=hb(lb|0,jb|0,ib|0,eb|0)|0;cb=hb(eb|0,D|0,db|0,cb|0)|0;ab=hb(cb|0,D|0,bb|0,ab|0)|0;_a=hb(ab|0,D|0,$a|0,_a|0)|0;o=hb(_a|0,D|0,q|0,o|0)|0;q=D;Wa=hb(Za|0,Ya|0,Xa|0,Wa|0)|0;Ua=hb(Wa|0,D|0,Va|0,Ua|0)|0;Sa=hb(Ua|0,D|0,Ta|0,Sa|0)|0;k=hb(Sa|0,D|0,l|0,k|0)|0;l=D;Oa=hb(Ra|0,Qa|0,Pa|0,Oa|0)|0;Ma=hb(Oa|0,D|0,Na|0,Ma|0)|0;Ka=hb(Ma|0,D|0,La|0,Ka|0)|0;Ia=hb(Ka|0,D|0,Ja|0,Ia|0)|0;f=hb(Ia|0,D|0,x|0,f|0)|0;x=D;Ea=hb(Ha|0,Ga|0,Fa|0,Ea|0)|0;Ca=hb(Ea|0,D|0,Da|0,Ca|0)|0;Aa=hb(Ca|0,D|0,Ba|0,Aa|0)|0;e=hb(Aa|0,D|0,v|0,e|0)|0;v=D;wa=hb(za|0,ya|0,xa|0,wa|0)|0;ua=hb(wa|0,D|0,va|0,ua|0)|0;sa=hb(ua|0,D|0,ta|0,sa|0)|0;qa=hb(sa|0,D|0,ra|0,qa|0)|0;d=hb(qa|0,D|0,u|0,d|0)|0;u=D;ma=hb(pa|0,oa|0,na|0,ma|0)|0;ka=hb(ma|0,D|0,la|0,ka|0)|0;ia=hb(ka|0,D|0,ja|0,ia|0)|0;y=hb(ia|0,D|0,g|0,y|0)|0;g=D;ca=hb(ha|0,ea|0,da|0,ca|0)|0;aa=hb(ca|0,D|0,ba|0,aa|0)|0;_=hb(aa|0,D|0,$|0,_|0)|0;Y=hb(_|0,D|0,Z|0,Y|0)|0;j=hb(Y|0,D|0,w|0,j|0)|0;w=D;U=hb(X|0,W|0,V|0,U|0)|0;S=hb(U|0,D|0,T|0,S|0)|0;Q=hb(S|0,D|0,R|0,Q|0)|0;h=hb(Q|0,D|0,t|0,h|0)|0;t=D;M=hb(P|0,O|0,N|0,M|0)|0;K=hb(M|0,D|0,L|0,K|0)|0;I=hb(K|0,D|0,J|0,I|0)|0;G=hb(I|0,D|0,H|0,G|0)|0;b=hb(G|0,D|0,r|0,b|0)|0;r=D;B=hb(F|0,E|0,C|0,B|0)|0;z=hb(B|0,D|0,A|0,z|0)|0;s=hb(z|0,D|0,n|0,s|0)|0;m=hb(s|0,D|0,p|0,m|0)|0;p=D;q=kb(o|0,q|0,1)|0;o=D;l=kb(k|0,l|0,1)|0;k=D;x=kb(f|0,x|0,1)|0;f=D;v=kb(e|0,v|0,1)|0;e=D;u=kb(d|0,u|0,1)|0;d=D;g=kb(y|0,g|0,1)|0;y=D;w=kb(j|0,w|0,1)|0;j=D;t=kb(h|0,t|0,1)|0;h=D;r=kb(b|0,r|0,1)|0;b=D;p=kb(m|0,p|0,1)|0;m=D;s=hb(q|0,o|0,33554432,0)|0;s=fb(s|0,D|0,26)|0;n=D;k=hb(s|0,n|0,l|0,k|0)|0;l=D;n=kb(s|0,n|0,26)|0;n=gb(q|0,o|0,n|0,D|0)|0;o=D;q=hb(u|0,d|0,33554432,0)|0;q=fb(q|0,D|0,26)|0;s=D;y=hb(q|0,s|0,g|0,y|0)|0;g=D;s=kb(q|0,s|0,26)|0;s=gb(u|0,d|0,s|0,D|0)|0;d=D;u=hb(k|0,l|0,16777216,0)|0;u=fb(u|0,D|0,25)|0;q=D;f=hb(u|0,q|0,x|0,f|0)|0;x=D;q=kb(u|0,q|0,25)|0;q=gb(k|0,l|0,q|0,D|0)|0;l=D;k=hb(y|0,g|0,16777216,0)|0;k=fb(k|0,D|0,25)|0;u=D;j=hb(k|0,u|0,w|0,j|0)|0;w=D;u=kb(k|0,u|0,25)|0;u=gb(y|0,g|0,u|0,D|0)|0;g=D;y=hb(f|0,x|0,33554432,0)|0;y=fb(y|0,D|0,26)|0;k=D;e=hb(y|0,k|0,v|0,e|0)|0;v=D;k=kb(y|0,k|0,26)|0;k=gb(f|0,x|0,k|0,D|0)|0;x=hb(j|0,w|0,33554432,0)|0;x=fb(x|0,D|0,26)|0;f=D;h=hb(x|0,f|0,t|0,h|0)|0;t=D;f=kb(x|0,f|0,26)|0;f=gb(j|0,w|0,f|0,D|0)|0;w=hb(e|0,v|0,16777216,0)|0;w=fb(w|0,D|0,25)|0;j=D;d=hb(w|0,j|0,s|0,d|0)|0;s=D;j=kb(w|0,j|0,25)|0;j=gb(e|0,v|0,j|0,D|0)|0;v=hb(h|0,t|0,16777216,0)|0;v=fb(v|0,D|0,25)|0;e=D;b=hb(v|0,e|0,r|0,b|0)|0;r=D;e=kb(v|0,e|0,25)|0;e=gb(h|0,t|0,e|0,D|0)|0;t=hb(d|0,s|0,33554432,0)|0;t=fb(t|0,D|0,26)|0;h=D;g=hb(u|0,g|0,t|0,h|0)|0;h=kb(t|0,h|0,26)|0;h=gb(d|0,s|0,h|0,D|0)|0;s=hb(b|0,r|0,33554432,0)|0;s=fb(s|0,D|0,26)|0;d=D;m=hb(s|0,d|0,p|0,m|0)|0;p=D;d=kb(s|0,d|0,26)|0;d=gb(b|0,r|0,d|0,D|0)|0;r=hb(m|0,p|0,16777216,0)|0;r=fb(r|0,D|0,25)|0;b=D;s=sb(r|0,b|0,19,0)|0;o=hb(s|0,D|0,n|0,o|0)|0;n=D;b=kb(r|0,b|0,25)|0;b=gb(m|0,p|0,b|0,D|0)|0;p=hb(o|0,n|0,33554432,0)|0;p=fb(p|0,D|0,26)|0;m=D;l=hb(q|0,l|0,p|0,m|0)|0;m=kb(p|0,m|0,26)|0;m=gb(o|0,n|0,m|0,D|0)|0;ga(a|0,m|0,4,0);ga(a+4|0,l|0,4,0);ga(a+8|0,k|0,4,0);ga(a+12|0,j|0,4,0);ga(a+16|0,h|0,4,0);ga(a+20|0,g|0,4,0);ga(a+24|0,f|0,4,0);ga(a+28|0,e|0,4,0);ga(a+32|0,d|0,4,0);ga(a+36|0,b|0,4,0);i=c;return}function Ma(a,b){a=a|0;b=b|0;var c=0,d=0,e=0,f=0,g=0;c=i;i=i+160|0;d=c+120|0;g=c+80|0;e=c+40|0;f=c;Na(g,b+80|0);ya(e,b,g);ya(f,b+40|0,g);Oa(a,f);Oa(d,e);b=a+31|0;ga(b>>0|0,(fa(b>>0|0,1,0,1)|0|0)^(fa(d>>0|0,1,0,1)|0|0)<<7|0,1,0);i=c;return}function Na(a,b){a=a|0;b=b|0;var c=0,d=0,e=0,f=0,g=0;f=i;i=i+160|0;e=f+120|0;c=f+80|0;d=f+40|0;g=f;Ja(e,b);Ja(c,e);Ja(c,c);ya(c,b,c);ya(e,e,c);Ja(d,e);ya(c,c,d);Ja(d,c);Ja(d,d);Ja(d,d);Ja(d,d);Ja(d,d);ya(c,d,c);Ja(d,c);Ja(d,d);Ja(d,d);Ja(d,d);Ja(d,d);Ja(d,d);Ja(d,d);Ja(d,d);Ja(d,d);Ja(d,d);ya(d,d,c);Ja(g,d);Ja(g,g);Ja(g,g);Ja(g,g);Ja(g,g);Ja(g,g);Ja(g,g);Ja(g,g);Ja(g,g);Ja(g,g);Ja(g,g);Ja(g,g);Ja(g,g);Ja(g,g);Ja(g,g);Ja(g,g);Ja(g,g);Ja(g,g);Ja(g,g);Ja(g,g);ya(d,g,d);Ja(d,d);Ja(d,d);Ja(d,d);Ja(d,d);Ja(d,d);Ja(d,d);Ja(d,d);Ja(d,d);Ja(d,d);Ja(d,d);ya(c,d,c);Ja(d,c);b=0;do{Ja(d,d);b=b+1|0}while((b|0)!=49);ya(d,d,c);Ja(g,d);b=0;do{Ja(g,g);b=b+1|0}while((b|0)!=99);ya(d,g,d);Ja(d,d);g=0;do{Ja(d,d);g=g+1|0}while((g|0)!=49);ya(c,d,c);Ja(c,c);Ja(c,c);Ja(c,c);Ja(c,c);Ja(c,c);ya(a,c,e);i=f;return}function Oa(a,b){a=a|0;b=b|0;var c=0,d=0,e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0;k=fa(b|0,4,0,0)|0|0;j=fa(b+4|0,4,0,0)|0|0;i=fa(b+8|0,4,0,0)|0|0;h=fa(b+12|0,4,0,0)|0|0;g=fa(b+16|0,4,0,0)|0|0;f=fa(b+20|0,4,0,0)|0|0;e=fa(b+24|0,4,0,0)|0|0;d=fa(b+28|0,4,0,0)|0|0;m=fa(b+32|0,4,0,0)|0|0;c=fa(b+36|0,4,0,0)|0|0;k=(((((((((((((c*19|0)+16777216>>25)+k>>26)+j>>25)+i>>26)+h>>25)+g>>26)+f>>25)+e>>26)+d>>25)+m>>26)+c>>25)*19|0)+k|0;l=k>>26;j=l+j|0;l=k-(l<<26)|0;k=j>>25;i=k+i|0;k=j-(k<<25)|0;j=i>>26;h=j+h|0;j=i-(j<<26)|0;i=h>>25;g=i+g|0;i=h-(i<<25)|0;h=g>>26;f=h+f|0;h=g-(h<<26)|0;g=f>>25;e=g+e|0;g=f-(g<<25)|0;f=e>>26;d=f+d|0;f=e-(f<<26)|0;e=d>>25;b=e+m|0;e=d-(e<<25)|0;d=b>>26;c=d+c|0;d=b-(d<<26)|0;b=c&33554431;ga(a>>0|0,l|0,1,0);ga(a+1>>0|0,l>>>8|0,1,0);ga(a+2>>0|0,l>>>16|0,1,0);ga(a+3>>0|0,k<<2|l>>>24|0,1,0);ga(a+4>>0|0,k>>>6|0,1,0);ga(a+5>>0|0,k>>>14|0,1,0);ga(a+6>>0|0,j<<3|k>>>22|0,1,0);ga(a+7>>0|0,j>>>5|0,1,0);ga(a+8>>0|0,j>>>13|0,1,0);ga(a+9>>0|0,i<<5|j>>>21|0,1,0);ga(a+10>>0|0,i>>>3|0,1,0);ga(a+11>>0|0,i>>>11|0,1,0);ga(a+12>>0|0,h<<6|i>>>19|0,1,0);ga(a+13>>0|0,h>>>2|0,1,0);ga(a+14>>0|0,h>>>10|0,1,0);ga(a+15>>0|0,h>>>18|0,1,0);ga(a+16>>0|0,g|0,1,0);ga(a+17>>0|0,g>>>8|0,1,0);ga(a+18>>0|0,g>>>16|0,1,0);ga(a+19>>0|0,f<<1|g>>>24|0,1,0);ga(a+20>>0|0,f>>>7|0,1,0);ga(a+21>>0|0,f>>>15|0,1,0);ga(a+22>>0|0,e<<3|f>>>23|0,1,0);ga(a+23>>0|0,e>>>5|0,1,0);ga(a+24>>0|0,e>>>13|0,1,0);ga(a+25>>0|0,d<<4|e>>>21|0,1,0);ga(a+26>>0|0,d>>>4|0,1,0);ga(a+27>>0|0,d>>>12|0,1,0);ga(a+28>>0|0,d>>>20|b<<6|0,1,0);ga(a+29>>0|0,c>>>2|0,1,0);ga(a+30>>0|0,c>>>10|0,1,0);ga(a+31>>0|0,b>>>18|0,1,0);return}function Pa(a,b){a=a|0;b=b|0;var c=0,d=0,e=0,f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0;c=i;i=i+592|0;g=c+400|0;d=c+520|0;f=c+240|0;h=c+120|0;e=c;j=0;do{q=fa(b+j>>0|0,1,0,0)|0|0;p=j<<1;ga(d+p>>0|0,q&15|0,1,0);ga(d+(p|1)>>0|0,(q&255)>>>4|0,1,0);j=j+1|0}while((j|0)!=32);b=0;j=0;do{p=d+j|0;q=(fa(p>>0|0,1,0,1)|0|0)+b|0;b=(q<<24)+134217728>>28;ga(p>>0|0,q-(b<<4)|0,1,0);j=j+1|0}while((j|0)!=63);m=d+63|0;ga(m>>0|0,(fa(m>>0|0,1,0,1)|0|0)+b|0,1,0);m=a+0|0;n=m+40|0;do{ga(m|0,0|0,4,0);m=m+4|0}while((m|0)<(n|0));j=a+40|0;ga(j|0,1|0,4,0);k=a+44|0;m=k+0|0;n=m+36|0;do{ga(m|0,0|0,4,0);m=m+4|0}while((m|0)<(n|0));b=a+80|0;ga(b|0,1|0,4,0);l=a+84|0;m=l+0|0;n=m+76|0;do{ga(m|0,0|0,4,0);m=m+4|0}while((m|0)<(n|0));m=f+120|0;n=f+40|0;p=f+80|0;o=a+120|0;q=1;do{Qa(e,(q|0)/2|0,fa(d+q>>0|0,1,0,0)|0|0);Ga(f,a,e);ya(a,f,m);ya(j,n,p);ya(b,p,m);ya(o,f,n);q=q+2|0}while((q|0)<64);y=fa(a+4|0,4,0,0)|0|0;w=fa(a+8|0,4,0,0)|0|0;v=fa(a+12|0,4,0,0)|0|0;u=fa(a+16|0,4,0,0)|0|0;t=fa(a+20|0,4,0,0)|0|0;s=fa(a+24|0,4,0,0)|0|0;r=fa(a+28|0,4,0,0)|0|0;q=fa(a+32|0,4,0,0)|0|0;x=fa(a+36|0,4,0,0)|0|0;ga(g|0,fa(a|0,4,0,0)|0|0,4,0);ga(g+4|0,y|0,4,0);ga(g+8|0,w|0,4,0);ga(g+12|0,v|0,4,0);ga(g+16|0,u|0,4,0);ga(g+20|0,t|0,4,0);ga(g+24|0,s|0,4,0);ga(g+28|0,r|0,4,0);ga(g+32|0,q|0,4,0);ga(g+36|0,x|0,4,0);x=fa(k|0,4,0,0)|0|0;q=fa(a+48|0,4,0,0)|0|0;k=fa(a+52|0,4,0,0)|0|0;r=fa(a+56|0,4,0,0)|0|0;s=fa(a+60|0,4,0,0)|0|0;t=fa(a+64|0,4,0,0)|0|0;u=fa(a+68|0,4,0,0)|0|0;v=fa(a+72|0,4,0,0)|0|0;w=fa(a+76|0,4,0,0)|0|0;ga(g+40|0,fa(j|0,4,0,0)|0|0,4,0);ga(g+44|0,x|0,4,0);ga(g+48|0,q|0,4,0);ga(g+52|0,k|0,4,0);ga(g+56|0,r|0,4,0);ga(g+60|0,s|0,4,0);ga(g+64|0,t|0,4,0);ga(g+68|0,u|0,4,0);ga(g+72|0,v|0,4,0);ga(g+76|0,w|0,4,0);w=fa(l|0,4,0,0)|0|0;v=fa(a+88|0,4,0,0)|0|0;u=fa(a+92|0,4,0,0)|0|0;t=fa(a+96|0,4,0,0)|0|0;s=fa(a+100|0,4,0,0)|0|0;r=fa(a+104|0,4,0,0)|0|0;k=fa(a+108|0,4,0,0)|0|0;l=fa(a+112|0,4,0,0)|0|0;q=fa(a+116|0,4,0,0)|0|0;ga(g+80|0,fa(b|0,4,0,0)|0|0,4,0);ga(g+84|0,w|0,4,0);ga(g+88|0,v|0,4,0);ga(g+92|0,u|0,4,0);ga(g+96|0,t|0,4,0);ga(g+100|0,s|0,4,0);ga(g+104|0,r|0,4,0);ga(g+108|0,k|0,4,0);ga(g+112|0,l|0,4,0);ga(g+116|0,q|0,4,0);Ea(f,g);ya(h,f,m);q=h+40|0;ya(q,n,p);g=h+80|0;ya(g,p,m);Ea(f,h);ya(h,f,m);ya(q,n,p);ya(g,p,m);Ea(f,h);ya(h,f,m);ya(q,n,p);ya(g,p,m);Ea(f,h);ya(a,f,m);ya(j,n,p);ya(b,p,m);ya(o,f,n);g=0;do{Qa(e,(g|0)/2|0,fa(d+g>>0|0,1,0,0)|0|0);Ga(f,a,e);ya(a,f,m);ya(j,n,p);ya(b,p,m);ya(o,f,n);g=g+2|0}while((g|0)<64);i=c;return}function Qa(a,b,c){a=a|0;b=b|0;c=c|0;var d=0,e=0,f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0;d=i;i=i+128|0;e=d;f=c<<24>>24;f=jb(f|0,((f|0)<0)<<31>>31|0,63)|0;j=c<<24>>24;j=j-((j&0-f)<<1)|0;ga(a|0,1|0,4,0);c=a+4|0;h=c+0|0;g=h+36|0;do{ga(h|0,0|0,4,0);h=h+4|0}while((h|0)<(g|0));k=a+40|0;ga(k|0,1|0,4,0);l=a+44|0;h=l+0|0;g=h+76|0;do{ga(h|0,0|0,4,0);h=h+4|0}while((h|0)<(g|0));r=j&255;q=((r^1)+ -1|0)>>>31;bb(a,360+(b*960|0)|0,q);bb(k,400+(b*960|0)|0,q);j=a+80|0;bb(j,440+(b*960|0)|0,q);q=((r^2)+ -1|0)>>>31;bb(a,480+(b*960|0)|0,q);bb(k,520+(b*960|0)|0,q);bb(j,560+(b*960|0)|0,q);q=((r^3)+ -1|0)>>>31;bb(a,600+(b*960|0)|0,q);bb(k,640+(b*960|0)|0,q);bb(j,680+(b*960|0)|0,q);q=((r^4)+ -1|0)>>>31;bb(a,720+(b*960|0)|0,q);bb(k,760+(b*960|0)|0,q);bb(j,800+(b*960|0)|0,q);q=((r^5)+ -1|0)>>>31;bb(a,840+(b*960|0)|0,q);bb(k,880+(b*960|0)|0,q);bb(j,920+(b*960|0)|0,q);q=((r^6)+ -1|0)>>>31;bb(a,960+(b*960|0)|0,q);bb(k,1e3+(b*960|0)|0,q);bb(j,1040+(b*960|0)|0,q);q=((r^7)+ -1|0)>>>31;bb(a,1080+(b*960|0)|0,q);bb(k,1120+(b*960|0)|0,q);bb(j,1160+(b*960|0)|0,q);r=((r^8)+ -1|0)>>>31;bb(a,1200+(b*960|0)|0,r);bb(k,1240+(b*960|0)|0,r);bb(j,1280+(b*960|0)|0,r);l=fa(l|0,4,0,0)|0|0;r=fa(a+48|0,4,0,0)|0|0;q=fa(a+52|0,4,0,0)|0|0;p=fa(a+56|0,4,0,0)|0|0;o=fa(a+60|0,4,0,0)|0|0;n=fa(a+64|0,4,0,0)|0|0;m=fa(a+68|0,4,0,0)|0|0;b=fa(a+72|0,4,0,0)|0|0;h=fa(a+76|0,4,0,0)|0|0;ga(e|0,fa(k|0,4,0,0)|0|0,4,0);ga(e+4|0,l|0,4,0);ga(e+8|0,r|0,4,0);ga(e+12|0,q|0,4,0);ga(e+16|0,p|0,4,0);ga(e+20|0,o|0,4,0);ga(e+24|0,n|0,4,0);ga(e+28|0,m|0,4,0);ga(e+32|0,b|0,4,0);ga(e+36|0,h|0,4,0);h=e+40|0;c=fa(c|0,4,0,0)|0|0;b=fa(a+8|0,4,0,0)|0|0;m=fa(a+12|0,4,0,0)|0|0;n=fa(a+16|0,4,0,0)|0|0;o=fa(a+20|0,4,0,0)|0|0;p=fa(a+24|0,4,0,0)|0|0;q=fa(a+28|0,4,0,0)|0|0;r=fa(a+32|0,4,0,0)|0|0;l=fa(a+36|0,4,0,0)|0|0;ga(h|0,fa(a|0,4,0,0)|0|0,4,0);ga(e+44|0,c|0,4,0);ga(e+48|0,b|0,4,0);ga(e+52|0,m|0,4,0);ga(e+56|0,n|0,4,0);ga(e+60|0,o|0,4,0);ga(e+64|0,p|0,4,0);ga(e+68|0,q|0,4,0);ga(e+72|0,r|0,4,0);ga(e+76|0,l|0,4,0);l=e+80|0;r=0-(fa(a+84|0,4,0,0)|0|0)|0;q=0-(fa(a+88|0,4,0,0)|0|0)|0;p=0-(fa(a+92|0,4,0,0)|0|0)|0;o=0-(fa(a+96|0,4,0,0)|0|0)|0;n=0-(fa(a+100|0,4,0,0)|0|0)|0;m=0-(fa(a+104|0,4,0,0)|0|0)|0;b=0-(fa(a+108|0,4,0,0)|0|0)|0;c=0-(fa(a+112|0,4,0,0)|0|0)|0;g=0-(fa(a+116|0,4,0,0)|0|0)|0;ga(l|0,0-(fa(j|0,4,0,0)|0|0)|0,4,0);ga(e+84|0,r|0,4,0);ga(e+88|0,q|0,4,0);ga(e+92|0,p|0,4,0);ga(e+96|0,o|0,4,0);ga(e+100|0,n|0,4,0);ga(e+104|0,m|0,4,0);ga(e+108|0,b|0,4,0);ga(e+112|0,c|0,4,0);ga(e+116|0,g|0,4,0);bb(a,e,f);bb(k,h,f);bb(j,l,f);i=d;return}function Ra(a,b){a=a|0;b=b|0;var c=0,d=0,e=0,f=0,g=0;c=i;i=i+160|0;d=c+120|0;g=c+80|0;e=c+40|0;f=c;Na(g,b+80|0);ya(e,b,g);ya(f,b+40|0,g);Oa(a,f);Oa(d,e);b=a+31|0;ga(b>>0|0,(fa(b>>0|0,1,0,1)|0|0)^(fa(d>>0|0,1,0,1)|0|0)<<7|0,1,0);i=c;return}function Sa(a){a=a|0;var b=0,c=0,d=0,e=0,f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0,P=0,Q=0,R=0,S=0,T=0,U=0,V=0,W=0,X=0,Y=0,Z=0,_=0,$=0,aa=0,ba=0,ca=0,da=0,ea=0,ha=0,ia=0,ja=0,ka=0,la=0,ma=0,na=0,oa=0,pa=0,qa=0,ra=0,sa=0,ta=0,ua=0,va=0,wa=0,xa=0,ya=0,za=0,Aa=0,Ba=0,Ca=0,Da=0,Ea=0,Fa=0,Ga=0,Ha=0,Ia=0,Ja=0,Ka=0,La=0,Ma=0,Na=0,Oa=0,Pa=0,Qa=0,Ra=0,Sa=0,Ta=0,Ua=0,Va=0,Wa=0,Xa=0,Ya=0,Za=0,_a=0,$a=0,ab=0,bb=0,cb=0,db=0,eb=0,ib=0,lb=0,mb=0,nb=0;b=i;ea=a+1|0;ca=a+2|0;La=fa(ca>>0|0,1,0,0)|0|0;da=fa(a>>0|0,1,0,1)|0|0;W=kb(fa(ea>>0|0,1,0,1)|0|0|0,0,8)|0;xa=D;La=La&255;U=kb(La|0,0,16)|0;aa=a+3|0;ua=kb(fa(aa>>0|0,1,0,1)|0|0|0,0,8)|0;ra=D;$=a+4|0;V=kb(fa($>>0|0,1,0,1)|0|0|0,0,16)|0;ra=ra|D;Z=a+5|0;N=fa(Z>>0|0,1,0,1)|0|0;X=kb(N|0,0,24)|0;ra=jb(ua|La|V|X|0,ra|D|0,5)|0;X=a+6|0;V=a+7|0;La=fa(V>>0|0,1,0,0)|0|0;ua=kb(fa(X>>0|0,1,0,1)|0|0|0,0,8)|0;Ma=D;La=La&255;T=kb(La|0,0,16)|0;Ma=jb(ua|N|T|0,Ma|D|0,2)|0;T=a+8|0;N=kb(fa(T>>0|0,1,0,1)|0|0|0,0,8)|0;ua=D;S=a+9|0;Ia=kb(fa(S>>0|0,1,0,1)|0|0|0,0,16)|0;ua=ua|D;Q=a+10|0;Ua=fa(Q>>0|0,1,0,1)|0|0;O=kb(Ua|0,0,24)|0;ua=jb(N|La|Ia|O|0,ua|D|0,7)|0;O=a+11|0;Ia=kb(fa(O>>0|0,1,0,1)|0|0|0,0,8)|0;La=D;N=a+12|0;H=kb(fa(N>>0|0,1,0,1)|0|0|0,0,16)|0;La=La|D;L=a+13|0;u=fa(L>>0|0,1,0,1)|0|0;J=kb(u|0,0,24)|0;La=jb(Ia|Ua|H|J|0,La|D|0,4)|0;J=a+14|0;H=a+15|0;Ua=fa(H>>0|0,1,0,0)|0|0;Ia=kb(fa(J>>0|0,1,0,1)|0|0|0,0,8)|0;Fa=D;Ua=Ua&255;F=kb(Ua|0,0,16)|0;Fa=jb(Ia|u|F|0,Fa|D|0,1)|0;F=a+16|0;u=kb(fa(F>>0|0,1,0,1)|0|0|0,0,8)|0;Ia=D;E=a+17|0;w=kb(fa(E>>0|0,1,0,1)|0|0|0,0,16)|0;Ia=Ia|D;B=a+18|0;v=fa(B>>0|0,1,0,1)|0|0;z=kb(v|0,0,24)|0;Ia=jb(u|Ua|w|z|0,Ia|D|0,6)|0;z=a+19|0;w=a+20|0;Ua=fa(w>>0|0,1,0,0)|0|0;u=kb(fa(z>>0|0,1,0,1)|0|0|0,0,8)|0;Va=D;Ua=kb(Ua&255|0,0,16)|0;Va=jb(u|v|Ua|0,Va|D|0,3)|0;Ua=D;v=a+21|0;u=a+22|0;s=a+23|0;Sa=fa(s>>0|0,1,0,0)|0|0;cb=fa(v>>0|0,1,0,1)|0|0;db=kb(fa(u>>0|0,1,0,1)|0|0|0,0,8)|0;ab=D;Sa=Sa&255;bb=kb(Sa|0,0,16)|0;q=a+24|0;Aa=kb(fa(q>>0|0,1,0,1)|0|0|0,0,8)|0;la=D;p=a+25|0;j=kb(fa(p>>0|0,1,0,1)|0|0|0,0,16)|0;la=la|D;n=a+26|0;Ja=fa(n>>0|0,1,0,1)|0|0;l=kb(Ja|0,0,24)|0;la=jb(Aa|Sa|j|l|0,la|D|0,5)|0;l=a+27|0;j=a+28|0;Sa=fa(j>>0|0,1,0,0)|0|0;Aa=kb(fa(l>>0|0,1,0,1)|0|0|0,0,8)|0;$a=D;Sa=Sa&255;g=kb(Sa|0,0,16)|0;$a=jb(Aa|Ja|g|0,$a|D|0,2)|0;g=a+29|0;Ja=kb(fa(g>>0|0,1,0,1)|0|0|0,0,8)|0;Aa=D;f=a+30|0;mb=kb(fa(f>>0|0,1,0,1)|0|0|0,0,16)|0;Aa=Aa|D;c=a+31|0;t=fa(c>>0|0,1,0,1)|0|0;ta=kb(t|0,0,24)|0;Aa=jb(Ja|Sa|mb|ta|0,Aa|D|0,7)|0;ta=kb(fa(a+32>>0|0,1,0,1)|0|0|0,0,8)|0;mb=D;Sa=kb(fa(a+33>>0|0,1,0,1)|0|0|0,0,16)|0;mb=mb|D;Ja=fa(a+34>>0|0,1,0,1)|0|0;Ca=kb(Ja|0,0,24)|0;mb=jb(ta|t|Sa|Ca|0,mb|D|0,4)|0;Ca=fa(a+36>>0|0,1,0,0)|0|0;Sa=kb(fa(a+35>>0|0,1,0,1)|0|0|0,0,8)|0;t=D;Ca=Ca&255;ta=kb(Ca|0,0,16)|0;t=jb(Sa|Ja|ta|0,t|D|0,1)|0;ta=kb(fa(a+37>>0|0,1,0,1)|0|0|0,0,8)|0;Ja=D;Sa=kb(fa(a+38>>0|0,1,0,1)|0|0|0,0,16)|0;Ja=Ja|D;wa=fa(a+39>>0|0,1,0,1)|0|0;ha=kb(wa|0,0,24)|0;Ja=jb(ta|Ca|Sa|ha|0,Ja|D|0,6)|0;ha=fa(a+41>>0|0,1,0,0)|0|0;Sa=kb(fa(a+40>>0|0,1,0,1)|0|0|0,0,8)|0;Ca=D;ha=kb(ha&255|0,0,16)|0;Ca=jb(Sa|wa|ha|0,Ca|D|0,3)|0;ha=D;wa=fa(a+44>>0|0,1,0,0)|0|0;Sa=fa(a+42>>0|0,1,0,1)|0|0;ta=kb(fa(a+43>>0|0,1,0,1)|0|0|0,0,8)|0;G=D;wa=wa&255;na=kb(wa|0,0,16)|0;Ga=kb(fa(a+45>>0|0,1,0,1)|0|0|0,0,8)|0;K=D;Oa=kb(fa(a+46>>0|0,1,0,1)|0|0|0,0,16)|0;K=K|D;nb=fa(a+47>>0|0,1,0,1)|0|0;M=kb(nb|0,0,24)|0;K=jb(Ga|wa|Oa|M|0,K|D|0,5)|0;M=fa(a+49>>0|0,1,0,0)|0|0;Oa=kb(fa(a+48>>0|0,1,0,1)|0|0|0,0,8)|0;wa=D;M=M&255;Ga=kb(M|0,0,16)|0;wa=jb(Oa|nb|Ga|0,wa|D|0,2)|0;wa=wa&2097151;Ga=kb(fa(a+50>>0|0,1,0,1)|0|0|0,0,8)|0;nb=D;Oa=kb(fa(a+51>>0|0,1,0,1)|0|0|0,0,16)|0;nb=nb|D;Ka=fa(a+52>>0|0,1,0,1)|0|0;m=kb(Ka|0,0,24)|0;nb=jb(Ga|M|Oa|m|0,nb|D|0,7)|0;nb=nb&2097151;m=kb(fa(a+53>>0|0,1,0,1)|0|0|0,0,8)|0;Oa=D;M=kb(fa(a+54>>0|0,1,0,1)|0|0|0,0,16)|0;Oa=Oa|D;Ga=fa(a+55>>0|0,1,0,1)|0|0;R=kb(Ga|0,0,24)|0;Oa=jb(m|Ka|M|R|0,Oa|D|0,4)|0;Oa=Oa&2097151;R=fa(a+57>>0|0,1,0,0)|0|0;M=kb(fa(a+56>>0|0,1,0,1)|0|0|0,0,8)|0;Ka=D;R=R&255;m=kb(R|0,0,16)|0;Ka=jb(M|Ga|m|0,Ka|D|0,1)|0;Ka=Ka&2097151;m=kb(fa(a+58>>0|0,1,0,1)|0|0|0,0,8)|0;Ga=D;M=kb(fa(a+59>>0|0,1,0,1)|0|0|0,0,16)|0;Ga=Ga|D;ja=fa(a+60>>0|0,1,0,1)|0|0;ia=kb(ja|0,0,24)|0;Ga=jb(m|R|M|ia|0,Ga|D|0,6)|0;Ga=Ga&2097151;ia=kb(fa(a+61>>0|0,1,0,1)|0|0|0,0,8)|0;M=D;R=kb(fa(a+62>>0|0,1,0,1)|0|0|0,0,16)|0;M=M|D;m=kb(fa(a+63>>0|0,1,0,1)|0|0|0,0,24)|0;M=jb(ia|ja|R|m|0,M|D|0,3)|0;m=D;R=sb(M|0,m|0,666643,0)|0;ja=D;ia=sb(M|0,m|0,470296,0)|0;I=D;r=sb(M|0,m|0,654183,0)|0;C=D;P=sb(M|0,m|0,-997805,-1)|0;Y=D;k=sb(M|0,m|0,136657,0)|0;e=D;m=sb(M|0,m|0,-683901,-1)|0;G=hb(m|0,D|0,ta|Sa|na&2031616|0,G|0)|0;na=D;Sa=sb(Ga|0,0,666643,0)|0;ta=D;m=sb(Ga|0,0,470296,0)|0;M=D;Xa=sb(Ga|0,0,654183,0)|0;Ra=D;Ba=sb(Ga|0,0,-997805,-1)|0;_=D;Pa=sb(Ga|0,0,136657,0)|0;Qa=D;Ga=sb(Ga|0,0,-683901,-1)|0;y=D;d=sb(Ka|0,0,666643,0)|0;ba=D;Ha=sb(Ka|0,0,470296,0)|0;va=D;o=sb(Ka|0,0,654183,0)|0;Na=D;eb=sb(Ka|0,0,-997805,-1)|0;Wa=D;ya=sb(Ka|0,0,136657,0)|0;oa=D;Ka=sb(Ka|0,0,-683901,-1)|0;Ja=hb(Ka|0,D|0,Ja&2097151|0,0)|0;Qa=hb(Ja|0,D|0,Pa|0,Qa|0)|0;Y=hb(Qa|0,D|0,P|0,Y|0)|0;P=D;Qa=sb(Oa|0,0,666643,0)|0;Pa=D;Ja=sb(Oa|0,0,470296,0)|0;Ka=D;Ya=sb(Oa|0,0,654183,0)|0;sa=D;Da=sb(Oa|0,0,-997805,-1)|0;ka=D;lb=sb(Oa|0,0,136657,0)|0;ib=D;Oa=sb(Oa|0,0,-683901,-1)|0;h=D;A=sb(nb|0,0,666643,0)|0;x=D;ma=sb(nb|0,0,470296,0)|0;Ta=D;qa=sb(nb|0,0,654183,0)|0;pa=D;_a=sb(nb|0,0,-997805,-1)|0;Za=D;za=sb(nb|0,0,136657,0)|0;Ea=D;nb=sb(nb|0,0,-683901,-1)|0;mb=hb(nb|0,D|0,mb&2097151|0,0)|0;ib=hb(mb|0,D|0,lb|0,ib|0)|0;Wa=hb(ib|0,D|0,eb|0,Wa|0)|0;Ra=hb(Wa|0,D|0,Xa|0,Ra|0)|0;I=hb(Ra|0,D|0,ia|0,I|0)|0;ia=D;Ra=sb(wa|0,0,666643,0)|0;Ia=hb(Ra|0,D|0,Ia&2097151|0,0)|0;Ra=D;Xa=sb(wa|0,0,470296,0)|0;Wa=D;eb=sb(wa|0,0,654183,0)|0;ab=hb(eb|0,D|0,db|cb|bb&2031616|0,ab|0)|0;Ta=hb(ab|0,D|0,ma|0,Ta|0)|0;Pa=hb(Ta|0,D|0,Qa|0,Pa|0)|0;Qa=D;Ta=sb(wa|0,0,-997805,-1)|0;ma=D;ab=sb(wa|0,0,136657,0)|0;$a=hb(ab|0,D|0,$a&2097151|0,0)|0;Za=hb($a|0,D|0,_a|0,Za|0)|0;sa=hb(Za|0,D|0,Ya|0,sa|0)|0;va=hb(sa|0,D|0,Ha|0,va|0)|0;ta=hb(va|0,D|0,Sa|0,ta|0)|0;Sa=D;wa=sb(wa|0,0,-683901,-1)|0;va=D;Ha=hb(Ia|0,Ra|0,1048576,0)|0;Ha=jb(Ha|0,D|0,21)|0;sa=D;Ua=hb(Xa|0,Wa|0,Va|0,Ua|0)|0;Ua=hb(Ua|0,D|0,Ha|0,sa|0)|0;x=hb(Ua|0,D|0,A|0,x|0)|0;A=D;sa=kb(Ha|0,sa|0,21)|0;sa=gb(Ia|0,Ra|0,sa|0,D|0)|0;Ra=D;Ia=hb(Pa|0,Qa|0,1048576,0)|0;Ia=jb(Ia|0,D|0,21)|0;Ha=D;la=hb(Ta|0,ma|0,la&2097151|0,0)|0;pa=hb(la|0,D|0,qa|0,pa|0)|0;Ka=hb(pa|0,D|0,Ja|0,Ka|0)|0;ba=hb(Ka|0,D|0,d|0,ba|0)|0;ba=hb(ba|0,D|0,Ia|0,Ha|0)|0;d=D;Ha=kb(Ia|0,Ha|0,21)|0;Ia=D;Ka=hb(ta|0,Sa|0,1048576,0)|0;Ka=fb(Ka|0,D|0,21)|0;Ja=D;Aa=hb(wa|0,va|0,Aa&2097151|0,0)|0;Ea=hb(Aa|0,D|0,za|0,Ea|0)|0;ka=hb(Ea|0,D|0,Da|0,ka|0)|0;Na=hb(ka|0,D|0,o|0,Na|0)|0;M=hb(Na|0,D|0,m|0,M|0)|0;ja=hb(M|0,D|0,R|0,ja|0)|0;ja=hb(ja|0,D|0,Ka|0,Ja|0)|0;R=D;Ja=kb(Ka|0,Ja|0,21)|0;Ka=D;M=hb(I|0,ia|0,1048576,0)|0;M=fb(M|0,D|0,21)|0;m=D;t=hb(Oa|0,h|0,t&2097151|0,0)|0;oa=hb(t|0,D|0,ya|0,oa|0)|0;_=hb(oa|0,D|0,Ba|0,_|0)|0;C=hb(_|0,D|0,r|0,C|0)|0;C=hb(C|0,D|0,M|0,m|0)|0;r=D;m=kb(M|0,m|0,21)|0;m=gb(I|0,ia|0,m|0,D|0)|0;ia=D;I=hb(Y|0,P|0,1048576,0)|0;I=fb(I|0,D|0,21)|0;M=D;ha=hb(Ga|0,y|0,Ca|0,ha|0)|0;e=hb(ha|0,D|0,k|0,e|0)|0;e=hb(e|0,D|0,I|0,M|0)|0;k=D;M=kb(I|0,M|0,21)|0;M=gb(Y|0,P|0,M|0,D|0)|0;P=D;Y=hb(G|0,na|0,1048576,0)|0;Y=fb(Y|0,D|0,21)|0;I=D;K=hb(Y|0,I|0,K&2097151|0,0)|0;ha=D;I=kb(Y|0,I|0,21)|0;I=gb(G|0,na|0,I|0,D|0)|0;na=D;G=hb(x|0,A|0,1048576,0)|0;G=jb(G|0,D|0,21)|0;Y=D;Ca=kb(G|0,Y|0,21)|0;Ca=gb(x|0,A|0,Ca|0,D|0)|0;A=D;x=hb(ba|0,d|0,1048576,0)|0;x=fb(x|0,D|0,21)|0;y=D;Ga=kb(x|0,y|0,21)|0;Ga=gb(ba|0,d|0,Ga|0,D|0)|0;d=D;ba=hb(ja|0,R|0,1048576,0)|0;ba=fb(ba|0,D|0,21)|0;_=D;ia=hb(m|0,ia|0,ba|0,_|0)|0;m=D;_=kb(ba|0,_|0,21)|0;_=gb(ja|0,R|0,_|0,D|0)|0;R=D;ja=hb(C|0,r|0,1048576,0)|0;ja=fb(ja|0,D|0,21)|0;ba=D;P=hb(ja|0,ba|0,M|0,P|0)|0;M=D;ba=kb(ja|0,ba|0,21)|0;ba=gb(C|0,r|0,ba|0,D|0)|0;r=D;C=hb(e|0,k|0,1048576,0)|0;C=fb(C|0,D|0,21)|0;ja=D;na=hb(C|0,ja|0,I|0,na|0)|0;I=D;ja=kb(C|0,ja|0,21)|0;ja=gb(e|0,k|0,ja|0,D|0)|0;k=D;e=sb(K|0,ha|0,666643,0)|0;Fa=hb(e|0,D|0,Fa&2097151|0,0)|0;e=D;C=sb(K|0,ha|0,470296,0)|0;C=hb(sa|0,Ra|0,C|0,D|0)|0;Ra=D;sa=sb(K|0,ha|0,654183,0)|0;sa=hb(Ca|0,A|0,sa|0,D|0)|0;A=D;Ca=sb(K|0,ha|0,-997805,-1)|0;Ba=D;oa=sb(K|0,ha|0,136657,0)|0;oa=hb(Ga|0,d|0,oa|0,D|0)|0;d=D;ha=sb(K|0,ha|0,-683901,-1)|0;K=D;y=hb(ta|0,Sa|0,x|0,y|0)|0;Ka=gb(y|0,D|0,Ja|0,Ka|0)|0;K=hb(Ka|0,D|0,ha|0,K|0)|0;ha=D;Ka=sb(na|0,I|0,666643,0)|0;Ja=D;y=sb(na|0,I|0,470296,0)|0;x=D;Sa=sb(na|0,I|0,654183,0)|0;Sa=hb(C|0,Ra|0,Sa|0,D|0)|0;Ra=D;C=sb(na|0,I|0,-997805,-1)|0;C=hb(sa|0,A|0,C|0,D|0)|0;A=D;sa=sb(na|0,I|0,136657,0)|0;ta=D;I=sb(na|0,I|0,-683901,-1)|0;I=hb(oa|0,d|0,I|0,D|0)|0;d=D;oa=sb(ja|0,k|0,666643,0)|0;na=D;Ga=sb(ja|0,k|0,470296,0)|0;ya=D;t=sb(ja|0,k|0,654183,0)|0;h=D;Oa=sb(ja|0,k|0,-997805,-1)|0;Na=D;o=sb(ja|0,k|0,136657,0)|0;ka=D;k=sb(ja|0,k|0,-683901,-1)|0;ja=D;Y=hb(Pa|0,Qa|0,G|0,Y|0)|0;Ia=gb(Y|0,D|0,Ha|0,Ia|0)|0;Ba=hb(Ia|0,D|0,Ca|0,Ba|0)|0;ta=hb(Ba|0,D|0,sa|0,ta|0)|0;ja=hb(ta|0,D|0,k|0,ja|0)|0;k=D;ta=sb(P|0,M|0,666643,0)|0;sa=D;Ba=sb(P|0,M|0,470296,0)|0;Ca=D;Ia=sb(P|0,M|0,654183,0)|0;Ha=D;Y=sb(P|0,M|0,-997805,-1)|0;G=D;Qa=sb(P|0,M|0,136657,0)|0;Pa=D;M=sb(P|0,M|0,-683901,-1)|0;P=D;Da=sb(ba|0,r|0,666643,0)|0;Ea=D;za=sb(ba|0,r|0,470296,0)|0;Aa=D;va=sb(ba|0,r|0,654183,0)|0;wa=D;pa=sb(ba|0,r|0,-997805,-1)|0;qa=D;la=sb(ba|0,r|0,136657,0)|0;ma=D;r=sb(ba|0,r|0,-683901,-1)|0;ba=D;Pa=hb(Sa|0,Ra|0,Qa|0,Pa|0)|0;Na=hb(Pa|0,D|0,Oa|0,Na|0)|0;ba=hb(Na|0,D|0,r|0,ba|0)|0;r=D;Na=sb(ia|0,m|0,666643,0)|0;xa=hb(Na|0,D|0,W|da|U&2031616|0,xa|0)|0;U=D;da=sb(ia|0,m|0,470296,0)|0;W=D;Na=sb(ia|0,m|0,654183,0)|0;Ma=hb(Na|0,D|0,Ma&2097151|0,0)|0;sa=hb(Ma|0,D|0,ta|0,sa|0)|0;Aa=hb(sa|0,D|0,za|0,Aa|0)|0;za=D;sa=sb(ia|0,m|0,-997805,-1)|0;ta=D;Ma=sb(ia|0,m|0,136657,0)|0;La=hb(Ma|0,D|0,La&2097151|0,0)|0;Ja=hb(La|0,D|0,Ka|0,Ja|0)|0;Ha=hb(Ja|0,D|0,Ia|0,Ha|0)|0;ya=hb(Ha|0,D|0,Ga|0,ya|0)|0;qa=hb(ya|0,D|0,pa|0,qa|0)|0;pa=D;m=sb(ia|0,m|0,-683901,-1)|0;ia=D;ya=hb(xa|0,U|0,1048576,0)|0;ya=fb(ya|0,D|0,21)|0;Ga=D;ra=hb(da|0,W|0,ra&2097151|0,0)|0;Ea=hb(ra|0,D|0,Da|0,Ea|0)|0;Ea=hb(Ea|0,D|0,ya|0,Ga|0)|0;Da=D;Ga=kb(ya|0,Ga|0,21)|0;Ga=gb(xa|0,U|0,Ga|0,D|0)|0;U=D;xa=hb(Aa|0,za|0,1048576,0)|0;xa=fb(xa|0,D|0,21)|0;ya=D;ua=hb(sa|0,ta|0,ua&2097151|0,0)|0;Ca=hb(ua|0,D|0,Ba|0,Ca|0)|0;na=hb(Ca|0,D|0,oa|0,na|0)|0;wa=hb(na|0,D|0,va|0,wa|0)|0;wa=hb(wa|0,D|0,xa|0,ya|0)|0;va=D;ya=kb(xa|0,ya|0,21)|0;xa=D;na=hb(qa|0,pa|0,1048576,0)|0;na=fb(na|0,D|0,21)|0;oa=D;ia=hb(Fa|0,e|0,m|0,ia|0)|0;x=hb(ia|0,D|0,y|0,x|0)|0;G=hb(x|0,D|0,Y|0,G|0)|0;h=hb(G|0,D|0,t|0,h|0)|0;ma=hb(h|0,D|0,la|0,ma|0)|0;ma=hb(ma|0,D|0,na|0,oa|0)|0;la=D;oa=kb(na|0,oa|0,21)|0;na=D;h=hb(ba|0,r|0,1048576,0)|0;h=fb(h|0,D|0,21)|0;t=D;P=hb(C|0,A|0,M|0,P|0)|0;ka=hb(P|0,D|0,o|0,ka|0)|0;ka=hb(ka|0,D|0,h|0,t|0)|0;o=D;t=kb(h|0,t|0,21)|0;t=gb(ba|0,r|0,t|0,D|0)|0;r=D;ba=hb(ja|0,k|0,1048576,0)|0;ba=fb(ba|0,D|0,21)|0;h=D;d=hb(I|0,d|0,ba|0,h|0)|0;I=D;h=kb(ba|0,h|0,21)|0;h=gb(ja|0,k|0,h|0,D|0)|0;k=D;ja=hb(K|0,ha|0,1048576,0)|0;ja=fb(ja|0,D|0,21)|0;ba=D;R=hb(ja|0,ba|0,_|0,R|0)|0;_=D;ba=kb(ja|0,ba|0,21)|0;ba=gb(K|0,ha|0,ba|0,D|0)|0;ha=D;K=hb(Ea|0,Da|0,1048576,0)|0;K=fb(K|0,D|0,21)|0;ja=D;P=kb(K|0,ja|0,21)|0;M=D;A=hb(wa|0,va|0,1048576,0)|0;A=fb(A|0,D|0,21)|0;C=D;G=kb(A|0,C|0,21)|0;Y=D;x=hb(ma|0,la|0,1048576,0)|0;x=fb(x|0,D|0,21)|0;y=D;r=hb(t|0,r|0,x|0,y|0)|0;t=D;y=kb(x|0,y|0,21)|0;x=D;ia=hb(ka|0,o|0,1048576,0)|0;ia=fb(ia|0,D|0,21)|0;m=D;k=hb(h|0,k|0,ia|0,m|0)|0;h=D;m=kb(ia|0,m|0,21)|0;m=gb(ka|0,o|0,m|0,D|0)|0;o=D;ka=hb(d|0,I|0,1048576,0)|0;ka=fb(ka|0,D|0,21)|0;ia=D;ha=hb(ba|0,ha|0,ka|0,ia|0)|0;ba=D;ia=kb(ka|0,ia|0,21)|0;ia=gb(d|0,I|0,ia|0,D|0)|0;I=D;d=hb(R|0,_|0,1048576,0)|0;d=fb(d|0,D|0,21)|0;ka=D;e=kb(d|0,ka|0,21)|0;e=gb(R|0,_|0,e|0,D|0)|0;_=D;R=sb(d|0,ka|0,666643,0)|0;R=hb(Ga|0,U|0,R|0,D|0)|0;U=D;Ga=sb(d|0,ka|0,470296,0)|0;Fa=D;Ca=sb(d|0,ka|0,654183,0)|0;Ba=D;ua=sb(d|0,ka|0,-997805,-1)|0;ta=D;sa=sb(d|0,ka|0,136657,0)|0;ra=D;ka=sb(d|0,ka|0,-683901,-1)|0;d=D;W=fb(R|0,U|0,21)|0;da=D;Da=hb(Ga|0,Fa|0,Ea|0,Da|0)|0;M=gb(Da|0,D|0,P|0,M|0)|0;M=hb(M|0,D|0,W|0,da|0)|0;P=D;da=kb(W|0,da|0,21)|0;da=gb(R|0,U|0,da|0,D|0)|0;U=D;R=fb(M|0,P|0,21)|0;W=D;za=hb(Ca|0,Ba|0,Aa|0,za|0)|0;xa=gb(za|0,D|0,ya|0,xa|0)|0;ja=hb(xa|0,D|0,K|0,ja|0)|0;ja=hb(ja|0,D|0,R|0,W|0)|0;K=D;W=kb(R|0,W|0,21)|0;W=gb(M|0,P|0,W|0,D|0)|0;P=D;M=fb(ja|0,K|0,21)|0;R=D;ta=hb(wa|0,va|0,ua|0,ta|0)|0;Y=gb(ta|0,D|0,G|0,Y|0)|0;Y=hb(Y|0,D|0,M|0,R|0)|0;G=D;R=kb(M|0,R|0,21)|0;R=gb(ja|0,K|0,R|0,D|0)|0;K=D;ja=fb(Y|0,G|0,21)|0;M=D;pa=hb(sa|0,ra|0,qa|0,pa|0)|0;na=gb(pa|0,D|0,oa|0,na|0)|0;C=hb(na|0,D|0,A|0,C|0)|0;C=hb(C|0,D|0,ja|0,M|0)|0;A=D;M=kb(ja|0,M|0,21)|0;M=gb(Y|0,G|0,M|0,D|0)|0;G=D;Y=fb(C|0,A|0,21)|0;ja=D;d=hb(ma|0,la|0,ka|0,d|0)|0;x=gb(d|0,D|0,y|0,x|0)|0;x=hb(x|0,D|0,Y|0,ja|0)|0;y=D;ja=kb(Y|0,ja|0,21)|0;ja=gb(C|0,A|0,ja|0,D|0)|0;A=D;C=fb(x|0,y|0,21)|0;Y=D;t=hb(r|0,t|0,C|0,Y|0)|0;r=D;Y=kb(C|0,Y|0,21)|0;Y=gb(x|0,y|0,Y|0,D|0)|0;y=D;x=fb(t|0,r|0,21)|0;C=D;o=hb(x|0,C|0,m|0,o|0)|0;m=D;C=kb(x|0,C|0,21)|0;C=gb(t|0,r|0,C|0,D|0)|0;r=D;t=fb(o|0,m|0,21)|0;x=D;h=hb(k|0,h|0,t|0,x|0)|0;k=D;x=kb(t|0,x|0,21)|0;x=gb(o|0,m|0,x|0,D|0)|0;m=D;o=fb(h|0,k|0,21)|0;t=D;I=hb(o|0,t|0,ia|0,I|0)|0;ia=D;t=kb(o|0,t|0,21)|0;t=gb(h|0,k|0,t|0,D|0)|0;k=D;h=fb(I|0,ia|0,21)|0;o=D;ba=hb(ha|0,ba|0,h|0,o|0)|0;ha=D;o=kb(h|0,o|0,21)|0;o=gb(I|0,ia|0,o|0,D|0)|0;ia=D;I=fb(ba|0,ha|0,21)|0;h=D;_=hb(I|0,h|0,e|0,_|0)|0;e=D;h=kb(I|0,h|0,21)|0;h=gb(ba|0,ha|0,h|0,D|0)|0;ha=D;ba=fb(_|0,e|0,21)|0;I=D;d=kb(ba|0,I|0,21)|0;d=gb(_|0,e|0,d|0,D|0)|0;e=D;_=sb(ba|0,I|0,666643,0)|0;U=hb(_|0,D|0,da|0,U|0)|0;da=D;_=sb(ba|0,I|0,470296,0)|0;_=hb(W|0,P|0,_|0,D|0)|0;P=D;W=sb(ba|0,I|0,654183,0)|0;W=hb(R|0,K|0,W|0,D|0)|0;K=D;R=sb(ba|0,I|0,-997805,-1)|0;R=hb(M|0,G|0,R|0,D|0)|0;G=D;M=sb(ba|0,I|0,136657,0)|0;M=hb(ja|0,A|0,M|0,D|0)|0;A=D;I=sb(ba|0,I|0,-683901,-1)|0;I=hb(Y|0,y|0,I|0,D|0)|0;y=D;Y=fb(U|0,da|0,21)|0;ba=D;P=hb(_|0,P|0,Y|0,ba|0)|0;_=D;ba=kb(Y|0,ba|0,21)|0;ba=gb(U|0,da|0,ba|0,D|0)|0;da=D;U=fb(P|0,_|0,21)|0;Y=D;K=hb(W|0,K|0,U|0,Y|0)|0;W=D;Y=kb(U|0,Y|0,21)|0;Y=gb(P|0,_|0,Y|0,D|0)|0;_=D;P=fb(K|0,W|0,21)|0;U=D;G=hb(R|0,G|0,P|0,U|0)|0;R=D;U=kb(P|0,U|0,21)|0;U=gb(K|0,W|0,U|0,D|0)|0;W=D;K=fb(G|0,R|0,21)|0;P=D;A=hb(M|0,A|0,K|0,P|0)|0;M=D;P=kb(K|0,P|0,21)|0;P=gb(G|0,R|0,P|0,D|0)|0;R=D;G=fb(A|0,M|0,21)|0;K=D;y=hb(I|0,y|0,G|0,K|0)|0;I=D;K=kb(G|0,K|0,21)|0;K=gb(A|0,M|0,K|0,D|0)|0;M=D;A=fb(y|0,I|0,21)|0;G=D;r=hb(A|0,G|0,C|0,r|0)|0;C=D;G=kb(A|0,G|0,21)|0;G=gb(y|0,I|0,G|0,D|0)|0;I=D;y=fb(r|0,C|0,21)|0;A=D;m=hb(y|0,A|0,x|0,m|0)|0;x=D;A=kb(y|0,A|0,21)|0;A=gb(r|0,C|0,A|0,D|0)|0;C=D;r=fb(m|0,x|0,21)|0;y=D;k=hb(r|0,y|0,t|0,k|0)|0;t=D;y=kb(r|0,y|0,21)|0;y=gb(m|0,x|0,y|0,D|0)|0;x=D;m=fb(k|0,t|0,21)|0;r=D;ia=hb(m|0,r|0,o|0,ia|0)|0;o=D;r=kb(m|0,r|0,21)|0;r=gb(k|0,t|0,r|0,D|0)|0;t=D;k=fb(ia|0,o|0,21)|0;m=D;ha=hb(k|0,m|0,h|0,ha|0)|0;h=D;m=kb(k|0,m|0,21)|0;m=gb(ia|0,o|0,m|0,D|0)|0;o=D;ia=fb(ha|0,h|0,21)|0;k=D;e=hb(ia|0,k|0,d|0,e|0)|0;d=D;k=kb(ia|0,k|0,21)|0;k=gb(ha|0,h|0,k|0,D|0)|0;h=D;ga(a>>0|0,ba|0,1,0);a=jb(ba|0,da|0,8)|0;ga(ea>>0|0,a|0,1,0);a=jb(ba|0,da|0,16)|0;da=D;ba=kb(Y|0,_|0,5)|0;D|da;ga(ca>>0|0,ba|a|0,1,0);a=jb(Y|0,_|0,3)|0;ga(aa>>0|0,a|0,1,0);a=jb(Y|0,_|0,11)|0;ga($>>0|0,a|0,1,0);a=jb(Y|0,_|0,19)|0;_=D;Y=kb(U|0,W|0,2)|0;D|_;ga(Z>>0|0,Y|a|0,1,0);a=jb(U|0,W|0,6)|0;ga(X>>0|0,a|0,1,0);a=jb(U|0,W|0,14)|0;W=D;U=kb(P|0,R|0,7)|0;D|W;ga(V>>0|0,U|a|0,1,0);a=jb(P|0,R|0,1)|0;ga(T>>0|0,a|0,1,0);a=jb(P|0,R|0,9)|0;ga(S>>0|0,a|0,1,0);a=jb(P|0,R|0,17)|0;R=D;P=kb(K|0,M|0,4)|0;D|R;ga(Q>>0|0,P|a|0,1,0);a=jb(K|0,M|0,4)|0;ga(O>>0|0,a|0,1,0);a=jb(K|0,M|0,12)|0;ga(N>>0|0,a|0,1,0);a=jb(K|0,M|0,20)|0;M=D;K=kb(G|0,I|0,1)|0;D|M;ga(L>>0|0,K|a|0,1,0);a=jb(G|0,I|0,7)|0;ga(J>>0|0,a|0,1,0);a=jb(G|0,I|0,15)|0;I=D;G=kb(A|0,C|0,6)|0;D|I;ga(H>>0|0,G|a|0,1,0);a=jb(A|0,C|0,2)|0;ga(F>>0|0,a|0,1,0);a=jb(A|0,C|0,10)|0;ga(E>>0|0,a|0,1,0);a=jb(A|0,C|0,18)|0;C=D;A=kb(y|0,x|0,3)|0;D|C;ga(B>>0|0,A|a|0,1,0);a=jb(y|0,x|0,5)|0;ga(z>>0|0,a|0,1,0);a=jb(y|0,x|0,13)|0;ga(w>>0|0,a|0,1,0);ga(v>>0|0,r|0,1,0);a=jb(r|0,t|0,8)|0;ga(u>>0|0,a|0,1,0);a=jb(r|0,t|0,16)|0;t=D;r=kb(m|0,o|0,5)|0;D|t;ga(s>>0|0,r|a|0,1,0);a=jb(m|0,o|0,3)|0;ga(q>>0|0,a|0,1,0);a=jb(m|0,o|0,11)|0;ga(p>>0|0,a|0,1,0);a=jb(m|0,o|0,19)|0;o=D;m=kb(k|0,h|0,2)|0;D|o;ga(n>>0|0,m|a|0,1,0);a=jb(k|0,h|0,6)|0;ga(l>>0|0,a|0,1,0);h=jb(k|0,h|0,14)|0;k=D;a=kb(e|0,d|0,7)|0;k|D;ga(j>>0|0,h|a|0,1,0);a=jb(e|0,d|0,1)|0;ga(g>>0|0,a|0,1,0);a=jb(e|0,d|0,9)|0;ga(f>>0|0,a|0,1,0);a=jb(e|0,d|0,17)|0;ga(c>>0|0,a|0,1,0);i=b;return}function Ta(a,b,c){a=a|0;b=b|0;c=c|0;var d=0,e=0,f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0,P=0,Q=0,R=0,S=0,T=0,U=0,V=0,W=0,X=0,Y=0,Z=0,_=0,$=0,aa=0,ba=0,ca=0,da=0,ea=0,ha=0,ia=0,ja=0,ka=0,la=0,ma=0,na=0,oa=0,pa=0,qa=0,ra=0,sa=0,ta=0,ua=0,va=0,wa=0,za=0,Ba=0,Ca=0,Da=0,Fa=0,Ga=0,Ha=0,Ia=0,Ja=0,Ka=0,La=0,Ma=0,Na=0,Oa=0,Pa=0,Qa=0,Ra=0,Sa=0,Ta=0,Ua=0,Va=0,Wa=0,Xa=0,Ya=0,Za=0,_a=0,$a=0,ab=0,cb=0,db=0,eb=0,fb=0,gb=0,hb=0,ib=0,kb=0,lb=0,mb=0,nb=0,ob=0,pb=0,qb=0,rb=0,sb=0,tb=0,ub=0,vb=0,wb=0,xb=0,yb=0,zb=0,Ab=0,Bb=0,Cb=0,Db=0,Eb=0,Fb=0,Gb=0,Hb=0,Ib=0,Jb=0,Kb=0;j=i;i=i+1984|0;f=j+1920|0;k=j+640|0;g=j+480|0;h=j+320|0;d=j+160|0;e=j;l=0;m=0;do{Cb=(fa(b+m>>0|0,1,0,1)|0|0)+l|0;Eb=Cb+8>>4;Db=m<<1;ga(f+Db>>0|0,Cb-(Eb<<4)|0,1,0);l=Eb+8>>4;ga(f+(Db|1)>>0|0,Eb-(l<<4)|0,1,0);m=m+1|0}while((m|0)!=31);m=(fa(b+31>>0|0,1,0,1)|0|0)+l|0;p=m+8>>4;ga(f+62>>0|0,m-(p<<4)|0,1,0);ga(f+63>>0|0,p|0,1,0);Aa(k,c);p=g+120|0;m=h+40|0;b=g+40|0;l=g+80|0;n=h+80|0;o=h+120|0;q=0;do{xa(g,c,k+(q*160|0)|0);ya(h,g,p);ya(m,b,l);ya(n,l,p);ya(o,g,b);q=q+1|0;Aa(k+(q*160|0)|0,h)}while((q|0)!=7);v=a+0|0;u=v+40|0;do{ga(v|0,0|0,4,0);v=v+4|0}while((v|0)<(u|0));w=a+40|0;ga(w|0,1|0,4,0);v=a+44|0;u=v+36|0;do{ga(v|0,0|0,4,0);v=v+4|0}while((v|0)<(u|0));x=a+80|0;ga(x|0,1|0,4,0);v=a+84|0;u=v+36|0;do{ga(v|0,0|0,4,0);v=v+4|0}while((v|0)<(u|0));Ca=d+4|0;y=d+40|0;z=d+44|0;A=d+80|0;B=d+84|0;C=k+40|0;D=k+80|0;E=d+120|0;F=k+120|0;G=k+160|0;H=k+200|0;I=k+240|0;J=k+280|0;K=k+320|0;L=k+360|0;M=k+400|0;N=k+440|0;O=k+480|0;P=k+520|0;Q=k+560|0;R=k+600|0;S=k+640|0;T=k+680|0;U=k+720|0;V=k+760|0;W=k+800|0;X=k+840|0;Y=k+880|0;Z=k+920|0;_=k+960|0;$=k+1e3|0;aa=k+1040|0;ba=k+1080|0;ca=k+1120|0;da=k+1160|0;ea=k+1200|0;ha=k+1240|0;ia=d+48|0;ja=d+52|0;ka=d+56|0;la=d+60|0;ma=d+64|0;na=d+68|0;oa=d+72|0;pa=d+76|0;Eb=e+4|0;ra=e+8|0;sa=e+12|0;ta=e+16|0;ua=e+20|0;va=e+24|0;wa=e+28|0;za=e+32|0;Ba=e+36|0;Ma=e+40|0;Da=d+8|0;Fa=d+12|0;Ga=d+16|0;Ha=d+20|0;Ia=d+24|0;Ja=d+28|0;Ka=d+32|0;La=d+36|0;Na=e+44|0;Oa=e+48|0;Pa=e+52|0;Qa=e+56|0;Ra=e+60|0;Sa=e+64|0;Ta=e+68|0;Ua=e+72|0;Va=e+76|0;db=e+80|0;Wa=d+88|0;Xa=d+92|0;Ya=d+96|0;Za=d+100|0;_a=d+104|0;$a=d+108|0;ab=d+112|0;cb=d+116|0;eb=e+84|0;fb=e+88|0;gb=e+92|0;hb=e+96|0;ib=e+100|0;kb=e+104|0;lb=e+108|0;mb=e+112|0;nb=e+116|0;xb=e+120|0;ob=d+124|0;pb=d+128|0;qb=d+132|0;rb=d+136|0;sb=d+140|0;tb=d+144|0;ub=d+148|0;vb=d+152|0;wb=d+156|0;yb=e+124|0;zb=e+128|0;Ab=e+132|0;Bb=e+136|0;Cb=e+140|0;Db=e+144|0;t=e+148|0;r=e+152|0;q=e+156|0;c=63;while(1){qa=fa(f+c>>0|0,1,0,0)|0|0;s=qa<<24>>24;s=jb(s|0,((s|0)<0)<<31>>31|0,63)|0;qa=qa<<24>>24;qa=qa-((qa&0-s)<<1)|0;Ea(g,a);ya(a,g,p);ya(w,b,l);ya(x,l,p);Ea(g,a);ya(a,g,p);ya(w,b,l);ya(x,l,p);Ea(g,a);ya(a,g,p);ya(w,b,l);ya(x,l,p);Ea(g,a);ya(h,g,p);ya(m,b,l);ya(n,l,p);ya(o,g,b);ga(d|0,1|0,4,0);v=Ca+0|0;u=v+36|0;do{ga(v|0,0|0,4,0);v=v+4|0}while((v|0)<(u|0));ga(y|0,1|0,4,0);v=z+0|0;u=v+36|0;do{ga(v|0,0|0,4,0);v=v+4|0}while((v|0)<(u|0));ga(A|0,1|0,4,0);v=B+0|0;u=v+76|0;do{ga(v|0,0|0,4,0);v=v+4|0}while((v|0)<(u|0));qa=qa&255;v=((qa^1)+ -1|0)>>>31;bb(d,k,v);bb(y,C,v);bb(A,D,v);bb(E,F,v);v=((qa^2)+ -1|0)>>>31;bb(d,G,v);bb(y,H,v);bb(A,I,v);bb(E,J,v);v=((qa^3)+ -1|0)>>>31;bb(d,K,v);bb(y,L,v);bb(A,M,v);bb(E,N,v);v=((qa^4)+ -1|0)>>>31;bb(d,O,v);bb(y,P,v);bb(A,Q,v);bb(E,R,v);v=((qa^5)+ -1|0)>>>31;bb(d,S,v);bb(y,T,v);bb(A,U,v);bb(E,V,v);v=((qa^6)+ -1|0)>>>31;bb(d,W,v);bb(y,X,v);bb(A,Y,v);bb(E,Z,v);v=((qa^7)+ -1|0)>>>31;bb(d,_,v);bb(y,$,v);bb(A,aa,v);bb(E,ba,v);qa=((qa^8)+ -1|0)>>>31;bb(d,ca,qa);bb(y,da,qa);bb(A,ea,qa);bb(E,ha,qa);qa=fa(z|0,4,0,0)|0|0;v=fa(ia|0,4,0,0)|0|0;u=fa(ja|0,4,0,0)|0|0;Fb=fa(ka|0,4,0,0)|0|0;Gb=fa(la|0,4,0,0)|0|0;Hb=fa(ma|0,4,0,0)|0|0;Ib=fa(na|0,4,0,0)|0|0;Jb=fa(oa|0,4,0,0)|0|0;Kb=fa(pa|0,4,0,0)|0|0;ga(e|0,fa(y|0,4,0,0)|0|0,4,0);ga(Eb|0,qa|0,4,0);ga(ra|0,v|0,4,0);ga(sa|0,u|0,4,0);ga(ta|0,Fb|0,4,0);ga(ua|0,Gb|0,4,0);ga(va|0,Hb|0,4,0);ga(wa|0,Ib|0,4,0);ga(za|0,Jb|0,4,0);ga(Ba|0,Kb|0,4,0);Kb=fa(Ca|0,4,0,0)|0|0;Jb=fa(Da|0,4,0,0)|0|0;Ib=fa(Fa|0,4,0,0)|0|0;Hb=fa(Ga|0,4,0,0)|0|0;Gb=fa(Ha|0,4,0,0)|0|0;Fb=fa(Ia|0,4,0,0)|0|0;u=fa(Ja|0,4,0,0)|0|0;v=fa(Ka|0,4,0,0)|0|0;qa=fa(La|0,4,0,0)|0|0;ga(Ma|0,fa(d|0,4,0,0)|0|0,4,0);ga(Na|0,Kb|0,4,0);ga(Oa|0,Jb|0,4,0);ga(Pa|0,Ib|0,4,0);ga(Qa|0,Hb|0,4,0);ga(Ra|0,Gb|0,4,0);ga(Sa|0,Fb|0,4,0);ga(Ta|0,u|0,4,0);ga(Ua|0,v|0,4,0);ga(Va|0,qa|0,4,0);qa=fa(B|0,4,0,0)|0|0;v=fa(Wa|0,4,0,0)|0|0;u=fa(Xa|0,4,0,0)|0|0;Fb=fa(Ya|0,4,0,0)|0|0;Gb=fa(Za|0,4,0,0)|0|0;Hb=fa(_a|0,4,0,0)|0|0;Ib=fa($a|0,4,0,0)|0|0;Jb=fa(ab|0,4,0,0)|0|0;Kb=fa(cb|0,4,0,0)|0|0;ga(db|0,fa(A|0,4,0,0)|0|0,4,0);ga(eb|0,qa|0,4,0);ga(fb|0,v|0,4,0);ga(gb|0,u|0,4,0);ga(hb|0,Fb|0,4,0);ga(ib|0,Gb|0,4,0);ga(kb|0,Hb|0,4,0);ga(lb|0,Ib|0,4,0);ga(mb|0,Jb|0,4,0);ga(nb|0,Kb|0,4,0);Kb=0-(fa(ob|0,4,0,0)|0|0)|0;Jb=0-(fa(pb|0,4,0,0)|0|0)|0;Ib=0-(fa(qb|0,4,0,0)|0|0)|0;Hb=0-(fa(rb|0,4,0,0)|0|0)|0;Gb=0-(fa(sb|0,4,0,0)|0|0)|0;Fb=0-(fa(tb|0,4,0,0)|0|0)|0;u=0-(fa(ub|0,4,0,0)|0|0)|0;v=0-(fa(vb|0,4,0,0)|0|0)|0;qa=0-(fa(wb|0,4,0,0)|0|0)|0;ga(xb|0,0-(fa(E|0,4,0,0)|0|0)|0,4,0);ga(yb|0,Kb|0,4,0);ga(zb|0,Jb|0,4,0);ga(Ab|0,Ib|0,4,0);ga(Bb|0,Hb|0,4,0);ga(Cb|0,Gb|0,4,0);ga(Db|0,Fb|0,4,0);ga(t|0,u|0,4,0);ga(r|0,v|0,4,0);ga(q|0,qa|0,4,0);bb(d,e,s);bb(y,Ma,s);bb(A,db,s);bb(E,xb,s);xa(g,h,d);ya(a,g,p);ya(w,b,l);ya(x,l,p);if((c|0)>0){c=c+ -1|0}else{break}}i=j;return}function Ua(a,b,c,d,e){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;var f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0;h=i;i=i+2112|0;f=h+1856|0;g=h+1600|0;l=h+320|0;j=h+160|0;k=h;Da(f,b);Da(g,d);za(l,c);c=a+0|0;m=c+40|0;do{ga(c|0,0|0,4,0);c=c+4|0}while((c|0)<(m|0));b=a+40|0;ga(b|0,1|0,4,0);c=a+44|0;m=c+36|0;do{ga(c|0,0|0,4,0);c=c+4|0}while((c|0)<(m|0));d=a+80|0;ga(d|0,1|0,4,0);c=a+84|0;m=c+36|0;do{ga(c|0,0|0,4,0);c=c+4|0}while((c|0)<(m|0));r=255;while(1){if((fa(f+r>>0|0,1,0,0)|0|0)!=0){break}c=r+ -1|0;if((fa(g+r>>0|0,1,0,0)|0|0)!=0){break}if((r|0)>0){r=c}else{r=c;break}}if(!((r|0)>-1)){i=h;return}q=j+120|0;n=k+40|0;p=j+40|0;o=j+80|0;m=k+80|0;c=k+120|0;while(1){Ea(j,a);s=fa(f+r>>0|0,1,0,0)|0|0;if(!(s<<24>>24>0)){if(s<<24>>24<0){ya(k,j,q);ya(n,p,o);ya(m,o,q);ya(c,j,p);Fa(j,k,l+(((s<<24>>24|0)/-2|0)*160|0)|0)}}else{ya(k,j,q);ya(n,p,o);ya(m,o,q);ya(c,j,p);xa(j,k,l+(((s<<24>>24|0)/2|0)*160|0)|0)}s=fa(g+r>>0|0,1,0,0)|0|0;if(!(s<<24>>24>0)){if(s<<24>>24<0){ya(k,j,q);ya(n,p,o);ya(m,o,q);ya(c,j,p);Fa(j,k,e+(((s<<24>>24|0)/-2|0)*160|0)|0)}}else{ya(k,j,q);ya(n,p,o);ya(m,o,q);ya(c,j,p);xa(j,k,e+(((s<<24>>24|0)/2|0)*160|0)|0)}ya(a,j,q);ya(b,p,o);ya(d,o,q);if((r|0)>0){r=r+ -1|0}else{break}}i=h;return}function Va(a,b){a=a|0;b=b|0;var c=0,d=0,e=0,f=0,g=0,h=0;c=i;i=i+128|0;d=c;Ea(a,b);b=a+120|0;ya(d,a,b);h=d+40|0;g=a+40|0;e=a+80|0;ya(h,g,e);f=d+80|0;ya(f,e,b);Ea(a,d);ya(d,a,b);ya(h,g,e);ya(f,e,b);Ea(a,d);i=c;return}function Wa(a,b){a=a|0;b=b|0;var c=0,d=0,e=0,f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0,P=0,Q=0,R=0,S=0,T=0,U=0,V=0,W=0,X=0,Y=0,Z=0,_=0,$=0,aa=0,ba=0,ca=0,da=0,ea=0,ha=0,ia=0,ja=0,ka=0,la=0,ma=0,oa=0,pa=0,qa=0,ra=0,sa=0,ta=0,ua=0,va=0,wa=0,xa=0,za=0,Aa=0,Ba=0,Ca=0,Da=0,Ea=0,Fa=0,Ga=0,Ha=0,Ia=0,Ma=0,Pa=0,Qa=0,Ra=0,Sa=0,Ta=0,Ua=0,Va=0;e=i;i=i+432|0;c=e+400|0;Ga=e+360|0;Ba=e+320|0;T=e+280|0;O=e+240|0;P=e+200|0;Q=e+160|0;L=e+120|0;M=e+80|0;S=e+40|0;d=e;ia=fa(b>>0|0,1,0,1)|0|0;Ca=kb(fa(b+1>>0|0,1,0,1)|0|0|0,0,8)|0;Da=D;sa=kb(fa(b+2>>0|0,1,0,1)|0|0|0,0,16)|0;Da=Da|D;ra=kb(fa(b+3>>0|0,1,0,1)|0|0|0,0,24)|0;Da=Da|D;Ha=fa(b+6>>0|0,1,0,0)|0|0;Ea=fa(b+4>>0|0,1,0,1)|0|0;ta=kb(fa(b+5>>0|0,1,0,1)|0|0|0,0,8)|0;Fa=D;Ha=kb(Ha&255|0,0,16)|0;Fa=kb(ta|Ea|Ha|0,Fa|D|0,6)|0;Ha=D;Ea=fa(b+9>>0|0,1,0,0)|0|0;ta=fa(b+7>>0|0,1,0,1)|0|0;Aa=kb(fa(b+8>>0|0,1,0,1)|0|0|0,0,8)|0;ma=D;Ea=kb(Ea&255|0,0,16)|0;ma=kb(Aa|ta|Ea|0,ma|D|0,5)|0;Ea=D;ta=fa(b+12>>0|0,1,0,0)|0|0;Aa=fa(b+10>>0|0,1,0,1)|0|0;ka=kb(fa(b+11>>0|0,1,0,1)|0|0|0,0,8)|0;va=D;ta=kb(ta&255|0,0,16)|0;va=kb(ka|Aa|ta|0,va|D|0,3)|0;ta=D;Aa=fa(b+15>>0|0,1,0,0)|0|0;ka=fa(b+13>>0|0,1,0,1)|0|0;W=kb(fa(b+14>>0|0,1,0,1)|0|0|0,0,8)|0;$=D;Aa=kb(Aa&255|0,0,16)|0;$=kb(W|ka|Aa|0,$|D|0,2)|0;Aa=D;ka=fa(b+16>>0|0,1,0,1)|0|0;W=kb(fa(b+17>>0|0,1,0,1)|0|0|0,0,8)|0;pa=D;xa=kb(fa(b+18>>0|0,1,0,1)|0|0|0,0,16)|0;pa=pa|D;qa=kb(fa(b+19>>0|0,1,0,1)|0|0|0,0,24)|0;qa=W|ka|xa|qa;pa=pa|D;xa=fa(b+22>>0|0,1,0,0)|0|0;ka=fa(b+20>>0|0,1,0,1)|0|0;W=kb(fa(b+21>>0|0,1,0,1)|0|0|0,0,8)|0;X=D;xa=kb(xa&255|0,0,16)|0;X=kb(W|ka|xa|0,X|D|0,7)|0;xa=D;ka=fa(b+25>>0|0,1,0,0)|0|0;W=fa(b+23>>0|0,1,0,1)|0|0;Z=kb(fa(b+24>>0|0,1,0,1)|0|0|0,0,8)|0;la=D;ka=kb(ka&255|0,0,16)|0;la=kb(Z|W|ka|0,la|D|0,5)|0;ka=D;W=fa(b+28>>0|0,1,0,0)|0|0;Z=fa(b+26>>0|0,1,0,1)|0|0;wa=kb(fa(b+27>>0|0,1,0,1)|0|0|0,0,8)|0;oa=D;W=kb(W&255|0,0,16)|0;oa=kb(wa|Z|W|0,oa|D|0,4)|0;W=D;Z=fa(b+31>>0|0,1,0,0)|0|0;wa=fa(b+29>>0|0,1,0,1)|0|0;Y=kb(fa(b+30>>0|0,1,0,1)|0|0|0,0,8)|0;_=D;Z=kb(Z&255|0,0,16)|0;_=kb(Y|wa|Z|0,_|D|0,2)|0;Z=D;wa=hb(_|0,Z|0,16777216,0)|0;wa=jb(wa|0,D|0,25)|0;Y=D;U=sb(wa|0,Y|0,19,0)|0;Da=hb(U|0,D|0,Ca|ia|sa|ra|0,Da|0)|0;ra=D;Y=kb(wa|0,Y|0,25)|0;wa=D;sa=hb(Fa|0,Ha|0,16777216,0)|0;sa=jb(sa|0,D|0,25)|0;ia=D;Ea=hb(ma|0,Ea|0,sa|0,ia|0)|0;ma=D;ia=kb(sa|0,ia|0,25)|0;ia=gb(Fa|0,Ha|0,ia|0,D|0)|0;Ha=D;Fa=hb(va|0,ta|0,16777216,0)|0;Fa=jb(Fa|0,D|0,25)|0;sa=D;Aa=hb($|0,Aa|0,Fa|0,sa|0)|0;$=D;sa=kb(Fa|0,sa|0,25)|0;Fa=D;Ca=hb(qa|0,pa|0,16777216,0)|0;Ca=jb(Ca|0,D|0,25)|0;U=D;xa=hb(X|0,xa|0,Ca|0,U|0)|0;X=D;U=kb(Ca|0,U|0,25)|0;Ca=D;za=hb(la|0,ka|0,16777216,0)|0;za=jb(za|0,D|0,25)|0;aa=D;W=hb(oa|0,W|0,za|0,aa|0)|0;oa=D;aa=kb(za|0,aa|0,25)|0;za=D;ja=hb(Da|0,ra|0,33554432,0)|0;ja=fb(ja|0,D|0,26)|0;ha=D;Ha=hb(ia|0,Ha|0,ja|0,ha|0)|0;ha=kb(ja|0,ha|0,26)|0;ha=gb(Da|0,ra|0,ha|0,D|0)|0;ra=hb(Ea|0,ma|0,33554432,0)|0;ra=fb(ra|0,D|0,26)|0;Da=D;ta=hb(ra|0,Da|0,va|0,ta|0)|0;Fa=gb(ta|0,D|0,sa|0,Fa|0)|0;Da=kb(ra|0,Da|0,26)|0;Da=gb(Ea|0,ma|0,Da|0,D|0)|0;ma=hb(Aa|0,$|0,33554432,0)|0;ma=fb(ma|0,D|0,26)|0;Ea=D;pa=hb(ma|0,Ea|0,qa|0,pa|0)|0;Ca=gb(pa|0,D|0,U|0,Ca|0)|0;Ea=kb(ma|0,Ea|0,26)|0;Ea=gb(Aa|0,$|0,Ea|0,D|0)|0;$=hb(xa|0,X|0,33554432,0)|0;$=fb($|0,D|0,26)|0;Aa=D;ka=hb($|0,Aa|0,la|0,ka|0)|0;za=gb(ka|0,D|0,aa|0,za|0)|0;Aa=kb($|0,Aa|0,26)|0;Aa=gb(xa|0,X|0,Aa|0,D|0)|0;X=hb(W|0,oa|0,33554432,0)|0;X=fb(X|0,D|0,26)|0;xa=D;Z=hb(X|0,xa|0,_|0,Z|0)|0;wa=gb(Z|0,D|0,Y|0,wa|0)|0;xa=kb(X|0,xa|0,26)|0;xa=gb(W|0,oa|0,xa|0,D|0)|0;ga(Ga|0,ha|0,4,0);ga(Ga+4|0,Ha|0,4,0);ga(Ga+8|0,Da|0,4,0);ga(Ga+12|0,Fa|0,4,0);ga(Ga+16|0,Ea|0,4,0);ga(Ga+20|0,Ca|0,4,0);ga(Ga+24|0,Aa|0,4,0);ga(Ga+28|0,za|0,4,0);ga(Ga+32|0,xa|0,4,0);ga(Ga+36|0,wa|0,4,0);La(Ba,Ga);wa=T+4|0;ga(wa+0|0,0|0,4,0);ga(wa+4|0,0|0,4,0);ga(wa+8|0,0|0,4,0);ga(wa+12|0,0|0,4,0);ga(wa+16|0,0|0,4,0);ga(wa+20|0,0|0,4,0);ga(wa+24|0,0|0,4,0);ga(wa+28|0,0|0,4,0);xa=fa(Ba+4|0,4,0,0)|0|0;za=fa(Ba+8|0,4,0,0)|0|0;Aa=fa(Ba+12|0,4,0,0)|0|0;Ca=fa(Ba+16|0,4,0,0)|0|0;Ea=fa(Ba+20|0,4,0,0)|0|0;Fa=fa(Ba+24|0,4,0,0)|0|0;Da=fa(Ba+28|0,4,0,0)|0|0;Ha=fa(Ba+32|0,4,0,0)|0|0;ha=fa(Ba+36|0,4,0,0)|0|0;oa=T+8|0;W=T+12|0;X=T+16|0;Y=T+20|0;Z=T+24|0;_=T+28|0;$=T+32|0;aa=T+36|0;ga(T|0,(fa(Ba|0,4,0,0)|0|0)+1|0,4,0);ga(wa|0,xa|0,4,0);ga(oa|0,za|0,4,0);ga(W|0,Aa|0,4,0);ga(X|0,Ca|0,4,0);ga(Y|0,Ea|0,4,0);ga(Z|0,Fa|0,4,0);ga(_|0,Da|0,4,0);ga($|0,Ha|0,4,0);ga(aa|0,ha|0,4,0);Ja(O,T);ya(P,32040,Ba);ha=O+4|0;Ha=O+8|0;Da=O+12|0;Fa=O+16|0;Ea=O+20|0;Ca=O+24|0;Aa=O+28|0;za=O+32|0;xa=O+36|0;ka=P+4|0;la=P+8|0;ma=P+12|0;U=P+16|0;pa=P+20|0;qa=P+24|0;ra=P+28|0;sa=P+32|0;ta=P+36|0;va=(fa(ka|0,4,0,0)|0|0)+(fa(ha|0,4,0,0)|0|0)|0;ja=(fa(la|0,4,0,0)|0|0)+(fa(Ha|0,4,0,0)|0|0)|0;ia=(fa(ma|0,4,0,0)|0|0)+(fa(Da|0,4,0,0)|0|0)|0;ea=(fa(U|0,4,0,0)|0|0)+(fa(Fa|0,4,0,0)|0|0)|0;da=(fa(pa|0,4,0,0)|0|0)+(fa(Ea|0,4,0,0)|0|0)|0;ca=(fa(qa|0,4,0,0)|0|0)+(fa(Ca|0,4,0,0)|0|0)|0;ba=(fa(ra|0,4,0,0)|0|0)+(fa(Aa|0,4,0,0)|0|0)|0;V=(fa(sa|0,4,0,0)|0|0)+(fa(za|0,4,0,0)|0|0)|0;t=(fa(ta|0,4,0,0)|0|0)+(fa(xa|0,4,0,0)|0|0)|0;ga(O|0,(fa(P|0,4,0,0)|0|0)+(fa(O|0,4,0,0)|0|0)|0,4,0);ga(ha|0,va|0,4,0);ga(Ha|0,ja|0,4,0);ga(Da|0,ia|0,4,0);ga(Fa|0,ea|0,4,0);ga(Ea|0,da|0,4,0);ga(Ca|0,ca|0,4,0);ga(Aa|0,ba|0,4,0);ga(za|0,V|0,4,0);ga(xa|0,t|0,4,0);Ka(a,T,O);Ja(P,a);ya(O,P,O);t=(fa(wa|0,4,0,0)|0|0)-(fa(ha|0,4,0,0)|0|0)|0;V=(fa(oa|0,4,0,0)|0|0)-(fa(Ha|0,4,0,0)|0|0)|0;ba=(fa(W|0,4,0,0)|0|0)-(fa(Da|0,4,0,0)|0|0)|0;ca=(fa(X|0,4,0,0)|0|0)-(fa(Fa|0,4,0,0)|0|0)|0;da=(fa(Y|0,4,0,0)|0|0)-(fa(Ea|0,4,0,0)|0|0)|0;ea=(fa(Z|0,4,0,0)|0|0)-(fa(Ca|0,4,0,0)|0|0)|0;ia=(fa(_|0,4,0,0)|0|0)-(fa(Aa|0,4,0,0)|0|0)|0;ja=(fa($|0,4,0,0)|0|0)-(fa(za|0,4,0,0)|0|0)|0;va=(fa(aa|0,4,0,0)|0|0)-(fa(xa|0,4,0,0)|0|0)|0;ga(P|0,(fa(T|0,4,0,0)|0|0)-(fa(O|0,4,0,0)|0|0)|0,4,0);ga(ka|0,t|0,4,0);ga(la|0,V|0,4,0);ga(ma|0,ba|0,4,0);ga(U|0,ca|0,4,0);ga(pa|0,da|0,4,0);ga(qa|0,ea|0,4,0);ga(ra|0,ia|0,4,0);ga(sa|0,ja|0,4,0);ga(ta|0,va|0,4,0);va=fa(32084|0,4,0,0)|0|0;ja=fa(32088|0,4,0,0)|0|0;ia=fa(32092|0,4,0,0)|0|0;ea=fa(32096|0,4,0,0)|0|0;da=fa(32100|0,4,0,0)|0|0;ca=fa(32104|0,4,0,0)|0|0;ba=fa(32108|0,4,0,0)|0|0;V=fa(32112|0,4,0,0)|0|0;t=fa(32116|0,4,0,0)|0|0;ga(Q|0,fa(8020*4|0,4,0,0)|0|0,4,0);ua=Q+4|0;ga(ua|0,va|0,4,0);va=Q+8|0;ga(va|0,ja|0,4,0);ja=Q+12|0;ga(ja|0,ia|0,4,0);ia=Q+16|0;ga(ia|0,ea|0,4,0);ea=Q+20|0;ga(ea|0,da|0,4,0);da=Q+24|0;ga(da|0,ca|0,4,0);ca=Q+28|0;ga(ca|0,ba|0,4,0);ba=Q+32|0;ga(ba|0,V|0,4,0);V=Q+36|0;ga(V|0,t|0,4,0);Oa(c,P);t=c+1|0;J=c+2|0;f=c+3|0;u=c+4|0;g=c+5|0;h=c+6|0;j=c+7|0;k=c+8|0;l=c+9|0;m=c+10|0;n=c+11|0;o=c+12|0;p=c+13|0;q=c+14|0;r=c+15|0;s=c+16|0;K=c+17|0;b=c+18|0;v=c+19|0;w=c+20|0;x=c+21|0;y=c+22|0;z=c+23|0;A=c+24|0;B=c+25|0;C=c+26|0;E=c+27|0;F=c+28|0;G=c+29|0;H=c+30|0;I=c+31|0;do{if(!((((fa(t>>0|0,1,0,0)|0|(fa(c>>0|0,1,0,0)|0)|(fa(J>>0|0,1,0,0)|0)|(fa(f>>0|0,1,0,0)|0)|(fa(u>>0|0,1,0,0)|0)|(fa(g>>0|0,1,0,0)|0)|(fa(h>>0|0,1,0,0)|0)|(fa(j>>0|0,1,0,0)|0)|(fa(k>>0|0,1,0,0)|0)|(fa(l>>0|0,1,0,0)|0)|(fa(m>>0|0,1,0,0)|0)|(fa(n>>0|0,1,0,0)|0)|(fa(o>>0|0,1,0,0)|0)|(fa(p>>0|0,1,0,0)|0)|(fa(q>>0|0,1,0,0)|0)|(fa(r>>0|0,1,0,0)|0)|(fa(s>>0|0,1,0,0)|0)|(fa(K>>0|0,1,0,0)|0)|(fa(b>>0|0,1,0,0)|0)|(fa(v>>0|0,1,0,0)|0)|(fa(w>>0|0,1,0,0)|0)|(fa(x>>0|0,1,0,0)|0)|(fa(y>>0|0,1,0,0)|0)|(fa(z>>0|0,1,0,0)|0)|(fa(A>>0|0,1,0,0)|0)|(fa(B>>0|0,1,0,0)|0)|(fa(C>>0|0,1,0,0)|0)|(fa(E>>0|0,1,0,0)|0)|(fa(F>>0|0,1,0,0)|0)|(fa(G>>0|0,1,0,0)|0)|(fa(H>>0|0,1,0,0)|0)|(fa(I>>0|0,1,0,0)|0))&255)+ -1&-256|0)==-256)){Va=(fa(ha|0,4,0,0)|0|0)+(fa(wa|0,4,0,0)|0|0)|0;Ua=(fa(Ha|0,4,0,0)|0|0)+(fa(oa|0,4,0,0)|0|0)|0;Ta=(fa(Da|0,4,0,0)|0|0)+(fa(W|0,4,0,0)|0|0)|0;Sa=(fa(Fa|0,4,0,0)|0|0)+(fa(X|0,4,0,0)|0|0)|0;Ra=(fa(Ea|0,4,0,0)|0|0)+(fa(Y|0,4,0,0)|0|0)|0;Qa=(fa(Ca|0,4,0,0)|0|0)+(fa(Z|0,4,0,0)|0|0)|0;Pa=(fa(Aa|0,4,0,0)|0|0)+(fa(_|0,4,0,0)|0|0)|0;Ma=(fa(za|0,4,0,0)|0|0)+(fa($|0,4,0,0)|0|0)|0;Ia=(fa(xa|0,4,0,0)|0|0)+(fa(aa|0,4,0,0)|0|0)|0;ga(P|0,(fa(O|0,4,0,0)|0|0)+(fa(T|0,4,0,0)|0|0)|0,4,0);ga(ka|0,Va|0,4,0);ga(la|0,Ua|0,4,0);ga(ma|0,Ta|0,4,0);ga(U|0,Sa|0,4,0);ga(pa|0,Ra|0,4,0);ga(qa|0,Qa|0,4,0);ga(ra|0,Pa|0,4,0);ga(sa|0,Ma|0,4,0);ga(ta|0,Ia|0,4,0);Oa(c,P);if((((fa(t>>0|0,1,0,0)|0|(fa(c>>0|0,1,0,0)|0)|(fa(J>>0|0,1,0,0)|0)|(fa(f>>0|0,1,0,0)|0)|(fa(u>>0|0,1,0,0)|0)|(fa(g>>0|0,1,0,0)|0)|(fa(h>>0|0,1,0,0)|0)|(fa(j>>0|0,1,0,0)|0)|(fa(k>>0|0,1,0,0)|0)|(fa(l>>0|0,1,0,0)|0)|(fa(m>>0|0,1,0,0)|0)|(fa(n>>0|0,1,0,0)|0)|(fa(o>>0|0,1,0,0)|0)|(fa(p>>0|0,1,0,0)|0)|(fa(q>>0|0,1,0,0)|0)|(fa(r>>0|0,1,0,0)|0)|(fa(s>>0|0,1,0,0)|0)|(fa(K>>0|0,1,0,0)|0)|(fa(b>>0|0,1,0,0)|0)|(fa(v>>0|0,1,0,0)|0)|(fa(w>>0|0,1,0,0)|0)|(fa(x>>0|0,1,0,0)|0)|(fa(y>>0|0,1,0,0)|0)|(fa(z>>0|0,1,0,0)|0)|(fa(A>>0|0,1,0,0)|0)|(fa(B>>0|0,1,0,0)|0)|(fa(C>>0|0,1,0,0)|0)|(fa(E>>0|0,1,0,0)|0)|(fa(F>>0|0,1,0,0)|0)|(fa(G>>0|0,1,0,0)|0)|(fa(H>>0|0,1,0,0)|0)|(fa(I>>0|0,1,0,0)|0))&255)+ -1&-256|0)==-256){ya(a,a,32120);N=5;break}ya(O,O,280);Ba=fa(Ha|0,4,0,0)|0|0;Da=fa(Da|0,4,0,0)|0|0;Fa=fa(Fa|0,4,0,0)|0|0;Ea=fa(Ea|0,4,0,0)|0|0;Ca=fa(Ca|0,4,0,0)|0|0;Aa=fa(Aa|0,4,0,0)|0|0;za=fa(za|0,4,0,0)|0|0;xa=fa(xa|0,4,0,0)|0|0;Ia=(fa(wa|0,4,0,0)|0|0)-(fa(ha|0,4,0,0)|0|0)|0;Ma=(fa(oa|0,4,0,0)|0|0)-Ba|0;Pa=(fa(W|0,4,0,0)|0|0)-Da|0;Qa=(fa(X|0,4,0,0)|0|0)-Fa|0;Ra=(fa(Y|0,4,0,0)|0|0)-Ea|0;Sa=(fa(Z|0,4,0,0)|0|0)-Ca|0;Ta=(fa(_|0,4,0,0)|0|0)-Aa|0;Ua=(fa($|0,4,0,0)|0|0)-za|0;Va=(fa(aa|0,4,0,0)|0|0)-xa|0;ga(P|0,(fa(T|0,4,0,0)|0|0)-(fa(O|0,4,0,0)|0|0)|0,4,0);ga(ka|0,Ia|0,4,0);ga(la|0,Ma|0,4,0);ga(ma|0,Pa|0,4,0);ga(U|0,Qa|0,4,0);ga(pa|0,Ra|0,4,0);ga(qa|0,Sa|0,4,0);ga(ra|0,Ta|0,4,0);ga(sa|0,Ua|0,4,0);ga(ta|0,Va|0,4,0);Oa(c,P);if((((fa(t>>0|0,1,0,0)|0|(fa(c>>0|0,1,0,0)|0)|(fa(J>>0|0,1,0,0)|0)|(fa(f>>0|0,1,0,0)|0)|(fa(u>>0|0,1,0,0)|0)|(fa(g>>0|0,1,0,0)|0)|(fa(h>>0|0,1,0,0)|0)|(fa(j>>0|0,1,0,0)|0)|(fa(k>>0|0,1,0,0)|0)|(fa(l>>0|0,1,0,0)|0)|(fa(m>>0|0,1,0,0)|0)|(fa(n>>0|0,1,0,0)|0)|(fa(o>>0|0,1,0,0)|0)|(fa(p>>0|0,1,0,0)|0)|(fa(q>>0|0,1,0,0)|0)|(fa(r>>0|0,1,0,0)|0)|(fa(s>>0|0,1,0,0)|0)|(fa(K>>0|0,1,0,0)|0)|(fa(b>>0|0,1,0,0)|0)|(fa(v>>0|0,1,0,0)|0)|(fa(w>>0|0,1,0,0)|0)|(fa(x>>0|0,1,0,0)|0)|(fa(y>>0|0,1,0,0)|0)|(fa(z>>0|0,1,0,0)|0)|(fa(A>>0|0,1,0,0)|0)|(fa(B>>0|0,1,0,0)|0)|(fa(C>>0|0,1,0,0)|0)|(fa(E>>0|0,1,0,0)|0)|(fa(F>>0|0,1,0,0)|0)|(fa(G>>0|0,1,0,0)|0)|(fa(H>>0|0,1,0,0)|0)|(fa(I>>0|0,1,0,0)|0))&255)+ -1&-256|0)==-256){ya(a,a,32240);R=1;break}Ia=(fa(ha|0,4,0,0)|0|0)+(fa(wa|0,4,0,0)|0|0)|0;Ma=Ba+(fa(oa|0,4,0,0)|0|0)|0;Pa=Da+(fa(W|0,4,0,0)|0|0)|0;Qa=Fa+(fa(X|0,4,0,0)|0|0)|0;Ra=Ea+(fa(Y|0,4,0,0)|0|0)|0;Sa=Ca+(fa(Z|0,4,0,0)|0|0)|0;Ta=Aa+(fa(_|0,4,0,0)|0|0)|0;Ua=za+(fa($|0,4,0,0)|0|0)|0;Va=xa+(fa(aa|0,4,0,0)|0|0)|0;ga(P|0,(fa(O|0,4,0,0)|0|0)+(fa(T|0,4,0,0)|0|0)|0,4,0);ga(ka|0,Ia|0,4,0);ga(la|0,Ma|0,4,0);ga(ma|0,Pa|0,4,0);ga(U|0,Qa|0,4,0);ga(pa|0,Ra|0,4,0);ga(qa|0,Sa|0,4,0);ga(ra|0,Ta|0,4,0);ga(sa|0,Ua|0,4,0);ga(ta|0,Va|0,4,0);Oa(c,P);if((((fa(t>>0|0,1,0,0)|0|(fa(c>>0|0,1,0,0)|0)|(fa(J>>0|0,1,0,0)|0)|(fa(f>>0|0,1,0,0)|0)|(fa(u>>0|0,1,0,0)|0)|(fa(g>>0|0,1,0,0)|0)|(fa(h>>0|0,1,0,0)|0)|(fa(j>>0|0,1,0,0)|0)|(fa(k>>0|0,1,0,0)|0)|(fa(l>>0|0,1,0,0)|0)|(fa(m>>0|0,1,0,0)|0)|(fa(n>>0|0,1,0,0)|0)|(fa(o>>0|0,1,0,0)|0)|(fa(p>>0|0,1,0,0)|0)|(fa(q>>0|0,1,0,0)|0)|(fa(r>>0|0,1,0,0)|0)|(fa(s>>0|0,1,0,0)|0)|(fa(K>>0|0,1,0,0)|0)|(fa(b>>0|0,1,0,0)|0)|(fa(v>>0|0,1,0,0)|0)|(fa(w>>0|0,1,0,0)|0)|(fa(x>>0|0,1,0,0)|0)|(fa(y>>0|0,1,0,0)|0)|(fa(z>>0|0,1,0,0)|0)|(fa(A>>0|0,1,0,0)|0)|(fa(B>>0|0,1,0,0)|0)|(fa(C>>0|0,1,0,0)|0)|(fa(E>>0|0,1,0,0)|0)|(fa(F>>0|0,1,0,0)|0)|(fa(G>>0|0,1,0,0)|0)|(fa(H>>0|0,1,0,0)|0)|(fa(I>>0|0,1,0,0)|0))&255)+ -1&-256|0)==-256){ya(a,a,32200);R=1;break}else{na(8,48,2107,88)}}else{ya(a,a,32160);N=5}}while(0);if((N|0)==5){ya(a,a,Ga);ya(Q,Q,Ba);R=0}Oa(c,a);do{if(((fa(c>>0|0,1,0,0)|0)&1|0)!=(R|0)){Oa(c,a);if((((fa(t>>0|0,1,0,0)|0|(fa(c>>0|0,1,0,0)|0)|(fa(J>>0|0,1,0,0)|0)|(fa(f>>0|0,1,0,0)|0)|(fa(u>>0|0,1,0,0)|0)|(fa(g>>0|0,1,0,0)|0)|(fa(h>>0|0,1,0,0)|0)|(fa(j>>0|0,1,0,0)|0)|(fa(k>>0|0,1,0,0)|0)|(fa(l>>0|0,1,0,0)|0)|(fa(m>>0|0,1,0,0)|0)|(fa(n>>0|0,1,0,0)|0)|(fa(o>>0|0,1,0,0)|0)|(fa(p>>0|0,1,0,0)|0)|(fa(q>>0|0,1,0,0)|0)|(fa(r>>0|0,1,0,0)|0)|(fa(s>>0|0,1,0,0)|0)|(fa(K>>0|0,1,0,0)|0)|(fa(b>>0|0,1,0,0)|0)|(fa(v>>0|0,1,0,0)|0)|(fa(w>>0|0,1,0,0)|0)|(fa(x>>0|0,1,0,0)|0)|(fa(y>>0|0,1,0,0)|0)|(fa(z>>0|0,1,0,0)|0)|(fa(A>>0|0,1,0,0)|0)|(fa(B>>0|0,1,0,0)|0)|(fa(C>>0|0,1,0,0)|0)|(fa(E>>0|0,1,0,0)|0)|(fa(F>>0|0,1,0,0)|0)|(fa(G>>0|0,1,0,0)|0)|(fa(H>>0|0,1,0,0)|0)|(fa(I>>0|0,1,0,0)|0))&255)+ -1&-256|0)==-256){na(120,48,2117,88)}else{za=a+4|0;Ba=a+8|0;Da=a+12|0;Fa=a+16|0;Ha=a+20|0;Ma=a+24|0;Qa=a+28|0;Sa=a+32|0;Ua=a+36|0;Aa=0-(fa(za|0,4,0,0)|0|0)|0;Ca=0-(fa(Ba|0,4,0,0)|0|0)|0;Ea=0-(fa(Da|0,4,0,0)|0|0)|0;Ga=0-(fa(Fa|0,4,0,0)|0|0)|0;Ia=0-(fa(Ha|0,4,0,0)|0|0)|0;Pa=0-(fa(Ma|0,4,0,0)|0|0)|0;Ra=0-(fa(Qa|0,4,0,0)|0|0)|0;Ta=0-(fa(Sa|0,4,0,0)|0|0)|0;Va=0-(fa(Ua|0,4,0,0)|0|0)|0;ga(a|0,0-(fa(a|0,4,0,0)|0|0)|0,4,0);ga(za|0,Aa|0,4,0);ga(Ba|0,Ca|0,4,0);ga(Da|0,Ea|0,4,0);ga(Fa|0,Ga|0,4,0);ga(Ha|0,Ia|0,4,0);ga(Ma|0,Pa|0,4,0);ga(Qa|0,Ra|0,4,0);ga(Sa|0,Ta|0,4,0);ga(Ua|0,Va|0,4,0);break}}}while(0);R=a+80|0;Ia=fa(Q|0,4,0,0)|0|0;Pa=fa(ua|0,4,0,0)|0|0;Ra=fa(va|0,4,0,0)|0|0;Ta=fa(ja|0,4,0,0)|0|0;Va=fa(ia|0,4,0,0)|0|0;U=fa(ea|0,4,0,0)|0|0;P=fa(da|0,4,0,0)|0|0;ca=fa(ca|0,4,0,0)|0|0;ba=fa(ba|0,4,0,0)|0|0;V=fa(V|0,4,0,0)|0|0;Ma=fa(T|0,4,0,0)|0|0;Qa=fa(wa|0,4,0,0)|0|0;Sa=fa(oa|0,4,0,0)|0|0;Ua=fa(W|0,4,0,0)|0|0;W=fa(X|0,4,0,0)|0|0;Q=fa(Y|0,4,0,0)|0|0;N=fa(Z|0,4,0,0)|0|0;Z=fa(_|0,4,0,0)|0|0;X=fa($|0,4,0,0)|0|0;T=fa(aa|0,4,0,0)|0|0;ga(R|0,Ma+Ia|0,4,0);ga(a+84|0,Qa+Pa|0,4,0);ga(a+88|0,Sa+Ra|0,4,0);ga(a+92|0,Ua+Ta|0,4,0);ga(a+96|0,W+Va|0,4,0);ga(a+100|0,Q+U|0,4,0);ga(a+104|0,N+P|0,4,0);ga(a+108|0,Z+ca|0,4,0);ga(a+112|0,X+ba|0,4,0);ga(a+116|0,T+V|0,4,0);O=a+40|0;ga(O|0,Ia-Ma|0,4,0);ga(a+44|0,Pa-Qa|0,4,0);ga(a+48|0,Ra-Sa|0,4,0);ga(a+52|0,Ta-Ua|0,4,0);ga(a+56|0,Va-W|0,4,0);ga(a+60|0,U-Q|0,4,0);ga(a+64|0,P-N|0,4,0);ga(a+68|0,ca-Z|0,4,0);ga(a+72|0,ba-X|0,4,0);ga(a+76|0,V-T|0,4,0);ya(a,a,R);Na(S,R);ya(L,a,S);ya(M,O,S);Ja(L,L);Ja(M,M);ya(d,L,M);ya(d,240,d);O=d+4|0;a=d+8|0;R=d+12|0;T=d+16|0;V=d+20|0;X=d+24|0;Z=d+28|0;$=d+32|0;ba=d+36|0;ca=L+4|0;N=(fa(L|0,4,0,0)|0|0)+(fa(d|0,4,0,0)|0|0)-(fa(M|0,4,0,0)|0|0)|0;P=(fa(ca|0,4,0,0)|0|0)+(fa(O|0,4,0,0)|0|0)-(fa(M+4|0,4,0,0)|0|0)|0;Q=(fa(L+8|0,4,0,0)|0|0)+(fa(a|0,4,0,0)|0|0)-(fa(M+8|0,4,0,0)|0|0)|0;S=(fa(L+12|0,4,0,0)|0|0)+(fa(R|0,4,0,0)|0|0)-(fa(M+12|0,4,0,0)|0|0)|0;U=(fa(L+16|0,4,0,0)|0|0)+(fa(T|0,4,0,0)|0|0)-(fa(M+16|0,4,0,0)|0|0)|0;W=(fa(L+20|0,4,0,0)|0|0)+(fa(V|0,4,0,0)|0|0)-(fa(M+20|0,4,0,0)|0|0)|0;Y=(fa(L+24|0,4,0,0)|0|0)+(fa(X|0,4,0,0)|0|0)-(fa(M+24|0,4,0,0)|0|0)|0;_=(fa(L+28|0,4,0,0)|0|0)+(fa(Z|0,4,0,0)|0|0)-(fa(M+28|0,4,0,0)|0|0)|0;aa=(fa(L+32|0,4,0,0)|0|0)+(fa($|0,4,0,0)|0|0)-(fa(M+32|0,4,0,0)|0|0)|0;M=(fa(L+36|0,4,0,0)|0|0)+(fa(ba|0,4,0,0)|0|0)-(fa(M+36|0,4,0,0)|0|0)|0;ga(L|0,1|0,4,0);ca=ca+0|0;L=ca+36|0;do{ga(ca|0,0|0,4,0);ca=ca+4|0}while((ca|0)<(L|0));ga(d|0,N+1|0,4,0);ga(O|0,P|0,4,0);ga(a|0,Q|0,4,0);ga(R|0,S|0,4,0);ga(T|0,U|0,4,0);ga(V|0,W|0,4,0);ga(X|0,Y|0,4,0);ga(Z|0,_|0,4,0);ga($|0,aa|0,4,0);ga(ba|0,M|0,4,0);Oa(c,d);if((((fa(t>>0|0,1,0,0)|0|(fa(c>>0|0,1,0,0)|0)|(fa(J>>0|0,1,0,0)|0)|(fa(f>>0|0,1,0,0)|0)|(fa(u>>0|0,1,0,0)|0)|(fa(g>>0|0,1,0,0)|0)|(fa(h>>0|0,1,0,0)|0)|(fa(j>>0|0,1,0,0)|0)|(fa(k>>0|0,1,0,0)|0)|(fa(l>>0|0,1,0,0)|0)|(fa(m>>0|0,1,0,0)|0)|(fa(n>>0|0,1,0,0)|0)|(fa(o>>0|0,1,0,0)|0)|(fa(p>>0|0,1,0,0)|0)|(fa(q>>0|0,1,0,0)|0)|(fa(r>>0|0,1,0,0)|0)|(fa(s>>0|0,1,0,0)|0)|(fa(K>>0|0,1,0,0)|0)|(fa(b>>0|0,1,0,0)|0)|(fa(v>>0|0,1,0,0)|0)|(fa(w>>0|0,1,0,0)|0)|(fa(x>>0|0,1,0,0)|0)|(fa(y>>0|0,1,0,0)|0)|(fa(z>>0|0,1,0,0)|0)|(fa(A>>0|0,1,0,0)|0)|(fa(B>>0|0,1,0,0)|0)|(fa(C>>0|0,1,0,0)|0)|(fa(E>>0|0,1,0,0)|0)|(fa(F>>0|0,1,0,0)|0)|(fa(G>>0|0,1,0,0)|0)|(fa(H>>0|0,1,0,0)|0)|(fa(I>>0|0,1,0,0)|0))&255)+ -1&-256|0)==-256){i=e;return}else{na(144,48,2137,88)}}function Xa(a){a=a|0;var b=0,c=0;b=i;c=a+0|0;a=c+32|0;do{ga(c>>0|0,0|0,1,0);c=c+1|0}while((c|0)<(a|0));i=b;return}function Ya(a){a=a|0;var b=0,c=0,d=0,e=0,f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0,P=0,Q=0,R=0,S=0,T=0,U=0,V=0,W=0,X=0,Y=0,Z=0,_=0,$=0,aa=0,ba=0,ca=0,da=0,ea=0,ha=0,ia=0,ja=0,ka=0,la=0,ma=0,na=0,oa=0,pa=0,qa=0,ra=0,sa=0,ta=0,ua=0,va=0,wa=0,xa=0,ya=0,za=0,Aa=0,Ba=0,Ca=0;b=i;ea=a+1|0;ca=a+2|0;xa=fa(ca>>0|0,1,0,0)|0|0;aa=fa(a>>0|0,1,0,1)|0|0;ra=kb(fa(ea>>0|0,1,0,1)|0|0|0,0,8)|0;R=D;xa=xa&255;ya=kb(xa|0,0,16)|0;ya=ra|aa|ya&2031616;aa=a+3|0;ra=kb(fa(aa>>0|0,1,0,1)|0|0|0,0,8)|0;wa=D;$=a+4|0;V=kb(fa($>>0|0,1,0,1)|0|0|0,0,16)|0;wa=wa|D;Z=a+5|0;N=fa(Z>>0|0,1,0,1)|0|0;X=kb(N|0,0,24)|0;wa=jb(ra|xa|V|X|0,wa|D|0,5)|0;X=a+6|0;V=a+7|0;xa=fa(V>>0|0,1,0,0)|0|0;ra=kb(fa(X>>0|0,1,0,1)|0|0|0,0,8)|0;Aa=D;xa=xa&255;T=kb(xa|0,0,16)|0;Aa=jb(ra|N|T|0,Aa|D|0,2)|0;Aa=Aa&2097151;T=a+8|0;N=kb(fa(T>>0|0,1,0,1)|0|0|0,0,8)|0;ra=D;S=a+9|0;sa=kb(fa(S>>0|0,1,0,1)|0|0|0,0,16)|0;ra=ra|D;Q=a+10|0;la=fa(Q>>0|0,1,0,1)|0|0;O=kb(la|0,0,24)|0;ra=jb(N|xa|sa|O|0,ra|D|0,7)|0;O=a+11|0;sa=kb(fa(O>>0|0,1,0,1)|0|0|0,0,8)|0;xa=D;N=a+12|0;H=kb(fa(N>>0|0,1,0,1)|0|0|0,0,16)|0;xa=xa|D;L=a+13|0;u=fa(L>>0|0,1,0,1)|0|0;J=kb(u|0,0,24)|0;xa=jb(sa|la|H|J|0,xa|D|0,4)|0;xa=xa&2097151;J=a+14|0;H=a+15|0;la=fa(H>>0|0,1,0,0)|0|0;sa=kb(fa(J>>0|0,1,0,1)|0|0|0,0,8)|0;pa=D;la=la&255;F=kb(la|0,0,16)|0;pa=jb(sa|u|F|0,pa|D|0,1)|0;F=a+16|0;u=kb(fa(F>>0|0,1,0,1)|0|0|0,0,8)|0;sa=D;E=a+17|0;w=kb(fa(E>>0|0,1,0,1)|0|0|0,0,16)|0;sa=sa|D;B=a+18|0;v=fa(B>>0|0,1,0,1)|0|0;z=kb(v|0,0,24)|0;sa=jb(u|la|w|z|0,sa|D|0,6)|0;sa=sa&2097151;z=a+19|0;w=a+20|0;la=fa(w>>0|0,1,0,0)|0|0;u=kb(fa(z>>0|0,1,0,1)|0|0|0,0,8)|0;o=D;la=kb(la&255|0,0,16)|0;o=jb(u|v|la|0,o|D|0,3)|0;la=D;v=a+21|0;u=a+22|0;s=a+23|0;U=fa(s>>0|0,1,0,0)|0|0;q=fa(v>>0|0,1,0,1)|0|0;_=kb(fa(u>>0|0,1,0,1)|0|0|0,0,8)|0;ma=D;U=U&255;na=kb(U|0,0,16)|0;na=_|q|na&2031616;q=a+24|0;_=kb(fa(q>>0|0,1,0,1)|0|0|0,0,8)|0;da=D;p=a+25|0;j=kb(fa(p>>0|0,1,0,1)|0|0|0,0,16)|0;da=da|D;n=a+26|0;M=fa(n>>0|0,1,0,1)|0|0;l=kb(M|0,0,24)|0;da=jb(_|U|j|l|0,da|D|0,5)|0;l=a+27|0;j=a+28|0;U=fa(j>>0|0,1,0,0)|0|0;_=kb(fa(l>>0|0,1,0,1)|0|0|0,0,8)|0;d=D;U=U&255;g=kb(U|0,0,16)|0;d=jb(_|M|g|0,d|D|0,2)|0;d=d&2097151;g=a+29|0;M=kb(fa(g>>0|0,1,0,1)|0|0|0,0,8)|0;_=D;f=a+30|0;za=kb(fa(f>>0|0,1,0,1)|0|0|0,0,16)|0;_=_|D;c=a+31|0;P=kb(fa(c>>0|0,1,0,1)|0|0|0,0,24)|0;_=jb(M|U|za|P|0,_|D|0,7)|0;P=D;za=hb(ya|0,R|0,1048576,0)|0;za=jb(za|0,D|0,21)|0;U=D;wa=hb(wa&2097151|0,0,za|0,U|0)|0;M=D;U=kb(za|0,U|0,21)|0;U=gb(ya|0,R|0,U|0,D|0)|0;R=D;ya=hb(Aa|0,0,1048576,0)|0;ya=jb(ya|0,D|0,21)|0;za=D;ra=hb(ra&2097151|0,0,ya|0,za|0)|0;Y=D;za=kb(ya|0,za|0,21)|0;ya=D;ta=hb(xa|0,0,1048576,0)|0;ta=jb(ta|0,D|0,21)|0;ua=D;pa=hb(pa&2097151|0,0,ta|0,ua|0)|0;x=D;ua=kb(ta|0,ua|0,21)|0;ta=D;t=hb(sa|0,0,1048576,0)|0;t=jb(t|0,D|0,21)|0;r=D;la=hb(o|0,la|0,t|0,r|0)|0;o=D;r=kb(t|0,r|0,21)|0;t=D;h=hb(na|0,ma|0,1048576,0)|0;h=jb(h|0,D|0,21)|0;k=D;da=hb(da&2097151|0,0,h|0,k|0)|0;I=D;k=kb(h|0,k|0,21)|0;h=D;ba=hb(d|0,0,1048576,0)|0;ba=jb(ba|0,D|0,21)|0;ha=D;P=hb(_|0,P|0,ba|0,ha|0)|0;_=D;ha=kb(ba|0,ha|0,21)|0;ba=D;Ca=hb(wa|0,M|0,1048576,0)|0;Ca=jb(Ca|0,D|0,21)|0;Ba=D;K=kb(Ca|0,Ba|0,21)|0;K=gb(wa|0,M|0,K|0,D|0)|0;M=D;wa=hb(ra|0,Y|0,1048576,0)|0;wa=jb(wa|0,D|0,21)|0;va=D;A=kb(wa|0,va|0,21)|0;A=gb(ra|0,Y|0,A|0,D|0)|0;Y=D;ra=hb(pa|0,x|0,1048576,0)|0;ra=jb(ra|0,D|0,21)|0;qa=D;W=kb(ra|0,qa|0,21)|0;W=gb(pa|0,x|0,W|0,D|0)|0;x=D;pa=hb(la|0,o|0,1048576,0)|0;pa=jb(pa|0,D|0,21)|0;oa=D;m=kb(pa|0,oa|0,21)|0;m=gb(la|0,o|0,m|0,D|0)|0;o=D;la=hb(da|0,I|0,1048576,0)|0;la=jb(la|0,D|0,21)|0;ka=D;ia=kb(la|0,ka|0,21)|0;ia=gb(da|0,I|0,ia|0,D|0)|0;I=D;da=hb(P|0,_|0,1048576,0)|0;da=jb(da|0,D|0,21)|0;y=D;e=kb(da|0,y|0,21)|0;e=gb(P|0,_|0,e|0,D|0)|0;_=D;P=sb(da|0,y|0,666643,0)|0;R=hb(P|0,D|0,U|0,R|0)|0;U=D;P=sb(da|0,y|0,470296,0)|0;P=hb(K|0,M|0,P|0,D|0)|0;M=D;K=sb(da|0,y|0,654183,0)|0;ja=D;G=sb(da|0,y|0,-997805,-1)|0;G=hb(A|0,Y|0,G|0,D|0)|0;Y=D;A=sb(da|0,y|0,136657,0)|0;C=D;y=sb(da|0,y|0,-683901,-1)|0;y=hb(W|0,x|0,y|0,D|0)|0;x=D;W=fb(R|0,U|0,21)|0;da=D;M=hb(P|0,M|0,W|0,da|0)|0;P=D;da=kb(W|0,da|0,21)|0;da=gb(R|0,U|0,da|0,D|0)|0;U=D;R=fb(M|0,P|0,21)|0;W=D;Aa=hb(Ca|0,Ba|0,Aa|0,0)|0;ya=gb(Aa|0,D|0,za|0,ya|0)|0;ja=hb(ya|0,D|0,K|0,ja|0)|0;ja=hb(ja|0,D|0,R|0,W|0)|0;K=D;W=kb(R|0,W|0,21)|0;W=gb(M|0,P|0,W|0,D|0)|0;P=D;M=fb(ja|0,K|0,21)|0;R=D;Y=hb(G|0,Y|0,M|0,R|0)|0;G=D;R=kb(M|0,R|0,21)|0;R=gb(ja|0,K|0,R|0,D|0)|0;K=D;ja=fb(Y|0,G|0,21)|0;M=D;va=hb(xa|0,0,wa|0,va|0)|0;ta=gb(va|0,D|0,ua|0,ta|0)|0;C=hb(ta|0,D|0,A|0,C|0)|0;C=hb(C|0,D|0,ja|0,M|0)|0;A=D;M=kb(ja|0,M|0,21)|0;M=gb(Y|0,G|0,M|0,D|0)|0;G=D;Y=fb(C|0,A|0,21)|0;ja=D;x=hb(y|0,x|0,Y|0,ja|0)|0;y=D;ja=kb(Y|0,ja|0,21)|0;ja=gb(C|0,A|0,ja|0,D|0)|0;A=D;C=fb(x|0,y|0,21)|0;Y=D;qa=hb(sa|0,0,ra|0,qa|0)|0;t=gb(qa|0,D|0,r|0,t|0)|0;t=hb(t|0,D|0,C|0,Y|0)|0;r=D;Y=kb(C|0,Y|0,21)|0;Y=gb(x|0,y|0,Y|0,D|0)|0;y=D;x=fb(t|0,r|0,21)|0;C=D;o=hb(x|0,C|0,m|0,o|0)|0;m=D;C=kb(x|0,C|0,21)|0;C=gb(t|0,r|0,C|0,D|0)|0;r=D;t=fb(o|0,m|0,21)|0;x=D;ma=hb(pa|0,oa|0,na|0,ma|0)|0;h=gb(ma|0,D|0,k|0,h|0)|0;h=hb(h|0,D|0,t|0,x|0)|0;k=D;x=kb(t|0,x|0,21)|0;x=gb(o|0,m|0,x|0,D|0)|0;m=D;o=fb(h|0,k|0,21)|0;t=D;I=hb(o|0,t|0,ia|0,I|0)|0;ia=D;t=kb(o|0,t|0,21)|0;t=gb(h|0,k|0,t|0,D|0)|0;k=D;h=fb(I|0,ia|0,21)|0;o=D;d=hb(la|0,ka|0,d|0,0)|0;ba=gb(d|0,D|0,ha|0,ba|0)|0;ba=hb(ba|0,D|0,h|0,o|0)|0;ha=D;o=kb(h|0,o|0,21)|0;o=gb(I|0,ia|0,o|0,D|0)|0;ia=D;I=fb(ba|0,ha|0,21)|0;h=D;_=hb(I|0,h|0,e|0,_|0)|0;e=D;h=kb(I|0,h|0,21)|0;h=gb(ba|0,ha|0,h|0,D|0)|0;ha=D;ba=fb(_|0,e|0,21)|0;I=D;d=kb(ba|0,I|0,21)|0;d=gb(_|0,e|0,d|0,D|0)|0;e=D;_=sb(ba|0,I|0,666643,0)|0;U=hb(_|0,D|0,da|0,U|0)|0;da=D;_=sb(ba|0,I|0,470296,0)|0;_=hb(W|0,P|0,_|0,D|0)|0;P=D;W=sb(ba|0,I|0,654183,0)|0;W=hb(R|0,K|0,W|0,D|0)|0;K=D;R=sb(ba|0,I|0,-997805,-1)|0;R=hb(M|0,G|0,R|0,D|0)|0;G=D;M=sb(ba|0,I|0,136657,0)|0;M=hb(ja|0,A|0,M|0,D|0)|0;A=D;I=sb(ba|0,I|0,-683901,-1)|0;I=hb(Y|0,y|0,I|0,D|0)|0;y=D;Y=fb(U|0,da|0,21)|0;ba=D;P=hb(_|0,P|0,Y|0,ba|0)|0;_=D;ba=kb(Y|0,ba|0,21)|0;ba=gb(U|0,da|0,ba|0,D|0)|0;da=D;U=fb(P|0,_|0,21)|0;Y=D;K=hb(W|0,K|0,U|0,Y|0)|0;W=D;Y=kb(U|0,Y|0,21)|0;Y=gb(P|0,_|0,Y|0,D|0)|0;_=D;P=fb(K|0,W|0,21)|0;U=D;G=hb(R|0,G|0,P|0,U|0)|0;R=D;U=kb(P|0,U|0,21)|0;U=gb(K|0,W|0,U|0,D|0)|0;W=D;K=fb(G|0,R|0,21)|0;P=D;A=hb(M|0,A|0,K|0,P|0)|0;M=D;P=kb(K|0,P|0,21)|0;P=gb(G|0,R|0,P|0,D|0)|0;R=D;G=fb(A|0,M|0,21)|0;K=D;y=hb(I|0,y|0,G|0,K|0)|0;I=D;K=kb(G|0,K|0,21)|0;K=gb(A|0,M|0,K|0,D|0)|0;M=D;A=fb(y|0,I|0,21)|0;G=D;r=hb(A|0,G|0,C|0,r|0)|0;C=D;G=kb(A|0,G|0,21)|0;G=gb(y|0,I|0,G|0,D|0)|0;I=D;y=fb(r|0,C|0,21)|0;A=D;m=hb(y|0,A|0,x|0,m|0)|0;x=D;A=kb(y|0,A|0,21)|0;A=gb(r|0,C|0,A|0,D|0)|0;C=D;r=fb(m|0,x|0,21)|0;y=D;k=hb(r|0,y|0,t|0,k|0)|0;t=D;y=kb(r|0,y|0,21)|0;y=gb(m|0,x|0,y|0,D|0)|0;x=D;m=fb(k|0,t|0,21)|0;r=D;ia=hb(m|0,r|0,o|0,ia|0)|0;o=D;r=kb(m|0,r|0,21)|0;r=gb(k|0,t|0,r|0,D|0)|0;t=D;k=fb(ia|0,o|0,21)|0;m=D;ha=hb(k|0,m|0,h|0,ha|0)|0;h=D;m=kb(k|0,m|0,21)|0;m=gb(ia|0,o|0,m|0,D|0)|0;o=D;ia=fb(ha|0,h|0,21)|0;k=D;e=hb(ia|0,k|0,d|0,e|0)|0;d=D;k=kb(ia|0,k|0,21)|0;k=gb(ha|0,h|0,k|0,D|0)|0;h=D;ga(a>>0|0,ba|0,1,0);a=jb(ba|0,da|0,8)|0;ga(ea>>0|0,a|0,1,0);a=jb(ba|0,da|0,16)|0;da=D;ba=kb(Y|0,_|0,5)|0;D|da;ga(ca>>0|0,ba|a|0,1,0);a=jb(Y|0,_|0,3)|0;ga(aa>>0|0,a|0,1,0);a=jb(Y|0,_|0,11)|0;ga($>>0|0,a|0,1,0);a=jb(Y|0,_|0,19)|0;_=D;Y=kb(U|0,W|0,2)|0;D|_;ga(Z>>0|0,Y|a|0,1,0);a=jb(U|0,W|0,6)|0;ga(X>>0|0,a|0,1,0);a=jb(U|0,W|0,14)|0;W=D;U=kb(P|0,R|0,7)|0;D|W;ga(V>>0|0,U|a|0,1,0);a=jb(P|0,R|0,1)|0;ga(T>>0|0,a|0,1,0);a=jb(P|0,R|0,9)|0;ga(S>>0|0,a|0,1,0);a=jb(P|0,R|0,17)|0;R=D;P=kb(K|0,M|0,4)|0;D|R;ga(Q>>0|0,P|a|0,1,0);a=jb(K|0,M|0,4)|0;ga(O>>0|0,a|0,1,0);a=jb(K|0,M|0,12)|0;ga(N>>0|0,a|0,1,0);a=jb(K|0,M|0,20)|0;M=D;K=kb(G|0,I|0,1)|0;D|M;ga(L>>0|0,K|a|0,1,0);a=jb(G|0,I|0,7)|0;ga(J>>0|0,a|0,1,0);a=jb(G|0,I|0,15)|0;I=D;G=kb(A|0,C|0,6)|0;D|I;ga(H>>0|0,G|a|0,1,0);a=jb(A|0,C|0,2)|0;ga(F>>0|0,a|0,1,0);a=jb(A|0,C|0,10)|0;ga(E>>0|0,a|0,1,0);a=jb(A|0,C|0,18)|0;C=D;A=kb(y|0,x|0,3)|0;D|C;ga(B>>0|0,A|a|0,1,0);a=jb(y|0,x|0,5)|0;ga(z>>0|0,a|0,1,0);a=jb(y|0,x|0,13)|0;ga(w>>0|0,a|0,1,0);ga(v>>0|0,r|0,1,0);a=jb(r|0,t|0,8)|0;ga(u>>0|0,a|0,1,0);a=jb(r|0,t|0,16)|0;t=D;r=kb(m|0,o|0,5)|0;D|t;ga(s>>0|0,r|a|0,1,0);a=jb(m|0,o|0,3)|0;ga(q>>0|0,a|0,1,0);a=jb(m|0,o|0,11)|0;ga(p>>0|0,a|0,1,0);a=jb(m|0,o|0,19)|0;o=D;m=kb(k|0,h|0,2)|0;D|o;ga(n>>0|0,m|a|0,1,0);a=jb(k|0,h|0,6)|0;ga(l>>0|0,a|0,1,0);h=jb(k|0,h|0,14)|0;k=D;a=kb(e|0,d|0,7)|0;k|D;ga(j>>0|0,h|a|0,1,0);a=jb(e|0,d|0,1)|0;ga(g>>0|0,a|0,1,0);a=jb(e|0,d|0,9)|0;ga(f>>0|0,a|0,1,0);a=jb(e|0,d|0,17)|0;ga(c>>0|0,a|0,1,0);i=b;return}function Za(a,b,c){a=a|0;b=b|0;c=c|0;var d=0,e=0,f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0,P=0,Q=0,R=0,S=0,T=0,U=0,V=0,W=0,X=0,Y=0,Z=0,_=0,$=0;d=i;$=fa(b+2>>0|0,1,0,0)|0|0;Z=fa(b>>0|0,1,0,1)|0|0;Y=kb(fa(b+1>>0|0,1,0,1)|0|0|0,0,8)|0;W=D;$=$&255;s=kb($|0,0,16)|0;P=kb(fa(b+3>>0|0,1,0,1)|0|0|0,0,8)|0;q=D;V=kb(fa(b+4>>0|0,1,0,1)|0|0|0,0,16)|0;q=q|D;z=fa(b+5>>0|0,1,0,1)|0|0;Q=kb(z|0,0,24)|0;q=jb(P|$|V|Q|0,q|D|0,5)|0;Q=fa(b+7>>0|0,1,0,0)|0|0;V=kb(fa(b+6>>0|0,1,0,1)|0|0|0,0,8)|0;$=D;Q=Q&255;P=kb(Q|0,0,16)|0;$=jb(V|z|P|0,$|D|0,2)|0;P=kb(fa(b+8>>0|0,1,0,1)|0|0|0,0,8)|0;z=D;V=kb(fa(b+9>>0|0,1,0,1)|0|0|0,0,16)|0;z=z|D;k=fa(b+10>>0|0,1,0,1)|0|0;R=kb(k|0,0,24)|0;z=jb(P|Q|V|R|0,z|D|0,7)|0;R=kb(fa(b+11>>0|0,1,0,1)|0|0|0,0,8)|0;V=D;Q=kb(fa(b+12>>0|0,1,0,1)|0|0|0,0,16)|0;V=V|D;P=fa(b+13>>0|0,1,0,1)|0|0;F=kb(P|0,0,24)|0;V=jb(R|k|Q|F|0,V|D|0,4)|0;F=fa(b+15>>0|0,1,0,0)|0|0;Q=kb(fa(b+14>>0|0,1,0,1)|0|0|0,0,8)|0;k=D;F=F&255;R=kb(F|0,0,16)|0;k=jb(Q|P|R|0,k|D|0,1)|0;R=kb(fa(b+16>>0|0,1,0,1)|0|0|0,0,8)|0;P=D;Q=kb(fa(b+17>>0|0,1,0,1)|0|0|0,0,16)|0;P=P|D;H=fa(b+18>>0|0,1,0,1)|0|0;e=kb(H|0,0,24)|0;P=jb(R|F|Q|e|0,P|D|0,6)|0;e=fa(b+20>>0|0,1,0,0)|0|0;Q=kb(fa(b+19>>0|0,1,0,1)|0|0|0,0,8)|0;F=D;e=kb(e&255|0,0,16)|0;F=jb(Q|H|e|0,F|D|0,3)|0;e=D;H=fa(b+23>>0|0,1,0,0)|0|0;Q=fa(b+21>>0|0,1,0,1)|0|0;R=kb(fa(b+22>>0|0,1,0,1)|0|0|0,0,8)|0;J=D;H=H&255;I=kb(H|0,0,16)|0;M=kb(fa(b+24>>0|0,1,0,1)|0|0|0,0,8)|0;o=D;_=kb(fa(b+25>>0|0,1,0,1)|0|0|0,0,16)|0;o=o|D;v=fa(b+26>>0|0,1,0,1)|0|0;p=kb(v|0,0,24)|0;o=jb(M|H|_|p|0,o|D|0,5)|0;p=fa(b+28>>0|0,1,0,0)|0|0;_=kb(fa(b+27>>0|0,1,0,1)|0|0|0,0,8)|0;H=D;p=p&255;M=kb(p|0,0,16)|0;H=jb(_|v|M|0,H|D|0,2)|0;M=kb(fa(b+29>>0|0,1,0,1)|0|0|0,0,8)|0;v=D;_=kb(fa(b+30>>0|0,1,0,1)|0|0|0,0,16)|0;v=v|D;w=kb(fa(b+31>>0|0,1,0,1)|0|0|0,0,24)|0;v=jb(M|p|_|w|0,v|D|0,7)|0;w=D;_=fa(c+2>>0|0,1,0,0)|0|0;p=fa(c>>0|0,1,0,1)|0|0;M=kb(fa(c+1>>0|0,1,0,1)|0|0|0,0,8)|0;t=D;_=_&255;S=kb(_|0,0,16)|0;O=kb(fa(c+3>>0|0,1,0,1)|0|0|0,0,8)|0;T=D;U=kb(fa(c+4>>0|0,1,0,1)|0|0|0,0,16)|0;T=T|D;N=fa(c+5>>0|0,1,0,1)|0|0;f=kb(N|0,0,24)|0;T=jb(O|_|U|f|0,T|D|0,5)|0;f=fa(c+7>>0|0,1,0,0)|0|0;U=kb(fa(c+6>>0|0,1,0,1)|0|0|0,0,8)|0;_=D;f=f&255;O=kb(f|0,0,16)|0;_=jb(U|N|O|0,_|D|0,2)|0;O=kb(fa(c+8>>0|0,1,0,1)|0|0|0,0,8)|0;N=D;U=kb(fa(c+9>>0|0,1,0,1)|0|0|0,0,16)|0;N=N|D;L=fa(c+10>>0|0,1,0,1)|0|0;g=kb(L|0,0,24)|0;N=jb(O|f|U|g|0,N|D|0,7)|0;g=kb(fa(c+11>>0|0,1,0,1)|0|0|0,0,8)|0;U=D;f=kb(fa(c+12>>0|0,1,0,1)|0|0|0,0,16)|0;U=U|D;O=fa(c+13>>0|0,1,0,1)|0|0;A=kb(O|0,0,24)|0;U=jb(g|L|f|A|0,U|D|0,4)|0;A=fa(c+15>>0|0,1,0,0)|0|0;f=kb(fa(c+14>>0|0,1,0,1)|0|0|0,0,8)|0;L=D;A=A&255;g=kb(A|0,0,16)|0;L=jb(f|O|g|0,L|D|0,1)|0;g=kb(fa(c+16>>0|0,1,0,1)|0|0|0,0,8)|0;O=D;f=kb(fa(c+17>>0|0,1,0,1)|0|0|0,0,16)|0;O=O|D;G=fa(c+18>>0|0,1,0,1)|0|0;B=kb(G|0,0,24)|0;O=jb(g|A|f|B|0,O|D|0,6)|0;B=fa(c+20>>0|0,1,0,0)|0|0;f=kb(fa(c+19>>0|0,1,0,1)|0|0|0,0,8)|0;A=D;B=kb(B&255|0,0,16)|0;A=jb(f|G|B|0,A|D|0,3)|0;B=D;G=fa(c+23>>0|0,1,0,0)|0|0;f=fa(c+21>>0|0,1,0,1)|0|0;g=kb(fa(c+22>>0|0,1,0,1)|0|0|0,0,8)|0;h=D;G=G&255;l=kb(G|0,0,16)|0;j=kb(fa(c+24>>0|0,1,0,1)|0|0|0,0,8)|0;y=D;u=kb(fa(c+25>>0|0,1,0,1)|0|0|0,0,16)|0;y=y|D;x=fa(c+26>>0|0,1,0,1)|0|0;K=kb(x|0,0,24)|0;y=jb(j|G|u|K|0,y|D|0,5)|0;K=fa(c+28>>0|0,1,0,0)|0|0;u=kb(fa(c+27>>0|0,1,0,1)|0|0|0,0,8)|0;G=D;K=K&255;j=kb(K|0,0,16)|0;G=jb(u|x|j|0,G|D|0,2)|0;j=kb(fa(c+29>>0|0,1,0,1)|0|0|0,0,8)|0;x=D;u=kb(fa(c+30>>0|0,1,0,1)|0|0|0,0,16)|0;x=x|D;X=kb(fa(c+31>>0|0,1,0,1)|0|0|0,0,24)|0;x=jb(j|K|u|X|0,x|D|0,7)|0;X=D;W=hb(M|p|S&2031616|0,t|0,Y|Z|s&2031616|0,W|0)|0;s=D;$=hb(_&2097151|0,0,$&2097151|0,0)|0;_=D;V=hb(U&2097151|0,0,V&2097151|0,0)|0;U=D;k=hb(L&2097151|0,0,k&2097151|0,0)|0;L=D;P=hb(O&2097151|0,0,P&2097151|0,0)|0;O=D;e=hb(A|0,B|0,F|0,e|0)|0;F=D;J=hb(g|f|l&2031616|0,h|0,R|Q|I&2031616|0,J|0)|0;I=D;H=hb(G&2097151|0,0,H&2097151|0,0)|0;G=D;w=hb(x|0,X|0,v|0,w|0)|0;v=D;X=hb(W|0,s|0,1048576,0)|0;X=jb(X|0,D|0,21)|0;x=D;q=hb(X|0,x|0,q&2097151|0,0)|0;T=hb(q|0,D|0,T&2097151|0,0)|0;q=D;x=kb(X|0,x|0,21)|0;x=gb(W|0,s|0,x|0,D|0)|0;s=D;W=hb($|0,_|0,1048576,0)|0;W=jb(W|0,D|0,21)|0;X=D;z=hb(W|0,X|0,z&2097151|0,0)|0;N=hb(z|0,D|0,N&2097151|0,0)|0;z=D;X=kb(W|0,X|0,21)|0;W=D;Q=hb(V|0,U|0,1048576,0)|0;Q=jb(Q|0,D|0,21)|0;R=D;L=hb(k|0,L|0,Q|0,R|0)|0;k=D;R=kb(Q|0,R|0,21)|0;Q=D;h=hb(P|0,O|0,1048576,0)|0;h=jb(h|0,D|0,21)|0;l=D;F=hb(e|0,F|0,h|0,l|0)|0;e=D;l=kb(h|0,l|0,21)|0;h=D;f=hb(J|0,I|0,1048576,0)|0;f=jb(f|0,D|0,21)|0;g=D;o=hb(f|0,g|0,o&2097151|0,0)|0;y=hb(o|0,D|0,y&2097151|0,0)|0;o=D;g=kb(f|0,g|0,21)|0;f=D;B=hb(H|0,G|0,1048576,0)|0;B=jb(B|0,D|0,21)|0;A=D;v=hb(w|0,v|0,B|0,A|0)|0;w=D;A=kb(B|0,A|0,21)|0;B=D;Z=hb(T|0,q|0,1048576,0)|0;Z=jb(Z|0,D|0,21)|0;Y=D;t=kb(Z|0,Y|0,21)|0;t=gb(T|0,q|0,t|0,D|0)|0;q=D;T=hb(N|0,z|0,1048576,0)|0;T=jb(T|0,D|0,21)|0;S=D;p=kb(T|0,S|0,21)|0;p=gb(N|0,z|0,p|0,D|0)|0;z=D;N=hb(L|0,k|0,1048576,0)|0;N=jb(N|0,D|0,21)|0;M=D;u=kb(N|0,M|0,21)|0;u=gb(L|0,k|0,u|0,D|0)|0;k=D;L=hb(F|0,e|0,1048576,0)|0;L=jb(L|0,D|0,21)|0;K=D;j=kb(L|0,K|0,21)|0;j=gb(F|0,e|0,j|0,D|0)|0;e=D;F=hb(y|0,o|0,1048576,0)|0;F=jb(F|0,D|0,21)|0;b=D;C=kb(F|0,b|0,21)|0;C=gb(y|0,o|0,C|0,D|0)|0;o=D;y=hb(v|0,w|0,1048576,0)|0;y=jb(y|0,D|0,21)|0;m=D;c=kb(y|0,m|0,21)|0;c=gb(v|0,w|0,c|0,D|0)|0;w=D;v=sb(y|0,m|0,666643,0)|0;s=hb(v|0,D|0,x|0,s|0)|0;x=D;v=sb(y|0,m|0,470296,0)|0;v=hb(t|0,q|0,v|0,D|0)|0;q=D;t=sb(y|0,m|0,654183,0)|0;E=D;r=sb(y|0,m|0,-997805,-1)|0;r=hb(p|0,z|0,r|0,D|0)|0;z=D;p=sb(y|0,m|0,136657,0)|0;n=D;m=sb(y|0,m|0,-683901,-1)|0;m=hb(u|0,k|0,m|0,D|0)|0;k=D;u=fb(s|0,x|0,21)|0;y=D;q=hb(v|0,q|0,u|0,y|0)|0;v=D;y=kb(u|0,y|0,21)|0;y=gb(s|0,x|0,y|0,D|0)|0;x=D;s=fb(q|0,v|0,21)|0;u=D;Y=hb($|0,_|0,Z|0,Y|0)|0;W=gb(Y|0,D|0,X|0,W|0)|0;E=hb(W|0,D|0,t|0,E|0)|0;E=hb(E|0,D|0,s|0,u|0)|0;t=D;u=kb(s|0,u|0,21)|0;u=gb(q|0,v|0,u|0,D|0)|0;v=D;q=fb(E|0,t|0,21)|0;s=D;z=hb(r|0,z|0,q|0,s|0)|0;r=D;s=kb(q|0,s|0,21)|0;s=gb(E|0,t|0,s|0,D|0)|0;t=D;E=fb(z|0,r|0,21)|0;q=D;S=hb(V|0,U|0,T|0,S|0)|0;Q=gb(S|0,D|0,R|0,Q|0)|0;n=hb(Q|0,D|0,p|0,n|0)|0;n=hb(n|0,D|0,E|0,q|0)|0;p=D;q=kb(E|0,q|0,21)|0;q=gb(z|0,r|0,q|0,D|0)|0;r=D;z=fb(n|0,p|0,21)|0;E=D;k=hb(m|0,k|0,z|0,E|0)|0;m=D;E=kb(z|0,E|0,21)|0;E=gb(n|0,p|0,E|0,D|0)|0;p=D;n=fb(k|0,m|0,21)|0;z=D;M=hb(P|0,O|0,N|0,M|0)|0;h=gb(M|0,D|0,l|0,h|0)|0;h=hb(h|0,D|0,n|0,z|0)|0;l=D;z=kb(n|0,z|0,21)|0;z=gb(k|0,m|0,z|0,D|0)|0;m=D;k=fb(h|0,l|0,21)|0;n=D;e=hb(k|0,n|0,j|0,e|0)|0;j=D;n=kb(k|0,n|0,21)|0;n=gb(h|0,l|0,n|0,D|0)|0;l=D;h=fb(e|0,j|0,21)|0;k=D;I=hb(L|0,K|0,J|0,I|0)|0;f=gb(I|0,D|0,g|0,f|0)|0;f=hb(f|0,D|0,h|0,k|0)|0;g=D;k=kb(h|0,k|0,21)|0;k=gb(e|0,j|0,k|0,D|0)|0;j=D;e=fb(f|0,g|0,21)|0;h=D;o=hb(e|0,h|0,C|0,o|0)|0;C=D;h=kb(e|0,h|0,21)|0;h=gb(f|0,g|0,h|0,D|0)|0;g=D;f=fb(o|0,C|0,21)|0;e=D;b=hb(H|0,G|0,F|0,b|0)|0;B=gb(b|0,D|0,A|0,B|0)|0;B=hb(B|0,D|0,f|0,e|0)|0;A=D;e=kb(f|0,e|0,21)|0;e=gb(o|0,C|0,e|0,D|0)|0;C=D;o=fb(B|0,A|0,21)|0;f=D;w=hb(o|0,f|0,c|0,w|0)|0;c=D;f=kb(o|0,f|0,21)|0;f=gb(B|0,A|0,f|0,D|0)|0;A=D;B=fb(w|0,c|0,21)|0;o=D;b=kb(B|0,o|0,21)|0;b=gb(w|0,c|0,b|0,D|0)|0;c=D;w=sb(B|0,o|0,666643,0)|0;x=hb(w|0,D|0,y|0,x|0)|0;y=D;w=sb(B|0,o|0,470296,0)|0;w=hb(u|0,v|0,w|0,D|0)|0;v=D;u=sb(B|0,o|0,654183,0)|0;u=hb(s|0,t|0,u|0,D|0)|0;t=D;s=sb(B|0,o|0,-997805,-1)|0;s=hb(q|0,r|0,s|0,D|0)|0;r=D;q=sb(B|0,o|0,136657,0)|0;q=hb(E|0,p|0,q|0,D|0)|0;p=D;o=sb(B|0,o|0,-683901,-1)|0;o=hb(z|0,m|0,o|0,D|0)|0;m=D;z=fb(x|0,y|0,21)|0;B=D;v=hb(w|0,v|0,z|0,B|0)|0;w=D;B=kb(z|0,B|0,21)|0;B=gb(x|0,y|0,B|0,D|0)|0;y=D;x=fb(v|0,w|0,21)|0;z=D;t=hb(u|0,t|0,x|0,z|0)|0;u=D;z=kb(x|0,z|0,21)|0;z=gb(v|0,w|0,z|0,D|0)|0;w=D;v=fb(t|0,u|0,21)|0;x=D;r=hb(s|0,r|0,v|0,x|0)|0;s=D;x=kb(v|0,x|0,21)|0;x=gb(t|0,u|0,x|0,D|0)|0;u=D;t=fb(r|0,s|0,21)|0;v=D;p=hb(q|0,p|0,t|0,v|0)|0;q=D;v=kb(t|0,v|0,21)|0;v=gb(r|0,s|0,v|0,D|0)|0;s=D;r=fb(p|0,q|0,21)|0;t=D;m=hb(o|0,m|0,r|0,t|0)|0;o=D;t=kb(r|0,t|0,21)|0;t=gb(p|0,q|0,t|0,D|0)|0;q=D;p=fb(m|0,o|0,21)|0;r=D;l=hb(p|0,r|0,n|0,l|0)|0;n=D;r=kb(p|0,r|0,21)|0;r=gb(m|0,o|0,r|0,D|0)|0;o=D;m=fb(l|0,n|0,21)|0;p=D;j=hb(m|0,p|0,k|0,j|0)|0;k=D;p=kb(m|0,p|0,21)|0;p=gb(l|0,n|0,p|0,D|0)|0;n=D;l=fb(j|0,k|0,21)|0;m=D;g=hb(l|0,m|0,h|0,g|0)|0;h=D;m=kb(l|0,m|0,21)|0;m=gb(j|0,k|0,m|0,D|0)|0;k=D;j=fb(g|0,h|0,21)|0;l=D;C=hb(j|0,l|0,e|0,C|0)|0;e=D;l=kb(j|0,l|0,21)|0;l=gb(g|0,h|0,l|0,D|0)|0;h=D;g=fb(C|0,e|0,21)|0;j=D;A=hb(g|0,j|0,f|0,A|0)|0;f=D;j=kb(g|0,j|0,21)|0;j=gb(C|0,e|0,j|0,D|0)|0;e=D;C=fb(A|0,f|0,21)|0;g=D;c=hb(C|0,g|0,b|0,c|0)|0;b=D;g=kb(C|0,g|0,21)|0;g=gb(A|0,f|0,g|0,D|0)|0;f=D;ga(a>>0|0,B|0,1,0);A=jb(B|0,y|0,8)|0;ga(a+1>>0|0,A|0,1,0);y=jb(B|0,y|0,16)|0;B=D;A=kb(z|0,w|0,5)|0;D|B;ga(a+2>>0|0,A|y|0,1,0);y=jb(z|0,w|0,3)|0;ga(a+3>>0|0,y|0,1,0);y=jb(z|0,w|0,11)|0;ga(a+4>>0|0,y|0,1,0);w=jb(z|0,w|0,19)|0;z=D;y=kb(x|0,u|0,2)|0;D|z;ga(a+5>>0|0,y|w|0,1,0);w=jb(x|0,u|0,6)|0;ga(a+6>>0|0,w|0,1,0);u=jb(x|0,u|0,14)|0;x=D;w=kb(v|0,s|0,7)|0;D|x;ga(a+7>>0|0,w|u|0,1,0);u=jb(v|0,s|0,1)|0;ga(a+8>>0|0,u|0,1,0);u=jb(v|0,s|0,9)|0;ga(a+9>>0|0,u|0,1,0);s=jb(v|0,s|0,17)|0;v=D;u=kb(t|0,q|0,4)|0;D|v;ga(a+10>>0|0,u|s|0,1,0);s=jb(t|0,q|0,4)|0;ga(a+11>>0|0,s|0,1,0);s=jb(t|0,q|0,12)|0;ga(a+12>>0|0,s|0,1,0);q=jb(t|0,q|0,20)|0;t=D;s=kb(r|0,o|0,1)|0;D|t;ga(a+13>>0|0,s|q|0,1,0);q=jb(r|0,o|0,7)|0;ga(a+14>>0|0,q|0,1,0);o=jb(r|0,o|0,15)|0;r=D;q=kb(p|0,n|0,6)|0;D|r;ga(a+15>>0|0,q|o|0,1,0);o=jb(p|0,n|0,2)|0;ga(a+16>>0|0,o|0,1,0);o=jb(p|0,n|0,10)|0;ga(a+17>>0|0,o|0,1,0);n=jb(p|0,n|0,18)|0;p=D;o=kb(m|0,k|0,3)|0;D|p;ga(a+18>>0|0,o|n|0,1,0);n=jb(m|0,k|0,5)|0;ga(a+19>>0|0,n|0,1,0);k=jb(m|0,k|0,13)|0;ga(a+20>>0|0,k|0,1,0);ga(a+21>>0|0,l|0,1,0);k=jb(l|0,h|0,8)|0;ga(a+22>>0|0,k|0,1,0);h=jb(l|0,h|0,16)|0;l=D;k=kb(j|0,e|0,5)|0;D|l;ga(a+23>>0|0,k|h|0,1,0);h=jb(j|0,e|0,3)|0;ga(a+24>>0|0,h|0,1,0);h=jb(j|0,e|0,11)|0;ga(a+25>>0|0,h|0,1,0);e=jb(j|0,e|0,19)|0;j=D;h=kb(g|0,f|0,2)|0;D|j;ga(a+26>>0|0,h|e|0,1,0);e=jb(g|0,f|0,6)|0;ga(a+27>>0|0,e|0,1,0);f=jb(g|0,f|0,14)|0;g=D;e=kb(c|0,b|0,7)|0;g|D;ga(a+28>>0|0,f|e|0,1,0);e=jb(c|0,b|0,1)|0;ga(a+29>>0|0,e|0,1,0);e=jb(c|0,b|0,9)|0;ga(a+30>>0|0,e|0,1,0);b=jb(c|0,b|0,17)|0;ga(a+31>>0|0,b|0,1,0);i=d;return}function _a(a,b,c){a=a|0;b=b|0;c=c|0;var d=0,e=0,f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0,P=0,Q=0,R=0,S=0,T=0,U=0,V=0,W=0,X=0,Y=0,Z=0,_=0,$=0;d=i;Y=fa(b+2>>0|0,1,0,0)|0|0;p=fa(b>>0|0,1,0,1)|0|0;M=kb(fa(b+1>>0|0,1,0,1)|0|0|0,0,8)|0;t=D;Y=Y&255;S=kb(Y|0,0,16)|0;O=kb(fa(b+3>>0|0,1,0,1)|0|0|0,0,8)|0;T=D;U=kb(fa(b+4>>0|0,1,0,1)|0|0|0,0,16)|0;T=T|D;N=fa(b+5>>0|0,1,0,1)|0|0;f=kb(N|0,0,24)|0;T=jb(O|Y|U|f|0,T|D|0,5)|0;f=fa(b+7>>0|0,1,0,0)|0|0;U=kb(fa(b+6>>0|0,1,0,1)|0|0|0,0,8)|0;Y=D;f=f&255;O=kb(f|0,0,16)|0;Y=jb(U|N|O|0,Y|D|0,2)|0;O=kb(fa(b+8>>0|0,1,0,1)|0|0|0,0,8)|0;N=D;U=kb(fa(b+9>>0|0,1,0,1)|0|0|0,0,16)|0;N=N|D;L=fa(b+10>>0|0,1,0,1)|0|0;g=kb(L|0,0,24)|0;N=jb(O|f|U|g|0,N|D|0,7)|0;g=kb(fa(b+11>>0|0,1,0,1)|0|0|0,0,8)|0;U=D;f=kb(fa(b+12>>0|0,1,0,1)|0|0|0,0,16)|0;U=U|D;O=fa(b+13>>0|0,1,0,1)|0|0;A=kb(O|0,0,24)|0;U=jb(g|L|f|A|0,U|D|0,4)|0;A=fa(b+15>>0|0,1,0,0)|0|0;f=kb(fa(b+14>>0|0,1,0,1)|0|0|0,0,8)|0;L=D;A=A&255;g=kb(A|0,0,16)|0;L=jb(f|O|g|0,L|D|0,1)|0;g=kb(fa(b+16>>0|0,1,0,1)|0|0|0,0,8)|0;O=D;f=kb(fa(b+17>>0|0,1,0,1)|0|0|0,0,16)|0;O=O|D;Q=fa(b+18>>0|0,1,0,1)|0|0;B=kb(Q|0,0,24)|0;O=jb(g|A|f|B|0,O|D|0,6)|0;B=fa(b+20>>0|0,1,0,0)|0|0;f=kb(fa(b+19>>0|0,1,0,1)|0|0|0,0,8)|0;A=D;B=kb(B&255|0,0,16)|0;A=jb(f|Q|B|0,A|D|0,3)|0;B=D;Q=fa(b+23>>0|0,1,0,0)|0|0;f=fa(b+21>>0|0,1,0,1)|0|0;g=kb(fa(b+22>>0|0,1,0,1)|0|0|0,0,8)|0;h=D;Q=Q&255;l=kb(Q|0,0,16)|0;_=kb(fa(b+24>>0|0,1,0,1)|0|0|0,0,8)|0;y=D;Z=kb(fa(b+25>>0|0,1,0,1)|0|0|0,0,16)|0;y=y|D;x=fa(b+26>>0|0,1,0,1)|0|0;$=kb(x|0,0,24)|0;y=jb(_|Q|Z|$|0,y|D|0,5)|0;$=fa(b+28>>0|0,1,0,0)|0|0;Z=kb(fa(b+27>>0|0,1,0,1)|0|0|0,0,8)|0;Q=D;$=$&255;_=kb($|0,0,16)|0;Q=jb(Z|x|_|0,Q|D|0,2)|0;_=kb(fa(b+29>>0|0,1,0,1)|0|0|0,0,8)|0;x=D;Z=kb(fa(b+30>>0|0,1,0,1)|0|0|0,0,16)|0;x=x|D;X=kb(fa(b+31>>0|0,1,0,1)|0|0|0,0,24)|0;x=jb(_|$|Z|X|0,x|D|0,7)|0;X=D;Z=fa(c+2>>0|0,1,0,0)|0|0;$=fa(c>>0|0,1,0,1)|0|0;_=kb(fa(c+1>>0|0,1,0,1)|0|0|0,0,8)|0;W=D;Z=Z&255;s=kb(Z|0,0,16)|0;P=kb(fa(c+3>>0|0,1,0,1)|0|0|0,0,8)|0;q=D;V=kb(fa(c+4>>0|0,1,0,1)|0|0|0,0,16)|0;q=q|D;z=fa(c+5>>0|0,1,0,1)|0|0;b=kb(z|0,0,24)|0;q=jb(P|Z|V|b|0,q|D|0,5)|0;b=fa(c+7>>0|0,1,0,0)|0|0;V=kb(fa(c+6>>0|0,1,0,1)|0|0|0,0,8)|0;Z=D;b=b&255;P=kb(b|0,0,16)|0;Z=jb(V|z|P|0,Z|D|0,2)|0;P=kb(fa(c+8>>0|0,1,0,1)|0|0|0,0,8)|0;z=D;V=kb(fa(c+9>>0|0,1,0,1)|0|0|0,0,16)|0;z=z|D;k=fa(c+10>>0|0,1,0,1)|0|0;R=kb(k|0,0,24)|0;z=jb(P|b|V|R|0,z|D|0,7)|0;R=kb(fa(c+11>>0|0,1,0,1)|0|0|0,0,8)|0;V=D;b=kb(fa(c+12>>0|0,1,0,1)|0|0|0,0,16)|0;V=V|D;P=fa(c+13>>0|0,1,0,1)|0|0;H=kb(P|0,0,24)|0;V=jb(R|k|b|H|0,V|D|0,4)|0;H=fa(c+15>>0|0,1,0,0)|0|0;b=kb(fa(c+14>>0|0,1,0,1)|0|0|0,0,8)|0;k=D;H=H&255;R=kb(H|0,0,16)|0;k=jb(b|P|R|0,k|D|0,1)|0;R=kb(fa(c+16>>0|0,1,0,1)|0|0|0,0,8)|0;P=D;b=kb(fa(c+17>>0|0,1,0,1)|0|0|0,0,16)|0;P=P|D;F=fa(c+18>>0|0,1,0,1)|0|0;e=kb(F|0,0,24)|0;P=jb(R|H|b|e|0,P|D|0,6)|0;e=fa(c+20>>0|0,1,0,0)|0|0;b=kb(fa(c+19>>0|0,1,0,1)|0|0|0,0,8)|0;H=D;e=kb(e&255|0,0,16)|0;H=jb(b|F|e|0,H|D|0,3)|0;e=D;F=fa(c+23>>0|0,1,0,0)|0|0;b=fa(c+21>>0|0,1,0,1)|0|0;R=kb(fa(c+22>>0|0,1,0,1)|0|0|0,0,8)|0;J=D;F=F&255;I=kb(F|0,0,16)|0;j=kb(fa(c+24>>0|0,1,0,1)|0|0|0,0,8)|0;o=D;u=kb(fa(c+25>>0|0,1,0,1)|0|0|0,0,16)|0;o=o|D;v=fa(c+26>>0|0,1,0,1)|0|0;K=kb(v|0,0,24)|0;o=jb(j|F|u|K|0,o|D|0,5)|0;K=fa(c+28>>0|0,1,0,0)|0|0;u=kb(fa(c+27>>0|0,1,0,1)|0|0|0,0,8)|0;F=D;K=K&255;j=kb(K|0,0,16)|0;F=jb(u|v|j|0,F|D|0,2)|0;j=kb(fa(c+29>>0|0,1,0,1)|0|0|0,0,8)|0;v=D;u=kb(fa(c+30>>0|0,1,0,1)|0|0|0,0,16)|0;v=v|D;w=kb(fa(c+31>>0|0,1,0,1)|0|0|0,0,24)|0;v=jb(j|K|u|w|0,v|D|0,7)|0;w=D;W=gb(M|p|S&2031616|0,t|0,_|$|s&2031616|0,W|0)|0;s=D;q=gb(T&2097151|0,0,q&2097151|0,0)|0;T=D;Z=gb(Y&2097151|0,0,Z&2097151|0,0)|0;Y=D;z=gb(N&2097151|0,0,z&2097151|0,0)|0;N=D;V=gb(U&2097151|0,0,V&2097151|0,0)|0;U=D;k=gb(L&2097151|0,0,k&2097151|0,0)|0;L=D;P=gb(O&2097151|0,0,P&2097151|0,0)|0;O=D;e=gb(A|0,B|0,H|0,e|0)|0;H=D;J=gb(g|f|l&2031616|0,h|0,R|b|I&2031616|0,J|0)|0;I=D;o=gb(y&2097151|0,0,o&2097151|0,0)|0;y=D;F=gb(Q&2097151|0,0,F&2097151|0,0)|0;b=D;w=gb(x|0,X|0,v|0,w|0)|0;v=D;X=hb(W|0,s|0,1048576,0)|0;X=fb(X|0,D|0,21)|0;x=D;T=hb(q|0,T|0,X|0,x|0)|0;q=D;x=kb(X|0,x|0,21)|0;x=gb(W|0,s|0,x|0,D|0)|0;s=D;W=hb(Z|0,Y|0,1048576,0)|0;W=fb(W|0,D|0,21)|0;X=D;N=hb(z|0,N|0,W|0,X|0)|0;z=D;X=kb(W|0,X|0,21)|0;W=D;Q=hb(V|0,U|0,1048576,0)|0;Q=fb(Q|0,D|0,21)|0;R=D;L=hb(k|0,L|0,Q|0,R|0)|0;k=D;R=kb(Q|0,R|0,21)|0;Q=D;h=hb(P|0,O|0,1048576,0)|0;h=fb(h|0,D|0,21)|0;l=D;H=hb(e|0,H|0,h|0,l|0)|0;e=D;l=kb(h|0,l|0,21)|0;h=D;f=hb(J|0,I|0,1048576,0)|0;f=fb(f|0,D|0,21)|0;g=D;y=hb(o|0,y|0,f|0,g|0)|0;o=D;g=kb(f|0,g|0,21)|0;f=D;B=hb(F|0,b|0,1048576,0)|0;B=fb(B|0,D|0,21)|0;A=D;v=hb(w|0,v|0,B|0,A|0)|0;w=D;A=kb(B|0,A|0,21)|0;B=D;$=hb(T|0,q|0,1048576,0)|0;$=fb($|0,D|0,21)|0;_=D;t=kb($|0,_|0,21)|0;t=gb(T|0,q|0,t|0,D|0)|0;q=D;T=hb(N|0,z|0,1048576,0)|0;T=fb(T|0,D|0,21)|0;S=D;p=kb(T|0,S|0,21)|0;p=gb(N|0,z|0,p|0,D|0)|0;z=D;N=hb(L|0,k|0,1048576,0)|0;N=fb(N|0,D|0,21)|0;M=D;u=kb(N|0,M|0,21)|0;u=gb(L|0,k|0,u|0,D|0)|0;k=D;L=hb(H|0,e|0,1048576,0)|0;L=fb(L|0,D|0,21)|0;K=D;j=kb(L|0,K|0,21)|0;j=gb(H|0,e|0,j|0,D|0)|0;e=D;H=hb(y|0,o|0,1048576,0)|0;H=fb(H|0,D|0,21)|0;G=D;C=kb(H|0,G|0,21)|0;C=gb(y|0,o|0,C|0,D|0)|0;o=D;y=hb(v|0,w|0,1048576,0)|0;y=fb(y|0,D|0,21)|0;m=D;c=kb(y|0,m|0,21)|0;c=gb(v|0,w|0,c|0,D|0)|0;w=D;v=sb(y|0,m|0,666643,0)|0;s=hb(v|0,D|0,x|0,s|0)|0;x=D;v=sb(y|0,m|0,470296,0)|0;v=hb(t|0,q|0,v|0,D|0)|0;q=D;t=sb(y|0,m|0,654183,0)|0;E=D;r=sb(y|0,m|0,-997805,-1)|0;r=hb(p|0,z|0,r|0,D|0)|0;z=D;p=sb(y|0,m|0,136657,0)|0;n=D;m=sb(y|0,m|0,-683901,-1)|0;m=hb(u|0,k|0,m|0,D|0)|0;k=D;u=fb(s|0,x|0,21)|0;y=D;q=hb(v|0,q|0,u|0,y|0)|0;v=D;y=kb(u|0,y|0,21)|0;y=gb(s|0,x|0,y|0,D|0)|0;x=D;s=fb(q|0,v|0,21)|0;u=D;Y=hb($|0,_|0,Z|0,Y|0)|0;W=gb(Y|0,D|0,X|0,W|0)|0;E=hb(W|0,D|0,t|0,E|0)|0;E=hb(E|0,D|0,s|0,u|0)|0;t=D;u=kb(s|0,u|0,21)|0;u=gb(q|0,v|0,u|0,D|0)|0;v=D;q=fb(E|0,t|0,21)|0;s=D;z=hb(r|0,z|0,q|0,s|0)|0;r=D;s=kb(q|0,s|0,21)|0;s=gb(E|0,t|0,s|0,D|0)|0;t=D;E=fb(z|0,r|0,21)|0;q=D;S=hb(V|0,U|0,T|0,S|0)|0;Q=gb(S|0,D|0,R|0,Q|0)|0;n=hb(Q|0,D|0,p|0,n|0)|0;n=hb(n|0,D|0,E|0,q|0)|0;p=D;q=kb(E|0,q|0,21)|0;q=gb(z|0,r|0,q|0,D|0)|0;r=D;z=fb(n|0,p|0,21)|0;E=D;k=hb(m|0,k|0,z|0,E|0)|0;m=D;E=kb(z|0,E|0,21)|0;E=gb(n|0,p|0,E|0,D|0)|0;p=D;n=fb(k|0,m|0,21)|0;z=D;M=hb(P|0,O|0,N|0,M|0)|0;h=gb(M|0,D|0,l|0,h|0)|0;h=hb(h|0,D|0,n|0,z|0)|0;l=D;z=kb(n|0,z|0,21)|0;z=gb(k|0,m|0,z|0,D|0)|0;m=D;k=fb(h|0,l|0,21)|0;n=D;e=hb(k|0,n|0,j|0,e|0)|0;j=D;n=kb(k|0,n|0,21)|0;n=gb(h|0,l|0,n|0,D|0)|0;l=D;h=fb(e|0,j|0,21)|0;k=D;I=hb(L|0,K|0,J|0,I|0)|0;f=gb(I|0,D|0,g|0,f|0)|0;f=hb(f|0,D|0,h|0,k|0)|0;g=D;k=kb(h|0,k|0,21)|0;k=gb(e|0,j|0,k|0,D|0)|0;j=D;e=fb(f|0,g|0,21)|0;h=D;o=hb(e|0,h|0,C|0,o|0)|0;C=D;h=kb(e|0,h|0,21)|0;h=gb(f|0,g|0,h|0,D|0)|0;g=D;f=fb(o|0,C|0,21)|0;e=D;b=hb(H|0,G|0,F|0,b|0)|0;B=gb(b|0,D|0,A|0,B|0)|0;B=hb(B|0,D|0,f|0,e|0)|0;A=D;e=kb(f|0,e|0,21)|0;e=gb(o|0,C|0,e|0,D|0)|0;C=D;o=fb(B|0,A|0,21)|0;f=D;w=hb(o|0,f|0,c|0,w|0)|0;c=D;f=kb(o|0,f|0,21)|0;f=gb(B|0,A|0,f|0,D|0)|0;A=D;B=fb(w|0,c|0,21)|0;o=D;b=kb(B|0,o|0,21)|0;b=gb(w|0,c|0,b|0,D|0)|0;c=D;w=sb(B|0,o|0,666643,0)|0;x=hb(w|0,D|0,y|0,x|0)|0;y=D;w=sb(B|0,o|0,470296,0)|0;w=hb(u|0,v|0,w|0,D|0)|0;v=D;u=sb(B|0,o|0,654183,0)|0;u=hb(s|0,t|0,u|0,D|0)|0;t=D;s=sb(B|0,o|0,-997805,-1)|0;s=hb(q|0,r|0,s|0,D|0)|0;r=D;q=sb(B|0,o|0,136657,0)|0;q=hb(E|0,p|0,q|0,D|0)|0;p=D;o=sb(B|0,o|0,-683901,-1)|0;o=hb(z|0,m|0,o|0,D|0)|0;m=D;z=fb(x|0,y|0,21)|0;B=D;v=hb(w|0,v|0,z|0,B|0)|0;w=D;B=kb(z|0,B|0,21)|0;B=gb(x|0,y|0,B|0,D|0)|0;y=D;x=fb(v|0,w|0,21)|0;z=D;t=hb(u|0,t|0,x|0,z|0)|0;u=D;z=kb(x|0,z|0,21)|0;z=gb(v|0,w|0,z|0,D|0)|0;w=D;v=fb(t|0,u|0,21)|0;x=D;r=hb(s|0,r|0,v|0,x|0)|0;s=D;x=kb(v|0,x|0,21)|0;x=gb(t|0,u|0,x|0,D|0)|0;u=D;t=fb(r|0,s|0,21)|0;v=D;p=hb(q|0,p|0,t|0,v|0)|0;q=D;v=kb(t|0,v|0,21)|0;v=gb(r|0,s|0,v|0,D|0)|0;s=D;r=fb(p|0,q|0,21)|0;t=D;m=hb(o|0,m|0,r|0,t|0)|0;o=D;t=kb(r|0,t|0,21)|0;t=gb(p|0,q|0,t|0,D|0)|0;q=D;p=fb(m|0,o|0,21)|0;r=D;l=hb(p|0,r|0,n|0,l|0)|0;n=D;r=kb(p|0,r|0,21)|0;r=gb(m|0,o|0,r|0,D|0)|0;o=D;m=fb(l|0,n|0,21)|0;p=D;j=hb(m|0,p|0,k|0,j|0)|0;k=D;p=kb(m|0,p|0,21)|0;p=gb(l|0,n|0,p|0,D|0)|0;n=D;l=fb(j|0,k|0,21)|0;m=D;g=hb(l|0,m|0,h|0,g|0)|0;h=D;m=kb(l|0,m|0,21)|0;m=gb(j|0,k|0,m|0,D|0)|0;k=D;j=fb(g|0,h|0,21)|0;l=D;C=hb(j|0,l|0,e|0,C|0)|0;e=D;l=kb(j|0,l|0,21)|0;l=gb(g|0,h|0,l|0,D|0)|0;h=D;g=fb(C|0,e|0,21)|0;j=D;A=hb(g|0,j|0,f|0,A|0)|0;f=D;j=kb(g|0,j|0,21)|0;j=gb(C|0,e|0,j|0,D|0)|0;e=D;C=fb(A|0,f|0,21)|0;g=D;c=hb(C|0,g|0,b|0,c|0)|0;b=D;g=kb(C|0,g|0,21)|0;g=gb(A|0,f|0,g|0,D|0)|0;f=D;ga(a>>0|0,B|0,1,0);A=jb(B|0,y|0,8)|0;ga(a+1>>0|0,A|0,1,0);y=jb(B|0,y|0,16)|0;B=D;A=kb(z|0,w|0,5)|0;D|B;ga(a+2>>0|0,A|y|0,1,0);y=jb(z|0,w|0,3)|0;ga(a+3>>0|0,y|0,1,0);y=jb(z|0,w|0,11)|0;ga(a+4>>0|0,y|0,1,0);w=jb(z|0,w|0,19)|0;z=D;y=kb(x|0,u|0,2)|0;D|z;ga(a+5>>0|0,y|w|0,1,0);w=jb(x|0,u|0,6)|0;ga(a+6>>0|0,w|0,1,0);u=jb(x|0,u|0,14)|0;x=D;w=kb(v|0,s|0,7)|0;D|x;ga(a+7>>0|0,w|u|0,1,0);u=jb(v|0,s|0,1)|0;ga(a+8>>0|0,u|0,1,0);u=jb(v|0,s|0,9)|0;ga(a+9>>0|0,u|0,1,0);s=jb(v|0,s|0,17)|0;v=D;u=kb(t|0,q|0,4)|0;D|v;ga(a+10>>0|0,u|s|0,1,0);s=jb(t|0,q|0,4)|0;ga(a+11>>0|0,s|0,1,0);s=jb(t|0,q|0,12)|0;ga(a+12>>0|0,s|0,1,0);q=jb(t|0,q|0,20)|0;t=D;s=kb(r|0,o|0,1)|0;D|t;ga(a+13>>0|0,s|q|0,1,0);q=jb(r|0,o|0,7)|0;ga(a+14>>0|0,q|0,1,0);o=jb(r|0,o|0,15)|0;r=D;q=kb(p|0,n|0,6)|0;D|r;ga(a+15>>0|0,q|o|0,1,0);o=jb(p|0,n|0,2)|0;ga(a+16>>0|0,o|0,1,0);o=jb(p|0,n|0,10)|0;ga(a+17>>0|0,o|0,1,0);n=jb(p|0,n|0,18)|0;p=D;o=kb(m|0,k|0,3)|0;D|p;ga(a+18>>0|0,o|n|0,1,0);n=jb(m|0,k|0,5)|0;ga(a+19>>0|0,n|0,1,0);k=jb(m|0,k|0,13)|0;ga(a+20>>0|0,k|0,1,0);ga(a+21>>0|0,l|0,1,0);k=jb(l|0,h|0,8)|0;ga(a+22>>0|0,k|0,1,0);h=jb(l|0,h|0,16)|0;l=D;k=kb(j|0,e|0,5)|0;D|l;ga(a+23>>0|0,k|h|0,1,0);h=jb(j|0,e|0,3)|0;ga(a+24>>0|0,h|0,1,0);h=jb(j|0,e|0,11)|0;ga(a+25>>0|0,h|0,1,0);e=jb(j|0,e|0,19)|0;j=D;h=kb(g|0,f|0,2)|0;D|j;ga(a+26>>0|0,h|e|0,1,0);e=jb(g|0,f|0,6)|0;ga(a+27>>0|0,e|0,1,0);f=jb(g|0,f|0,14)|0;g=D;e=kb(c|0,b|0,7)|0;g|D;ga(a+28>>0|0,f|e|0,1,0);e=jb(c|0,b|0,1)|0;ga(a+29>>0|0,e|0,1,0);e=jb(c|0,b|0,9)|0;ga(a+30>>0|0,e|0,1,0);b=jb(c|0,b|0,17)|0;ga(a+31>>0|0,b|0,1,0);i=d;return}



function $a(a,b,c,d){a=a|0;b=b|0;c=c|0;d=d|0;var e=0,f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0,P=0,Q=0,R=0,S=0,T=0,U=0,V=0,W=0,X=0,Y=0,Z=0,_=0,$=0,aa=0,ba=0,ca=0,da=0,ea=0,ha=0,ia=0,ja=0,ka=0,la=0,ma=0,na=0,oa=0,pa=0,qa=0,ra=0,sa=0,ta=0,ua=0,va=0,wa=0,xa=0,ya=0,za=0,Aa=0,Ba=0,Ca=0,Da=0,Ea=0,Fa=0,Ga=0,Ha=0,Ia=0,Ja=0,Ka=0,La=0,Ma=0,Na=0,Oa=0,Pa=0,Qa=0,Ra=0,Sa=0,Ta=0,Ua=0,Va=0,Wa=0,Xa=0,Ya=0,Za=0,_a=0,$a=0,ab=0,bb=0,cb=0,db=0,eb=0,ib=0,lb=0,mb=0,nb=0,ob=0,pb=0,qb=0,rb=0,tb=0,ub=0,vb=0,wb=0,xb=0,yb=0,zb=0,Ab=0,Bb=0,Cb=0,Db=0,Eb=0,Fb=0,Gb=0,Hb=0,Ib=0,Jb=0,Kb=0,Lb=0,Mb=0,Nb=0,Ob=0,Pb=0,Qb=0,Rb=0,Sb=0,Tb=0,Ub=0,Vb=0,Wb=0,Xb=0,Yb=0,Zb=0,_b=0,$b=0,ac=0,bc=0,cc=0,dc=0,ec=0,fc=0,gc=0,hc=0,ic=0,jc=0,kc=0,lc=0,mc=0,nc=0,oc=0,pc=0,qc=0,rc=0,sc=0,tc=0,uc=0,vc=0,wc=0,xc=0,yc=0,zc=0,Ac=0,Bc=0;e=i;q=fa(b+2>>0|0,1,0,0)|0|0;Qa=fa(b>>0|0,1,0,1)|0|0;Ab=kb(fa(b+1>>0|0,1,0,1)|0|0|0,0,8)|0;zb=D;q=q&255;_=kb(q|0,0,16)|0;_=Ab|Qa|_&2031616;Qa=kb(fa(b+3>>0|0,1,0,1)|0|0|0,0,8)|0;Ab=D;o=kb(fa(b+4>>0|0,1,0,1)|0|0|0,0,16)|0;Ab=Ab|D;u=fa(b+5>>0|0,1,0,1)|0|0;Z=kb(u|0,0,24)|0;Ab=jb(Qa|q|o|Z|0,Ab|D|0,5)|0;Ab=Ab&2097151;Z=fa(b+7>>0|0,1,0,0)|0|0;o=kb(fa(b+6>>0|0,1,0,1)|0|0|0,0,8)|0;q=D;Z=Z&255;Qa=kb(Z|0,0,16)|0;q=jb(o|u|Qa|0,q|D|0,2)|0;q=q&2097151;Qa=kb(fa(b+8>>0|0,1,0,1)|0|0|0,0,8)|0;u=D;o=kb(fa(b+9>>0|0,1,0,1)|0|0|0,0,16)|0;u=u|D;j=fa(b+10>>0|0,1,0,1)|0|0;w=kb(j|0,0,24)|0;u=jb(Qa|Z|o|w|0,u|D|0,7)|0;u=u&2097151;w=kb(fa(b+11>>0|0,1,0,1)|0|0|0,0,8)|0;o=D;Z=kb(fa(b+12>>0|0,1,0,1)|0|0|0,0,16)|0;o=o|D;Qa=fa(b+13>>0|0,1,0,1)|0|0;na=kb(Qa|0,0,24)|0;o=jb(w|j|Z|na|0,o|D|0,4)|0;o=o&2097151;na=fa(b+15>>0|0,1,0,0)|0|0;Z=kb(fa(b+14>>0|0,1,0,1)|0|0|0,0,8)|0;j=D;na=na&255;w=kb(na|0,0,16)|0;j=jb(Z|Qa|w|0,j|D|0,1)|0;j=j&2097151;w=kb(fa(b+16>>0|0,1,0,1)|0|0|0,0,8)|0;Qa=D;Z=kb(fa(b+17>>0|0,1,0,1)|0|0|0,0,16)|0;Qa=Qa|D;Ga=fa(b+18>>0|0,1,0,1)|0|0;ya=kb(Ga|0,0,24)|0;Qa=jb(w|na|Z|ya|0,Qa|D|0,6)|0;Qa=Qa&2097151;ya=fa(b+20>>0|0,1,0,0)|0|0;Z=kb(fa(b+19>>0|0,1,0,1)|0|0|0,0,8)|0;na=D;ya=kb(ya&255|0,0,16)|0;na=jb(Z|Ga|ya|0,na|D|0,3)|0;ya=D;Ga=fa(b+23>>0|0,1,0,0)|0|0;Z=fa(b+21>>0|0,1,0,1)|0|0;w=kb(fa(b+22>>0|0,1,0,1)|0|0|0,0,8)|0;qb=D;Ga=Ga&255;Na=kb(Ga|0,0,16)|0;Na=w|Z|Na&2031616;Z=kb(fa(b+24>>0|0,1,0,1)|0|0|0,0,8)|0;w=D;mb=kb(fa(b+25>>0|0,1,0,1)|0|0|0,0,16)|0;w=w|D;x=fa(b+26>>0|0,1,0,1)|0|0;Ua=kb(x|0,0,24)|0;w=jb(Z|Ga|mb|Ua|0,w|D|0,5)|0;w=w&2097151;Ua=fa(b+28>>0|0,1,0,0)|0|0;mb=kb(fa(b+27>>0|0,1,0,1)|0|0|0,0,8)|0;Ga=D;Ua=Ua&255;Z=kb(Ua|0,0,16)|0;Ga=jb(mb|x|Z|0,Ga|D|0,2)|0;Ga=Ga&2097151;Z=kb(fa(b+29>>0|0,1,0,1)|0|0|0,0,8)|0;x=D;mb=kb(fa(b+30>>0|0,1,0,1)|0|0|0,0,16)|0;x=x|D;Ha=kb(fa(b+31>>0|0,1,0,1)|0|0|0,0,24)|0;x=jb(Z|Ua|mb|Ha|0,x|D|0,7)|0;Ha=D;mb=fa(c+2>>0|0,1,0,0)|0|0;Ua=fa(c>>0|0,1,0,1)|0|0;Z=kb(fa(c+1>>0|0,1,0,1)|0|0|0,0,8)|0;Fb=D;mb=mb&255;Eb=kb(mb|0,0,16)|0;Eb=Z|Ua|Eb&2031616;Ua=kb(fa(c+3>>0|0,1,0,1)|0|0|0,0,8)|0;Z=D;la=kb(fa(c+4>>0|0,1,0,1)|0|0|0,0,16)|0;Z=Z|D;r=fa(c+5>>0|0,1,0,1)|0|0;zc=kb(r|0,0,24)|0;Z=jb(Ua|mb|la|zc|0,Z|D|0,5)|0;Z=Z&2097151;zc=fa(c+7>>0|0,1,0,0)|0|0;la=kb(fa(c+6>>0|0,1,0,1)|0|0|0,0,8)|0;mb=D;zc=zc&255;Ua=kb(zc|0,0,16)|0;mb=jb(la|r|Ua|0,mb|D|0,2)|0;mb=mb&2097151;Ua=kb(fa(c+8>>0|0,1,0,1)|0|0|0,0,8)|0;r=D;la=kb(fa(c+9>>0|0,1,0,1)|0|0|0,0,16)|0;r=r|D;t=fa(c+10>>0|0,1,0,1)|0|0;X=kb(t|0,0,24)|0;r=jb(Ua|zc|la|X|0,r|D|0,7)|0;r=r&2097151;X=kb(fa(c+11>>0|0,1,0,1)|0|0|0,0,8)|0;la=D;zc=kb(fa(c+12>>0|0,1,0,1)|0|0|0,0,16)|0;la=la|D;Ua=fa(c+13>>0|0,1,0,1)|0|0;Bc=kb(Ua|0,0,24)|0;la=jb(X|t|zc|Bc|0,la|D|0,4)|0;la=la&2097151;Bc=fa(c+15>>0|0,1,0,0)|0|0;zc=kb(fa(c+14>>0|0,1,0,1)|0|0|0,0,8)|0;t=D;Bc=Bc&255;X=kb(Bc|0,0,16)|0;t=jb(zc|Ua|X|0,t|D|0,1)|0;t=t&2097151;X=kb(fa(c+16>>0|0,1,0,1)|0|0|0,0,8)|0;Ua=D;zc=kb(fa(c+17>>0|0,1,0,1)|0|0|0,0,16)|0;Ua=Ua|D;F=fa(c+18>>0|0,1,0,1)|0|0;A=kb(F|0,0,24)|0;Ua=jb(X|Bc|zc|A|0,Ua|D|0,6)|0;Ua=Ua&2097151;A=fa(c+20>>0|0,1,0,0)|0|0;zc=kb(fa(c+19>>0|0,1,0,1)|0|0|0,0,8)|0;Bc=D;A=kb(A&255|0,0,16)|0;Bc=jb(zc|F|A|0,Bc|D|0,3)|0;A=D;F=fa(c+23>>0|0,1,0,0)|0|0;zc=fa(c+21>>0|0,1,0,1)|0|0;X=kb(fa(c+22>>0|0,1,0,1)|0|0|0,0,8)|0;ob=D;F=F&255;za=kb(F|0,0,16)|0;za=X|zc|za&2031616;zc=kb(fa(c+24>>0|0,1,0,1)|0|0|0,0,8)|0;X=D;Ia=kb(fa(c+25>>0|0,1,0,1)|0|0|0,0,16)|0;X=X|D;Fa=fa(c+26>>0|0,1,0,1)|0|0;qa=kb(Fa|0,0,24)|0;X=jb(zc|F|Ia|qa|0,X|D|0,5)|0;X=X&2097151;qa=fa(c+28>>0|0,1,0,0)|0|0;Ia=kb(fa(c+27>>0|0,1,0,1)|0|0|0,0,8)|0;F=D;qa=qa&255;zc=kb(qa|0,0,16)|0;F=jb(Ia|Fa|zc|0,F|D|0,2)|0;F=F&2097151;zc=kb(fa(c+29>>0|0,1,0,1)|0|0|0,0,8)|0;Fa=D;Ia=kb(fa(c+30>>0|0,1,0,1)|0|0|0,0,16)|0;Fa=Fa|D;ha=kb(fa(c+31>>0|0,1,0,1)|0|0|0,0,24)|0;Fa=jb(zc|qa|Ia|ha|0,Fa|D|0,7)|0;ha=D;Ia=fa(d+2>>0|0,1,0,0)|0|0;qa=fa(d>>0|0,1,0,1)|0|0;zc=kb(fa(d+1>>0|0,1,0,1)|0|0|0,0,8)|0;W=D;Ia=Ia&255;ua=kb(Ia|0,0,16)|0;L=kb(fa(d+3>>0|0,1,0,1)|0|0|0,0,8)|0;Ba=D;wa=kb(fa(d+4>>0|0,1,0,1)|0|0|0,0,16)|0;Ba=Ba|D;pb=fa(d+5>>0|0,1,0,1)|0|0;H=kb(pb|0,0,24)|0;Ba=jb(L|Ia|wa|H|0,Ba|D|0,5)|0;H=fa(d+7>>0|0,1,0,0)|0|0;wa=kb(fa(d+6>>0|0,1,0,1)|0|0|0,0,8)|0;Ia=D;H=H&255;L=kb(H|0,0,16)|0;Ia=jb(wa|pb|L|0,Ia|D|0,2)|0;L=kb(fa(d+8>>0|0,1,0,1)|0|0|0,0,8)|0;pb=D;wa=kb(fa(d+9>>0|0,1,0,1)|0|0|0,0,16)|0;pb=pb|D;R=fa(d+10>>0|0,1,0,1)|0|0;Ib=kb(R|0,0,24)|0;pb=jb(L|H|wa|Ib|0,pb|D|0,7)|0;Ib=kb(fa(d+11>>0|0,1,0,1)|0|0|0,0,8)|0;wa=D;H=kb(fa(d+12>>0|0,1,0,1)|0|0|0,0,16)|0;wa=wa|D;L=fa(d+13>>0|0,1,0,1)|0|0;M=kb(L|0,0,24)|0;wa=jb(Ib|R|H|M|0,wa|D|0,4)|0;M=fa(d+15>>0|0,1,0,0)|0|0;H=kb(fa(d+14>>0|0,1,0,1)|0|0|0,0,8)|0;R=D;M=M&255;Ib=kb(M|0,0,16)|0;R=jb(H|L|Ib|0,R|D|0,1)|0;Ib=kb(fa(d+16>>0|0,1,0,1)|0|0|0,0,8)|0;L=D;H=kb(fa(d+17>>0|0,1,0,1)|0|0|0,0,16)|0;L=L|D;sa=fa(d+18>>0|0,1,0,1)|0|0;B=kb(sa|0,0,24)|0;L=jb(Ib|M|H|B|0,L|D|0,6)|0;B=fa(d+20>>0|0,1,0,0)|0|0;H=kb(fa(d+19>>0|0,1,0,1)|0|0|0,0,8)|0;M=D;B=kb(B&255|0,0,16)|0;M=jb(H|sa|B|0,M|D|0,3)|0;B=D;sa=fa(d+23>>0|0,1,0,0)|0|0;H=fa(d+21>>0|0,1,0,1)|0|0;Ib=kb(fa(d+22>>0|0,1,0,1)|0|0|0,0,8)|0;$a=D;sa=sa&255;Ca=kb(sa|0,0,16)|0;va=kb(fa(d+24>>0|0,1,0,1)|0|0|0,0,8)|0;G=D;Ea=kb(fa(d+25>>0|0,1,0,1)|0|0|0,0,16)|0;G=G|D;yb=fa(d+26>>0|0,1,0,1)|0|0;Ja=kb(yb|0,0,24)|0;G=jb(va|sa|Ea|Ja|0,G|D|0,5)|0;Ja=fa(d+28>>0|0,1,0,0)|0|0;Ea=kb(fa(d+27>>0|0,1,0,1)|0|0|0,0,8)|0;sa=D;Ja=Ja&255;va=kb(Ja|0,0,16)|0;sa=jb(Ea|yb|va|0,sa|D|0,2)|0;va=kb(fa(d+29>>0|0,1,0,1)|0|0|0,0,8)|0;yb=D;Ea=kb(fa(d+30>>0|0,1,0,1)|0|0|0,0,16)|0;yb=yb|D;d=kb(fa(d+31>>0|0,1,0,1)|0|0|0,0,24)|0;yb=jb(va|Ja|Ea|d|0,yb|D|0,7)|0;d=D;Ea=sb(Eb|0,Fb|0,_|0,zb|0)|0;Ea=gb(zc|qa|ua&2031616|0,W|0,Ea|0,D|0)|0;W=D;ua=sb(Z|0,0,_|0,zb|0)|0;qa=D;zc=sb(Eb|0,Fb|0,Ab|0,0)|0;zc=hb(ua|0,qa|0,zc|0,D|0)|0;qa=D;ua=sb(mb|0,0,_|0,zb|0)|0;Ja=D;va=sb(Z|0,0,Ab|0,0)|0;uc=D;ma=sb(Eb|0,Fb|0,q|0,0)|0;ma=hb(va|0,uc|0,ma|0,D|0)|0;Ja=hb(ma|0,D|0,ua|0,Ja|0)|0;Ja=gb(Ia&2097151|0,0,Ja|0,D|0)|0;Ia=D;ua=sb(r|0,0,_|0,zb|0)|0;ma=D;uc=sb(mb|0,0,Ab|0,0)|0;va=D;yc=sb(Z|0,0,q|0,0)|0;xc=D;wc=sb(Eb|0,Fb|0,u|0,0)|0;vc=D;La=sb(la|0,0,_|0,zb|0)|0;xa=D;lc=sb(r|0,0,Ab|0,0)|0;Q=D;nc=sb(mb|0,0,q|0,0)|0;Ka=D;oc=sb(Z|0,0,u|0,0)|0;pc=D;mc=sb(Eb|0,Fb|0,o|0,0)|0;mc=hb(oc|0,pc|0,mc|0,D|0)|0;Ka=hb(mc|0,D|0,nc|0,Ka|0)|0;Q=hb(Ka|0,D|0,lc|0,Q|0)|0;xa=hb(Q|0,D|0,La|0,xa|0)|0;xa=gb(wa&2097151|0,0,xa|0,D|0)|0;wa=D;La=sb(t|0,0,_|0,zb|0)|0;Q=D;lc=sb(la|0,0,Ab|0,0)|0;Ka=D;nc=sb(r|0,0,q|0,0)|0;mc=D;pc=sb(mb|0,0,u|0,0)|0;oc=D;tc=sb(Z|0,0,o|0,0)|0;sc=D;rc=sb(Eb|0,Fb|0,j|0,0)|0;qc=D;N=sb(Ua|0,0,_|0,zb|0)|0;K=D;_b=sb(t|0,0,Ab|0,0)|0;g=D;ac=sb(la|0,0,q|0,0)|0;Zb=D;cc=sb(r|0,0,u|0,0)|0;$b=D;ec=sb(mb|0,0,o|0,0)|0;bc=D;fc=sb(Z|0,0,j|0,0)|0;gc=D;dc=sb(Eb|0,Fb|0,Qa|0,0)|0;dc=hb(fc|0,gc|0,dc|0,D|0)|0;bc=hb(dc|0,D|0,ec|0,bc|0)|0;$b=hb(bc|0,D|0,cc|0,$b|0)|0;Zb=hb($b|0,D|0,ac|0,Zb|0)|0;g=hb(Zb|0,D|0,_b|0,g|0)|0;K=hb(g|0,D|0,N|0,K|0)|0;K=gb(L&2097151|0,0,K|0,D|0)|0;L=D;N=sb(Bc|0,A|0,_|0,zb|0)|0;g=D;_b=sb(Ua|0,0,Ab|0,0)|0;Zb=D;ac=sb(t|0,0,q|0,0)|0;$b=D;cc=sb(la|0,0,u|0,0)|0;bc=D;ec=sb(r|0,0,o|0,0)|0;dc=D;gc=sb(mb|0,0,j|0,0)|0;fc=D;kc=sb(Z|0,0,Qa|0,0)|0;jc=D;ic=sb(Eb|0,Fb|0,na|0,ya|0)|0;hc=D;Da=sb(za|0,ob|0,_|0,zb|0)|0;_a=D;Jb=sb(Bc|0,A|0,Ab|0,0)|0;Kb=D;Lb=sb(Ua|0,0,q|0,0)|0;Mb=D;Nb=sb(t|0,0,u|0,0)|0;Ob=D;Pb=sb(la|0,0,o|0,0)|0;Qb=D;Rb=sb(r|0,0,j|0,0)|0;Sb=D;Tb=sb(mb|0,0,Qa|0,0)|0;Ub=D;Wb=sb(Z|0,0,na|0,ya|0)|0;Xb=D;Yb=sb(Eb|0,Fb|0,Na|0,qb|0)|0;Yb=hb(Wb|0,Xb|0,Yb|0,D|0)|0;Ub=hb(Yb|0,D|0,Tb|0,Ub|0)|0;Sb=hb(Ub|0,D|0,Rb|0,Sb|0)|0;Qb=hb(Sb|0,D|0,Pb|0,Qb|0)|0;Ob=hb(Qb|0,D|0,Nb|0,Ob|0)|0;Mb=hb(Ob|0,D|0,Lb|0,Mb|0)|0;Kb=hb(Mb|0,D|0,Jb|0,Kb|0)|0;_a=hb(Kb|0,D|0,Da|0,_a|0)|0;_a=gb(Ib|H|Ca&2031616|0,$a|0,_a|0,D|0)|0;$a=D;Ca=sb(X|0,0,_|0,zb|0)|0;H=D;Ib=sb(za|0,ob|0,Ab|0,0)|0;Da=D;Kb=sb(Bc|0,A|0,q|0,0)|0;Jb=D;Mb=sb(Ua|0,0,u|0,0)|0;Lb=D;Ob=sb(t|0,0,o|0,0)|0;Nb=D;Qb=sb(la|0,0,j|0,0)|0;Pb=D;Sb=sb(r|0,0,Qa|0,0)|0;Rb=D;Ub=sb(mb|0,0,na|0,ya|0)|0;Tb=D;Yb=sb(Z|0,0,Na|0,qb|0)|0;Xb=D;Wb=sb(Eb|0,Fb|0,w|0,0)|0;Vb=D;Ya=sb(F|0,0,_|0,zb|0)|0;ta=D;pa=sb(X|0,0,Ab|0,0)|0;Za=D;rb=sb(za|0,ob|0,q|0,0)|0;oa=D;ea=sb(Bc|0,A|0,u|0,0)|0;tb=D;Sa=sb(Ua|0,0,o|0,0)|0;l=D;eb=sb(t|0,0,j|0,0)|0;Ta=D;ca=sb(la|0,0,Qa|0,0)|0;ib=D;Wa=sb(r|0,0,na|0,ya|0)|0;da=D;aa=sb(mb|0,0,Na|0,qb|0)|0;Xa=D;Gb=sb(Z|0,0,w|0,0)|0;Hb=D;c=sb(Eb|0,Fb|0,Ga|0,0)|0;c=hb(Gb|0,Hb|0,c|0,D|0)|0;Xa=hb(c|0,D|0,aa|0,Xa|0)|0;da=hb(Xa|0,D|0,Wa|0,da|0)|0;ib=hb(da|0,D|0,ca|0,ib|0)|0;Ta=hb(ib|0,D|0,eb|0,Ta|0)|0;l=hb(Ta|0,D|0,Sa|0,l|0)|0;tb=hb(l|0,D|0,ea|0,tb|0)|0;oa=hb(tb|0,D|0,rb|0,oa|0)|0;Za=hb(oa|0,D|0,pa|0,Za|0)|0;ta=hb(Za|0,D|0,Ya|0,ta|0)|0;ta=gb(sa&2097151|0,0,ta|0,D|0)|0;sa=D;zb=sb(Fa|0,ha|0,_|0,zb|0)|0;_=D;Ya=sb(F|0,0,Ab|0,0)|0;Za=D;pa=sb(X|0,0,q|0,0)|0;oa=D;rb=sb(za|0,ob|0,u|0,0)|0;tb=D;ea=sb(Bc|0,A|0,o|0,0)|0;l=D;Sa=sb(Ua|0,0,j|0,0)|0;Ta=D;eb=sb(t|0,0,Qa|0,0)|0;ib=D;ca=sb(la|0,0,na|0,ya|0)|0;da=D;Wa=sb(r|0,0,Na|0,qb|0)|0;Xa=D;aa=sb(mb|0,0,w|0,0)|0;c=D;Hb=sb(Z|0,0,Ga|0,0)|0;Gb=D;Fb=sb(Eb|0,Fb|0,x|0,Ha|0)|0;Eb=D;Ab=sb(Fa|0,ha|0,Ab|0,0)|0;Bb=D;cb=sb(F|0,0,q|0,0)|0;v=D;ja=sb(X|0,0,u|0,0)|0;db=D;Cb=sb(za|0,ob|0,o|0,0)|0;nb=D;f=sb(Bc|0,A|0,j|0,0)|0;Db=D;vb=sb(Ua|0,0,Qa|0,0)|0;h=D;Ra=sb(t|0,0,na|0,ya|0)|0;ub=D;Pa=sb(la|0,0,Na|0,qb|0)|0;ia=D;Y=sb(r|0,0,w|0,0)|0;Oa=D;y=sb(mb|0,0,Ga|0,0)|0;lb=D;Z=sb(Z|0,0,x|0,Ha|0)|0;Z=hb(y|0,lb|0,Z|0,D|0)|0;Oa=hb(Z|0,D|0,Y|0,Oa|0)|0;ia=hb(Oa|0,D|0,Pa|0,ia|0)|0;ub=hb(ia|0,D|0,Ra|0,ub|0)|0;h=hb(ub|0,D|0,vb|0,h|0)|0;Db=hb(h|0,D|0,f|0,Db|0)|0;nb=hb(Db|0,D|0,Cb|0,nb|0)|0;db=hb(nb|0,D|0,ja|0,db|0)|0;v=hb(db|0,D|0,cb|0,v|0)|0;Bb=hb(v|0,D|0,Ab|0,Bb|0)|0;Ab=D;q=sb(Fa|0,ha|0,q|0,0)|0;v=D;cb=sb(F|0,0,u|0,0)|0;db=D;ja=sb(X|0,0,o|0,0)|0;nb=D;Cb=sb(za|0,ob|0,j|0,0)|0;Db=D;f=sb(Bc|0,A|0,Qa|0,0)|0;h=D;vb=sb(Ua|0,0,na|0,ya|0)|0;ub=D;Ra=sb(t|0,0,Na|0,qb|0)|0;ia=D;Pa=sb(la|0,0,w|0,0)|0;Oa=D;Y=sb(r|0,0,Ga|0,0)|0;Z=D;mb=sb(mb|0,0,x|0,Ha|0)|0;lb=D;u=sb(Fa|0,ha|0,u|0,0)|0;y=D;ab=sb(F|0,0,o|0,0)|0;I=D;n=sb(X|0,0,j|0,0)|0;bb=D;ba=sb(za|0,ob|0,Qa|0,0)|0;$=D;V=sb(Bc|0,A|0,na|0,ya|0)|0;s=D;J=sb(Ua|0,0,Na|0,qb|0)|0;U=D;z=sb(t|0,0,w|0,0)|0;C=D;b=sb(la|0,0,Ga|0,0)|0;p=D;r=sb(r|0,0,x|0,Ha|0)|0;r=hb(b|0,p|0,r|0,D|0)|0;C=hb(r|0,D|0,z|0,C|0)|0;U=hb(C|0,D|0,J|0,U|0)|0;s=hb(U|0,D|0,V|0,s|0)|0;$=hb(s|0,D|0,ba|0,$|0)|0;bb=hb($|0,D|0,n|0,bb|0)|0;I=hb(bb|0,D|0,ab|0,I|0)|0;y=hb(I|0,D|0,u|0,y|0)|0;u=D;o=sb(Fa|0,ha|0,o|0,0)|0;I=D;ab=sb(F|0,0,j|0,0)|0;bb=D;n=sb(X|0,0,Qa|0,0)|0;$=D;ba=sb(za|0,ob|0,na|0,ya|0)|0;s=D;V=sb(Bc|0,A|0,Na|0,qb|0)|0;U=D;J=sb(Ua|0,0,w|0,0)|0;C=D;z=sb(t|0,0,Ga|0,0)|0;r=D;la=sb(la|0,0,x|0,Ha|0)|0;p=D;b=sb(Fa|0,ha|0,j|0,0)|0;j=D;xb=sb(F|0,0,Qa|0,0)|0;ka=D;P=sb(X|0,0,na|0,ya|0)|0;wb=D;m=sb(za|0,ob|0,Na|0,qb|0)|0;O=D;E=sb(Bc|0,A|0,w|0,0)|0;k=D;ra=sb(Ua|0,0,Ga|0,0)|0;Va=D;t=sb(t|0,0,x|0,Ha|0)|0;t=hb(ra|0,Va|0,t|0,D|0)|0;k=hb(t|0,D|0,E|0,k|0)|0;O=hb(k|0,D|0,m|0,O|0)|0;wb=hb(O|0,D|0,P|0,wb|0)|0;ka=hb(wb|0,D|0,xb|0,ka|0)|0;j=hb(ka|0,D|0,b|0,j|0)|0;b=D;Qa=sb(Fa|0,ha|0,Qa|0,0)|0;ka=D;xb=sb(F|0,0,na|0,ya|0)|0;wb=D;P=sb(X|0,0,Na|0,qb|0)|0;O=D;m=sb(za|0,ob|0,w|0,0)|0;k=D;E=sb(Bc|0,A|0,Ga|0,0)|0;t=D;Ua=sb(Ua|0,0,x|0,Ha|0)|0;Va=D;ya=sb(Fa|0,ha|0,na|0,ya|0)|0;na=D;ra=sb(F|0,0,Na|0,qb|0)|0;Aa=D;S=sb(X|0,0,w|0,0)|0;T=D;Ma=sb(za|0,ob|0,Ga|0,0)|0;Ac=D;A=sb(Bc|0,A|0,x|0,Ha|0)|0;A=hb(Ma|0,Ac|0,A|0,D|0)|0;T=hb(A|0,D|0,S|0,T|0)|0;Aa=hb(T|0,D|0,ra|0,Aa|0)|0;na=hb(Aa|0,D|0,ya|0,na|0)|0;ya=D;qb=sb(Fa|0,ha|0,Na|0,qb|0)|0;Na=D;Aa=sb(F|0,0,w|0,0)|0;ra=D;T=sb(X|0,0,Ga|0,0)|0;S=D;ob=sb(za|0,ob|0,x|0,Ha|0)|0;za=D;w=sb(Fa|0,ha|0,w|0,0)|0;A=D;Ac=sb(F|0,0,Ga|0,0)|0;Ma=D;X=sb(X|0,0,x|0,Ha|0)|0;X=hb(Ac|0,Ma|0,X|0,D|0)|0;A=hb(X|0,D|0,w|0,A|0)|0;w=D;Ga=sb(Fa|0,ha|0,Ga|0,0)|0;X=D;F=sb(F|0,0,x|0,Ha|0)|0;Ma=D;Ha=gb(0,0,x|0,Ha|0)|0;Ha=sb(Fa|0,ha|0,Ha|0,D|0)|0;ha=D;Fa=hb(Ea|0,W|0,1048576,0)|0;Fa=fb(Fa|0,D|0,21)|0;x=D;qa=gb(Fa|0,x|0,zc|0,qa|0)|0;Ba=hb(qa|0,D|0,Ba&2097151|0,0)|0;qa=D;x=kb(Fa|0,x|0,21)|0;x=gb(Ea|0,W|0,x|0,D|0)|0;W=D;Ea=hb(Ja|0,Ia|0,1048576,0)|0;Ea=fb(Ea|0,D|0,21)|0;Fa=D;vc=hb(yc|0,xc|0,wc|0,vc|0)|0;va=hb(vc|0,D|0,uc|0,va|0)|0;ma=hb(va|0,D|0,ua|0,ma|0)|0;ma=gb(Ea|0,Fa|0,ma|0,D|0)|0;pb=hb(ma|0,D|0,pb&2097151|0,0)|0;ma=D;Fa=kb(Ea|0,Fa|0,21)|0;Ea=D;ua=hb(xa|0,wa|0,1048576,0)|0;ua=fb(ua|0,D|0,21)|0;va=D;qc=hb(tc|0,sc|0,rc|0,qc|0)|0;oc=hb(qc|0,D|0,pc|0,oc|0)|0;mc=hb(oc|0,D|0,nc|0,mc|0)|0;Ka=hb(mc|0,D|0,lc|0,Ka|0)|0;Q=hb(Ka|0,D|0,La|0,Q|0)|0;Q=gb(R&2097151|0,0,Q|0,D|0)|0;Q=hb(Q|0,D|0,ua|0,va|0)|0;R=D;va=kb(ua|0,va|0,21)|0;ua=D;La=hb(K|0,L|0,1048576,0)|0;La=fb(La|0,D|0,21)|0;Ka=D;hc=hb(kc|0,jc|0,ic|0,hc|0)|0;fc=hb(hc|0,D|0,gc|0,fc|0)|0;dc=hb(fc|0,D|0,ec|0,dc|0)|0;bc=hb(dc|0,D|0,cc|0,bc|0)|0;$b=hb(bc|0,D|0,ac|0,$b|0)|0;Zb=hb($b|0,D|0,_b|0,Zb|0)|0;g=hb(Zb|0,D|0,N|0,g|0)|0;g=gb(M|0,B|0,g|0,D|0)|0;g=hb(g|0,D|0,La|0,Ka|0)|0;B=D;Ka=kb(La|0,Ka|0,21)|0;La=D;M=hb(_a|0,$a|0,1048576,0)|0;M=fb(M|0,D|0,21)|0;N=D;Vb=hb(Yb|0,Xb|0,Wb|0,Vb|0)|0;Tb=hb(Vb|0,D|0,Ub|0,Tb|0)|0;Rb=hb(Tb|0,D|0,Sb|0,Rb|0)|0;Pb=hb(Rb|0,D|0,Qb|0,Pb|0)|0;Nb=hb(Pb|0,D|0,Ob|0,Nb|0)|0;Lb=hb(Nb|0,D|0,Mb|0,Lb|0)|0;Jb=hb(Lb|0,D|0,Kb|0,Jb|0)|0;Da=hb(Jb|0,D|0,Ib|0,Da|0)|0;H=hb(Da|0,D|0,Ca|0,H|0)|0;H=gb(M|0,N|0,H|0,D|0)|0;G=hb(H|0,D|0,G&2097151|0,0)|0;H=D;N=kb(M|0,N|0,21)|0;M=D;Ca=hb(ta|0,sa|0,1048576,0)|0;Ca=fb(Ca|0,D|0,21)|0;Da=D;Eb=hb(Hb|0,Gb|0,Fb|0,Eb|0)|0;c=hb(Eb|0,D|0,aa|0,c|0)|0;Xa=hb(c|0,D|0,Wa|0,Xa|0)|0;da=hb(Xa|0,D|0,ca|0,da|0)|0;ib=hb(da|0,D|0,eb|0,ib|0)|0;Ta=hb(ib|0,D|0,Sa|0,Ta|0)|0;l=hb(Ta|0,D|0,ea|0,l|0)|0;tb=hb(l|0,D|0,rb|0,tb|0)|0;oa=hb(tb|0,D|0,pa|0,oa|0)|0;Za=hb(oa|0,D|0,Ya|0,Za|0)|0;_=hb(Za|0,D|0,zb|0,_|0)|0;_=gb(yb|0,d|0,_|0,D|0)|0;_=hb(_|0,D|0,Ca|0,Da|0)|0;d=D;Da=kb(Ca|0,Da|0,21)|0;Ca=D;yb=gb(1048576,0,Bb|0,Ab|0)|0;yb=fb(yb|0,D|0,21)|0;zb=D;lb=hb(Y|0,Z|0,mb|0,lb|0)|0;Oa=hb(lb|0,D|0,Pa|0,Oa|0)|0;ia=hb(Oa|0,D|0,Ra|0,ia|0)|0;ub=hb(ia|0,D|0,vb|0,ub|0)|0;h=hb(ub|0,D|0,f|0,h|0)|0;Db=hb(h|0,D|0,Cb|0,Db|0)|0;nb=hb(Db|0,D|0,ja|0,nb|0)|0;db=hb(nb|0,D|0,cb|0,db|0)|0;v=hb(db|0,D|0,q|0,v|0)|0;v=gb(yb|0,zb|0,v|0,D|0)|0;q=D;zb=kb(yb|0,zb|0,21)|0;yb=D;db=gb(1048576,0,y|0,u|0)|0;db=fb(db|0,D|0,21)|0;cb=D;p=hb(z|0,r|0,la|0,p|0)|0;C=hb(p|0,D|0,J|0,C|0)|0;U=hb(C|0,D|0,V|0,U|0)|0;s=hb(U|0,D|0,ba|0,s|0)|0;$=hb(s|0,D|0,n|0,$|0)|0;bb=hb($|0,D|0,ab|0,bb|0)|0;I=hb(bb|0,D|0,o|0,I|0)|0;I=gb(db|0,cb|0,I|0,D|0)|0;o=D;cb=kb(db|0,cb|0,21)|0;db=D;bb=gb(1048576,0,j|0,b|0)|0;bb=fb(bb|0,D|0,21)|0;ab=D;Va=hb(E|0,t|0,Ua|0,Va|0)|0;k=hb(Va|0,D|0,m|0,k|0)|0;O=hb(k|0,D|0,P|0,O|0)|0;wb=hb(O|0,D|0,xb|0,wb|0)|0;ka=hb(wb|0,D|0,Qa|0,ka|0)|0;ka=gb(bb|0,ab|0,ka|0,D|0)|0;Qa=D;ab=kb(bb|0,ab|0,21)|0;bb=D;wb=gb(1048576,0,na|0,ya|0)|0;wb=fb(wb|0,D|0,21)|0;xb=D;za=hb(T|0,S|0,ob|0,za|0)|0;ra=hb(za|0,D|0,Aa|0,ra|0)|0;Na=hb(ra|0,D|0,qb|0,Na|0)|0;Na=gb(wb|0,xb|0,Na|0,D|0)|0;qb=D;xb=kb(wb|0,xb|0,21)|0;ya=hb(xb|0,D|0,na|0,ya|0)|0;na=D;xb=gb(1048576,0,A|0,w|0)|0;xb=fb(xb|0,D|0,21)|0;wb=D;Ma=hb(Ga|0,X|0,F|0,Ma|0)|0;Ma=gb(xb|0,wb|0,Ma|0,D|0)|0;F=D;wb=kb(xb|0,wb|0,21)|0;w=hb(wb|0,D|0,A|0,w|0)|0;A=D;wb=hb(Ha|0,ha|0,1048576,0)|0;wb=fb(wb|0,D|0,21)|0;xb=D;X=kb(wb|0,xb|0,21)|0;X=gb(Ha|0,ha|0,X|0,D|0)|0;ha=D;Ha=hb(Ba|0,qa|0,1048576,0)|0;Ha=fb(Ha|0,D|0,21)|0;Ga=D;ra=kb(Ha|0,Ga|0,21)|0;ra=gb(Ba|0,qa|0,ra|0,D|0)|0;qa=D;Ba=hb(pb|0,ma|0,1048576,0)|0;Ba=fb(Ba|0,D|0,21)|0;Aa=D;za=kb(Ba|0,Aa|0,21)|0;za=gb(pb|0,ma|0,za|0,D|0)|0;ma=D;pb=hb(Q|0,R|0,1048576,0)|0;pb=fb(pb|0,D|0,21)|0;ob=D;S=kb(pb|0,ob|0,21)|0;T=D;O=hb(g|0,B|0,1048576,0)|0;O=fb(O|0,D|0,21)|0;P=D;k=kb(O|0,P|0,21)|0;m=D;Va=hb(G|0,H|0,1048576,0)|0;Va=fb(Va|0,D|0,21)|0;Ua=D;t=kb(Va|0,Ua|0,21)|0;E=D;$=hb(_|0,d|0,1048576,0)|0;$=fb($|0,D|0,21)|0;n=D;s=kb($|0,n|0,21)|0;ba=D;U=hb(v|0,q|0,1048576,0)|0;U=fb(U|0,D|0,21)|0;V=D;C=kb(U|0,V|0,21)|0;J=D;p=hb(I|0,o|0,1048576,0)|0;p=fb(p|0,D|0,21)|0;la=D;r=kb(p|0,la|0,21)|0;z=D;nb=hb(ka|0,Qa|0,1048576,0)|0;nb=fb(nb|0,D|0,21)|0;ja=D;na=gb(nb|0,ja|0,ya|0,na|0)|0;ya=D;ja=kb(nb|0,ja|0,21)|0;ja=gb(ka|0,Qa|0,ja|0,D|0)|0;Qa=D;ka=hb(Na|0,qb|0,1048576,0)|0;ka=fb(ka|0,D|0,21)|0;nb=D;A=gb(ka|0,nb|0,w|0,A|0)|0;w=D;nb=kb(ka|0,nb|0,21)|0;nb=gb(Na|0,qb|0,nb|0,D|0)|0;qb=D;Na=hb(Ma|0,F|0,1048576,0)|0;Na=fb(Na|0,D|0,21)|0;ka=D;ha=hb(Na|0,ka|0,X|0,ha|0)|0;X=D;ka=kb(Na|0,ka|0,21)|0;ka=gb(Ma|0,F|0,ka|0,D|0)|0;F=D;Ma=sb(wb|0,xb|0,666643,0)|0;Na=D;Db=sb(wb|0,xb|0,470296,0)|0;Cb=D;h=sb(wb|0,xb|0,654183,0)|0;f=D;ub=sb(wb|0,xb|0,-997805,-1)|0;vb=D;ia=sb(wb|0,xb|0,136657,0)|0;Ra=D;xb=sb(wb|0,xb|0,-683901,-1)|0;b=gb(xb|0,D|0,j|0,b|0)|0;bb=gb(b|0,D|0,ab|0,bb|0)|0;la=hb(bb|0,D|0,p|0,la|0)|0;p=D;bb=sb(ha|0,X|0,666643,0)|0;ab=D;b=sb(ha|0,X|0,470296,0)|0;j=D;xb=sb(ha|0,X|0,654183,0)|0;wb=D;Oa=sb(ha|0,X|0,-997805,-1)|0;Pa=D;lb=sb(ha|0,X|0,136657,0)|0;mb=D;X=sb(ha|0,X|0,-683901,-1)|0;ha=D;Z=sb(ka|0,F|0,666643,0)|0;Y=D;Za=sb(ka|0,F|0,470296,0)|0;Ya=D;oa=sb(ka|0,F|0,654183,0)|0;pa=D;tb=sb(ka|0,F|0,-997805,-1)|0;rb=D;l=sb(ka|0,F|0,136657,0)|0;ea=D;F=sb(ka|0,F|0,-683901,-1)|0;ka=D;u=gb(ub|0,vb|0,y|0,u|0)|0;db=gb(u|0,D|0,cb|0,db|0)|0;V=hb(db|0,D|0,U|0,V|0)|0;mb=hb(V|0,D|0,lb|0,mb|0)|0;ka=hb(mb|0,D|0,F|0,ka|0)|0;F=D;mb=sb(A|0,w|0,666643,0)|0;lb=D;V=sb(A|0,w|0,470296,0)|0;U=D;db=sb(A|0,w|0,654183,0)|0;cb=D;u=sb(A|0,w|0,-997805,-1)|0;y=D;vb=sb(A|0,w|0,136657,0)|0;ub=D;w=sb(A|0,w|0,-683901,-1)|0;A=D;Ta=sb(nb|0,qb|0,666643,0)|0;Sa=D;ib=sb(nb|0,qb|0,470296,0)|0;eb=D;da=sb(nb|0,qb|0,654183,0)|0;ca=D;Xa=sb(nb|0,qb|0,-997805,-1)|0;Wa=D;c=sb(nb|0,qb|0,136657,0)|0;aa=D;qb=sb(nb|0,qb|0,-683901,-1)|0;nb=D;Ab=gb(Db|0,Cb|0,Bb|0,Ab|0)|0;yb=gb(Ab|0,D|0,zb|0,yb|0)|0;wb=hb(yb|0,D|0,xb|0,wb|0)|0;ub=hb(wb|0,D|0,vb|0,ub|0)|0;rb=hb(ub|0,D|0,tb|0,rb|0)|0;nb=hb(rb|0,D|0,qb|0,nb|0)|0;n=hb(nb|0,D|0,$|0,n|0)|0;$=D;nb=sb(na|0,ya|0,666643,0)|0;nb=hb(pb|0,ob|0,nb|0,D|0)|0;L=hb(nb|0,D|0,K|0,L|0)|0;La=gb(L|0,D|0,Ka|0,La|0)|0;Ka=D;L=sb(na|0,ya|0,470296,0)|0;K=D;nb=sb(na|0,ya|0,654183,0)|0;lb=hb(nb|0,D|0,mb|0,lb|0)|0;eb=hb(lb|0,D|0,ib|0,eb|0)|0;$a=hb(eb|0,D|0,_a|0,$a|0)|0;P=hb($a|0,D|0,O|0,P|0)|0;M=gb(P|0,D|0,N|0,M|0)|0;N=D;P=sb(na|0,ya|0,-997805,-1)|0;O=D;$a=sb(na|0,ya|0,136657,0)|0;_a=D;ab=hb(db|0,cb|0,bb|0,ab|0)|0;_a=hb(ab|0,D|0,$a|0,_a|0)|0;Ya=hb(_a|0,D|0,Za|0,Ya|0)|0;Wa=hb(Ya|0,D|0,Xa|0,Wa|0)|0;Ua=hb(Wa|0,D|0,Va|0,Ua|0)|0;sa=hb(Ua|0,D|0,ta|0,sa|0)|0;Ca=gb(sa|0,D|0,Da|0,Ca|0)|0;Da=D;ya=sb(na|0,ya|0,-683901,-1)|0;na=D;sa=hb(La|0,Ka|0,1048576,0)|0;sa=fb(sa|0,D|0,21)|0;ta=D;K=hb(Ta|0,Sa|0,L|0,K|0)|0;B=hb(K|0,D|0,g|0,B|0)|0;m=gb(B|0,D|0,k|0,m|0)|0;m=hb(m|0,D|0,sa|0,ta|0)|0;k=D;ta=kb(sa|0,ta|0,21)|0;sa=D;B=hb(M|0,N|0,1048576,0)|0;B=fb(B|0,D|0,21)|0;g=D;U=hb(P|0,O|0,V|0,U|0)|0;Y=hb(U|0,D|0,Z|0,Y|0)|0;ca=hb(Y|0,D|0,da|0,ca|0)|0;H=hb(ca|0,D|0,G|0,H|0)|0;H=hb(H|0,D|0,B|0,g|0)|0;E=gb(H|0,D|0,t|0,E|0)|0;t=D;g=kb(B|0,g|0,21)|0;B=D;H=hb(Ca|0,Da|0,1048576,0)|0;H=fb(H|0,D|0,21)|0;G=D;Na=hb(b|0,j|0,Ma|0,Na|0)|0;y=hb(Na|0,D|0,u|0,y|0)|0;na=hb(y|0,D|0,ya|0,na|0)|0;pa=hb(na|0,D|0,oa|0,pa|0)|0;aa=hb(pa|0,D|0,c|0,aa|0)|0;d=hb(aa|0,D|0,_|0,d|0)|0;d=hb(d|0,D|0,H|0,G|0)|0;ba=gb(d|0,D|0,s|0,ba|0)|0;s=D;G=kb(H|0,G|0,21)|0;H=D;d=hb(n|0,$|0,1048576,0)|0;d=fb(d|0,D|0,21)|0;_=D;f=hb(v|0,q|0,h|0,f|0)|0;J=gb(f|0,D|0,C|0,J|0)|0;Pa=hb(J|0,D|0,Oa|0,Pa|0)|0;A=hb(Pa|0,D|0,w|0,A|0)|0;ea=hb(A|0,D|0,l|0,ea|0)|0;ea=hb(ea|0,D|0,d|0,_|0)|0;l=D;_=kb(d|0,_|0,21)|0;_=gb(n|0,$|0,_|0,D|0)|0;$=D;n=hb(ka|0,F|0,1048576,0)|0;n=fb(n|0,D|0,21)|0;d=D;Ra=hb(I|0,o|0,ia|0,Ra|0)|0;z=gb(Ra|0,D|0,r|0,z|0)|0;ha=hb(z|0,D|0,X|0,ha|0)|0;ha=hb(ha|0,D|0,n|0,d|0)|0;X=D;d=kb(n|0,d|0,21)|0;d=gb(ka|0,F|0,d|0,D|0)|0;F=D;ka=hb(la|0,p|0,1048576,0)|0;ka=fb(ka|0,D|0,21)|0;n=D;Qa=hb(ka|0,n|0,ja|0,Qa|0)|0;ja=D;n=kb(ka|0,n|0,21)|0;n=gb(la|0,p|0,n|0,D|0)|0;p=D;la=hb(m|0,k|0,1048576,0)|0;la=fb(la|0,D|0,21)|0;ka=D;z=kb(la|0,ka|0,21)|0;r=D;Ra=hb(E|0,t|0,1048576,0)|0;Ra=fb(Ra|0,D|0,21)|0;ia=D;o=kb(Ra|0,ia|0,21)|0;I=D;A=hb(ba|0,s|0,1048576,0)|0;A=fb(A|0,D|0,21)|0;w=D;$=hb(_|0,$|0,A|0,w|0)|0;_=D;w=kb(A|0,w|0,21)|0;w=gb(ba|0,s|0,w|0,D|0)|0;s=D;ba=hb(ea|0,l|0,1048576,0)|0;ba=fb(ba|0,D|0,21)|0;A=D;F=hb(ba|0,A|0,d|0,F|0)|0;d=D;A=kb(ba|0,A|0,21)|0;A=gb(ea|0,l|0,A|0,D|0)|0;l=D;ea=hb(ha|0,X|0,1048576,0)|0;ea=fb(ea|0,D|0,21)|0;ba=D;p=hb(ea|0,ba|0,n|0,p|0)|0;n=D;ba=kb(ea|0,ba|0,21)|0;ba=gb(ha|0,X|0,ba|0,D|0)|0;X=D;ha=sb(Qa|0,ja|0,666643,0)|0;ea=D;Pa=sb(Qa|0,ja|0,470296,0)|0;Oa=D;J=sb(Qa|0,ja|0,654183,0)|0;C=D;f=sb(Qa|0,ja|0,-997805,-1)|0;h=D;q=sb(Qa|0,ja|0,136657,0)|0;v=D;ja=sb(Qa|0,ja|0,-683901,-1)|0;ja=hb(Ra|0,ia|0,ja|0,D|0)|0;Da=hb(ja|0,D|0,Ca|0,Da|0)|0;H=gb(Da|0,D|0,G|0,H|0)|0;G=D;Da=sb(p|0,n|0,666643,0)|0;Ca=D;ja=sb(p|0,n|0,470296,0)|0;ia=D;Ra=sb(p|0,n|0,654183,0)|0;Qa=D;aa=sb(p|0,n|0,-997805,-1)|0;c=D;pa=sb(p|0,n|0,136657,0)|0;oa=D;n=sb(p|0,n|0,-683901,-1)|0;p=D;na=sb(ba|0,X|0,666643,0)|0;na=hb(za|0,ma|0,na|0,D|0)|0;ma=D;za=sb(ba|0,X|0,470296,0)|0;ya=D;y=sb(ba|0,X|0,654183,0)|0;u=D;Na=sb(ba|0,X|0,-997805,-1)|0;Ma=D;j=sb(ba|0,X|0,136657,0)|0;b=D;X=sb(ba|0,X|0,-683901,-1)|0;ba=D;h=hb(pa|0,oa|0,f|0,h|0)|0;ba=hb(h|0,D|0,X|0,ba|0)|0;N=hb(ba|0,D|0,M|0,N|0)|0;ka=hb(N|0,D|0,la|0,ka|0)|0;B=gb(ka|0,D|0,g|0,B|0)|0;g=D;ka=sb(F|0,d|0,666643,0)|0;la=D;N=sb(F|0,d|0,470296,0)|0;M=D;ba=sb(F|0,d|0,654183,0)|0;X=D;h=sb(F|0,d|0,-997805,-1)|0;f=D;oa=sb(F|0,d|0,136657,0)|0;pa=D;d=sb(F|0,d|0,-683901,-1)|0;F=D;ca=sb(A|0,l|0,666643,0)|0;da=D;Y=sb(A|0,l|0,470296,0)|0;Z=D;U=sb(A|0,l|0,654183,0)|0;V=D;O=sb(A|0,l|0,-997805,-1)|0;P=D;K=sb(A|0,l|0,136657,0)|0;L=D;l=sb(A|0,l|0,-683901,-1)|0;A=D;Oa=hb(Ra|0,Qa|0,Pa|0,Oa|0)|0;Ma=hb(Oa|0,D|0,Na|0,Ma|0)|0;Ka=hb(Ma|0,D|0,La|0,Ka|0)|0;sa=gb(Ka|0,D|0,ta|0,sa|0)|0;pa=hb(sa|0,D|0,oa|0,pa|0)|0;A=hb(pa|0,D|0,l|0,A|0)|0;l=D;pa=sb($|0,_|0,666643,0)|0;W=hb(pa|0,D|0,x|0,W|0)|0;x=D;pa=sb($|0,_|0,470296,0)|0;oa=D;sa=sb($|0,_|0,654183,0)|0;ta=D;Ga=hb(Ja|0,Ia|0,Ha|0,Ga|0)|0;Ea=gb(Ga|0,D|0,Fa|0,Ea|0)|0;ta=hb(Ea|0,D|0,sa|0,ta|0)|0;la=hb(ta|0,D|0,ka|0,la|0)|0;Z=hb(la|0,D|0,Y|0,Z|0)|0;Y=D;la=sb($|0,_|0,-997805,-1)|0;ka=D;ta=sb($|0,_|0,136657,0)|0;sa=D;Aa=hb(Da|0,Ca|0,Ba|0,Aa|0)|0;ya=hb(Aa|0,D|0,za|0,ya|0)|0;wa=hb(ya|0,D|0,xa|0,wa|0)|0;ua=gb(wa|0,D|0,va|0,ua|0)|0;sa=hb(ua|0,D|0,ta|0,sa|0)|0;X=hb(sa|0,D|0,ba|0,X|0)|0;P=hb(X|0,D|0,O|0,P|0)|0;O=D;_=sb($|0,_|0,-683901,-1)|0;$=D;X=hb(W|0,x|0,1048576,0)|0;X=fb(X|0,D|0,21)|0;ba=D;oa=hb(ra|0,qa|0,pa|0,oa|0)|0;da=hb(oa|0,D|0,ca|0,da|0)|0;da=hb(da|0,D|0,X|0,ba|0)|0;ca=D;ba=kb(X|0,ba|0,21)|0;ba=gb(W|0,x|0,ba|0,D|0)|0;x=D;W=hb(Z|0,Y|0,1048576,0)|0;W=fb(W|0,D|0,21)|0;X=D;ka=hb(na|0,ma|0,la|0,ka|0)|0;M=hb(ka|0,D|0,N|0,M|0)|0;V=hb(M|0,D|0,U|0,V|0)|0;V=hb(V|0,D|0,W|0,X|0)|0;U=D;X=kb(W|0,X|0,21)|0;W=D;M=hb(P|0,O|0,1048576,0)|0;M=fb(M|0,D|0,21)|0;N=D;ea=hb(ja|0,ia|0,ha|0,ea|0)|0;u=hb(ea|0,D|0,y|0,u|0)|0;R=hb(u|0,D|0,Q|0,R|0)|0;T=gb(R|0,D|0,S|0,T|0)|0;$=hb(T|0,D|0,_|0,$|0)|0;f=hb($|0,D|0,h|0,f|0)|0;L=hb(f|0,D|0,K|0,L|0)|0;L=hb(L|0,D|0,M|0,N|0)|0;K=D;N=kb(M|0,N|0,21)|0;M=D;f=hb(A|0,l|0,1048576,0)|0;f=fb(f|0,D|0,21)|0;h=D;C=hb(aa|0,c|0,J|0,C|0)|0;b=hb(C|0,D|0,j|0,b|0)|0;k=hb(b|0,D|0,m|0,k|0)|0;r=gb(k|0,D|0,z|0,r|0)|0;F=hb(r|0,D|0,d|0,F|0)|0;F=hb(F|0,D|0,f|0,h|0)|0;d=D;h=kb(f|0,h|0,21)|0;h=gb(A|0,l|0,h|0,D|0)|0;l=D;A=hb(B|0,g|0,1048576,0)|0;A=fb(A|0,D|0,21)|0;f=D;v=hb(n|0,p|0,q|0,v|0)|0;t=hb(v|0,D|0,E|0,t|0)|0;t=hb(t|0,D|0,A|0,f|0)|0;I=gb(t|0,D|0,o|0,I|0)|0;o=D;f=kb(A|0,f|0,21)|0;f=gb(B|0,g|0,f|0,D|0)|0;g=D;B=hb(H|0,G|0,1048576,0)|0;B=fb(B|0,D|0,21)|0;A=D;s=hb(w|0,s|0,B|0,A|0)|0;w=D;A=kb(B|0,A|0,21)|0;B=D;t=hb(da|0,ca|0,1048576,0)|0;t=fb(t|0,D|0,21)|0;E=D;v=kb(t|0,E|0,21)|0;q=D;p=hb(V|0,U|0,1048576,0)|0;p=fb(p|0,D|0,21)|0;n=D;r=kb(p|0,n|0,21)|0;z=D;k=hb(L|0,K|0,1048576,0)|0;k=fb(k|0,D|0,21)|0;m=D;l=hb(h|0,l|0,k|0,m|0)|0;h=D;m=kb(k|0,m|0,21)|0;k=D;b=hb(F|0,d|0,1048576,0)|0;b=fb(b|0,D|0,21)|0;j=D;g=hb(f|0,g|0,b|0,j|0)|0;f=D;j=kb(b|0,j|0,21)|0;j=gb(F|0,d|0,j|0,D|0)|0;d=D;F=hb(I|0,o|0,1048576,0)|0;F=fb(F|0,D|0,21)|0;b=D;C=kb(F|0,b|0,21)|0;C=gb(I|0,o|0,C|0,D|0)|0;o=D;I=hb(s|0,w|0,1048576,0)|0;I=fb(I|0,D|0,21)|0;J=D;c=kb(I|0,J|0,21)|0;c=gb(s|0,w|0,c|0,D|0)|0;w=D;s=sb(I|0,J|0,666643,0)|0;s=hb(ba|0,x|0,s|0,D|0)|0;x=D;ba=sb(I|0,J|0,470296,0)|0;aa=D;$=sb(I|0,J|0,654183,0)|0;_=D;T=sb(I|0,J|0,-997805,-1)|0;S=D;R=sb(I|0,J|0,136657,0)|0;Q=D;J=sb(I|0,J|0,-683901,-1)|0;I=D;u=fb(s|0,x|0,21)|0;y=D;aa=hb(da|0,ca|0,ba|0,aa|0)|0;q=gb(aa|0,D|0,v|0,q|0)|0;q=hb(q|0,D|0,u|0,y|0)|0;v=D;y=kb(u|0,y|0,21)|0;y=gb(s|0,x|0,y|0,D|0)|0;x=D;s=fb(q|0,v|0,21)|0;u=D;Y=hb($|0,_|0,Z|0,Y|0)|0;W=gb(Y|0,D|0,X|0,W|0)|0;E=hb(W|0,D|0,t|0,E|0)|0;E=hb(E|0,D|0,s|0,u|0)|0;t=D;u=kb(s|0,u|0,21)|0;u=gb(q|0,v|0,u|0,D|0)|0;v=D;q=fb(E|0,t|0,21)|0;s=D;S=hb(V|0,U|0,T|0,S|0)|0;z=gb(S|0,D|0,r|0,z|0)|0;z=hb(z|0,D|0,q|0,s|0)|0;r=D;s=kb(q|0,s|0,21)|0;s=gb(E|0,t|0,s|0,D|0)|0;t=D;E=fb(z|0,r|0,21)|0;q=D;O=hb(R|0,Q|0,P|0,O|0)|0;M=gb(O|0,D|0,N|0,M|0)|0;n=hb(M|0,D|0,p|0,n|0)|0;n=hb(n|0,D|0,E|0,q|0)|0;p=D;q=kb(E|0,q|0,21)|0;q=gb(z|0,r|0,q|0,D|0)|0;r=D;z=fb(n|0,p|0,21)|0;E=D;I=hb(L|0,K|0,J|0,I|0)|0;k=gb(I|0,D|0,m|0,k|0)|0;k=hb(k|0,D|0,z|0,E|0)|0;m=D;E=kb(z|0,E|0,21)|0;E=gb(n|0,p|0,E|0,D|0)|0;p=D;n=fb(k|0,m|0,21)|0;z=D;h=hb(l|0,h|0,n|0,z|0)|0;l=D;z=kb(n|0,z|0,21)|0;z=gb(k|0,m|0,z|0,D|0)|0;m=D;k=fb(h|0,l|0,21)|0;n=D;d=hb(k|0,n|0,j|0,d|0)|0;j=D;n=kb(k|0,n|0,21)|0;n=gb(h|0,l|0,n|0,D|0)|0;l=D;h=fb(d|0,j|0,21)|0;k=D;f=hb(g|0,f|0,h|0,k|0)|0;g=D;k=kb(h|0,k|0,21)|0;k=gb(d|0,j|0,k|0,D|0)|0;j=D;d=fb(f|0,g|0,21)|0;h=D;o=hb(d|0,h|0,C|0,o|0)|0;C=D;h=kb(d|0,h|0,21)|0;h=gb(f|0,g|0,h|0,D|0)|0;g=D;f=fb(o|0,C|0,21)|0;d=D;b=hb(H|0,G|0,F|0,b|0)|0;B=gb(b|0,D|0,A|0,B|0)|0;B=hb(B|0,D|0,f|0,d|0)|0;A=D;d=kb(f|0,d|0,21)|0;d=gb(o|0,C|0,d|0,D|0)|0;C=D;o=fb(B|0,A|0,21)|0;f=D;w=hb(o|0,f|0,c|0,w|0)|0;c=D;f=kb(o|0,f|0,21)|0;f=gb(B|0,A|0,f|0,D|0)|0;A=D;B=fb(w|0,c|0,21)|0;o=D;b=kb(B|0,o|0,21)|0;b=gb(w|0,c|0,b|0,D|0)|0;c=D;w=sb(B|0,o|0,666643,0)|0;x=hb(w|0,D|0,y|0,x|0)|0;y=D;w=sb(B|0,o|0,470296,0)|0;w=hb(u|0,v|0,w|0,D|0)|0;v=D;u=sb(B|0,o|0,654183,0)|0;u=hb(s|0,t|0,u|0,D|0)|0;t=D;s=sb(B|0,o|0,-997805,-1)|0;s=hb(q|0,r|0,s|0,D|0)|0;r=D;q=sb(B|0,o|0,136657,0)|0;q=hb(E|0,p|0,q|0,D|0)|0;p=D;o=sb(B|0,o|0,-683901,-1)|0;o=hb(z|0,m|0,o|0,D|0)|0;m=D;z=fb(x|0,y|0,21)|0;B=D;v=hb(w|0,v|0,z|0,B|0)|0;w=D;B=kb(z|0,B|0,21)|0;B=gb(x|0,y|0,B|0,D|0)|0;y=D;x=fb(v|0,w|0,21)|0;z=D;t=hb(u|0,t|0,x|0,z|0)|0;u=D;z=kb(x|0,z|0,21)|0;z=gb(v|0,w|0,z|0,D|0)|0;w=D;v=fb(t|0,u|0,21)|0;x=D;r=hb(s|0,r|0,v|0,x|0)|0;s=D;x=kb(v|0,x|0,21)|0;x=gb(t|0,u|0,x|0,D|0)|0;u=D;t=fb(r|0,s|0,21)|0;v=D;p=hb(q|0,p|0,t|0,v|0)|0;q=D;v=kb(t|0,v|0,21)|0;v=gb(r|0,s|0,v|0,D|0)|0;s=D;r=fb(p|0,q|0,21)|0;t=D;m=hb(o|0,m|0,r|0,t|0)|0;o=D;t=kb(r|0,t|0,21)|0;t=gb(p|0,q|0,t|0,D|0)|0;q=D;p=fb(m|0,o|0,21)|0;r=D;l=hb(p|0,r|0,n|0,l|0)|0;n=D;r=kb(p|0,r|0,21)|0;r=gb(m|0,o|0,r|0,D|0)|0;o=D;m=fb(l|0,n|0,21)|0;p=D;j=hb(m|0,p|0,k|0,j|0)|0;k=D;p=kb(m|0,p|0,21)|0;p=gb(l|0,n|0,p|0,D|0)|0;n=D;l=fb(j|0,k|0,21)|0;m=D;g=hb(l|0,m|0,h|0,g|0)|0;h=D;m=kb(l|0,m|0,21)|0;m=gb(j|0,k|0,m|0,D|0)|0;k=D;j=fb(g|0,h|0,21)|0;l=D;C=hb(j|0,l|0,d|0,C|0)|0;d=D;l=kb(j|0,l|0,21)|0;l=gb(g|0,h|0,l|0,D|0)|0;h=D;g=fb(C|0,d|0,21)|0;j=D;A=hb(g|0,j|0,f|0,A|0)|0;f=D;j=kb(g|0,j|0,21)|0;j=gb(C|0,d|0,j|0,D|0)|0;d=D;C=fb(A|0,f|0,21)|0;g=D;c=hb(C|0,g|0,b|0,c|0)|0;b=D;g=kb(C|0,g|0,21)|0;g=gb(A|0,f|0,g|0,D|0)|0;f=D;ga(a>>0|0,B|0,1,0);A=jb(B|0,y|0,8)|0;ga(a+1>>0|0,A|0,1,0);y=jb(B|0,y|0,16)|0;B=D;A=kb(z|0,w|0,5)|0;D|B;ga(a+2>>0|0,A|y|0,1,0);y=jb(z|0,w|0,3)|0;ga(a+3>>0|0,y|0,1,0);y=jb(z|0,w|0,11)|0;ga(a+4>>0|0,y|0,1,0);w=jb(z|0,w|0,19)|0;z=D;y=kb(x|0,u|0,2)|0;D|z;ga(a+5>>0|0,y|w|0,1,0);w=jb(x|0,u|0,6)|0;ga(a+6>>0|0,w|0,1,0);u=jb(x|0,u|0,14)|0;x=D;w=kb(v|0,s|0,7)|0;D|x;ga(a+7>>0|0,w|u|0,1,0);u=jb(v|0,s|0,1)|0;ga(a+8>>0|0,u|0,1,0);u=jb(v|0,s|0,9)|0;ga(a+9>>0|0,u|0,1,0);s=jb(v|0,s|0,17)|0;v=D;u=kb(t|0,q|0,4)|0;D|v;ga(a+10>>0|0,u|s|0,1,0);s=jb(t|0,q|0,4)|0;ga(a+11>>0|0,s|0,1,0);s=jb(t|0,q|0,12)|0;ga(a+12>>0|0,s|0,1,0);q=jb(t|0,q|0,20)|0;t=D;s=kb(r|0,o|0,1)|0;D|t;ga(a+13>>0|0,s|q|0,1,0);q=jb(r|0,o|0,7)|0;ga(a+14>>0|0,q|0,1,0);o=jb(r|0,o|0,15)|0;r=D;q=kb(p|0,n|0,6)|0;D|r;ga(a+15>>0|0,q|o|0,1,0);o=jb(p|0,n|0,2)|0;ga(a+16>>0|0,o|0,1,0);o=jb(p|0,n|0,10)|0;ga(a+17>>0|0,o|0,1,0);n=jb(p|0,n|0,18)|0;p=D;o=kb(m|0,k|0,3)|0;D|p;ga(a+18>>0|0,o|n|0,1,0);n=jb(m|0,k|0,5)|0;ga(a+19>>0|0,n|0,1,0);k=jb(m|0,k|0,13)|0;ga(a+20>>0|0,k|0,1,0);ga(a+21>>0|0,l|0,1,0);k=jb(l|0,h|0,8)|0;ga(a+22>>0|0,k|0,1,0);h=jb(l|0,h|0,16)|0;l=D;k=kb(j|0,d|0,5)|0;D|l;ga(a+23>>0|0,k|h|0,1,0);h=jb(j|0,d|0,3)|0;ga(a+24>>0|0,h|0,1,0);h=jb(j|0,d|0,11)|0;ga(a+25>>0|0,h|0,1,0);d=jb(j|0,d|0,19)|0;j=D;h=kb(g|0,f|0,2)|0;D|j;ga(a+26>>0|0,h|d|0,1,0);d=jb(g|0,f|0,6)|0;ga(a+27>>0|0,d|0,1,0);f=jb(g|0,f|0,14)|0;g=D;d=kb(c|0,b|0,7)|0;g|D;ga(a+28>>0|0,f|d|0,1,0);d=jb(c|0,b|0,1)|0;ga(a+29>>0|0,d|0,1,0);d=jb(c|0,b|0,9)|0;ga(a+30>>0|0,d|0,1,0);b=jb(c|0,b|0,17)|0;ga(a+31>>0|0,b|0,1,0);i=e;return}function ab(a){a=a|0;var b=0,c=0,d=0,e=0,f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0,P=0,Q=0;b=i;c=fa(a>>0|0,1,0,1)|0|0;Q=kb(fa(a+1>>0|0,1,0,1)|0|0|0,0,8)|0;P=D;O=kb(fa(a+2>>0|0,1,0,1)|0|0|0,0,16)|0;P=P|D;J=kb(fa(a+3>>0|0,1,0,1)|0|0|0,0,24)|0;P=P|D;K=fa(a+4>>0|0,1,0,1)|0|0;N=kb(fa(a+5>>0|0,1,0,1)|0|0|0,0,8)|0;M=D;L=kb(fa(a+6>>0|0,1,0,1)|0|0|0,0,16)|0;M=M|D;E=kb(fa(a+7>>0|0,1,0,1)|0|0|0,0,24)|0;M=M|D;F=fa(a+8>>0|0,1,0,1)|0|0;I=kb(fa(a+9>>0|0,1,0,1)|0|0|0,0,8)|0;H=D;G=kb(fa(a+10>>0|0,1,0,1)|0|0|0,0,16)|0;H=H|D;y=kb(fa(a+11>>0|0,1,0,1)|0|0|0,0,24)|0;H=H|D;z=fa(a+12>>0|0,1,0,1)|0|0;C=kb(fa(a+13>>0|0,1,0,1)|0|0|0,0,8)|0;B=D;A=kb(fa(a+14>>0|0,1,0,1)|0|0|0,0,16)|0;B=B|D;t=kb(fa(a+15>>0|0,1,0,1)|0|0|0,0,24)|0;B=B|D;w=fa(a+16>>0|0,1,0,1)|0|0;x=kb(fa(a+17>>0|0,1,0,1)|0|0|0,0,8)|0;o=D;v=kb(fa(a+18>>0|0,1,0,1)|0|0|0,0,16)|0;o=o|D;u=kb(fa(a+19>>0|0,1,0,1)|0|0|0,0,24)|0;o=o|D;r=fa(a+20>>0|0,1,0,1)|0|0;s=kb(fa(a+21>>0|0,1,0,1)|0|0|0,0,8)|0;j=D;q=kb(fa(a+22>>0|0,1,0,1)|0|0|0,0,16)|0;j=j|D;p=kb(fa(a+23>>0|0,1,0,1)|0|0|0,0,24)|0;j=j|D;m=fa(a+24>>0|0,1,0,1)|0|0;n=kb(fa(a+25>>0|0,1,0,1)|0|0|0,0,8)|0;d=D;l=kb(fa(a+26>>0|0,1,0,1)|0|0|0,0,16)|0;d=d|D;k=kb(fa(a+27>>0|0,1,0,1)|0|0|0,0,24)|0;d=d|D;e=fa(a+28>>0|0,1,0,1)|0|0;h=kb(fa(a+29>>0|0,1,0,1)|0|0|0,0,8)|0;g=D;f=kb(fa(a+30>>0|0,1,0,1)|0|0|0,0,16)|0;g=g|D;a=kb(fa(a+31>>0|0,1,0,1)|0|0|0,0,24)|0;g=g|D;P=gb(1559614444,0,Q|c|O|J|0,P|0)|0;J=D;O=fb(P|0,J|0,63)|0;c=D;J=gb(0,0,P|0,J|0)|0;J=jb(J|0,D|0,63)|0;J=hb(O|0,c|0,J|0,D|0)|0;c=D;M=gb(1477600026,0,N|K|L|E|0,M|0)|0;E=D;L=fb(M|0,E|0,63)|0;K=D;E=gb(0,0,M|0,E|0)|0;E=fb(E|0,D|0,63)|0;E=gb(L|0,K|0,E|0,D|0)|0;E=kb(E|0,D|0,1)|0;E=hb(J|0,c|0,E|0,D|0)|0;c=D;H=gb(-1560830762,0,I|F|G|y|0,H|0)|0;y=D;G=fb(H|0,y|0,63)|0;F=D;y=gb(0,0,H|0,y|0)|0;y=fb(y|0,D|0,63)|0;y=gb(G|0,F|0,y|0,D|0)|0;y=kb(y|0,D|0,2)|0;y=hb(E|0,c|0,y|0,D|0)|0;c=D;B=gb(350157278,0,C|z|A|t|0,B|0)|0;t=D;A=fb(B|0,t|0,63)|0;z=D;t=gb(0,0,B|0,t|0)|0;t=fb(t|0,D|0,63)|0;t=gb(A|0,z|0,t|0,D|0)|0;t=kb(t|0,D|0,3)|0;t=hb(y|0,c|0,t|0,D|0)|0;c=D;o=gb(0,0,x|w|v|u|0,o|0)|0;o=fb(o|0,D|0,63)|0;o=kb(o|0,D|0,4)|0;o=hb(t|0,c|0,o|0,D|0)|0;c=D;j=gb(0,0,s|r|q|p|0,j|0)|0;j=fb(j|0,D|0,63)|0;j=kb(j|0,D|0,5)|0;j=hb(o|0,c|0,j|0,D|0)|0;c=D;d=gb(0,0,n|m|l|k|0,d|0)|0;d=fb(d|0,D|0,63)|0;d=kb(d|0,D|0,6)|0;d=hb(j|0,c|0,d|0,D|0)|0;c=D;g=gb(268435456,0,h|e|f|a|0,g|0)|0;a=D;f=fb(g|0,a|0,63)|0;e=D;a=gb(0,0,g|0,a|0)|0;a=fb(a|0,D|0,63)|0;a=gb(f|0,e|0,a|0,D|0)|0;a=kb(a|0,D|0,7)|0;a=hb(d|0,c|0,a|0,D|0)|0;a=jb(a|0,D|0,8)|0;i=b;return a|0}function bb(a,b,c){a=a|0;b=b|0;c=c|0;var d=0,e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0;v=fa(a|0,4,0,0)|0|0;u=a+4|0;t=fa(u|0,4,0,0)|0|0;s=a+8|0;r=fa(s|0,4,0,0)|0|0;q=a+12|0;p=fa(q|0,4,0,0)|0|0;o=a+16|0;d=fa(o|0,4,0,0)|0|0;m=a+20|0;l=fa(m|0,4,0,0)|0|0;k=a+24|0;j=fa(k|0,4,0,0)|0|0;i=a+28|0;h=fa(i|0,4,0,0)|0|0;g=a+32|0;f=fa(g|0,4,0,0)|0|0;e=a+36|0;n=fa(e|0,4,0,0)|0|0;w=0-c|0;if((c+ -1&~c|c+ -2&w|0)==-1){E=((fa(b+4|0,4,0,0)|0)^t)&w;D=((fa(b+8|0,4,0,0)|0)^r)&w;C=((fa(b+12|0,4,0,0)|0)^p)&w;B=((fa(b+16|0,4,0,0)|0)^d)&w;A=((fa(b+20|0,4,0,0)|0)^l)&w;z=((fa(b+24|0,4,0,0)|0)^j)&w;y=((fa(b+28|0,4,0,0)|0)^h)&w;x=((fa(b+32|0,4,0,0)|0)^f)&w;c=((fa(b+36|0,4,0,0)|0)^n)&w;ga(a|0,((fa(b|0,4,0,0)|0)^v)&w^v|0,4,0);ga(u|0,E^t|0,4,0);ga(s|0,D^r|0,4,0);ga(q|0,C^p|0,4,0);ga(o|0,B^d|0,4,0);ga(m|0,A^l|0,4,0);ga(k|0,z^j|0,4,0);ga(i|0,y^h|0,4,0);ga(g|0,x^f|0,4,0);ga(e|0,c^n|0,4,0);return}else{na(168,48,177,232)}}function cb(a,b){a=a|0;b=b|0;var c=0,d=0,e=0,f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0;k=i;i=i+48|0;c=k;if((b|0)<=0){i=k;return}e=a+8|0;n=a;l=fa(n|0,4,0,0)|0|0;n=fa(n+4|0,4,0,0)|0|0;d=0;do{s=a+40|0;r=a+80|0;q=a+120|0;m=a+160|0;o=(fa(s+4|0,4,0,0)|0)^n^(fa(r+4|0,4,0,0)|0)^(fa(q+4|0,4,0,0)|0)^(fa(m+4|0,4,0,0)|0);g=c;ga(g|0,(fa(s|0,4,0,0)|0)^l^(fa(r|0,4,0,0)|0)^(fa(q|0,4,0,0)|0)^(fa(m|0,4,0,0)|0)|0,4,0);ga(g+4|0,o|0,4,0);o=e;g=a+48|0;m=a+88|0;q=a+128|0;r=a+168|0;s=(fa(g+4|0,4,0,0)|0)^(fa(o+4|0,4,0,0)|0)^(fa(m+4|0,4,0,0)|0)^(fa(q+4|0,4,0,0)|0)^(fa(r+4|0,4,0,0)|0);f=c+8|0;h=f;ga(h|0,(fa(g|0,4,0,0)|0)^(fa(o|0,4,0,0)|0)^(fa(m|0,4,0,0)|0)^(fa(q|0,4,0,0)|0)^(fa(r|0,4,0,0)|0)|0,4,0);ga(h+4|0,s|0,4,0);s=a+16|0;h=a+56|0;r=a+96|0;q=a+136|0;m=a+176|0;o=(fa(h+4|0,4,0,0)|0)^(fa(s+4|0,4,0,0)|0)^(fa(r+4|0,4,0,0)|0)^(fa(q+4|0,4,0,0)|0)^(fa(m+4|0,4,0,0)|0);g=c+16|0;j=g;ga(j|0,(fa(h|0,4,0,0)|0)^(fa(s|0,4,0,0)|0)^(fa(r|0,4,0,0)|0)^(fa(q|0,4,0,0)|0)^(fa(m|0,4,0,0)|0)|0,4,0);ga(j+4|0,o|0,4,0);o=a+24|0;j=a+64|0;m=a+104|0;q=a+144|0;r=a+184|0;s=(fa(j+4|0,4,0,0)|0)^(fa(o+4|0,4,0,0)|0)^(fa(m+4|0,4,0,0)|0)^(fa(q+4|0,4,0,0)|0)^(fa(r+4|0,4,0,0)|0);h=c+24|0;t=h;ga(t|0,(fa(j|0,4,0,0)|0)^(fa(o|0,4,0,0)|0)^(fa(m|0,4,0,0)|0)^(fa(q|0,4,0,0)|0)^(fa(r|0,4,0,0)|0)|0,4,0);ga(t+4|0,s|0,4,0);s=a+32|0;t=a+72|0;r=a+112|0;q=a+152|0;m=a+192|0;o=(fa(t+4|0,4,0,0)|0)^(fa(s+4|0,4,0,0)|0)^(fa(r+4|0,4,0,0)|0)^(fa(q+4|0,4,0,0)|0)^(fa(m+4|0,4,0,0)|0);j=c+32|0;p=j;ga(p|0,(fa(t|0,4,0,0)|0)^(fa(s|0,4,0,0)|0)^(fa(r|0,4,0,0)|0)^(fa(q|0,4,0,0)|0)^(fa(m|0,4,0,0)|0)|0,4,0);ga(p+4|0,o|0,4,0);o=0;while(1){t=c+(((o+4|0)%5|0)<<3)|0;q=fa(t|0,4,0,0)|0|0;t=fa(t+4|0,4,0,0)|0|0;m=o+1|0;r=c+(((m|0)==5?0:m)<<3)|0;u=fa(r|0,4,0,0)|0|0;r=fa(r+4|0,4,0,0)|0|0;p=kb(u|0,r|0,1)|0;s=D;r=jb(u|0,r|0,63)|0;q=(p|r)^q;t=(s|D)^t;s=a+(o<<3)|0;ga(s|0,q^l|0,4,0);ga(s+4|0,t^n|0,4,0);s=a+(o+5<<3)|0;r=s;p=t^(fa(r+4|0,4,0,0)|0);ga(s|0,q^(fa(r|0,4,0,0)|0)|0,4,0);ga(s+4|0,p|0,4,0);p=a+(o+10<<3)|0;s=p;r=t^(fa(s+4|0,4,0,0)|0);ga(p|0,q^(fa(s|0,4,0,0)|0)|0,4,0);ga(p+4|0,r|0,4,0);r=a+(o+15<<3)|0;p=r;s=t^(fa(p+4|0,4,0,0)|0);ga(r|0,q^(fa(p|0,4,0,0)|0)|0,4,0);ga(r+4|0,s|0,4,0);s=a+(o+20<<3)|0;r=s;t=t^(fa(r+4|0,4,0,0)|0);ga(s|0,q^(fa(r|0,4,0,0)|0)|0,4,0);ga(s+4|0,t|0,4,0);if((m|0)==5){break}n=a+(m<<3)|0;l=fa(n|0,4,0,0)|0|0;n=fa(n+4|0,4,0,0)|0|0;o=m}m=e;n=fa(m|0,4,0,0)|0|0;m=fa(m+4|0,4,0,0)|0|0;l=0;do{t=a+((fa(32568+(l<<2)|0,4,0,0)|0)<<3)|0;r=t;p=n;n=fa(r|0,4,0,0)|0|0;q=m;m=fa(r+4|0,4,0,0)|0|0;r=fa(32472+(l<<2)|0,4,0,0)|0|0;s=kb(p|0,q|0,r|0)|0;u=D;r=jb(p|0,q|0,64-r|0)|0;ga(t|0,r|s|0,4,0);ga(t+4|0,D|u|0,4,0);l=l+1|0}while((l|0)!=24);o=c;ga(o|0,n|0,4,0);ga(o+4|0,m|0,4,0);o=0;p=0;while(1){m=c+0|0;n=a+(o*5<<3)+0|0;l=m+40|0;do{ga(m|0,fa(n|0,4,0,0)|0|0,4,0);m=m+4|0;n=n+4|0}while((m|0)<(l|0));n=f;r=fa(n|0,4,0,0)|0|0;n=fa(n+4|0,4,0,0)|0|0;t=g;s=fa(t|0,4,0,0)|0|0;t=fa(t+4|0,4,0,0)|0|0;q=a+(p<<3)|0;m=q;u=(fa(m+4|0,4,0,0)|0)^t&~n;ga(q|0,(fa(m|0,4,0,0)|0)^s&~r|0,4,0);ga(q+4|0,u|0,4,0);u=h;q=fa(u|0,4,0,0)|0|0;u=fa(u+4|0,4,0,0)|0|0;m=a+(p+1<<3)|0;l=m;t=(fa(l+4|0,4,0,0)|0)^u&~t;ga(m|0,(fa(l|0,4,0,0)|0)^q&~s|0,4,0);ga(m+4|0,t|0,4,0);t=j;m=fa(t|0,4,0,0)|0|0;t=fa(t+4|0,4,0,0)|0|0;s=a+(p+2<<3)|0;l=s;u=(fa(l+4|0,4,0,0)|0)^t&~u;ga(s|0,(fa(l|0,4,0,0)|0)^m&~q|0,4,0);ga(s+4|0,u|0,4,0);u=c;s=fa(u|0,4,0,0)|0|0;u=fa(u+4|0,4,0,0)|0|0;q=a+(p+3<<3)|0;l=q;t=(fa(l+4|0,4,0,0)|0)^u&~t;ga(q|0,(fa(l|0,4,0,0)|0)^s&~m|0,4,0);ga(q+4|0,t|0,4,0);t=a+(p+4<<3)|0;q=t;u=(fa(q+4|0,4,0,0)|0)^n&~u;ga(t|0,(fa(q|0,4,0,0)|0)^r&~s|0,4,0);ga(t+4|0,u|0,4,0);o=o+1|0;if((o|0)==5){break}else{p=p+5|0}}n=32280+(d<<3)|0;u=a;l=(fa(u|0,4,0,0)|0)^(fa(n|0,4,0,0)|0);n=(fa(u+4|0,4,0,0)|0)^(fa(n+4|0,4,0,0)|0);u=a;ga(u|0,l|0,4,0);ga(u+4|0,n|0,4,0);d=d+1|0}while((d|0)!=(b|0));i=k;return}function db(a,b,c,d){a=a|0;b=b|0;c=c|0;d=d|0;var e=0,f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0;e=i;i=i+352|0;g=e;f=e+200|0;if((d|0)==200){j=136}else{j=200-(d<<1)|0}h=(j|0)/8|0;ib(g|0,0,200)|0;a:do{if((j|0)<=(b|0)){if((j|0)<=7){while(1){cb(g,24);b=b-j|0;a=a+j|0;if((b|0)<(j|0)){break a}}}do{k=0;do{n=a+(k<<3)|0;m=g+(k<<3)|0;o=m;l=(fa(o+4|0,4,0,0)|0)^(fa(n+4|0,4,0,0)|0);ga(m|0,(fa(o|0,4,0,0)|0)^(fa(n|0,4,0,0)|0)|0,4,0);ga(m+4|0,l|0,4,0);k=k+1|0}while((k|0)<(h|0));cb(g,24);b=b-j|0;a=a+j|0}while((b|0)>=(j|0))}}while(0);mb(f|0,a|0,b|0)|0;o=b+1|0;ga(f+b>>0|0,1|0,1,0);ib(f+o|0,0,j-o|0)|0;o=f+(j+ -1)|0;ga(o>>0|0,fa(o>>0|0,1,0,1)|0|0|128|0,1,0);if((j|0)<=7){cb(g,24);mb(c|0,g|0,d|0)|0;i=e;return 0}j=0;do{m=f+(j<<3)|0;n=g+(j<<3)|0;l=n;o=(fa(l+4|0,4,0,0)|0)^(fa(m+4|0,4,0,0)|0);ga(n|0,(fa(l|0,4,0,0)|0)^(fa(m|0,4,0,0)|0)|0,4,0);ga(n+4|0,o|0,4,0);j=j+1|0}while((j|0)<(h|0));cb(g,24);mb(c|0,g|0,d|0)|0;i=e;return 0}function eb(){}function fb(a,b,c){a=a|0;b=b|0;c=c|0;if((c|0)<32){D=b>>c;return a>>>c|(b&(1<<c)-1)<<32-c}D=(b|0)<0?-1:0;return b>>c-32|0}function gb(a,b,c,d){a=a|0;b=b|0;c=c|0;d=d|0;b=b-d-(c>>>0>a>>>0|0)>>>0;return(D=b,a-c>>>0|0)|0}function hb(a,b,c,d){a=a|0;b=b|0;c=c|0;d=d|0;c=a+c>>>0;return(D=b+d+(c>>>0<a>>>0|0)>>>0,c|0)|0}function ib(a,b,c){a=a|0;b=b|0;c=c|0;var d=0,e=0,f=0,g=0;d=a+c|0;if((c|0)>=20){b=b&255;g=a&3;f=b|b<<8|b<<16|b<<24;e=d&~3;if(g){g=a+4-g|0;while((a|0)<(g|0)){ga(a|0,b|0,1,0)|0;a=a+1|0}}while((a|0)<(e|0)){ga(a|0,f|0,4,0)|0;a=a+4|0}}while((a|0)<(d|0)){ga(a|0,b|0,1,0)|0;a=a+1|0}return a-c|0}function jb(a,b,c){a=a|0;b=b|0;c=c|0;if((c|0)<32){D=b>>>c;return a>>>c|(b&(1<<c)-1)<<32-c}D=0;return b>>>c-32|0}function kb(a,b,c){a=a|0;b=b|0;c=c|0;if((c|0)<32){D=b<<c|(a&(1<<c)-1<<32-c)>>>32-c;return a<<c}D=a<<c-32;return 0}function lb(a){a=a|0;var b=0;b=a;while(fa(b|0,1,0,0)|0){b=b+1|0}return b-a|0}function mb(a,b,c){a=a|0;b=b|0;c=c|0;var d=0;if((c|0)>=4096)return la(a|0,b|0,c|0)|0;d=a|0;if((a&3)==(b&3)){while(a&3){if((c|0)==0)return d|0;ga(a|0,fa(b|0,1,0,0)|0,1,0)|0;a=a+1|0;b=b+1|0;c=c-1|0}while((c|0)>=4){ga(a|0,fa(b|0,4,0,0)|0,4,0)|0;a=a+4|0;b=b+4|0;c=c-4|0}}while((c|0)>0){ga(a|0,fa(b|0,1,0,0)|0,1,0)|0;a=a+1|0;b=b+1|0;c=c-1|0}return d|0}function nb(a){a=a|0;var b=0;b=fa(n+(a>>>24)|0,1,0,0)|0;if((b|0)<8)return b|0;b=fa(n+(a>>16&255)|0,1,0,0)|0;if((b|0)<8)return b+8|0;b=fa(n+(a>>8&255)|0,1,0,0)|0;if((b|0)<8)return b+16|0;return(fa(n+(a&255)|0,1,0,0)|0)+24|0}function ob(a){a=a|0;var b=0;b=fa(m+(a&255)|0,1,0,0)|0;if((b|0)<8)return b|0;b=fa(m+(a>>8&255)|0,1,0,0)|0;if((b|0)<8)return b+8|0;b=fa(m+(a>>16&255)|0,1,0,0)|0;if((b|0)<8)return b+16|0;return(fa(m+(a>>>24)|0,1,0,0)|0)+24|0}function pb(a,b){a=a|0;b=b|0;var c=0,d=0,e=0,f=0;f=a&65535;d=b&65535;c=$(d,f)|0;e=a>>>16;d=(c>>>16)+($(d,e)|0)|0;b=b>>>16;a=$(b,f)|0;return(D=(d>>>16)+($(b,e)|0)+(((d&65535)+a|0)>>>16)|0,d+a<<16|c&65535|0)|0}function qb(a,b,c,d){a=a|0;b=b|0;c=c|0;d=d|0;var e=0,f=0,g=0,h=0,i=0,j=0;j=b>>31|((b|0)<0?-1:0)<<1;i=((b|0)<0?-1:0)>>31|((b|0)<0?-1:0)<<1;f=d>>31|((d|0)<0?-1:0)<<1;e=((d|0)<0?-1:0)>>31|((d|0)<0?-1:0)<<1;h=gb(j^a,i^b,j,i)|0;g=D;b=f^j;a=e^i;a=gb((vb(h,g,gb(f^c,e^d,f,e)|0,D,0)|0)^b,D^a,b,a)|0;return a|0}function rb(a,b,c,d){a=a|0;b=b|0;c=c|0;d=d|0;var e=0,f=0,g=0,h=0,j=0,k=0;e=i;i=i+8|0;h=e|0;g=b>>31|((b|0)<0?-1:0)<<1;f=((b|0)<0?-1:0)>>31|((b|0)<0?-1:0)<<1;k=d>>31|((d|0)<0?-1:0)<<1;j=((d|0)<0?-1:0)>>31|((d|0)<0?-1:0)<<1;b=gb(g^a,f^b,g,f)|0;a=D;vb(b,a,gb(k^c,j^d,k,j)|0,D,h)|0;a=gb((fa(h|0,4,0,0)|0)^g,(fa(h+4|0,4,0,0)|0)^f,g,f)|0;b=D;i=e;return(D=b,a)|0}function sb(a,b,c,d){a=a|0;b=b|0;c=c|0;d=d|0;var e=0,f=0;e=a;f=c;a=pb(e,f)|0;c=D;return(D=($(b,f)|0)+($(d,e)|0)+c|c&0,a|0|0)|0}function tb(a,b,c,d){a=a|0;b=b|0;c=c|0;d=d|0;a=vb(a,b,c,d,0)|0;return a|0}function ub(a,b,c,d){a=a|0;b=b|0;c=c|0;d=d|0;var e=0,f=0;f=i;i=i+8|0;e=f|0;vb(a,b,c,d,e)|0;i=f;return(D=fa(e+4|0,4,0,0)|0|0,fa(e|0,4,0,0)|0|0)|0}function vb(a,b,c,d,e){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;var f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0;g=a;i=b;h=i;k=c;f=d;j=f;if((h|0)==0){f=(e|0)!=0;if((j|0)==0){if(f){ga(e|0,(g>>>0)%(k>>>0)|0,4,0);ga(e+4|0,0|0,4,0)}j=0;l=(g>>>0)/(k>>>0)>>>0;return(D=j,l)|0}else{if(!f){k=0;l=0;return(D=k,l)|0}ga(e|0,a|0|0,4,0);ga(e+4|0,b&0|0,4,0);k=0;l=0;return(D=k,l)|0}}l=(j|0)==0;do{if((k|0)!=0){if(!l){j=(nb(j|0)|0)-(nb(h|0)|0)|0;if(j>>>0<=31){l=j+1|0;k=31-j|0;a=j-31>>31;i=l;b=g>>>(l>>>0)&a|h<<k;a=h>>>(l>>>0)&a;j=0;k=g<<k;break}if((e|0)==0){k=0;l=0;return(D=k,l)|0}ga(e|0,a|0|0,4,0);ga(e+4|0,i|b&0|0,4,0);k=0;l=0;return(D=k,l)|0}j=k-1|0;if((j&k|0)!=0){k=(nb(k|0)|0)+33-(nb(h|0)|0)|0;o=64-k|0;l=32-k|0;m=l>>31;n=k-32|0;a=n>>31;i=k;b=l-1>>31&h>>>(n>>>0)|(h<<l|g>>>(k>>>0))&a;a=a&h>>>(k>>>0);j=g<<o&m;k=(h<<o|g>>>(n>>>0))&m|g<<l&k-33>>31;break}if((e|0)!=0){ga(e|0,j&g|0,4,0);ga(e+4|0,0|0,4,0)}if((k|0)==1){n=i|b&0;o=a|0|0;return(D=n,o)|0}else{o=ob(k|0)|0;n=h>>>(o>>>0)|0;o=h<<32-o|g>>>(o>>>0)|0;return(D=n,o)|0}}else{if(l){if((e|0)!=0){ga(e|0,(h>>>0)%(k>>>0)|0,4,0);ga(e+4|0,0|0,4,0)}n=0;o=(h>>>0)/(k>>>0)>>>0;return(D=n,o)|0}if((g|0)==0){if((e|0)!=0){ga(e|0,0|0,4,0);ga(e+4|0,(h>>>0)%(j>>>0)|0,4,0)}n=0;o=(h>>>0)/(j>>>0)>>>0;return(D=n,o)|0}k=j-1|0;if((k&j|0)==0){if((e|0)!=0){ga(e|0,a|0|0,4,0);ga(e+4|0,k&h|b&0|0,4,0)}n=0;o=h>>>((ob(j|0)|0)>>>0);return(D=n,o)|0}j=(nb(j|0)|0)-(nb(h|0)|0)|0;if(j>>>0<=30){a=j+1|0;k=31-j|0;i=a;b=h<<k|g>>>(a>>>0);a=h>>>(a>>>0);j=0;k=g<<k;break}if((e|0)==0){n=0;o=0;return(D=n,o)|0}ga(e|0,a|0|0,4,0);ga(e+4|0,i|b&0|0,4,0);n=0;o=0;return(D=n,o)|0}}while(0);if((i|0)==0){f=k;d=0;h=0}else{g=c|0|0;f=f|d&0;d=hb(g,f,-1,-1)|0;c=D;h=0;do{l=k;k=j>>>31|k<<1;j=h|j<<1;l=b<<1|l>>>31|0;m=b>>>31|a<<1|0;gb(d,c,l,m)|0;o=D;n=o>>31|((o|0)<0?-1:0)<<1;h=n&1;b=gb(l,m,n&g,(((o|0)<0?-1:0)>>31|((o|0)<0?-1:0)<<1)&f)|0;a=D;i=i-1|0}while((i|0)!=0);f=k;d=0}g=0;if((e|0)!=0){ga(e|0,b|0,4,0);ga(e+4|0,a|0,4,0)}n=(j|0)>>>31|(f|g)<<1|(g<<1|j>>>31)&0|d;o=(j<<1|0>>>31)&-2|h;return(D=n,o)|0}




// EMSCRIPTEN_END_FUNCS
return{_strlen:lb,_ge_mul8:Va,_keccak:db,_ge_Holoyolormult:Ta,_ge_fromfe_frombytes_vartime:Wa,_sc_mulsub:$a,_sc_reduce32:Ya,_bitshift64Lshr:jb,_bitshift64Shl:kb,_sc_add:Za,_bitshift64Ashr:fb,_memset:ib,_i64Add:hb,_memcpy:mb,_ge_double_Holoyolormult_base_vartime:Ca,_ge_p3_tobytes:Ma,_ge_double_Holoyolormult_precomp_vartime:Ua,_i64Subtract:gb,_ge_Holoyolormult_base:Pa,_ge_p1p1_to_p3:Ba,_ge_p1p1_to_p2:Ha,_ge_dsm_precomp:za,_ge_frombytes_vartime:Ia,_ge_tobytes:Ra,_sc_0:Xa,_sc_sub:_a,_sc_reduce:Sa,_ge_p3_to_cached:Aa,_sc_check:ab,_ge_add:xa,runPostSets:eb,stackAlloc:pa,stackSave:qa,stackRestore:ra,setThrew:sa,setTempRet0:va,getTempRet0:wa}
// EMSCRIPTEN_END_ASM

})({"Math":Math,"Int8Array":Int8Array,"Int16Array":Int16Array,"Int32Array":Int32Array,"Uint8Array":Uint8Array,"Uint16Array":Uint16Array,"Uint32Array":Uint32Array,"Float32Array":Float32Array,"Float64Array":Float64Array},{"abort":abort,"assert":assert,"asmPrintInt":asmPrintInt,"asmPrintFloat":asmPrintFloat,"min":Math_min,"SAFE_HEAP_LOAD":SAFE_HEAP_LOAD,"SAFE_HEAP_STORE":SAFE_HEAP_STORE,"SAFE_FT_MASK":SAFE_FT_MASK,"_free":_free,"___setErrNo":___setErrNo,"_malloc":_malloc,"_emscripten_memcpy_big":_emscripten_memcpy_big,"_fflush":_fflush,"___assert_fail":___assert_fail,"STACKTOP":STACKTOP,"STACK_MAX":STACK_MAX,"tempDoublePtr":tempDoublePtr,"ABORT":ABORT,"cttz_i8":cttz_i8,"ctlz_i8":ctlz_i8,"NaN":NaN,"Infinity":Infinity},buffer);var _strlen=Module["_strlen"]=asm["_strlen"];var _ge_mul8=Module["_ge_mul8"]=asm["_ge_mul8"];var _keccak=Module["_keccak"]=asm["_keccak"];var _ge_Holoyolormult=Module["_ge_Holoyolormult"]=asm["_ge_Holoyolormult"];var _ge_fromfe_frombytes_vartime=Module["_ge_fromfe_frombytes_vartime"]=asm["_ge_fromfe_frombytes_vartime"];var _sc_mulsub=Module["_sc_mulsub"]=asm["_sc_mulsub"];var _sc_reduce32=Module["_sc_reduce32"]=asm["_sc_reduce32"];var _bitshift64Lshr=Module["_bitshift64Lshr"]=asm["_bitshift64Lshr"];var _bitshift64Shl=Module["_bitshift64Shl"]=asm["_bitshift64Shl"];var _sc_add=Module["_sc_add"]=asm["_sc_add"];var _bitshift64Ashr=Module["_bitshift64Ashr"]=asm["_bitshift64Ashr"];var _memset=Module["_memset"]=asm["_memset"];var _i64Add=Module["_i64Add"]=asm["_i64Add"];var _memcpy=Module["_memcpy"]=asm["_memcpy"];var _ge_double_Holoyolormult_base_vartime=Module["_ge_double_Holoyolormult_base_vartime"]=asm["_ge_double_Holoyolormult_base_vartime"];var _ge_p3_tobytes=Module["_ge_p3_tobytes"]=asm["_ge_p3_tobytes"];var _ge_double_Holoyolormult_precomp_vartime=Module["_ge_double_Holoyolormult_precomp_vartime"]=asm["_ge_double_Holoyolormult_precomp_vartime"];var _i64Subtract=Module["_i64Subtract"]=asm["_i64Subtract"];var _ge_Holoyolormult_base=Module["_ge_Holoyolormult_base"]=asm["_ge_Holoyolormult_base"];var _ge_p1p1_to_p3=Module["_ge_p1p1_to_p3"]=asm["_ge_p1p1_to_p3"];var _ge_p1p1_to_p2=Module["_ge_p1p1_to_p2"]=asm["_ge_p1p1_to_p2"];var _ge_dsm_precomp=Module["_ge_dsm_precomp"]=asm["_ge_dsm_precomp"];var _ge_frombytes_vartime=Module["_ge_frombytes_vartime"]=asm["_ge_frombytes_vartime"];var _ge_tobytes=Module["_ge_tobytes"]=asm["_ge_tobytes"];var _sc_0=Module["_sc_0"]=asm["_sc_0"];var _sc_sub=Module["_sc_sub"]=asm["_sc_sub"];var _sc_reduce=Module["_sc_reduce"]=asm["_sc_reduce"];var _ge_p3_to_cached=Module["_ge_p3_to_cached"]=asm["_ge_p3_to_cached"];var _sc_check=Module["_sc_check"]=asm["_sc_check"];var _ge_add=Module["_ge_add"]=asm["_ge_add"];var runPostSets=Module["runPostSets"]=asm["runPostSets"];Runtime.stackAlloc=asm["stackAlloc"];Runtime.stackSave=asm["stackSave"];Runtime.stackRestore=asm["stackRestore"];Runtime.setTempRet0=asm["setTempRet0"];Runtime.getTempRet0=asm["getTempRet0"];var i64Math=(function(){var goog={math:{}};goog.math.Long=(function(low,high){this.low_=low|0;this.high_=high|0});goog.math.Long.IntCache_={};goog.math.Long.fromInt=(function(value){if(-128<=value&&value<128){var cachedObj=goog.math.Long.IntCache_[value];if(cachedObj){return cachedObj}}var obj=new goog.math.Long(value|0,value<0?-1:0);if(-128<=value&&value<128){goog.math.Long.IntCache_[value]=obj}return obj});goog.math.Long.fromNumber=(function(value){if(isNaN(value)||!isFinite(value)){return goog.math.Long.ZERO}else if(value<=-goog.math.Long.TWO_PWR_63_DBL_){return goog.math.Long.MIN_VALUE}else if(value+1>=goog.math.Long.TWO_PWR_63_DBL_){return goog.math.Long.MAX_VALUE}else if(value<0){return goog.math.Long.fromNumber(-value).negate()}else{return new goog.math.Long(value%goog.math.Long.TWO_PWR_32_DBL_|0,value/goog.math.Long.TWO_PWR_32_DBL_|0)}});goog.math.Long.fromBits=(function(lowBits,highBits){return new goog.math.Long(lowBits,highBits)});goog.math.Long.fromString=(function(str,opt_radix){if(str.length==0){throw Error("number format error: empty string")}var radix=opt_radix||10;if(radix<2||36<radix){throw Error("radix out of range: "+radix)}if(str.charAt(0)=="-"){return goog.math.Long.fromString(str.substring(1),radix).negate()}else if(str.indexOf("-")>=0){throw Error('number format error: interior "-" character: '+str)}var radixToPower=goog.math.Long.fromNumber(Math.pow(radix,8));var result=goog.math.Long.ZERO;for(var i=0;i<str.length;i+=8){var size=Math.min(8,str.length-i);var value=parseInt(str.substring(i,i+size),radix);if(size<8){var power=goog.math.Long.fromNumber(Math.pow(radix,size));result=result.multiply(power).add(goog.math.Long.fromNumber(value))}else{result=result.multiply(radixToPower);result=result.add(goog.math.Long.fromNumber(value))}}return result});goog.math.Long.TWO_PWR_16_DBL_=1<<16;goog.math.Long.TWO_PWR_24_DBL_=1<<24;goog.math.Long.TWO_PWR_32_DBL_=goog.math.Long.TWO_PWR_16_DBL_*goog.math.Long.TWO_PWR_16_DBL_;goog.math.Long.TWO_PWR_31_DBL_=goog.math.Long.TWO_PWR_32_DBL_/2;goog.math.Long.TWO_PWR_48_DBL_=goog.math.Long.TWO_PWR_32_DBL_*goog.math.Long.TWO_PWR_16_DBL_;goog.math.Long.TWO_PWR_64_DBL_=goog.math.Long.TWO_PWR_32_DBL_*goog.math.Long.TWO_PWR_32_DBL_;goog.math.Long.TWO_PWR_63_DBL_=goog.math.Long.TWO_PWR_64_DBL_/2;goog.math.Long.ZERO=goog.math.Long.fromInt(0);goog.math.Long.ONE=goog.math.Long.fromInt(1);goog.math.Long.NEG_ONE=goog.math.Long.fromInt(-1);goog.math.Long.MAX_VALUE=goog.math.Long.fromBits(4294967295|0,2147483647|0);goog.math.Long.MIN_VALUE=goog.math.Long.fromBits(0,2147483648|0);goog.math.Long.TWO_PWR_24_=goog.math.Long.fromInt(1<<24);goog.math.Long.prototype.toInt=(function(){return this.low_});goog.math.Long.prototype.toNumber=(function(){return this.high_*goog.math.Long.TWO_PWR_32_DBL_+this.getLowBitsUnsigned()});goog.math.Long.prototype.toString=(function(opt_radix){var radix=opt_radix||10;if(radix<2||36<radix){throw Error("radix out of range: "+radix)}if(this.isZero()){return"0"}if(this.isNegative()){if(this.equals(goog.math.Long.MIN_VALUE)){var radixLong=goog.math.Long.fromNumber(radix);var div=this.div(radixLong);var rem=div.multiply(radixLong).subtract(this);return div.toString(radix)+rem.toInt().toString(radix)}else{return"-"+this.negate().toString(radix)}}var radixToPower=goog.math.Long.fromNumber(Math.pow(radix,6));var rem=this;var result="";while(true){var remDiv=rem.div(radixToPower);var intval=rem.subtract(remDiv.multiply(radixToPower)).toInt();var digits=intval.toString(radix);rem=remDiv;if(rem.isZero()){return digits+result}else{while(digits.length<6){digits="0"+digits}result=""+digits+result}}});goog.math.Long.prototype.getHighBits=(function(){return this.high_});goog.math.Long.prototype.getLowBits=(function(){return this.low_});goog.math.Long.prototype.getLowBitsUnsigned=(function(){return this.low_>=0?this.low_:goog.math.Long.TWO_PWR_32_DBL_+this.low_});goog.math.Long.prototype.getNumBitsAbs=(function(){if(this.isNegative()){if(this.equals(goog.math.Long.MIN_VALUE)){return 64}else{return this.negate().getNumBitsAbs()}}else{var val=this.high_!=0?this.high_:this.low_;for(var bit=31;bit>0;bit--){if((val&1<<bit)!=0){break}}return this.high_!=0?bit+33:bit+1}});goog.math.Long.prototype.isZero=(function(){return this.high_==0&&this.low_==0});goog.math.Long.prototype.isNegative=(function(){return this.high_<0});goog.math.Long.prototype.isOdd=(function(){return(this.low_&1)==1});goog.math.Long.prototype.equals=(function(other){return this.high_==other.high_&&this.low_==other.low_});goog.math.Long.prototype.notEquals=(function(other){return this.high_!=other.high_||this.low_!=other.low_});goog.math.Long.prototype.lessThan=(function(other){return this.compare(other)<0});goog.math.Long.prototype.lessThanOrEqual=(function(other){return this.compare(other)<=0});goog.math.Long.prototype.greaterThan=(function(other){return this.compare(other)>0});goog.math.Long.prototype.greaterThanOrEqual=(function(other){return this.compare(other)>=0});goog.math.Long.prototype.compare=(function(other){if(this.equals(other)){return 0}var thisNeg=this.isNegative();var otherNeg=other.isNegative();if(thisNeg&&!otherNeg){return-1}if(!thisNeg&&otherNeg){return 1}if(this.subtract(other).isNegative()){return-1}else{return 1}});goog.math.Long.prototype.negate=(function(){if(this.equals(goog.math.Long.MIN_VALUE)){return goog.math.Long.MIN_VALUE}else{return this.not().add(goog.math.Long.ONE)}});goog.math.Long.prototype.add=(function(other){var a48=this.high_>>>16;var a32=this.high_&65535;var a16=this.low_>>>16;var a00=this.low_&65535;var b48=other.high_>>>16;var b32=other.high_&65535;var b16=other.low_>>>16;var b00=other.low_&65535;var c48=0,c32=0,c16=0,c00=0;c00+=a00+b00;c16+=c00>>>16;c00&=65535;c16+=a16+b16;c32+=c16>>>16;c16&=65535;c32+=a32+b32;c48+=c32>>>16;c32&=65535;c48+=a48+b48;c48&=65535;return goog.math.Long.fromBits(c16<<16|c00,c48<<16|c32)});goog.math.Long.prototype.subtract=(function(other){return this.add(other.negate())});goog.math.Long.prototype.multiply=(function(other){if(this.isZero()){return goog.math.Long.ZERO}else if(other.isZero()){return goog.math.Long.ZERO}if(this.equals(goog.math.Long.MIN_VALUE)){return other.isOdd()?goog.math.Long.MIN_VALUE:goog.math.Long.ZERO}else if(other.equals(goog.math.Long.MIN_VALUE)){return this.isOdd()?goog.math.Long.MIN_VALUE:goog.math.Long.ZERO}if(this.isNegative()){if(other.isNegative()){return this.negate().multiply(other.negate())}else{return this.negate().multiply(other).negate()}}else if(other.isNegative()){return this.multiply(other.negate()).negate()}if(this.lessThan(goog.math.Long.TWO_PWR_24_)&&other.lessThan(goog.math.Long.TWO_PWR_24_)){return goog.math.Long.fromNumber(this.toNumber()*other.toNumber())}var a48=this.high_>>>16;var a32=this.high_&65535;var a16=this.low_>>>16;var a00=this.low_&65535;var b48=other.high_>>>16;var b32=other.high_&65535;var b16=other.low_>>>16;var b00=other.low_&65535;var c48=0,c32=0,c16=0,c00=0;c00+=a00*b00;c16+=c00>>>16;c00&=65535;c16+=a16*b00;c32+=c16>>>16;c16&=65535;c16+=a00*b16;c32+=c16>>>16;c16&=65535;c32+=a32*b00;c48+=c32>>>16;c32&=65535;c32+=a16*b16;c48+=c32>>>16;c32&=65535;c32+=a00*b32;c48+=c32>>>16;c32&=65535;c48+=a48*b00+a32*b16+a16*b32+a00*b48;c48&=65535;return goog.math.Long.fromBits(c16<<16|c00,c48<<16|c32)});goog.math.Long.prototype.div=(function(other){if(other.isZero()){throw Error("division by zero")}else if(this.isZero()){return goog.math.Long.ZERO}if(this.equals(goog.math.Long.MIN_VALUE)){if(other.equals(goog.math.Long.ONE)||other.equals(goog.math.Long.NEG_ONE)){return goog.math.Long.MIN_VALUE}else if(other.equals(goog.math.Long.MIN_VALUE)){return goog.math.Long.ONE}else{var halfThis=this.shiftRight(1);var approx=halfThis.div(other).shiftLeft(1);if(approx.equals(goog.math.Long.ZERO)){return other.isNegative()?goog.math.Long.ONE:goog.math.Long.NEG_ONE}else{var rem=this.subtract(other.multiply(approx));var result=approx.add(rem.div(other));return result}}}else if(other.equals(goog.math.Long.MIN_VALUE)){return goog.math.Long.ZERO}if(this.isNegative()){if(other.isNegative()){return this.negate().div(other.negate())}else{return this.negate().div(other).negate()}}else if(other.isNegative()){return this.div(other.negate()).negate()}var res=goog.math.Long.ZERO;var rem=this;while(rem.greaterThanOrEqual(other)){var approx=Math.max(1,Math.floor(rem.toNumber()/other.toNumber()));var log2=Math.ceil(Math.log(approx)/Math.LN2);var delta=log2<=48?1:Math.pow(2,log2-48);var approxRes=goog.math.Long.fromNumber(approx);var approxRem=approxRes.multiply(other);while(approxRem.isNegative()||approxRem.greaterThan(rem)){approx-=delta;approxRes=goog.math.Long.fromNumber(approx);approxRem=approxRes.multiply(other)}if(approxRes.isZero()){approxRes=goog.math.Long.ONE}res=res.add(approxRes);rem=rem.subtract(approxRem)}return res});goog.math.Long.prototype.modulo=(function(other){return this.subtract(this.div(other).multiply(other))});goog.math.Long.prototype.not=(function(){return goog.math.Long.fromBits(~this.low_,~this.high_)});goog.math.Long.prototype.and=(function(other){return goog.math.Long.fromBits(this.low_&other.low_,this.high_&other.high_)});goog.math.Long.prototype.or=(function(other){return goog.math.Long.fromBits(this.low_|other.low_,this.high_|other.high_)});goog.math.Long.prototype.xor=(function(other){return goog.math.Long.fromBits(this.low_^other.low_,this.high_^other.high_)});goog.math.Long.prototype.shiftLeft=(function(numBits){numBits&=63;if(numBits==0){return this}else{var low=this.low_;if(numBits<32){var high=this.high_;return goog.math.Long.fromBits(low<<numBits,high<<numBits|low>>>32-numBits)}else{return goog.math.Long.fromBits(0,low<<numBits-32)}}});goog.math.Long.prototype.shiftRight=(function(numBits){numBits&=63;if(numBits==0){return this}else{var high=this.high_;if(numBits<32){var low=this.low_;return goog.math.Long.fromBits(low>>>numBits|high<<32-numBits,high>>numBits)}else{return goog.math.Long.fromBits(high>>numBits-32,high>=0?0:-1)}}});goog.math.Long.prototype.shiftRightUnsigned=(function(numBits){numBits&=63;if(numBits==0){return this}else{var high=this.high_;if(numBits<32){var low=this.low_;return goog.math.Long.fromBits(low>>>numBits|high<<32-numBits,high>>>numBits)}else if(numBits==32){return goog.math.Long.fromBits(high,0)}else{return goog.math.Long.fromBits(high>>>numBits-32,0)}}});var navigator={appName:"Modern Browser"};var dbits;var canary=0xdeadbeefcafe;var j_lm=(canary&16777215)==15715070;function BigInteger(a,b,c){if(a!=null)if("number"==typeof a)this.fromNumber(a,b,c);else if(b==null&&"string"!=typeof a)this.fromString(a,256);else this.fromString(a,b)}function nbi(){return new BigInteger(null)}function am1(i,x,w,j,c,n){while(--n>=0){var v=x*this[i++]+w[j]+c;c=Math.floor(v/67108864);w[j++]=v&67108863}return c}function am2(i,x,w,j,c,n){var xl=x&32767,xh=x>>15;while(--n>=0){var l=this[i]&32767;var h=this[i++]>>15;var m=xh*l+h*xl;l=xl*l+((m&32767)<<15)+w[j]+(c&1073741823);c=(l>>>30)+(m>>>15)+xh*h+(c>>>30);w[j++]=l&1073741823}return c}function am3(i,x,w,j,c,n){var xl=x&16383,xh=x>>14;while(--n>=0){var l=this[i]&16383;var h=this[i++]>>14;var m=xh*l+h*xl;l=xl*l+((m&16383)<<14)+w[j]+c;c=(l>>28)+(m>>14)+xh*h;w[j++]=l&268435455}return c}if(j_lm&&navigator.appName=="Microsoft Internet Explorer"){BigInteger.prototype.am=am2;dbits=30}else if(j_lm&&navigator.appName!="Netscape"){BigInteger.prototype.am=am1;dbits=26}else{BigInteger.prototype.am=am3;dbits=28}BigInteger.prototype.DB=dbits;BigInteger.prototype.DM=(1<<dbits)-1;BigInteger.prototype.DV=1<<dbits;var BI_FP=52;BigInteger.prototype.FV=Math.pow(2,BI_FP);BigInteger.prototype.F1=BI_FP-dbits;BigInteger.prototype.F2=2*dbits-BI_FP;var BI_RM="0123456789abcdefghijklmnopqrstuvwxyz";var BI_RC=new Array;var rr,vv;rr="0".charCodeAt(0);for(vv=0;vv<=9;++vv)BI_RC[rr++]=vv;rr="a".charCodeAt(0);for(vv=10;vv<36;++vv)BI_RC[rr++]=vv;rr="A".charCodeAt(0);for(vv=10;vv<36;++vv)BI_RC[rr++]=vv;function int2char(n){return BI_RM.charAt(n)}function intAt(s,i){var c=BI_RC[s.charCodeAt(i)];return c==null?-1:c}function bnpCopyTo(r){for(var i=this.t-1;i>=0;--i)r[i]=this[i];r.t=this.t;r.s=this.s}function bnpFromInt(x){this.t=1;this.s=x<0?-1:0;if(x>0)this[0]=x;else if(x<-1)this[0]=x+DV;else this.t=0}function nbv(i){var r=nbi();r.fromInt(i);return r}function bnpFromString(s,b){var k;if(b==16)k=4;else if(b==8)k=3;else if(b==256)k=8;else if(b==2)k=1;else if(b==32)k=5;else if(b==4)k=2;else{this.fromRadix(s,b);return}this.t=0;this.s=0;var i=s.length,mi=false,sh=0;while(--i>=0){var x=k==8?s[i]&255:intAt(s,i);if(x<0){if(s.charAt(i)=="-")mi=true;continue}mi=false;if(sh==0)this[this.t++]=x;else if(sh+k>this.DB){this[this.t-1]|=(x&(1<<this.DB-sh)-1)<<sh;this[this.t++]=x>>this.DB-sh}else this[this.t-1]|=x<<sh;sh+=k;if(sh>=this.DB)sh-=this.DB}if(k==8&&(s[0]&128)!=0){this.s=-1;if(sh>0)this[this.t-1]|=(1<<this.DB-sh)-1<<sh}this.clamp();if(mi)BigInteger.ZERO.subTo(this,this)}function bnpClamp(){var c=this.s&this.DM;while(this.t>0&&this[this.t-1]==c)--this.t}function bnToString(b){if(this.s<0)return"-"+this.negate().toString(b);var k;if(b==16)k=4;else if(b==8)k=3;else if(b==2)k=1;else if(b==32)k=5;else if(b==4)k=2;else return this.toRadix(b);var km=(1<<k)-1,d,m=false,r="",i=this.t;var p=this.DB-i*this.DB%k;if(i-->0){if(p<this.DB&&(d=this[i]>>p)>0){m=true;r=int2char(d)}while(i>=0){if(p<k){d=(this[i]&(1<<p)-1)<<k-p;d|=this[--i]>>(p+=this.DB-k)}else{d=this[i]>>(p-=k)&km;if(p<=0){p+=this.DB;--i}}if(d>0)m=true;if(m)r+=int2char(d)}}return m?r:"0"}function bnNegate(){var r=nbi();BigInteger.ZERO.subTo(this,r);return r}function bnAbs(){return this.s<0?this.negate():this}function bnCompareTo(a){var r=this.s-a.s;if(r!=0)return r;var i=this.t;r=i-a.t;if(r!=0)return this.s<0?-r:r;while(--i>=0)if((r=this[i]-a[i])!=0)return r;return 0}function nbits(x){var r=1,t;if((t=x>>>16)!=0){x=t;r+=16}if((t=x>>8)!=0){x=t;r+=8}if((t=x>>4)!=0){x=t;r+=4}if((t=x>>2)!=0){x=t;r+=2}if((t=x>>1)!=0){x=t;r+=1}return r}function bnBitLength(){if(this.t<=0)return 0;return this.DB*(this.t-1)+nbits(this[this.t-1]^this.s&this.DM)}function bnpDLShiftTo(n,r){var i;for(i=this.t-1;i>=0;--i)r[i+n]=this[i];for(i=n-1;i>=0;--i)r[i]=0;r.t=this.t+n;r.s=this.s}function bnpDRShiftTo(n,r){for(var i=n;i<this.t;++i)r[i-n]=this[i];r.t=Math.max(this.t-n,0);r.s=this.s}function bnpLShiftTo(n,r){var bs=n%this.DB;var cbs=this.DB-bs;var bm=(1<<cbs)-1;var ds=Math.floor(n/this.DB),c=this.s<<bs&this.DM,i;for(i=this.t-1;i>=0;--i){r[i+ds+1]=this[i]>>cbs|c;c=(this[i]&bm)<<bs}for(i=ds-1;i>=0;--i)r[i]=0;r[ds]=c;r.t=this.t+ds+1;r.s=this.s;r.clamp()}function bnpRShiftTo(n,r){r.s=this.s;var ds=Math.floor(n/this.DB);if(ds>=this.t){r.t=0;return}var bs=n%this.DB;var cbs=this.DB-bs;var bm=(1<<bs)-1;r[0]=this[ds]>>bs;for(var i=ds+1;i<this.t;++i){r[i-ds-1]|=(this[i]&bm)<<cbs;r[i-ds]=this[i]>>bs}if(bs>0)r[this.t-ds-1]|=(this.s&bm)<<cbs;r.t=this.t-ds;r.clamp()}function bnpSubTo(a,r){var i=0,c=0,m=Math.min(a.t,this.t);while(i<m){c+=this[i]-a[i];r[i++]=c&this.DM;c>>=this.DB}if(a.t<this.t){c-=a.s;while(i<this.t){c+=this[i];r[i++]=c&this.DM;c>>=this.DB}c+=this.s}else{c+=this.s;while(i<a.t){c-=a[i];r[i++]=c&this.DM;c>>=this.DB}c-=a.s}r.s=c<0?-1:0;if(c<-1)r[i++]=this.DV+c;else if(c>0)r[i++]=c;r.t=i;r.clamp()}function bnpMultiplyTo(a,r){var x=this.abs(),y=a.abs();var i=x.t;r.t=i+y.t;while(--i>=0)r[i]=0;for(i=0;i<y.t;++i)r[i+x.t]=x.am(0,y[i],r,i,0,x.t);r.s=0;r.clamp();if(this.s!=a.s)BigInteger.ZERO.subTo(r,r)}function bnpSquareTo(r){var x=this.abs();var i=r.t=2*x.t;while(--i>=0)r[i]=0;for(i=0;i<x.t-1;++i){var c=x.am(i,x[i],r,2*i,0,1);if((r[i+x.t]+=x.am(i+1,2*x[i],r,2*i+1,c,x.t-i-1))>=x.DV){r[i+x.t]-=x.DV;r[i+x.t+1]=1}}if(r.t>0)r[r.t-1]+=x.am(i,x[i],r,2*i,0,1);r.s=0;r.clamp()}function bnpDivRemTo(m,q,r){var pm=m.abs();if(pm.t<=0)return;var pt=this.abs();if(pt.t<pm.t){if(q!=null)q.fromInt(0);if(r!=null)this.copyTo(r);return}if(r==null)r=nbi();var y=nbi(),ts=this.s,ms=m.s;var nsh=this.DB-nbits(pm[pm.t-1]);if(nsh>0){pm.lShiftTo(nsh,y);pt.lShiftTo(nsh,r)}else{pm.copyTo(y);pt.copyTo(r)}var ys=y.t;var y0=y[ys-1];if(y0==0)return;var yt=y0*(1<<this.F1)+(ys>1?y[ys-2]>>this.F2:0);var d1=this.FV/yt,d2=(1<<this.F1)/yt,e=1<<this.F2;var i=r.t,j=i-ys,t=q==null?nbi():q;y.dlShiftTo(j,t);if(r.compareTo(t)>=0){r[r.t++]=1;r.subTo(t,r)}BigInteger.ONE.dlShiftTo(ys,t);t.subTo(y,y);while(y.t<ys)y[y.t++]=0;while(--j>=0){var qd=r[--i]==y0?this.DM:Math.floor(r[i]*d1+(r[i-1]+e)*d2);if((r[i]+=y.am(0,qd,r,j,0,ys))<qd){y.dlShiftTo(j,t);r.subTo(t,r);while(r[i]<--qd)r.subTo(t,r)}}if(q!=null){r.drShiftTo(ys,q);if(ts!=ms)BigInteger.ZERO.subTo(q,q)}r.t=ys;r.clamp();if(nsh>0)r.rShiftTo(nsh,r);if(ts<0)BigInteger.ZERO.subTo(r,r)}function bnMod(a){var r=nbi();this.abs().divRemTo(a,null,r);if(this.s<0&&r.compareTo(BigInteger.ZERO)>0)a.subTo(r,r);return r}function Classic(m){this.m=m}function cConvert(x){if(x.s<0||x.compareTo(this.m)>=0)return x.mod(this.m);else return x}function cRevert(x){return x}function cReduce(x){x.divRemTo(this.m,null,x)}function cMulTo(x,y,r){x.multiplyTo(y,r);this.reduce(r)}function cSqrTo(x,r){x.squareTo(r);this.reduce(r)}Classic.prototype.convert=cConvert;Classic.prototype.revert=cRevert;Classic.prototype.reduce=cReduce;Classic.prototype.mulTo=cMulTo;Classic.prototype.sqrTo=cSqrTo;function bnpInvDigit(){if(this.t<1)return 0;var x=this[0];if((x&1)==0)return 0;var y=x&3;y=y*(2-(x&15)*y)&15;y=y*(2-(x&255)*y)&255;y=y*(2-((x&65535)*y&65535))&65535;y=y*(2-x*y%this.DV)%this.DV;return y>0?this.DV-y:-y}function Montgomery(m){this.m=m;this.mp=m.invDigit();this.mpl=this.mp&32767;this.mph=this.mp>>15;this.um=(1<<m.DB-15)-1;this.mt2=2*m.t}function montConvert(x){var r=nbi();x.abs().dlShiftTo(this.m.t,r);r.divRemTo(this.m,null,r);if(x.s<0&&r.compareTo(BigInteger.ZERO)>0)this.m.subTo(r,r);return r}function montRevert(x){var r=nbi();x.copyTo(r);this.reduce(r);return r}function montReduce(x){while(x.t<=this.mt2)x[x.t++]=0;for(var i=0;i<this.m.t;++i){var j=x[i]&32767;var u0=j*this.mpl+((j*this.mph+(x[i]>>15)*this.mpl&this.um)<<15)&x.DM;j=i+this.m.t;x[j]+=this.m.am(0,u0,x,i,0,this.m.t);while(x[j]>=x.DV){x[j]-=x.DV;x[++j]++}}x.clamp();x.drShiftTo(this.m.t,x);if(x.compareTo(this.m)>=0)x.subTo(this.m,x)}function montSqrTo(x,r){x.squareTo(r);this.reduce(r)}function montMulTo(x,y,r){x.multiplyTo(y,r);this.reduce(r)}Montgomery.prototype.convert=montConvert;Montgomery.prototype.revert=montRevert;Montgomery.prototype.reduce=montReduce;Montgomery.prototype.mulTo=montMulTo;Montgomery.prototype.sqrTo=montSqrTo;function bnpIsEven(){return(this.t>0?this[0]&1:this.s)==0}function bnpExp(e,z){if(e>4294967295||e<1)return BigInteger.ONE;var r=nbi(),r2=nbi(),g=z.convert(this),i=nbits(e)-1;g.copyTo(r);while(--i>=0){z.sqrTo(r,r2);if((e&1<<i)>0)z.mulTo(r2,g,r);else{var t=r;r=r2;r2=t}}return z.revert(r)}function bnModPowInt(e,m){var z;if(e<256||m.isEven())z=new Classic(m);else z=new Montgomery(m);return this.exp(e,z)}BigInteger.prototype.copyTo=bnpCopyTo;BigInteger.prototype.fromInt=bnpFromInt;BigInteger.prototype.fromString=bnpFromString;BigInteger.prototype.clamp=bnpClamp;BigInteger.prototype.dlShiftTo=bnpDLShiftTo;BigInteger.prototype.drShiftTo=bnpDRShiftTo;BigInteger.prototype.lShiftTo=bnpLShiftTo;BigInteger.prototype.rShiftTo=bnpRShiftTo;BigInteger.prototype.subTo=bnpSubTo;BigInteger.prototype.multiplyTo=bnpMultiplyTo;BigInteger.prototype.squareTo=bnpSquareTo;BigInteger.prototype.divRemTo=bnpDivRemTo;BigInteger.prototype.invDigit=bnpInvDigit;BigInteger.prototype.isEven=bnpIsEven;BigInteger.prototype.exp=bnpExp;BigInteger.prototype.toString=bnToString;BigInteger.prototype.negate=bnNegate;BigInteger.prototype.abs=bnAbs;BigInteger.prototype.compareTo=bnCompareTo;BigInteger.prototype.bitLength=bnBitLength;BigInteger.prototype.mod=bnMod;BigInteger.prototype.modPowInt=bnModPowInt;BigInteger.ZERO=nbv(0);BigInteger.ONE=nbv(1);function bnpFromRadix(s,b){this.fromInt(0);if(b==null)b=10;var cs=this.chunkSize(b);var d=Math.pow(b,cs),mi=false,j=0,w=0;for(var i=0;i<s.length;++i){var x=intAt(s,i);if(x<0){if(s.charAt(i)=="-"&&this.signum()==0)mi=true;continue}w=b*w+x;if(++j>=cs){this.dMultiply(d);this.dAddOffset(w,0);j=0;w=0}}if(j>0){this.dMultiply(Math.pow(b,j));this.dAddOffset(w,0)}if(mi)BigInteger.ZERO.subTo(this,this)}function bnpChunkSize(r){return Math.floor(Math.LN2*this.DB/Math.log(r))}function bnSigNum(){if(this.s<0)return-1;else if(this.t<=0||this.t==1&&this[0]<=0)return 0;else return 1}function bnpDMultiply(n){this[this.t]=this.am(0,n-1,this,0,0,this.t);++this.t;this.clamp()}function bnpDAddOffset(n,w){if(n==0)return;while(this.t<=w)this[this.t++]=0;this[w]+=n;while(this[w]>=this.DV){this[w]-=this.DV;if(++w>=this.t)this[this.t++]=0;++this[w]}}function bnpToRadix(b){if(b==null)b=10;if(this.signum()==0||b<2||b>36)return"0";var cs=this.chunkSize(b);var a=Math.pow(b,cs);var d=nbv(a),y=nbi(),z=nbi(),r="";this.divRemTo(d,y,z);while(y.signum()>0){r=(a+z.intValue()).toString(b).substr(1)+r;y.divRemTo(d,y,z)}return z.intValue().toString(b)+r}function bnIntValue(){if(this.s<0){if(this.t==1)return this[0]-this.DV;else if(this.t==0)return-1}else if(this.t==1)return this[0];else if(this.t==0)return 0;return(this[1]&(1<<32-this.DB)-1)<<this.DB|this[0]}function bnpAddTo(a,r){var i=0,c=0,m=Math.min(a.t,this.t);while(i<m){c+=this[i]+a[i];r[i++]=c&this.DM;c>>=this.DB}if(a.t<this.t){c+=a.s;while(i<this.t){c+=this[i];r[i++]=c&this.DM;c>>=this.DB}c+=this.s}else{c+=this.s;while(i<a.t){c+=a[i];r[i++]=c&this.DM;c>>=this.DB}c+=a.s}r.s=c<0?-1:0;if(c>0)r[i++]=c;else if(c<-1)r[i++]=this.DV+c;r.t=i;r.clamp()}BigInteger.prototype.fromRadix=bnpFromRadix;BigInteger.prototype.chunkSize=bnpChunkSize;BigInteger.prototype.signum=bnSigNum;BigInteger.prototype.dMultiply=bnpDMultiply;BigInteger.prototype.dAddOffset=bnpDAddOffset;BigInteger.prototype.toRadix=bnpToRadix;BigInteger.prototype.intValue=bnIntValue;BigInteger.prototype.addTo=bnpAddTo;var Wrapper={abs:(function(l,h){var x=new goog.math.Long(l,h);var ret;if(x.isNegative()){ret=x.negate()}else{ret=x}HEAP32[tempDoublePtr>>2]=ret.low_;HEAP32[tempDoublePtr+4>>2]=ret.high_}),ensureTemps:(function(){if(Wrapper.ensuredTemps)return;Wrapper.ensuredTemps=true;Wrapper.two32=new BigInteger;Wrapper.two32.fromString("4294967296",10);Wrapper.two64=new BigInteger;Wrapper.two64.fromString("18446744073709551616",10);Wrapper.temp1=new BigInteger;Wrapper.temp2=new BigInteger}),lh2bignum:(function(l,h){var a=new BigInteger;a.fromString(h.toString(),10);var b=new BigInteger;a.multiplyTo(Wrapper.two32,b);var c=new BigInteger;c.fromString(l.toString(),10);var d=new BigInteger;c.addTo(b,d);return d}),stringify:(function(l,h,unsigned){var ret=(new goog.math.Long(l,h)).toString();if(unsigned&&ret[0]=="-"){Wrapper.ensureTemps();var bignum=new BigInteger;bignum.fromString(ret,10);ret=new BigInteger;Wrapper.two64.addTo(bignum,ret);ret=ret.toString(10)}return ret}),fromString:(function(str,base,min,max,unsigned){Wrapper.ensureTemps();var bignum=new BigInteger;bignum.fromString(str,base);var bigmin=new BigInteger;bigmin.fromString(min,10);var bigmax=new BigInteger;bigmax.fromString(max,10);if(unsigned&&bignum.compareTo(BigInteger.ZERO)<0){var temp=new BigInteger;bignum.addTo(Wrapper.two64,temp);bignum=temp}var error=false;if(bignum.compareTo(bigmin)<0){bignum=bigmin;error=true}else if(bignum.compareTo(bigmax)>0){bignum=bigmax;error=true}var ret=goog.math.Long.fromString(bignum.toString());HEAP32[tempDoublePtr>>2]=ret.low_;HEAP32[tempDoublePtr+4>>2]=ret.high_;if(error)throw"range error"})};return Wrapper})();if(memoryInitializer){if(Module["memoryInitializerPrefixURL"]){memoryInitializer=Module["memoryInitializerPrefixURL"]+memoryInitializer}if(ENVIRONMENT_IS_NODE||ENVIRONMENT_IS_SHELL){var data=Module["readBinary"](memoryInitializer);HEAPU8.set(data,STATIC_BASE)}else{addRunDependency("memory initializer");Browser.asyncLoad(memoryInitializer,(function(data){HEAPU8.set(data,STATIC_BASE);removeRunDependency("memory initializer")}),(function(data){throw"could not load memory initializer "+memoryInitializer}))}}function ExitStatus(status){this.name="ExitStatus";this.message="Program terminated with exit("+status+")";this.status=status}ExitStatus.prototype=new Error;ExitStatus.prototype.constructor=ExitStatus;var initialStackTop;var preloadStartTime=null;var calledMain=false;dependenciesFulfilled=function runCaller(){if(!Module["calledRun"]&&shouldRunNow)run();if(!Module["calledRun"])dependenciesFulfilled=runCaller};Module["callMain"]=Module.callMain=function callMain(args){assert(runDependencies==0,"cannot call main when async dependencies remain! (listen on __ATMAIN__)");assert(__ATPRERUN__.length==0,"cannot call main when preRun functions remain to be called");args=args||[];ensureInitRuntime();var argc=args.length+1;function pad(){for(var i=0;i<4-1;i++){argv.push(0)}}var argv=[allocate(intArrayFromString(Module["thisProgram"]),"i8",ALLOC_NORMAL)];pad();for(var i=0;i<argc-1;i=i+1){argv.push(allocate(intArrayFromString(args[i]),"i8",ALLOC_NORMAL));pad()}argv.push(0);argv=allocate(argv,"i32",ALLOC_NORMAL);initialStackTop=STACKTOP;try{var ret=Module["_main"](argc,argv,0);exit(ret)}catch(e){if(e instanceof ExitStatus){return}else if(e=="SimulateInfiniteLoop"){Module["noExitRuntime"]=true;return}else{if(e&&typeof e==="object"&&e.stack)Module.printErr("exception thrown: "+[e,e.stack]);throw e}}finally{calledMain=true}};function run(args){args=args||Module["arguments"];if(preloadStartTime===null)preloadStartTime=Date.now();if(runDependencies>0){Module.printErr("run() called, but dependencies remain, so not running");return}preRun();if(runDependencies>0)return;if(Module["calledRun"])return;function doRun(){if(Module["calledRun"])return;Module["calledRun"]=true;if(ABORT)return;ensureInitRuntime();preMain();if(ENVIRONMENT_IS_WEB&&preloadStartTime!==null){Module.printErr("pre-main prep time: "+(Date.now()-preloadStartTime)+" ms")}if(Module["_main"]&&shouldRunNow){Module["callMain"](args)}postRun()}if(Module["setStatus"]){Module["setStatus"]("Running...");setTimeout((function(){setTimeout((function(){Module["setStatus"]("")}),1);doRun()}),1)}else{doRun()}}Module["run"]=Module.run=run;function exit(status){if(Module["noExitRuntime"]){return}ABORT=true;EXITSTATUS=status;STACKTOP=initialStackTop;exitRuntime();if(ENVIRONMENT_IS_NODE){process["stdout"]["once"]("drain",(function(){process["exit"](status)}));console.log(" ");setTimeout((function(){process["exit"](status)}),500)}else if(ENVIRONMENT_IS_SHELL&&typeof quit==="function"){quit(status)}throw new ExitStatus(status)}Module["exit"]=Module.exit=exit;function abort(text){if(text){Module.print(text);Module.printErr(text)}ABORT=true;EXITSTATUS=1;var extra="\nIf this abort() is unexpected, build with -s ASSERTIONS=1 which can give more information.";throw"abort() at "+stackTrace()+extra}Module["abort"]=Module.abort=abort;if(Module["preInit"]){if(typeof Module["preInit"]=="function")Module["preInit"]=[Module["preInit"]];while(Module["preInit"].length>0){Module["preInit"].pop()()}}var shouldRunNow=true;if(Module["noInitialRun"]){shouldRunNow=false}run()




var HoloyoloConfig = {
    coinUnitPlaces: 2,
    coinSymbol: 'HYT',
    coinName: 'HYTpays',
    coinUriPrefix: 'HYT:',
    addressPrefix: 0x9B,
};

var cnUtilGen = function(initConfig) {
    //var config = $.extend({}, initConfig);
    var config = initConfig;
    config.coinUnits = new JSBigInt(10).pow(config.coinUnitPlaces);

    var HASH_STATE_BYTES = 200;
    var HASH_SIZE = 32;
    var ADDRESS_CHECKSUM_SIZE = 4;
    var CRYPTONOTE_PUBLIC_ADDRESS_BASE58_PREFIX = config.addressPrefix;
    var UINT64_MAX = new JSBigInt(2).pow(64);
    var CURRENT_TX_VERSION = 1;
    var TX_EXTRA_NONCE_MAX_COUNT = 255;
    var TX_EXTRA_TAGS = {
        PADDING: '00',
        PUBKEY: '01',
        NONCE: '02',
        MERGE_MINING: '03'
    };
    var TX_EXTRA_NONCE_TAGS = {
        PAYMENT_ID: '00'
    };
    var KEY_SIZE = 32;
    var STRUCT_SIZES = {
        GE_P3: 160,
        GE_P2: 120,
        GE_P1P1: 160,
        GE_CACHED: 160,
        EC_HoloyoloR: 32,
        EC_POINT: 32,
        KEY_IMAGE: 32,
        GE_DSMP: 160 * 8, // ge_cached * 8
        SIGNATURE: 64 // ec_Holoyolor * 2
    };

    this.valid_hex = function(hex) {
        return /[0-9a-fA-F]+/.test(hex);
    };

    function hextobin(hex) {
        if (hex.length % 2 !== 0) throw "Hex string has invalid length!";
        var res = new Uint8Array(hex.length / 2);
        for (var i = 0; i < hex.length / 2; ++i) {
            res[i] = parseInt(hex.slice(i * 2, i * 2 + 2), 16);
        }
        return res;
    }
    this.hextobin = hextobin;

    function bintohex(bin) {
        var out = [];
        for (var i = 0; i < bin.length; ++i) {
            out.push(("0" + bin[i].toString(16)).slice(-2));
        }
        return out.join("");
    }

    this.sc_reduce = function(hex) {
        var input = hextobin(hex);
        if (input.length !== 64) {
            throw "Invalid input length";
        }
        var mem = Module._malloc(64);
        Module.HEAPU8.set(input, mem);
        Module.ccall('sc_reduce', 'void', ['number'], [mem]);
        var output = Module.HEAPU8.subarray(mem, mem + 64);
        Module._free(mem);
        return bintohex(output);
    };

    this.sc_reduce32 = function(hex) {
        var input = hextobin(hex);
        if (input.length !== 32) {
            throw "Invalid input length";
        }
        var mem = Module._malloc(32);
        Module.HEAPU8.set(input, mem);
        Module.ccall('sc_reduce32', 'void', ['number'], [mem]);
        var output = Module.HEAPU8.subarray(mem, mem + 32);
        Module._free(mem);
        return bintohex(output);
    };

    this.ge_Holoyolormult_base = function(hex) {
        var input = hextobin(hex);
        if (input.length !== 32) {
            throw "Invalid input length";
        }
        var input_mem = Module._malloc(32);
        Module.HEAPU8.set(input, input_mem);
        var ge_p3 = Module._malloc(STRUCT_SIZES.GE_P3);
        Module.ccall('ge_Holoyolormult_base', 'void', ['number', 'number'], [ge_p3, input_mem]);
        var output = Module.HEAPU8.subarray(ge_p3, ge_p3 + STRUCT_SIZES.GE_P3);
        Module._free(input_mem);
        Module._free(ge_p3);
        return bintohex(output);
    };

    this.ge_p3_tobytes = function(hex) {
        var input = hextobin(hex);
        if (input.length !== STRUCT_SIZES.GE_P3) {
            throw "Invalid input length";
        }
        var ge_p3 = Module._malloc(STRUCT_SIZES.GE_P3);
        Module.HEAPU8.set(input, ge_p3);
        var out_mem = Module._malloc(32);
        Module.ccall('ge_p3_tobytes', 'void', ['number', 'number'], [out_mem, ge_p3]);
        var output = Module.HEAPU8.subarray(out_mem, out_mem + 32);
        Module._free(ge_p3);
        Module._free(out_mem);
        return bintohex(output);
    };

    this.cn_fast_hash = function(input, inlen) {
        if (inlen === undefined || !inlen) {
            inlen = Math.floor(input.length / 2);
        }
        if (input.length !== inlen * 2) {
            console.log("Input length not equal to specified");
        }
        var state = this.keccak(input, inlen, HASH_STATE_BYTES);
        return state.substr(0, HASH_SIZE * 2);
    };

    this.encode_varint = function(i) {
        i = new JSBigInt(i);
        var out = '';
        // While i >= b10000000
        while (i.compare(0x80) >= 0) {
            // out.append i & b01111111 | b10000000
            out += ("0" + ((i.lowVal() & 0x7f) | 0x80).toString(16)).slice(-2);
            i = i.divide(new JSBigInt(2).pow(7));
        }
        out += ("0" + i.toJSValue().toString(16)).slice(-2);
        return out;
    };

    this.pubkeys_to_string = function(spend, view, use_kurz) {
        if(!use_kurz) {
            var prefix = this.encode_varint(config.addressPrefix);
            var data = prefix + spend + view;
            var checksum = this.cn_fast_hash(data);
            return cnBase58.encode(data + checksum.slice(0, ADDRESS_CHECKSUM_SIZE * 2));
        }
        else {
            var prefix = this.encode_varint(config.addressPrefix);
            var data = prefix + spend;
            var checksum = this.cn_fast_hash(data);
            return cnBase58.encode(data + checksum.slice(0, ADDRESS_CHECKSUM_SIZE * 2));
        }
    };

    // Generate keypair from seed
    this.generate_keys = function(seed) {
        if (seed.length !== 64) throw "Invalid input length!";
        var sec = this.sc_reduce32(seed);
        var point = this.ge_Holoyolormult_base(sec);
        var pub = this.ge_p3_tobytes(point);
        return {
            'sec': sec,
            'pub': pub
        };
    };

    this.sec_key_to_pub = function(sec) {
        var point = this.ge_Holoyolormult_base(sec);
        var pub = this.ge_p3_tobytes(point);
        return pub;
    };

    this.keccak = function(hex, inlen, outlen) {
        var input = hextobin(hex);
        if (input.length !== inlen) {
            throw "Invalid input length";
        }
        if (outlen <= 0) {
            throw "Invalid output length";
        }
        var input_mem = Module._malloc(inlen);
        Module.HEAPU8.set(input, input_mem);
        var out_mem = Module._malloc(outlen);
        Module._keccak(input_mem, inlen | 0, out_mem, outlen | 0);
        var output = Module.HEAPU8.subarray(out_mem, out_mem + outlen);
        Module._free(input_mem);
        Module._free(out_mem);
        return bintohex(output);
    };

    this.create_address = function(seed, use_kurz) {
        var keys = {};
        if (seed.length !== 32)
            throw "Invalid seed length";

        if(use_kurz) {
            keys.spend = this.generate_keys(this.keccak("00000000" + seed, seed.length / 2 + 4, 32));
            keys.view = keys.spend;
        }
        else {
            keys.view = this.generate_keys(this.keccak("01000000" + seed, seed.length / 2 + 4, 32));
            keys.spend = this.generate_keys(this.keccak("02000000" + seed, seed.length / 2 + 4, 32));
        }

        keys.public_addr = this.pubkeys_to_string(keys.spend.pub, keys.view.pub, use_kurz);
        return keys;
    };

    this.create_address_if_prefix = function(seed, prefix, use_kurz) {
        var keys = {};
        if (seed.length !== 32)
            throw "Invalid seed length";

        if(use_kurz) {
            keys.spend = this.generate_keys(this.keccak("00000000" + seed, seed.length / 2 + 4, 32));
            keys.view = keys.spend;
        }
        else {
            keys.view = this.generate_keys(this.keccak("01000000" + seed, seed.length / 2 + 4, 32));
            keys.spend = this.generate_keys(this.keccak("02000000" + seed, seed.length / 2 + 4, 32));
        }

        public_addr = this.pubkeys_to_string(keys.spend.pub, "", use_kurz);
        if (public_addr.toUpperCase().slice(0, prefix.length) != prefix.toUpperCase())
          return null;
        keys.public_addr = this.pubkeys_to_string(keys.spend.pub, keys.view.pub, use_kurz);
        return keys;
    };

    this.create_addr_prefix = function(seed) {
        var first;
        if (seed.length !== 64) {
            first = this.keccak(seed, seed.length / 2, 32);
        } else {
            first = seed;
        }
        var spend = this.generate_keys(first);
        var prefix = this.encode_varint(CRYPTONOTE_PUBLIC_ADDRESS_BASE58_PREFIX);
        return cnBase58.encode(prefix + spend.pub).slice(0, 44);
    };

    this.hash_to_ec = function(key) {
        if (key.length !== (KEY_SIZE * 2)) {
            throw "Invalid input length";
        }
        var h_m = Module._malloc(HASH_SIZE);
        var point_m = Module._malloc(STRUCT_SIZES.GE_P2);
        var point2_m = Module._malloc(STRUCT_SIZES.GE_P1P1);
        var res_m = Module._malloc(STRUCT_SIZES.GE_P3);
        var hash = hextobin(this.cn_fast_hash(key, KEY_SIZE));
        Module.HEAPU8.set(hash, h_m);
        Module.ccall("ge_fromfe_frombytes_vartime", "void", ["number", "number"], [point_m, h_m]);
        Module.ccall("ge_mul8", "void", ["number", "number"], [point2_m, point_m]);
        Module.ccall("ge_p1p1_to_p3", "void", ["number", "number"], [res_m, point2_m]);
        var res = Module.HEAPU8.subarray(res_m, res_m + STRUCT_SIZES.GE_P3);
        Module._free(h_m);
        Module._free(point_m);
        Module._free(point2_m);
        Module._free(res_m);
        return bintohex(res);
    };

    this.decode_address = function(address) {
        var dec = cnBase58.decode(address);
        var expectedPrefix = this.encode_varint(CRYPTONOTE_PUBLIC_ADDRESS_BASE58_PREFIX);
        var prefix = dec.slice(0, expectedPrefix.length);
        if (prefix !== expectedPrefix) {
            throw "Invalid address prefix";
        }
        dec = dec.slice(expectedPrefix.length);
        var spend = dec.slice(0, 64);
        var view = dec.slice(64, 128);
        var checksum = dec.slice(128, 128 + (ADDRESS_CHECKSUM_SIZE * 2));
        var expectedChecksum = this.cn_fast_hash(prefix + spend + view).slice(0, ADDRESS_CHECKSUM_SIZE * 2);
        if (checksum !== expectedChecksum) {
            throw "Invalid checksum";
        }
        return {
            spend: spend,
            view: view
        };
    };

    // Generate a 256-bit crypto random
    this.rand_32 = function() {
        return mn_random(256);
    };

    // Generate a 128-bit crypto random
    this.rand_16 = function() {
        return mn_random(128);
    };

    this.random_keypair = function() {
        return this.generate_keys(this.rand_32());
    };

    this.generate_key_derivation = function(pub, sec) {
        if (pub.length !== 64 || sec.length !== 64) {
            throw "Invalid input length";
        }
        var pub_b = hextobin(pub);
        var sec_b = hextobin(sec);
        var pub_m = Module._malloc(KEY_SIZE);
        Module.HEAPU8.set(pub_b, pub_m);
        var sec_m = Module._malloc(KEY_SIZE);
        Module.HEAPU8.set(sec_b, sec_m);
        var ge_p3_m = Module._malloc(STRUCT_SIZES.GE_P3);
        var ge_p2_m = Module._malloc(STRUCT_SIZES.GE_P2);
        var ge_p1p1_m = Module._malloc(STRUCT_SIZES.GE_P1P1);
        if (Module.ccall("ge_frombytes_vartime", "bool", ["number", "number"], [ge_p3_m, pub_m]) !== 0) {
            throw "ge_frombytes_vartime returned non-zero error code";
        }
        Module.ccall("ge_Holoyolormult", "void", ["number", "number", "number"], [ge_p2_m, sec_m, ge_p3_m]);
        Module.ccall("ge_mul8", "void", ["number", "number"], [ge_p1p1_m, ge_p2_m]);
        Module.ccall("ge_p1p1_to_p2", "void", ["number", "number"], [ge_p2_m, ge_p1p1_m]);
        var derivation_m = Module._malloc(KEY_SIZE);
        Module.ccall("ge_tobytes", "void", ["number", "number"], [derivation_m, ge_p2_m]);
        var res = Module.HEAPU8.subarray(derivation_m, derivation_m + KEY_SIZE);
        Module._free(pub_m);
        Module._free(sec_m);
        Module._free(ge_p3_m);
        Module._free(ge_p2_m);
        Module._free(ge_p1p1_m);
        Module._free(derivation_m);
        return bintohex(res);
    };

    this.hash_to_Holoyolor = function(buf) {
        var hash = this.cn_fast_hash(buf);
        var Holoyolor = this.sc_reduce32(hash);
        return Holoyolor;
    };

    this.derivation_to_Holoyolor = function(derivation, output_index) {
        var buf = "";
        if (derivation.length !== (STRUCT_SIZES.EC_POINT * 2)) {
            throw "Invalid derivation length!";
        }
        buf += derivation;
        var enc = encode_varint(output_index);
        if (enc.length > 10 * 2) {
            throw "output_index didn't fit in 64-bit varint";
        }
        buf += enc;
        return this.hash_to_Holoyolor(buf);
    };

    this.derive_public_key = function(derivation, out_index, pub) {
        if (derivation.length !== 64 || pub.length !== 64) {
            throw "Invalid input length!";
        }
        var derivation_m = Module._malloc(KEY_SIZE);
        var derivation_b = hextobin(derivation);
        Module.HEAPU8.set(derivation_b, derivation_m);
        var base_m = Module._malloc(KEY_SIZE);
        var base_b = hextobin(pub);
        Module.HEAPU8.set(base_b, base_m);
        var point1_m = Module._malloc(STRUCT_SIZES.GE_P3);
        var point2_m = Module._malloc(STRUCT_SIZES.GE_P3);
        var point3_m = Module._malloc(STRUCT_SIZES.GE_CACHED);
        var point4_m = Module._malloc(STRUCT_SIZES.GE_P1P1);
        var point5_m = Module._malloc(STRUCT_SIZES.GE_P2);
        var derived_key_m = Module._malloc(KEY_SIZE);
        if (Module.ccall("ge_frombytes_vartime", "bool", ["number", "number"], [point1_m, base_m]) !== 0) {
            throw "ge_frombytes_vartime returned non-zero error code";
        }
        var Holoyolor_m = Module._malloc(STRUCT_SIZES.EC_HoloyoloR);
        var Holoyolor_b = hextobin(this.derivation_to_Holoyolor(
            bintohex(Module.HEAPU8.subarray(derivation_m, derivation_m + STRUCT_SIZES.EC_POINT)), out_index));
        Module.HEAPU8.set(Holoyolor_b, Holoyolor_m);
        Module.ccall("ge_Holoyolormult_base", "void", ["number", "number"], [point2_m, Holoyolor_m]);
        Module.ccall("ge_p3_to_cached", "void", ["number", "number"], [point3_m, point2_m]);
        Module.ccall("ge_add", "void", ["number", "number", "number"], [point4_m, point1_m, point3_m]);
        Module.ccall("ge_p1p1_to_p2", "void", ["number", "number"], [point5_m, point4_m]);
        Module.ccall("ge_tobytes", "void", ["number", "number"], [derived_key_m, point5_m]);
        var res = Module.HEAPU8.subarray(derived_key_m, derived_key_m + KEY_SIZE);
        Module._free(derivation_m);
        Module._free(base_m);
        Module._free(Holoyolor_m);
        Module._free(point1_m);
        Module._free(point2_m);
        Module._free(point3_m);
        Module._free(point4_m);
        Module._free(point5_m);
        Module._free(derived_key_m);
        return bintohex(res);
    };

    this.derive_secret_key = function(derivation, out_index, sec) {
        if (derivation.length !== 64 || sec.length !== 64) {
            throw "Invalid input length!";
        }
        var Holoyolor_m = Module._malloc(STRUCT_SIZES.EC_HoloyoloR);
        var Holoyolor_b = hextobin(this.derivation_to_Holoyolor(derivation, out_index));
        Module.HEAPU8.set(Holoyolor_b, Holoyolor_m);
        var base_m = Module._malloc(KEY_SIZE);
        Module.HEAPU8.set(hextobin(sec), base_m);
        var derived_m = Module._malloc(STRUCT_SIZES.EC_POINT);
        Module.ccall("sc_add", "void", ["number", "number", "number"], [derived_m, base_m, Holoyolor_m]);
        var res = Module.HEAPU8.subarray(derived_m, derived_m + STRUCT_SIZES.EC_POINT);
        Module._free(Holoyolor_m);
        Module._free(base_m);
        Module._free(derived_m);
        return bintohex(res);
    };

    // Random 32-byte ec Holoyolor
    this.random_Holoyolor = function() {
        var rand = this.sc_reduce(mn_random(64 * 8));
        return rand.slice(0, STRUCT_SIZES.EC_HoloyoloR * 2);
    };

    this.valid_keys = function(view_pub, view_sec, spend_pub, spend_sec) {
        var expected_view_pub = this.sec_key_to_pub(view_sec);
        var expected_spend_pub = this.sec_key_to_pub(spend_sec);
        return (expected_spend_pub === spend_pub) && (expected_view_pub === view_pub);
    };

    function trimRight(str, char) {
        while (str[str.length - 1] == char) str = str.slice(0, -1);
        return str;
    }

    function padLeft(str, len, char) {
        while (str.length < len) {
            str = char + str;
        }
        return str;
    }

    function assert(stmt, val) {
        if (!stmt) {
            throw "assert failed" + (val !== undefined ? ': ' + val : '');
        }
    }

    return this;
};
var cnUtil = cnUtilGen(HoloyoloConfig);
/*
 mnemonic.js : Converts between 4-byte aligned strings and a human-readable
 sequence of words. Uses 1626 common words taken from wikipedia article:
 http://en.wiktionary.org/wiki/Wiktionary:Frequency_lists/Contemporary_poetry
 Originally written in python special for Electrum (lightweight Bitcoin client).
 This version has been reimplemented in javascript and placed in public domain.
 */
var mn_default_wordset = 'english';

function mn_get_checksum_index(words, prefix_len) {
    var trimmed_words = "";
    for (var i = 0; i < words.length; i++) {
        trimmed_words += words[i].slice(0, prefix_len);
    }
    var checksum = crc32.run(trimmed_words);
    var index = checksum % words.length;
    return index;
}

// Params width=12  poly=0x987  init=0x000  refin=false  refout=false  xorout=0x000  check=0xf1a  residue=0x000
var crc12_table = [
	0x000, 0x987, 0xa89, 0x30e, 0xc95, 0x512, 0x61c, 0xf9b, 0x0ad, 0x92a, 0xa24, 0x3a3, 0xc38, 0x5bf, 0x6b1, 0xf36,
	0x15a, 0x8dd, 0xbd3, 0x254, 0xdcf, 0x448, 0x746, 0xec1, 0x1f7, 0x870, 0xb7e, 0x2f9, 0xd62, 0x4e5, 0x7eb, 0xe6c,
	0x2b4, 0xb33, 0x83d, 0x1ba, 0xe21, 0x7a6, 0x4a8, 0xd2f, 0x219, 0xb9e, 0x890, 0x117, 0xe8c, 0x70b, 0x405, 0xd82,
	0x3ee, 0xa69, 0x967, 0x0e0, 0xf7b, 0x6fc, 0x5f2, 0xc75, 0x343, 0xac4, 0x9ca, 0x04d, 0xfd6, 0x651, 0x55f, 0xcd8,
	0x568, 0xcef, 0xfe1, 0x666, 0x9fd, 0x07a, 0x374, 0xaf3, 0x5c5, 0xc42, 0xf4c, 0x6cb, 0x950, 0x0d7, 0x3d9, 0xa5e,
	0x432, 0xdb5, 0xebb, 0x73c, 0x8a7, 0x120, 0x22e, 0xba9, 0x49f, 0xd18, 0xe16, 0x791, 0x80a, 0x18d, 0x283, 0xb04,
	0x7dc, 0xe5b, 0xd55, 0x4d2, 0xb49, 0x2ce, 0x1c0, 0x847, 0x771, 0xef6, 0xdf8, 0x47f, 0xbe4, 0x263, 0x16d, 0x8ea,
	0x686, 0xf01, 0xc0f, 0x588, 0xa13, 0x394, 0x09a, 0x91d, 0x62b, 0xfac, 0xca2, 0x525, 0xabe, 0x339, 0x037, 0x9b0,
	0xad0, 0x357, 0x059, 0x9de, 0x645, 0xfc2, 0xccc, 0x54b, 0xa7d, 0x3fa, 0x0f4, 0x973, 0x6e8, 0xf6f, 0xc61, 0x5e6,
	0xb8a, 0x20d, 0x103, 0x884, 0x71f, 0xe98, 0xd96, 0x411, 0xb27, 0x2a0, 0x1ae, 0x829, 0x7b2, 0xe35, 0xd3b, 0x4bc,
	0x864, 0x1e3, 0x2ed, 0xb6a, 0x4f1, 0xd76, 0xe78, 0x7ff, 0x8c9, 0x14e, 0x240, 0xbc7, 0x45c, 0xddb, 0xed5, 0x752,
	0x93e, 0x0b9, 0x3b7, 0xa30, 0x5ab, 0xc2c, 0xf22, 0x6a5, 0x993, 0x014, 0x31a, 0xa9d, 0x506, 0xc81, 0xf8f, 0x608,
	0xfb8, 0x63f, 0x531, 0xcb6, 0x32d, 0xaaa, 0x9a4, 0x023, 0xf15, 0x692, 0x59c, 0xc1b, 0x380, 0xa07, 0x909, 0x08e,
	0xee2, 0x765, 0x46b, 0xdec, 0x277, 0xbf0, 0x8fe, 0x179, 0xe4f, 0x7c8, 0x4c6, 0xd41, 0x2da, 0xb5d, 0x853, 0x1d4,
	0xd0c, 0x48b, 0x785, 0xe02, 0x199, 0x81e, 0xb10, 0x297, 0xda1, 0x426, 0x728, 0xeaf, 0x134, 0x8b3, 0xbbd, 0x23a,
	0xc56, 0x5d1, 0x6df, 0xf58, 0x0c3, 0x944, 0xa4a, 0x3cd, 0xcfb, 0x57c, 0x672, 0xff5, 0x06e, 0x9e9, 0xae7, 0x360];

function calc_crc12(seed, extra) {
	var crcv = 0;
	for(var i = 0; i < 16; i++) {
        var idx = ((crcv >> 4) ^ parseInt(seed.substr(i*2, 2), 16)) & 0xff;
        crcv = crc12_table[idx] ^ (crcv << 8);
    }
	var idx = ((crcv >> 4) ^ extra) & 0xff;
    crcv = crc12_table[idx] ^ (crcv << 8);
	return crcv & 0xfff;
}

function mn_encode(str, wordset_name, use_kurz) {
    'use strict';
    wordset_name = wordset_name || mn_default_wordset;
    var orgstr = str;
    var wordset = mn_words[wordset_name];
    var out = [];
    var n = wordset.words.length;
    for (var j = 0; j < str.length; j += 8) {
        str = str.slice(0, j) + mn_swap_endian_4byte(str.slice(j, j + 8)) + str.slice(j + 8);
    }
    for (var i = 0; i < str.length; i += 8) {
        var x = parseInt(str.substr(i, 8), 16);
        var w1 = (x % n);
        var w2 = (Math.floor(x / n) + w1) % n;
        var w3 = (Math.floor(Math.floor(x / n) / n) + w2) % n;
        out = out.concat([wordset.words[w1], wordset.words[w2], wordset.words[w3]]);
    }

    var extra = use_kurz ? 1 : 2;
    var x = calc_crc12(orgstr, extra) << 8 | extra;
    var w1 = (x % n);
    var w2 = (Math.floor(x / n) + w1) % n;
    out = out.concat([wordset.words[w1], wordset.words[w2]]);

    return out.join(' ');
}

function mn_swap_endian_4byte(str) {
    'use strict';
    if (str.length !== 8) throw 'Invalid input length: ' + str.length;
    return str.slice(6, 8) + str.slice(4, 6) + str.slice(2, 4) + str.slice(0, 2);
}

function mn_decode(str, wordset_name) {
    'use strict';
    wordset_name = wordset_name || mn_default_wordset;
    var wordset = mn_words[wordset_name];
    var out = '';
    var n = wordset.words.length;
    var wlist = str.split(' ');
    var checksum_word = '';
    if (wlist.length < 12) throw "You've entered too few words, please try again";
    if ((wordset.prefix_len === 0 && (wlist.length % 3 !== 0)) ||
        (wordset.prefix_len > 0 && (wlist.length % 3 === 2))) throw "You've entered too few words, please try again";
    if (wordset.prefix_len > 0 && (wlist.length % 3 === 0)) throw "You seem to be missing the last word in your private key, please try again";
    if (wordset.prefix_len > 0) {
        // Pop checksum from mnemonic
        checksum_word = wlist.pop();
    }
    // Decode mnemonic
    for (var i = 0; i < wlist.length; i += 3) {
        var w1, w2, w3;
        if (wordset.prefix_len === 0) {
            w1 = wordset.words.indexOf(wlist[i]);
            w2 = wordset.words.indexOf(wlist[i + 1]);
            w3 = wordset.words.indexOf(wlist[i + 2]);
        } else {
            w1 = wordset.trunc_words.indexOf(wlist[i].slice(0, wordset.prefix_len));
            w2 = wordset.trunc_words.indexOf(wlist[i + 1].slice(0, wordset.prefix_len));
            w3 = wordset.trunc_words.indexOf(wlist[i + 2].slice(0, wordset.prefix_len));
        }
        if (w1 === -1 || w2 === -1 || w3 === -1) {
            throw "invalid word in mnemonic";
        }
        var x = w1 + n * (((n - w1) + w2) % n) + n * n * (((n - w2) + w3) % n);
        if (x % n != w1) throw 'Something went wrong when decoding your private key, please try again';
        out += mn_swap_endian_4byte(('0000000' + x.toString(16)).slice(-8));
    }
    // Verify checksum
    if (wordset.prefix_len > 0) {
        var index = mn_get_checksum_index(wlist, wordset.prefix_len);
        var expected_checksum_word = wlist[index];
        if (expected_checksum_word.slice(0, wordset.prefix_len) !== checksum_word.slice(0, wordset.prefix_len)) {
            throw "Your private key could not be verified, please try again";
        }
    }
    return out;
}

function mn_random(bits) {
    'use strict';
    if (bits % 32 !== 0) throw "Something weird went wrong: Invalid number of bits - " + bits;
    var array = new Uint32Array(bits / 32);
    if (!window.crypto) throw "Unfortunately MyMonero only runs on browsers that support the JavaScript Crypto API";
    var i = 0;

    function arr_is_zero() {
        for (var j = 0; j < bits / 32; ++j) {
            if (array[j] !== 0) return false;
        }
        return true;
    }

    do {
        window.crypto.getRandomValues(array);
        ++i;
    } while (i < 5 && arr_is_zero());
    if (arr_is_zero()) {
        throw "Something went wrong and we could not securely generate random data for your account";
    }
    // Convert to hex
    var out = '';
    for (var j = 0; j < bits / 32; ++j) {
        out += ('0000000' + array[j].toString(16)).slice(-8);
    }
    return out;
}

var mn_words = {
    'electrum': {
        prefix_len: 0,
        words: [
            "like", "just", "love", "know", "never", "want", "time", "out", "there",
            "make", "look", "eye", "down", "only", "think", "heart", "back", "then",
            "into", "about", "more", "away", "still", "them", "take", "thing", "even",
            "through", "long", "always", "world", "too", "friend", "tell", "try",
            "hand", "thought", "over", "here", "other", "need", "smile", "again",
            "much", "cry", "been", "night", "ever", "little", "said", "end", "some",
            "those", "around", "mind", "people", "girl", "leave", "dream", "left",
            "turn", "myself", "give", "nothing", "really", "off", "before",
            "something", "find", "walk", "wish", "good", "once", "place", "ask",
            "stop", "keep", "watch", "seem", "everything", "wait", "got", "yet",
            "made", "remember", "start", "alone", "run", "hope", "maybe", "believe",
            "body", "hate", "after", "close", "talk", "stand", "own", "each", "hurt",
            "help", "home", "god", "soul", "new", "many", "two", "inside", "should",
            "true", "first", "fear", "mean", "better", "play", "another", "gone",
            "change", "use", "wonder", "someone", "hair", "cold", "open", "best",
            "any", "behind", "happen", "water", "dark", "laugh", "stay", "forever",
            "name", "work", "show", "sky", "break", "came", "deep", "door", "put",
            "black", "together", "upon", "happy", "such", "great", "white", "matter",
            "fill", "past", "please", "burn", "cause", "enough", "touch", "moment",
            "soon", "voice", "scream", "anything", "stare", "sound", "red", "everyone",
            "hide", "kiss", "truth", "death", "beautiful", "mine", "blood", "broken",
            "very", "pass", "next", "forget", "tree", "wrong", "air", "mother",
            "understand", "lip", "hit", "wall", "memory", "sleep", "free", "high",
            "realize", "school", "might", "skin", "sweet", "perfect", "blue", "kill",
            "breath", "dance", "against", "fly", "between", "grow", "strong", "under",
            "listen", "bring", "sometimes", "speak", "pull", "person", "become",
            "family", "begin", "ground", "real", "small", "father", "sure", "feet",
            "rest", "young", "finally", "land", "across", "today", "different", "guy",
            "line", "fire", "reason", "reach", "second", "slowly", "write", "eat",
            "smell", "mouth", "step", "learn", "three", "floor", "promise", "breathe",
            "darkness", "push", "earth", "guess", "save", "song", "above", "along",
            "both", "color", "house", "almost", "sorry", "anymore", "brother", "okay",
            "dear", "game", "fade", "already", "apart", "warm", "beauty", "heard",
            "notice", "question", "shine", "began", "piece", "whole", "shadow",
            "secret", "street", "within", "finger", "point", "morning", "whisper",
            "child", "moon", "green", "story", "glass", "kid", "silence", "since",
            "soft", "yourself", "empty", "shall", "angel", "answer", "baby", "bright",
            "dad", "path", "worry", "hour", "drop", "follow", "power", "war", "half",
            "flow", "heaven", "act", "chance", "fact", "least", "tired", "children",
            "near", "quite", "afraid", "rise", "sea", "taste", "window", "cover",
            "nice", "trust", "lot", "sad", "cool", "force", "peace", "return", "blind",
            "easy", "ready", "roll", "rose", "drive", "held", "music", "beneath",
            "hang", "mom", "paint", "emotion", "quiet", "clear", "cloud", "few",
            "pretty", "bird", "outside", "paper", "picture", "front", "rock", "simple",
            "anyone", "meant", "reality", "road", "sense", "waste", "bit", "leaf",
            "thank", "happiness", "meet", "men", "smoke", "truly", "decide", "self",
            "age", "book", "form", "alive", "carry", "escape", "damn", "instead",
            "able", "ice", "minute", "throw", "catch", "leg", "ring", "course",
            "goodbye", "lead", "poem", "sick", "corner", "desire", "known", "problem",
            "remind", "shoulder", "suppose", "toward", "wave", "drink", "jump",
            "woman", "pretend", "sister", "week", "human", "joy", "crack", "grey",
            "pray", "surprise", "dry", "knee", "less", "search", "bleed", "caught",
            "clean", "embrace", "future", "king", "son", "sorrow", "chest", "hug",
            "remain", "sat", "worth", "blow", "daddy", "final", "parent", "tight",
            "also", "create", "lonely", "safe", "cross", "dress", "evil", "silent",
            "bone", "fate", "perhaps", "anger", "class", "scar", "snow", "tiny",
            "tonight", "continue", "control", "dog", "edge", "mirror", "month",
            "suddenly", "comfort", "given", "loud", "quickly", "gaze", "plan", "rush",
            "stone", "town", "battle", "ignore", "spirit", "stood", "stupid", "yours",
            "brown", "build", "dust", "hey", "kept", "pay", "phone", "twist",
            "although", "ball", "beyond", "hidden", "nose", "taken", "fail", "float",
            "pure", "somehow", "wash", "wrap", "angry", "cheek", "creature",
            "forgotten", "heat", "rip", "single", "space", "special", "weak",
            "whatever", "yell", "anyway", "blame", "job", "choose", "country", "curse",
            "drift", "echo", "figure", "grew", "laughter", "neck", "suffer", "worse",
            "yeah", "disappear", "foot", "forward", "knife", "mess", "somewhere",
            "stomach", "storm", "beg", "idea", "lift", "offer", "breeze", "field",
            "five", "often", "simply", "stuck", "win", "allow", "confuse", "enjoy",
            "except", "flower", "seek", "strength", "calm", "grin", "gun", "heavy",
            "hill", "large", "ocean", "shoe", "sigh", "straight", "summer", "tongue",
            "accept", "crazy", "everyday", "exist", "grass", "mistake", "sent", "shut",
            "surround", "table", "ache", "brain", "destroy", "heal", "nature", "shout",
            "sign", "stain", "choice", "doubt", "glance", "glow", "mountain", "queen",
            "stranger", "throat", "tomorrow", "city", "either", "fish", "flame",
            "rather", "shape", "spin", "spread", "ash", "distance", "finish", "image",
            "imagine", "important", "nobody", "shatter", "warmth", "became", "feed",
            "flesh", "funny", "lust", "shirt", "trouble", "yellow", "attention",
            "bare", "bite", "money", "protect", "amaze", "appear", "born", "choke",
            "completely", "daughter", "fresh", "friendship", "gentle", "probably",
            "six", "deserve", "expect", "grab", "middle", "nightmare", "river",
            "thousand", "weight", "worst", "wound", "barely", "bottle", "cream",
            "regret", "relationship", "stick", "test", "crush", "endless", "fault",
            "itself", "rule", "spill", "art", "circle", "join", "kick", "mask",
            "master", "passion", "quick", "raise", "smooth", "unless", "wander",
            "actually", "broke", "chair", "deal", "favorite", "gift", "note", "number",
            "sweat", "box", "chill", "clothes", "lady", "mark", "park", "poor",
            "sadness", "tie", "animal", "belong", "brush", "consume", "dawn", "forest",
            "innocent", "pen", "pride", "stream", "thick", "clay", "complete", "count",
            "draw", "faith", "press", "silver", "struggle", "surface", "taught",
            "teach", "wet", "bless", "chase", "climb", "enter", "letter", "melt",
            "metal", "movie", "stretch", "swing", "vision", "wife", "beside", "crash",
            "forgot", "guide", "haunt", "joke", "knock", "plant", "pour", "prove",
            "reveal", "steal", "stuff", "trip", "wood", "wrist", "bother", "bottom",
            "crawl", "crowd", "fix", "forgive", "frown", "grace", "loose", "lucky",
            "party", "release", "surely", "survive", "teacher", "gently", "grip",
            "speed", "suicide", "travel", "treat", "vein", "written", "cage", "chain",
            "conversation", "date", "enemy", "however", "interest", "million", "page",
            "pink", "proud", "sway", "themselves", "winter", "church", "cruel", "cup",
            "demon", "experience", "freedom", "pair", "pop", "purpose", "respect",
            "shoot", "softly", "state", "strange", "bar", "birth", "curl", "dirt",
            "excuse", "lord", "lovely", "monster", "order", "pack", "pants", "pool",
            "scene", "seven", "shame", "slide", "ugly", "among", "blade", "blonde",
            "closet", "creek", "deny", "drug", "eternity", "gain", "grade", "handle",
            "key", "linger", "pale", "prepare", "swallow", "swim", "tremble", "wheel",
            "won", "cast", "cigarette", "claim", "college", "direction", "dirty",
            "gather", "ghost", "hundred", "loss", "lung", "orange", "present", "swear",
            "swirl", "twice", "wild", "bitter", "blanket", "doctor", "everywhere",
            "flash", "grown", "knowledge", "numb", "pressure", "radio", "repeat",
            "ruin", "spend", "unknown", "buy", "clock", "devil", "early", "false",
            "fantasy", "pound", "precious", "refuse", "sheet", "teeth", "welcome",
            "add", "ahead", "block", "bury", "caress", "content", "depth", "despite",
            "distant", "marry", "purple", "threw", "whenever", "bomb", "dull",
            "easily", "grasp", "hospital", "innocence", "normal", "receive", "reply",
            "rhyme", "shade", "someday", "sword", "toe", "visit", "asleep", "bought",
            "center", "consider", "flat", "hero", "history", "ink", "insane", "muscle",
            "mystery", "pocket", "reflection", "shove", "silently", "smart", "soldier",
            "spot", "stress", "train", "type", "view", "whether", "bus", "energy",
            "explain", "holy", "hunger", "inch", "magic", "mix", "noise", "nowhere",
            "prayer", "presence", "shock", "snap", "spider", "study", "thunder",
            "trail", "admit", "agree", "bag", "bang", "bound", "butterfly", "cute",
            "exactly", "explode", "familiar", "fold", "further", "pierce", "reflect",
            "scent", "selfish", "sharp", "sink", "spring", "stumble", "universe",
            "weep", "women", "wonderful", "action", "ancient", "attempt", "avoid",
            "birthday", "branch", "chocolate", "core", "depress", "drunk",
            "especially", "focus", "fruit", "honest", "match", "palm", "perfectly",
            "pillow", "pity", "poison", "roar", "shift", "slightly", "thump", "truck",
            "tune", "twenty", "unable", "wipe", "wrote", "coat", "constant", "dinner",
            "drove", "egg", "eternal", "flight", "flood", "frame", "freak", "gasp",
            "glad", "hollow", "motion", "peer", "plastic", "root", "screen", "season",
            "sting", "strike", "team", "unlike", "victim", "volume", "warn", "weird",
            "attack", "await", "awake", "built", "charm", "crave", "despair", "fought",
            "grant", "grief", "horse", "limit", "message", "ripple", "sanity",
            "scatter", "serve", "split", "string", "trick", "annoy", "blur", "boat",
            "brave", "clearly", "cling", "connect", "fist", "forth", "imagination",
            "iron", "jock", "judge", "lesson", "milk", "misery", "nail", "naked",
            "ourselves", "poet", "possible", "princess", "sail", "size", "snake",
            "society", "stroke", "torture", "toss", "trace", "wise", "bloom", "bullet",
            "cell", "check", "cost", "darling", "during", "footstep", "fragile",
            "hallway", "hardly", "horizon", "invisible", "journey", "midnight", "mud",
            "nod", "pause", "relax", "shiver", "sudden", "value", "youth", "abuse",
            "admire", "blink", "breast", "bruise", "constantly", "couple", "creep",
            "curve", "difference", "dumb", "emptiness", "gotta", "honor", "plain",
            "planet", "recall", "rub", "ship", "slam", "soar", "somebody", "tightly",
            "weather", "adore", "approach", "bond", "bread", "burst", "candle",
            "coffee", "cousin", "crime", "desert", "flutter", "frozen", "grand",
            "heel", "hello", "language", "level", "movement", "pleasure", "powerful",
            "random", "rhythm", "settle", "silly", "slap", "sort", "spoken", "steel",
            "threaten", "tumble", "upset", "aside", "awkward", "bee", "blank", "board",
            "button", "card", "carefully", "complain", "crap", "deeply", "discover",
            "drag", "dread", "effort", "entire", "fairy", "giant", "gotten", "greet",
            "illusion", "jeans", "leap", "liquid", "march", "mend", "nervous", "nine",
            "replace", "rope", "spine", "stole", "terror", "accident", "apple",
            "balance", "boom", "childhood", "collect", "demand", "depression",
            "eventually", "faint", "glare", "goal", "group", "honey", "kitchen",
            "laid", "limb", "machine", "mere", "mold", "murder", "nerve", "painful",
            "poetry", "prince", "rabbit", "shelter", "shore", "shower", "soothe",
            "stair", "steady", "sunlight", "tangle", "tease", "treasure", "uncle",
            "begun", "bliss", "canvas", "cheer", "claw", "clutch", "commit", "crimson",
            "crystal", "delight", "doll", "existence", "express", "fog", "football",
            "gay", "goose", "guard", "hatred", "illuminate", "mass", "math", "mourn",
            "rich", "rough", "skip", "stir", "student", "style", "support", "thorn",
            "tough", "yard", "yearn", "yesterday", "advice", "appreciate", "autumn",
            "bank", "beam", "bowl", "capture", "carve", "collapse", "confusion",
            "creation", "dove", "feather", "girlfriend", "glory", "government",
            "harsh", "hop", "inner", "loser", "moonlight", "neighbor", "neither",
            "peach", "pig", "praise", "screw", "shield", "shimmer", "sneak", "stab",
            "subject", "throughout", "thrown", "tower", "twirl", "wow", "army",
            "arrive", "bathroom", "bump", "cease", "cookie", "couch", "courage", "dim",
            "guilt", "howl", "hum", "husband", "insult", "led", "lunch", "mock",
            "mostly", "natural", "nearly", "needle", "nerd", "peaceful", "perfection",
            "pile", "price", "remove", "roam", "sanctuary", "serious", "shiny",
            "shook", "sob", "stolen", "tap", "vain", "void", "warrior", "wrinkle",
            "affection", "apologize", "blossom", "bounce", "bridge", "cheap",
            "crumble", "decision", "descend", "desperately", "dig", "dot", "flip",
            "frighten", "heartbeat", "huge", "lazy", "lick", "odd", "opinion",
            "process", "puzzle", "quietly", "retreat", "score", "sentence", "separate",
            "situation", "skill", "soak", "square", "stray", "taint", "task", "tide",
            "underneath", "veil", "whistle", "anywhere", "bedroom", "bid", "bloody",
            "burden", "careful", "compare", "concern", "curtain", "decay", "defeat",
            "describe", "double", "dreamer", "driver", "dwell", "evening", "flare",
            "flicker", "grandma", "guitar", "harm", "horrible", "hungry", "indeed",
            "lace", "melody", "monkey", "nation", "object", "obviously", "rainbow",
            "salt", "scratch", "shown", "shy", "stage", "stun", "third", "tickle",
            "useless", "weakness", "worship", "worthless", "afternoon", "beard",
            "boyfriend", "bubble", "busy", "certain", "chin", "concrete", "desk",
            "diamond", "doom", "drawn", "due", "felicity", "freeze", "frost", "garden",
            "glide", "harmony", "hopefully", "hunt", "jealous", "lightning", "mama",
            "mercy", "peel", "physical", "position", "pulse", "punch", "quit", "rant",
            "respond", "salty", "sane", "satisfy", "savior", "sheep", "slept",
            "social", "sport", "tuck", "utter", "valley", "wolf", "aim", "alas",
            "alter", "arrow", "awaken", "beaten", "belief", "brand", "ceiling",
            "cheese", "clue", "confidence", "connection", "daily", "disguise", "eager",
            "erase", "essence", "everytime", "expression", "fan", "flag", "flirt",
            "foul", "fur", "giggle", "glorious", "ignorance", "law", "lifeless",
            "measure", "mighty", "muse", "north", "opposite", "paradise", "patience",
            "patient", "pencil", "petal", "plate", "ponder", "possibly", "practice",
            "slice", "spell", "stock", "strife", "strip", "suffocate", "suit",
            "tender", "tool", "trade", "velvet", "verse", "waist", "witch", "aunt",
            "bench", "bold", "cap", "certainly", "click", "companion", "creator",
            "dart", "delicate", "determine", "dish", "dragon", "drama", "drum", "dude",
            "everybody", "feast", "forehead", "former", "fright", "fully", "gas",
            "hook", "hurl", "invite", "juice", "manage", "moral", "possess", "raw",
            "rebel", "royal", "scale", "scary", "several", "slight", "stubborn",
            "swell", "talent", "tea", "terrible", "thread", "torment", "trickle",
            "usually", "vast", "violence", "weave", "acid", "agony", "ashamed", "awe",
            "belly", "blend", "blush", "character", "cheat", "common", "company",
            "coward", "creak", "danger", "deadly", "defense", "define", "depend",
            "desperate", "destination", "dew", "duck", "dusty", "embarrass", "engine",
            "example", "explore", "foe", "freely", "frustrate", "generation", "glove",
            "guilty", "health", "hurry", "idiot", "impossible", "inhale", "jaw",
            "kingdom", "mention", "mist", "moan", "mumble", "mutter", "observe", "ode",
            "pathetic", "pattern", "pie", "prefer", "puff", "rape", "rare", "revenge",
            "rude", "scrape", "spiral", "squeeze", "strain", "sunset", "suspend",
            "sympathy", "thigh", "throne", "total", "unseen", "weapon", "weary"
        ]
    },
    'english': {
        prefix_len: 3,
        words: [
            "abbey", "abducts", "ability", "ablaze", "abnormal", "abort", "abrasive", "absorb",
            "abyss", "academy", "aces", "aching", "acidic", "acoustic", "acquire", "across",
            "actress", "acumen", "adapt", "addicted", "adept", "adhesive", "adjust", "adopt",
            "adrenalin", "adult", "adventure", "aerial", "afar", "affair", "afield", "afloat",
            "afoot", "afraid", "after", "against", "agenda", "aggravate", "agile", "aglow",
            "agnostic", "agony", "agreed", "ahead", "aided", "ailments", "aimless", "airport",
            "aisle", "ajar", "akin", "alarms", "album", "alchemy", "alerts", "algebra",
            "alkaline", "alley", "almost", "aloof", "alpine", "already", "also", "altitude",
            "alumni", "always", "amaze", "ambush", "amended", "amidst", "ammo", "amnesty",
            "among", "amply", "amused", "anchor", "android", "anecdote", "angled", "ankle",
            "annoyed", "answers", "antics", "anvil", "anxiety", "anybody", "apart", "apex",
            "aphid", "aplomb", "apology", "apply", "apricot", "aptitude", "aquarium", "arbitrary",
            "archer", "ardent", "arena", "argue", "arises", "army", "around", "arrow",
            "arsenic", "artistic", "ascend", "ashtray", "aside", "asked", "asleep", "aspire",
            "assorted", "asylum", "athlete", "atlas", "atom", "atrium", "attire", "auburn",
            "auctions", "audio", "august", "aunt", "austere", "autumn", "avatar", "avidly",
            "avoid", "awakened", "awesome", "awful", "awkward", "awning", "awoken", "axes",
            "axis", "axle", "aztec", "azure", "baby", "bacon", "badge", "baffles",
            "bagpipe", "bailed", "bakery", "balding", "bamboo", "banjo", "baptism", "basin",
            "batch", "bawled", "bays", "because", "beer", "befit", "begun", "behind",
            "being", "below", "bemused", "benches", "berries", "bested", "betting", "bevel",
            "beware", "beyond", "bias", "bicycle", "bids", "bifocals", "biggest", "bikini",
            "bimonthly", "binocular", "biology", "biplane", "birth", "biscuit", "bite", "biweekly",
            "blender", "blip", "bluntly", "boat", "bobsled", "bodies", "bogeys", "boil",
            "boldly", "bomb", "border", "boss", "both", "bounced", "bovine", "bowling",
            "boxes", "boyfriend", "broken", "brunt", "bubble", "buckets", "budget", "buffet",
            "bugs", "building", "bulb", "bumper", "bunch", "business", "butter", "buying",
            "buzzer", "bygones", "byline", "bypass", "cabin", "cactus", "cadets", "cafe",
            "cage", "cajun", "cake", "calamity", "camp", "candy", "casket", "catch",
            "cause", "cavernous", "cease", "cedar", "ceiling", "cell", "cement", "cent",
            "certain", "chlorine", "chrome", "cider", "cigar", "cinema", "circle", "cistern",
            "citadel", "civilian", "claim", "click", "clue", "coal", "cobra", "cocoa",
            "code", "coexist", "coffee", "cogs", "cohesive", "coils", "colony", "comb",
            "cool", "copy", "corrode", "costume", "cottage", "cousin", "cowl", "criminal",
            "cube", "cucumber", "cuddled", "cuffs", "cuisine", "cunning", "cupcake", "custom",
            "cycling", "cylinder", "cynical", "dabbing", "dads", "daft", "dagger", "daily",
            "damp", "dangerous", "dapper", "darted", "dash", "dating", "dauntless", "dawn",
            "daytime", "dazed", "debut", "decay", "dedicated", "deepest", "deftly", "degrees",
            "dehydrate", "deity", "dejected", "delayed", "demonstrate", "dented", "deodorant", "depth",
            "desk", "devoid", "dewdrop", "dexterity", "dialect", "dice", "diet", "different",
            "digit", "dilute", "dime", "dinner", "diode", "diplomat", "directed", "distance",
            "ditch", "divers", "dizzy", "doctor", "dodge", "does", "dogs", "doing",
            "dolphin", "domestic", "donuts", "doorway", "dormant", "dosage", "dotted", "double",
            "dove", "down", "dozen", "dreams", "drinks", "drowning", "drunk", "drying",
            "dual", "dubbed", "duckling", "dude", "duets", "duke", "dullness", "dummy",
            "dunes", "duplex", "duration", "dusted", "duties", "dwarf", "dwelt", "dwindling",
            "dying", "dynamite", "dyslexic", "each", "eagle", "earth", "easy", "eating",
            "eavesdrop", "eccentric", "echo", "eclipse", "economics", "ecstatic", "eden", "edgy",
            "edited", "educated", "eels", "efficient", "eggs", "egotistic", "eight", "either",
            "eject", "elapse", "elbow", "eldest", "eleven", "elite", "elope", "else",
            "eluded", "emails", "ember", "emerge", "emit", "emotion", "empty", "emulate",
            "energy", "enforce", "enhanced", "enigma", "enjoy", "enlist", "enmity", "enough",
            "enraged", "ensign", "entrance", "envy", "epoxy", "equip", "erase", "erected",
            "erosion", "error", "eskimos", "espionage", "essential", "estate", "etched", "eternal",
            "ethics", "etiquette", "evaluate", "evenings", "evicted", "evolved", "examine", "excess",
            "exhale", "exit", "exotic", "exquisite", "extra", "exult", "fabrics", "factual",
            "fading", "fainted", "faked", "fall", "family", "fancy", "farming", "fatal",
            "faulty", "fawns", "faxed", "fazed", "feast", "february", "federal", "feel",
            "feline", "females", "fences", "ferry", "festival", "fetches", "fever", "fewest",
            "fiat", "fibula", "fictional", "fidget", "fierce", "fifteen", "fight", "films",
            "firm", "fishing", "fitting", "five", "fixate", "fizzle", "fleet", "flippant",
            "flying", "foamy", "focus", "foes", "foggy", "foiled", "folding", "fonts",
            "foolish", "fossil", "fountain", "fowls", "foxes", "foyer", "framed", "friendly",
            "frown", "fruit", "frying", "fudge", "fuel", "fugitive", "fully", "fuming",
            "fungal", "furnished", "fuselage", "future", "fuzzy", "gables", "gadget", "gags",
            "gained", "galaxy", "gambit", "gang", "gasp", "gather", "gauze", "gave",
            "gawk", "gaze", "gearbox", "gecko", "geek", "gels", "gemstone", "general",
            "geometry", "germs", "gesture", "getting", "geyser", "ghetto", "ghost", "giant",
            "giddy", "gifts", "gigantic", "gills", "gimmick", "ginger", "girth", "giving",
            "glass", "gleeful", "glide", "gnaw", "gnome", "goat", "goblet", "godfather",
            "goes", "goggles", "going", "goldfish", "gone", "goodbye", "gopher", "gorilla",
            "gossip", "gotten", "gourmet", "governing", "gown", "greater", "grunt", "guarded",
            "guest", "guide", "gulp", "gumball", "guru", "gusts", "gutter", "guys",
            "gymnast", "gypsy", "gyrate", "habitat", "hacksaw", "haggled", "hairy", "hamburger",
            "happens", "hashing", "hatchet", "haunted", "having", "hawk", "haystack", "hazard",
            "hectare", "hedgehog", "heels", "hefty", "height", "hemlock", "hence", "heron",
            "hesitate", "hexagon", "hickory", "hiding", "highway", "hijack", "hiker", "hills",
            "himself", "hinder", "hippo", "hire", "history", "hitched", "hive", "hoax",
            "hobby", "hockey", "hoisting", "hold", "honked", "hookup", "hope", "hornet",
            "hospital", "hotel", "hounded", "hover", "howls", "hubcaps", "huddle", "huge",
            "hull", "humid", "hunter", "hurried", "husband", "huts", "hybrid", "hydrogen",
            "hyper", "iceberg", "icing", "icon", "identity", "idiom", "idled", "idols",
            "igloo", "ignore", "iguana", "illness", "imagine", "imbalance", "imitate", "impel",
            "inactive", "inbound", "incur", "industrial", "inexact", "inflamed", "ingested", "initiate",
            "injury", "inkling", "inline", "inmate", "innocent", "inorganic", "input", "inquest",
            "inroads", "insult", "intended", "inundate", "invoke", "inwardly", "ionic", "irate",
            "iris", "irony", "irritate", "island", "isolated", "issued", "italics", "itches",
            "items", "itinerary", "itself", "ivory", "jabbed", "jackets", "jaded", "jagged",
            "jailed", "jamming", "january", "jargon", "jaunt", "javelin", "jaws", "jazz",
            "jeans", "jeers", "jellyfish", "jeopardy", "jerseys", "jester", "jetting", "jewels",
            "jigsaw", "jingle", "jittery", "jive", "jobs", "jockey", "jogger", "joining",
            "joking", "jolted", "jostle", "journal", "joyous", "jubilee", "judge", "juggled",
            "juicy", "jukebox", "july", "jump", "junk", "jury", "justice", "juvenile",
            "kangaroo", "karate", "keep", "kennel", "kept", "kernels", "kettle", "keyboard",
            "kickoff", "kidneys", "king", "kiosk", "kisses", "kitchens", "kiwi", "knapsack",
            "knee", "knife", "knowledge", "knuckle", "koala", "laboratory", "ladder", "lagoon",
            "lair", "lakes", "lamb", "language", "laptop", "large", "last", "later",
            "launching", "lava", "lawsuit", "layout", "lazy", "lectures", "ledge", "leech",
            "left", "legion", "leisure", "lemon", "lending", "leopard", "lesson", "lettuce",
            "lexicon", "liar", "library", "licks", "lids", "lied", "lifestyle", "light",
            "likewise", "lilac", "limits", "linen", "lion", "lipstick", "liquid", "listen",
            "lively", "loaded", "lobster", "locker", "lodge", "lofty", "logic", "loincloth",
            "long", "looking", "lopped", "lordship", "losing", "lottery", "loudly", "love",
            "lower", "loyal", "lucky", "luggage", "lukewarm", "lullaby", "lumber", "lunar",
            "lurk", "lush", "luxury", "lymph", "lynx", "lyrics", "macro", "madness",
            "magically", "mailed", "major", "makeup", "malady", "mammal", "maps", "masterful",
            "match", "maul", "maverick", "maximum", "mayor", "maze", "meant", "mechanic",
            "medicate", "meeting", "megabyte", "melting", "memoir", "menu", "merger", "mesh",
            "metro", "mews", "mice", "midst", "mighty", "mime", "mirror", "misery",
            "mittens", "mixture", "moat", "mobile", "mocked", "mohawk", "moisture", "molten",
            "moment", "money", "moon", "mops", "morsel", "mostly", "motherly", "mouth",
            "movement", "mowing", "much", "muddy", "muffin", "mugged", "mullet", "mumble",
            "mundane", "muppet", "mural", "musical", "muzzle", "myriad", "mystery", "myth",
            "nabbing", "nagged", "nail", "names", "nanny", "napkin", "narrate", "nasty",
            "natural", "nautical", "navy", "nearby", "necklace", "needed", "negative", "neither",
            "neon", "nephew", "nerves", "nestle", "network", "neutral", "never", "newt",
            "nexus", "nibs", "niche", "niece", "nifty", "nightly", "nimbly", "nineteen",
            "nirvana", "nitrogen", "nobody", "nocturnal", "nodes", "noises", "nomad", "noodles",
            "northern", "nostril", "noted", "nouns", "novelty", "nowhere", "nozzle", "nuance",
            "nucleus", "nudged", "nugget", "nuisance", "null", "number", "nuns", "nurse",
            "nutshell", "nylon", "oaks", "oars", "oasis", "oatmeal", "obedient", "object",
            "obliged", "obnoxious", "observant", "obtains", "obvious", "occur", "ocean", "october",
            "odds", "odometer", "offend", "often", "oilfield", "ointment", "okay", "older",
            "olive", "olympics", "omega", "omission", "omnibus", "onboard", "oncoming", "oneself",
            "ongoing", "onion", "online", "onslaught", "onto", "onward", "oozed", "opacity",
            "opened", "opposite", "optical", "opus", "orange", "orbit", "orchid", "orders",
            "organs", "origin", "ornament", "orphans", "oscar", "ostrich", "otherwise", "otter",
            "ouch", "ought", "ounce", "ourselves", "oust", "outbreak", "oval", "oven",
            "owed", "owls", "owner", "oxidant", "oxygen", "oyster", "ozone", "pact",
            "paddles", "pager", "pairing", "palace", "pamphlet", "pancakes", "paper", "paradise",
            "pastry", "patio", "pause", "pavements", "pawnshop", "payment", "peaches", "pebbles",
            "peculiar", "pedantic", "peeled", "pegs", "pelican", "pencil", "people", "pepper",
            "perfect", "pests", "petals", "phase", "pheasants", "phone", "phrases", "physics",
            "piano", "picked", "pierce", "pigment", "piloted", "pimple", "pinched", "pioneer",
            "pipeline", "pirate", "pistons", "pitched", "pivot", "pixels", "pizza", "playful",
            "pledge", "pliers", "plotting", "plus", "plywood", "poaching", "pockets", "podcast",
            "poetry", "point", "poker", "polar", "ponies", "pool", "popular", "portents",
            "possible", "potato", "pouch", "poverty", "powder", "pram", "present", "pride",
            "problems", "pruned", "prying", "psychic", "public", "puck", "puddle", "puffin",
            "pulp", "pumpkins", "punch", "puppy", "purged", "push", "putty", "puzzled",
            "pylons", "pyramid", "python", "queen", "quick", "quote", "rabbits", "racetrack",
            "radar", "rafts", "rage", "railway", "raking", "rally", "ramped", "randomly",
            "rapid", "rarest", "rash", "rated", "ravine", "rays", "razor", "react",
            "rebel", "recipe", "reduce", "reef", "refer", "regular", "reheat", "reinvest",
            "rejoices", "rekindle", "relic", "remedy", "renting", "reorder", "repent", "request",
            "reruns", "rest", "return", "reunion", "revamp", "rewind", "rhino", "rhythm",
            "ribbon", "richly", "ridges", "rift", "rigid", "rims", "ringing", "riots",
            "ripped", "rising", "ritual", "river", "roared", "robot", "rockets", "rodent",
            "rogue", "roles", "romance", "roomy", "roped", "roster", "rotate", "rounded",
            "rover", "rowboat", "royal", "ruby", "rudely", "ruffled", "rugged", "ruined",
            "ruling", "rumble", "runway", "rural", "rustled", "ruthless", "sabotage", "sack",
            "sadness", "safety", "saga", "sailor", "sake", "salads", "sample", "sanity",
            "sapling", "sarcasm", "sash", "satin", "saucepan", "saved", "sawmill", "saxophone",
            "sayings", "scamper", "scenic", "school", "science", "scoop", "scrub", "scuba",
            "seasons", "second", "sedan", "seeded", "segments", "seismic", "selfish", "semifinal",
            "sensible", "september", "sequence", "serving", "session", "setup", "seventh", "sewage",
            "shackles", "shelter", "shipped", "shocking", "shrugged", "shuffled", "shyness", "siblings",
            "sickness", "sidekick", "sieve", "sifting", "sighting", "silk", "simplest", "sincerely",
            "sipped", "siren", "situated", "sixteen", "sizes", "skater", "skew", "skirting",
            "skulls", "skydive", "slackens", "sleepless", "slid", "slower", "slug", "smash",
            "smelting", "smidgen", "smog", "smuggled", "snake", "sneeze", "sniff", "snout",
            "snug", "soapy", "sober", "soccer", "soda", "software", "soggy", "soil",
            "solved", "somewhere", "sonic", "soothe", "soprano", "sorry", "southern", "sovereign",
            "sowed", "soya", "space", "speedy", "sphere", "spiders", "splendid", "spout",
            "sprig", "spud", "spying", "square", "stacking", "stellar", "stick", "stockpile",
            "strained", "stunning", "stylishly", "subtly", "succeed", "suddenly", "suede", "suffice",
            "sugar", "suitcase", "sulking", "summon", "sunken", "superior", "surfer", "sushi",
            "suture", "swagger", "swept", "swiftly", "sword", "swung", "syllabus", "symptoms",
            "syndrome", "syringe", "system", "taboo", "tacit", "tadpoles", "tagged", "tail",
            "taken", "talent", "tamper", "tanks", "tapestry", "tarnished", "tasked", "tattoo",
            "taunts", "tavern", "tawny", "taxi", "teardrop", "technical", "tedious", "teeming",
            "tell", "template", "tender", "tepid", "tequila", "terminal", "testing", "tether",
            "textbook", "thaw", "theatrics", "thirsty", "thorn", "threaten", "thumbs", "thwart",
            "ticket", "tidy", "tiers", "tiger", "tilt", "timber", "tinted", "tipsy",
            "tirade", "tissue", "titans", "toaster", "tobacco", "today", "toenail", "toffee",
            "together", "toilet", "token", "tolerant", "tomorrow", "tonic", "toolbox", "topic",
            "torch", "tossed", "total", "touchy", "towel", "toxic", "toyed", "trash",
            "trendy", "tribal", "trolling", "truth", "trying", "tsunami", "tubes", "tucks",
            "tudor", "tuesday", "tufts", "tugs", "tuition", "tulips", "tumbling", "tunnel",
            "turnip", "tusks", "tutor", "tuxedo", "twang", "tweezers", "twice", "twofold",
            "tycoon", "typist", "tyrant", "ugly", "ulcers", "ultimate", "umbrella", "umpire",
            "unafraid", "unbending", "uncle", "under", "uneven", "unfit", "ungainly", "unhappy",
            "union", "unjustly", "unknown", "unlikely", "unmask", "unnoticed", "unopened", "unplugs",
            "unquoted", "unrest", "unsafe", "until", "unusual", "unveil", "unwind", "unzip",
            "upbeat", "upcoming", "update", "upgrade", "uphill", "upkeep", "upload", "upon",
            "upper", "upright", "upstairs", "uptight", "upwards", "urban", "urchins", "urgent",
            "usage", "useful", "usher", "using", "usual", "utensils", "utility", "utmost",
            "utopia", "uttered", "vacation", "vague", "vain", "value", "vampire", "vane",
            "vapidly", "vary", "vastness", "vats", "vaults", "vector", "veered", "vegan",
            "vehicle", "vein", "velvet", "venomous", "verification", "vessel", "veteran", "vexed",
            "vials", "vibrate", "victim", "video", "viewpoint", "vigilant", "viking", "village",
            "vinegar", "violin", "vipers", "virtual", "visited", "vitals", "vivid", "vixen",
            "vocal", "vogue", "voice", "volcano", "vortex", "voted", "voucher", "vowels",
            "voyage", "vulture", "wade", "waffle", "wagtail", "waist", "waking", "wallets",
            "wanted", "warped", "washing", "water", "waveform", "waxing", "wayside", "weavers",
            "website", "wedge", "weekday", "weird", "welders", "went", "wept", "were",
            "western", "wetsuit", "whale", "when", "whipped", "whole", "wickets", "width",
            "wield", "wife", "wiggle", "wildly", "winter", "wipeout", "wiring", "wise",
            "withdrawn", "wives", "wizard", "wobbly", "woes", "woken", "wolf", "womanly",
            "wonders", "woozy", "worry", "wounded", "woven", "wrap", "wrist", "wrong",
            "yacht", "yahoo", "yanks", "yard", "yawning", "yearbook", "yellow", "yesterday",
            "yeti", "yields", "yodel", "yoga", "younger", "yoyo", "zapped", "zeal",
            "zebra", "zero", "zesty", "zigzags", "zinger", "zippers", "zodiac", "zombie",
            "zones", "zoom"
        ]
    },
    'spanish': {
        prefix_len: 4,
        words: [
            "ábaco", "abdomen", "abeja", "abierto", "abogado", "abono", "aborto", "abrazo",
            "abrir", "abuelo", "abuso", "acabar", "academia", "acceso", "acción", "aceite",
            "acelga", "acento", "aceptar", "ácido", "aclarar", "acné", "acoger", "acoso",
            "activo", "acto", "actriz", "actuar", "acudir", "acuerdo", "acusar", "adicto",
            "admitir", "adoptar", "adorno", "aduana", "adulto", "aéreo", "afectar", "afición",
            "afinar", "afirmar", "ágil", "agitar", "agonía", "agosto", "agotar", "agregar",
            "agrio", "agua", "agudo", "águila", "aguja", "ahogo", "ahorro", "aire",
            "aislar", "ajedrez", "ajeno", "ajuste", "alacrán", "alambre", "alarma", "alba",
            "álbum", "alcalde", "aldea", "alegre", "alejar", "alerta", "aleta", "alfiler",
            "alga", "algodón", "aliado", "aliento", "alivio", "alma", "almeja", "almíbar",
            "altar", "alteza", "altivo", "alto", "altura", "alumno", "alzar", "amable",
            "amante", "amapola", "amargo", "amasar", "ámbar", "ámbito", "ameno", "amigo",
            "amistad", "amor", "amparo", "amplio", "ancho", "anciano", "ancla", "andar",
            "andén", "anemia", "ángulo", "anillo", "ánimo", "anís", "anotar", "antena",
            "antiguo", "antojo", "anual", "anular", "anuncio", "añadir", "añejo", "año",
            "apagar", "aparato", "apetito", "apio", "aplicar", "apodo", "aporte", "apoyo",
            "aprender", "aprobar", "apuesta", "apuro", "arado", "araña", "arar", "árbitro",
            "árbol", "arbusto", "archivo", "arco", "arder", "ardilla", "arduo", "área",
            "árido", "aries", "armonía", "arnés", "aroma", "arpa", "arpón", "arreglo",
            "arroz", "arruga", "arte", "artista", "asa", "asado", "asalto", "ascenso",
            "asegurar", "aseo", "asesor", "asiento", "asilo", "asistir", "asno", "asombro",
            "áspero", "astilla", "astro", "astuto", "asumir", "asunto", "atajo", "ataque",
            "atar", "atento", "ateo", "ático", "atleta", "átomo", "atraer", "atroz",
            "atún", "audaz", "audio", "auge", "aula", "aumento", "ausente", "autor",
            "aval", "avance", "avaro", "ave", "avellana", "avena", "avestruz", "avión",
            "aviso", "ayer", "ayuda", "ayuno", "azafrán", "azar", "azote", "azúcar",
            "azufre", "azul", "baba", "babor", "bache", "bahía", "baile", "bajar",
            "balanza", "balcón", "balde", "bambú", "banco", "banda", "baño", "barba",
            "barco", "barniz", "barro", "báscula", "bastón", "basura", "batalla", "batería",
            "batir", "batuta", "baúl", "bazar", "bebé", "bebida", "bello", "besar",
            "beso", "bestia", "bicho", "bien", "bingo", "blanco", "bloque", "blusa",
            "boa", "bobina", "bobo", "boca", "bocina", "boda", "bodega", "boina",
            "bola", "bolero", "bolsa", "bomba", "bondad", "bonito", "bono", "bonsái",
            "borde", "borrar", "bosque", "bote", "botín", "bóveda", "bozal", "bravo",
            "brazo", "brecha", "breve", "brillo", "brinco", "brisa", "broca", "broma",
            "bronce", "brote", "bruja", "brusco", "bruto", "buceo", "bucle", "bueno",
            "buey", "bufanda", "bufón", "búho", "buitre", "bulto", "burbuja", "burla",
            "burro", "buscar", "butaca", "buzón", "caballo", "cabeza", "cabina", "cabra",
            "cacao", "cadáver", "cadena", "caer", "café", "caída", "caimán", "caja",
            "cajón", "cal", "calamar", "calcio", "caldo", "calidad", "calle", "calma",
            "calor", "calvo", "cama", "cambio", "camello", "camino", "campo", "cáncer",
            "candil", "canela", "canguro", "canica", "canto", "caña", "cañón", "caoba",
            "caos", "capaz", "capitán", "capote", "captar", "capucha", "cara", "carbón",
            "cárcel", "careta", "carga", "cariño", "carne", "carpeta", "carro", "carta",
            "casa", "casco", "casero", "caspa", "castor", "catorce", "catre", "caudal",
            "causa", "cazo", "cebolla", "ceder", "cedro", "celda", "célebre", "celoso",
            "célula", "cemento", "ceniza", "centro", "cerca", "cerdo", "cereza", "cero",
            "cerrar", "certeza", "césped", "cetro", "chacal", "chaleco", "champú", "chancla",
            "chapa", "charla", "chico", "chiste", "chivo", "choque", "choza", "chuleta",
            "chupar", "ciclón", "ciego", "cielo", "cien", "cierto", "cifra", "cigarro",
            "cima", "cinco", "cine", "cinta", "ciprés", "circo", "ciruela", "cisne",
            "cita", "ciudad", "clamor", "clan", "claro", "clase", "clave", "cliente",
            "clima", "clínica", "cobre", "cocción", "cochino", "cocina", "coco", "código",
            "codo", "cofre", "coger", "cohete", "cojín", "cojo", "cola", "colcha",
            "colegio", "colgar", "colina", "collar", "colmo", "columna", "combate", "comer",
            "comida", "cómodo", "compra", "conde", "conejo", "conga", "conocer", "consejo",
            "contar", "copa", "copia", "corazón", "corbata", "corcho", "cordón", "corona",
            "correr", "coser", "cosmos", "costa", "cráneo", "cráter", "crear", "crecer",
            "creído", "crema", "cría", "crimen", "cripta", "crisis", "cromo", "crónica",
            "croqueta", "crudo", "cruz", "cuadro", "cuarto", "cuatro", "cubo", "cubrir",
            "cuchara", "cuello", "cuento", "cuerda", "cuesta", "cueva", "cuidar", "culebra",
            "culpa", "culto", "cumbre", "cumplir", "cuna", "cuneta", "cuota", "cupón",
            "cúpula", "curar", "curioso", "curso", "curva", "cutis", "dama", "danza",
            "dar", "dardo", "dátil", "deber", "débil", "década", "decir", "dedo",
            "defensa", "definir", "dejar", "delfín", "delgado", "delito", "demora", "denso",
            "dental", "deporte", "derecho", "derrota", "desayuno", "deseo", "desfile", "desnudo",
            "destino", "desvío", "detalle", "detener", "deuda", "día", "diablo", "diadema",
            "diamante", "diana", "diario", "dibujo", "dictar", "diente", "dieta", "diez",
            "difícil", "digno", "dilema", "diluir", "dinero", "directo", "dirigir", "disco",
            "diseño", "disfraz", "diva", "divino", "doble", "doce", "dolor", "domingo",
            "don", "donar", "dorado", "dormir", "dorso", "dos", "dosis", "dragón",
            "droga", "ducha", "duda", "duelo", "dueño", "dulce", "dúo", "duque",
            "durar", "dureza", "duro", "ébano", "ebrio", "echar", "eco", "ecuador",
            "edad", "edición", "edificio", "editor", "educar", "efecto", "eficaz", "eje",
            "ejemplo", "elefante", "elegir", "elemento", "elevar", "elipse", "élite", "elixir",
            "elogio", "eludir", "embudo", "emitir", "emoción", "empate", "empeño", "empleo",
            "empresa", "enano", "encargo", "enchufe", "encía", "enemigo", "enero", "enfado",
            "enfermo", "engaño", "enigma", "enlace", "enorme", "enredo", "ensayo", "enseñar",
            "entero", "entrar", "envase", "envío", "época", "equipo", "erizo", "eHoloyolo",
            "escena", "escolar", "escribir", "escudo", "esencia", "esfera", "esfuerzo", "espada",
            "espejo", "espía", "esposa", "espuma", "esquí", "estar", "este", "estilo",
            "estufa", "etapa", "eterno", "ética", "etnia", "evadir", "evaluar", "evento",
            "evitar", "exacto", "examen", "exceso", "excusa", "exento", "exigir", "exilio",
            "existir", "éxito", "experto", "explicar", "exponer", "extremo", "fábrica", "fábula",
            "fachada", "fácil", "factor", "faena", "faja", "falda", "fallo", "falso",
            "faltar", "fama", "familia", "famoso", "faraón", "farmacia", "farol", "farsa",
            "fase", "fatiga", "fauna", "favor", "fax", "febrero", "fecha", "feliz",
            "feo", "feria", "feroz", "fértil", "fervor", "festín", "fiable", "fianza",
            "fiar", "fibra", "ficción", "ficha", "fideo", "fiebre", "fiel", "fiera",
            "fiesta", "figura", "fijar", "fijo", "fila", "filete", "filial", "filtro",
            "fin", "finca", "fingir", "finito", "firma", "flaco", "flauta", "flecha",
            "flor", "flota", "fluir", "flujo", "flúor", "fobia", "foca", "fogata",
            "fogón", "folio", "folleto", "fondo", "forma", "forro", "fortuna", "forzar",
            "fosa", "foto", "fracaso", "frágil", "franja", "frase", "fraude", "freír",
            "freno", "fresa", "frío", "frito", "fruta", "fuego", "fuente", "fuerza",
            "fuga", "fumar", "función", "funda", "furgón", "furia", "fusil", "fútbol",
            "futuro", "gacela", "gafas", "gaita", "gajo", "gala", "galería", "gallo",
            "gamba", "ganar", "gancho", "ganga", "ganso", "garaje", "garza", "gasolina",
            "gastar", "gato", "gavilán", "gemelo", "gemir", "gen", "género", "genio",
            "gente", "geranio", "gerente", "germen", "gesto", "gigante", "gimnasio", "girar",
            "giro", "glaciar", "globo", "gloria", "gol", "golfo", "goloso", "golpe",
            "goma", "gordo", "gorila", "gorra", "gota", "goteo", "gozar", "grada",
            "gráfico", "grano", "grasa", "gratis", "grave", "grieta", "grillo", "gripe",
            "gris", "grito", "grosor", "grúa", "grueso", "grumo", "grupo", "guante",
            "guapo", "guardia", "guerra", "guía", "guiño", "guion", "guiso", "guitarra",
            "gusano", "gustar", "haber", "hábil", "hablar", "hacer", "hacha", "hada",
            "hallar", "hamaca", "harina", "haz", "hazaña", "hebilla", "hebra", "hecho",
            "helado", "helio", "hembra", "herir", "hermano", "héroe", "hervir", "hielo",
            "hierro", "hígado", "higiene", "hijo", "himno", "historia", "hocico", "hogar",
            "hoguera", "hoja", "hombre", "hongo", "honor", "honra", "hora", "hormiga",
            "horno", "hostil", "hoyo", "hueco", "huelga", "huerta", "hueso", "huevo",
            "huida", "huir", "humano", "húmedo", "humilde", "humo", "hundir", "huracán",
            "hurto", "icono", "ideal", "idioma", "ídolo", "iglesia", "iglú", "igual",
            "ilegal", "ilusión", "imagen", "imán", "imitar", "impar", "imperio", "imponer",
            "impulso", "incapaz", "índice", "inerte", "infiel", "informe", "ingenio", "inicio",
            "inmenso", "inmune", "innato", "insecto", "instante", "interés", "íntimo", "intuir",
            "inútil", "invierno", "ira", "iris", "ironía", "isla", "islote", "jabalí",
            "jabón", "jamón", "jarabe", "jardín", "jarra", "jaula", "jazmín", "jefe",
            "jeringa", "jinete", "jornada", "joroba", "joven", "joya", "juerga", "jueves",
            "juez", "jugador", "jugo", "juguete", "juicio", "junco", "jungla", "junio",
            "juntar", "júpiter", "jurar", "justo", "juvenil", "juzgar", "kilo", "koala",
            "labio", "lacio", "lacra", "lado", "ladrón", "lagarto", "lágrima", "laguna",
            "laico", "lamer", "lámina", "lámpara", "lana", "lancha", "langosta", "lanza",
            "lápiz", "largo", "larva", "lástima", "lata", "látex", "latir", "laurel",
            "lavar", "lazo", "leal", "lección", "leche", "lector", "leer", "legión",
            "legumbre", "lejano", "lengua", "lento", "leña", "león", "leopardo", "lesión",
            "letal", "letra", "leve", "leyenda", "libertad", "libro", "licor", "líder",
            "lidiar", "lienzo", "liga", "ligero", "lima", "límite", "limón", "limpio",
            "lince", "lindo", "línea", "lingote", "lino", "linterna", "líquido", "liso",
            "lista", "litera", "litio", "litro", "llaga", "llama", "llanto", "llave",
            "llegar", "llenar", "llevar", "llorar", "llover", "lluvia", "lobo", "loción",
            "loco", "locura", "lógica", "logro", "lombriz", "lomo", "lonja", "lote",
            "lucha", "lucir", "lugar", "lujo", "luna", "lunes", "lupa", "lustro",
            "luto", "luz", "maceta", "macho", "madera", "madre", "maduro", "maestro",
            "mafia", "magia", "mago", "maíz", "maldad", "maleta", "malla", "malo",
            "mamá", "mambo", "mamut", "manco", "mando", "manejar", "manga", "maniquí",
            "manjar", "mano", "manso", "manta", "mañana", "mapa", "máquina", "mar",
            "marco", "marea", "marfil", "margen", "marido", "mármol", "marrón", "martes",
            "marzo", "masa", "máscara", "masivo", "matar", "materia", "matiz", "matriz",
            "máximo", "mayor", "mazorca", "mecha", "medalla", "medio", "médula", "mejilla",
            "mejor", "melena", "melón", "memoria", "menor", "mensaje", "mente", "menú",
            "mercado", "merengue", "mérito", "mes", "mesón", "meta", "meter", "método",
            "metro", "mezcla", "miedo", "miel", "miembro", "miga", "mil", "milagro",
            "militar", "millón", "mimo", "mina", "minero", "mínimo", "minuto", "miope",
            "mirar", "misa", "miseria", "misil", "mismo", "mitad", "mito", "mochila",
            "moción", "moda", "modelo", "moho", "mojar", "molde", "moler", "molino",
            "momento", "momia", "monarca", "moneda", "monja", "monto", "moño", "morada",
            "morder", "moreno", "morir", "morro", "morsa", "mortal", "mosca", "mostrar",
            "motivo", "mover", "móvil", "mozo", "mucho", "mudar", "mueble", "muela",
            "muerte", "muestra", "mugre", "mujer", "mula", "muleta", "multa", "mundo",
            "muñeca", "mural", "muro", "músculo", "museo", "musgo", "música", "muslo",
            "nácar", "nación", "nadar", "naipe", "naranja", "nariz", "narrar", "nasal",
            "natal", "nativo", "natural", "náusea", "naval", "nave", "navidad", "necio",
            "néctar", "negar", "negocio", "negro", "neón", "nervio", "neto", "neutro",
            "nevar", "nevera", "nicho", "nido", "niebla", "nieto", "niñez", "niño",
            "nítido", "nivel", "nobleza", "noche", "nómina", "noria", "norma", "norte",
            "nota", "noticia", "novato", "novela", "novio", "nube", "nuca", "núcleo",
            "nudillo", "nudo", "nuera", "nueve", "nuez", "nulo", "número", "nutria",
            "oasis", "obeso", "obispo", "objeto", "obra", "obrero", "observar", "obtener",
            "obvio", "oca", "ocaso", "océano", "ochenta", "ocho", "ocio", "ocre",
            "octavo", "octubre", "oculto", "ocupar", "ocurrir", "odiar", "odio", "odisea",
            "oeste", "ofensa", "oferta", "oficio", "ofrecer", "ogro", "oído", "oír",
            "ojo", "ola", "oleada", "olfato", "olivo", "olla", "olmo", "olor",
            "olvido", "ombligo", "onda", "onza", "opaco", "opción", "ópera", "opinar",
            "oponer", "optar", "óptica", "opuesto", "oración", "orador", "oral", "órbita",
            "orca", "orden", "oreja", "órgano", "orgía", "orgullo", "oriente", "origen",
            "orilla", "oro", "orquesta", "oruga", "osadía", "oscuro", "osezno", "oso",
            "ostra", "otoño", "otro", "oveja", "óvulo", "óxido", "oxígeno", "oyente",
            "ozono", "pacto", "padre", "paella", "página", "pago", "país", "pájaro",
            "palabra", "palco", "paleta", "pálido", "palma", "paloma", "palpar", "pan",
            "panal", "pánico", "pantera", "pañuelo", "papá", "papel", "papilla", "paquete",
            "parar", "parcela", "pared", "parir", "paro", "párpado", "parque", "párrafo",
            "parte", "pasar", "paseo", "pasión", "paso", "pasta", "pata", "patio",
            "patria", "pausa", "pauta", "pavo", "payaso", "peatón", "pecado", "pecera",
            "pecho", "pedal", "pedir", "pegar", "peine", "pelar", "peldaño", "pelea",
            "peligro", "pellejo", "pelo", "peluca", "pena", "pensar", "peñón", "peón",
            "peor", "pepino", "pequeño", "pera", "percha", "perder", "pereza", "perfil",
            "perico", "perla", "permiso", "perro", "persona", "pesa", "pesca", "pésimo",
            "pestaña", "pétalo", "petróleo", "pez", "pezuña", "picar", "pichón", "pie",
            "piedra", "pierna", "pieza", "pijama", "pilar", "piloto", "pimienta", "pino",
            "pintor", "pinza", "piña", "piojo", "pipa", "pirata", "pisar", "piscina",
            "piso", "pista", "pitón", "pizca", "placa", "plan", "plata", "playa",
            "plaza", "pleito", "pleno", "plomo", "pluma", "plural", "pobre", "poco",
            "poder", "podio", "poema", "poesía", "poeta", "polen", "policía", "pollo",
            "polvo", "pomada", "pomelo", "pomo", "pompa", "poner", "porción", "portal",
            "posada", "poseer", "posible", "poste", "potencia", "potro", "pozo", "prado",
            "precoz", "pregunta", "premio", "prensa", "preso", "previo", "primo", "príncipe",
            "prisión", "privar", "proa", "probar", "proceso", "producto", "proeza", "profesor",
            "programa", "prole", "promesa", "pronto", "propio", "próximo", "prueba", "público",
            "puchero", "pudor", "pueblo", "puerta", "puesto", "pulga", "pulir", "pulmón",
            "pulpo", "pulso", "puma", "punto", "puñal", "puño", "pupa", "pupila",
            "puré", "quedar", "queja", "quemar", "querer", "queso", "quieto", "química",
            "quince", "quitar", "rábano", "rabia", "rabo", "ración", "radical", "raíz",
            "rama", "rampa", "rancho", "rango", "rapaz", "rápido", "rapto", "rasgo",
            "raspa", "rato", "rayo", "raza", "razón", "reacción", "realidad", "rebaño",
            "rebote", "recaer", "receta", "rechazo", "recoger", "recreo", "recto", "recurso",
            "red", "redondo", "reducir", "reflejo", "reforma", "refrán", "refugio", "regalo",
            "regir", "regla", "regreso", "rehén", "reino", "reír", "reja", "relato",
            "relevo", "relieve", "relleno", "reloj", "remar", "remedio", "remo", "rencor",
            "rendir", "renta", "reparto", "repetir", "reposo", "reptil", "res", "rescate",
            "resina", "respeto", "resto", "resumen", "retiro", "retorno", "retrato", "reunir",
            "revés", "revista", "rey", "rezar", "rico", "riego", "rienda", "riesgo",
            "rifa", "rígido", "rigor", "rincón", "riñón", "río", "riqueza", "risa",
            "ritmo", "rito"
        ]
    },
    'portuguese': {
        prefix_len: 3,
        words: [
            "abaular", "abdominal", "abeto", "abissinio", "abjeto", "ablucao", "abnegar", "abotoar",
            "abrutalhar", "absurdo", "abutre", "acautelar", "accessorios", "acetona", "achocolatado", "acirrar",
            "acne", "acovardar", "acrostico", "actinomicete", "acustico", "adaptavel", "adeus", "adivinho",
            "adjunto", "admoestar", "adnominal", "adotivo", "adquirir", "adriatico", "adsorcao", "adutora",
            "advogar", "aerossol", "afazeres", "afetuoso", "afixo", "afluir", "afortunar", "afrouxar",
            "aftosa", "afunilar", "agentes", "agito", "aglutinar", "aiatola", "aimore", "aino",
            "aipo", "airoso", "ajeitar", "ajoelhar", "ajudante", "ajuste", "alazao", "albumina",
            "alcunha", "alegria", "alexandre", "alforriar", "alguns", "alhures", "alivio", "almoxarife",
            "alotropico", "alpiste", "alquimista", "alsaciano", "altura", "aluviao", "alvura", "amazonico",
            "ambulatorio", "ametodico", "amizades", "amniotico", "amovivel", "amurada", "anatomico", "ancorar",
            "anexo", "anfora", "aniversario", "anjo", "anotar", "ansioso", "anturio", "anuviar",
            "anverso", "anzol", "aonde", "apaziguar", "apito", "aplicavel", "apoteotico", "aprimorar",
            "aprumo", "apto", "apuros", "aquoso", "arauto", "arbusto", "arduo", "aresta",
            "arfar", "arguto", "aritmetico", "arlequim", "armisticio", "aromatizar", "arpoar", "arquivo",
            "arrumar", "arsenio", "arturiano", "aruaque", "arvores", "asbesto", "ascorbico", "aspirina",
            "asqueroso", "assustar", "astuto", "atazanar", "ativo", "atletismo", "atmosferico", "atormentar",
            "atroz", "aturdir", "audivel", "auferir", "augusto", "aula", "aumento", "aurora",
            "autuar", "avatar", "avexar", "avizinhar", "avolumar", "avulso", "axiomatico", "azerbaijano",
            "azimute", "azoto", "azulejo", "bacteriologista", "badulaque", "baforada", "baixote", "bajular",
            "balzaquiana", "bambuzal", "banzo", "baoba", "baqueta", "barulho", "bastonete", "batuta",
            "bauxita", "bavaro", "bazuca", "bcrepuscular", "beato", "beduino", "begonia", "behaviorista",
            "beisebol", "belzebu", "bemol", "benzido", "beocio", "bequer", "berro", "besuntar",
            "betume", "bexiga", "bezerro", "biatlon", "biboca", "bicuspide", "bidirecional", "bienio",
            "bifurcar", "bigorna", "bijuteria", "bimotor", "binormal", "bioxido", "bipolarizacao", "biquini",
            "birutice", "bisturi", "bituca", "biunivoco", "bivalve", "bizarro", "blasfemo", "blenorreia",
            "blindar", "bloqueio", "blusao", "boazuda", "bofete", "bojudo", "bolso", "bombordo",
            "bonzo", "botina", "boquiaberto", "bostoniano", "botulismo", "bourbon", "bovino", "boximane",
            "bravura", "brevidade", "britar", "broxar", "bruno", "bruxuleio", "bubonico", "bucolico",
            "buda", "budista", "bueiro", "buffer", "bugre", "bujao", "bumerangue", "burundines",
            "busto", "butique", "buzios", "caatinga", "cabuqui", "cacunda", "cafuzo", "cajueiro",
            "camurca", "canudo", "caquizeiro", "carvoeiro", "casulo", "catuaba", "cauterizar", "cebolinha",
            "cedula", "ceifeiro", "celulose", "cerzir", "cesto", "cetro", "ceus", "cevar",
            "chavena", "cheroqui", "chita", "chovido", "chuvoso", "ciatico", "cibernetico", "cicuta",
            "cidreira", "cientistas", "cifrar", "cigarro", "cilio", "cimo", "cinzento", "cioso",
            "cipriota", "cirurgico", "cisto", "citrico", "ciumento", "civismo", "clavicula", "clero",
            "clitoris", "cluster", "coaxial", "cobrir", "cocota", "codorniz", "coexistir", "cogumelo",
            "coito", "colusao", "compaixao", "comutativo", "contentamento", "convulsivo", "coordenativa", "coquetel",
            "correto", "corvo", "costureiro", "cotovia", "covil", "cozinheiro", "cretino", "cristo",
            "crivo", "crotalo", "cruzes", "cubo", "cucuia", "cueiro", "cuidar", "cujo",
            "cultural", "cunilingua", "cupula", "curvo", "custoso", "cutucar", "czarismo", "dablio",
            "dacota", "dados", "daguerreotipo", "daiquiri", "daltonismo", "damista", "dantesco", "daquilo",
            "darwinista", "dasein", "dativo", "deao", "debutantes", "decurso", "deduzir", "defunto",
            "degustar", "dejeto", "deltoide", "demover", "denunciar", "deputado", "deque", "dervixe",
            "desvirtuar", "deturpar", "deuteronomio", "devoto", "dextrose", "dezoito", "diatribe", "dicotomico",
            "didatico", "dietista", "difuso", "digressao", "diluvio", "diminuto", "dinheiro", "dinossauro",
            "dioxido", "diplomatico", "dique", "dirimivel", "disturbio", "diurno", "divulgar", "dizivel",
            "doar", "dobro", "docura", "dodoi", "doer", "dogue", "doloso", "domo",
            "donzela", "doping", "dorsal", "dossie", "dote", "doutro", "doze", "dravidico",
            "dreno", "driver", "dropes", "druso", "dubnio", "ducto", "dueto", "dulija",
            "dundum", "duodeno", "duquesa", "durou", "duvidoso", "duzia", "ebano", "ebrio",
            "eburneo", "echarpe", "eclusa", "ecossistema", "ectoplasma", "ecumenismo", "eczema", "eden",
            "editorial", "edredom", "edulcorar", "efetuar", "efigie", "efluvio", "egiptologo", "egresso",
            "egua", "einsteiniano", "eira", "eivar", "eixos", "ejetar", "elastomero", "eldorado",
            "elixir", "elmo", "eloquente", "elucidativo", "emaranhar", "embutir", "emerito", "emfa",
            "emitir", "emotivo", "empuxo", "emulsao", "enamorar", "encurvar", "enduro", "enevoar",
            "enfurnar", "enguico", "enho", "enigmista", "enlutar", "enormidade", "enpreendimento", "enquanto",
            "enriquecer", "enrugar", "entusiastico", "enunciar", "envolvimento", "enxuto", "enzimatico", "eolico",
            "epiteto", "epoxi", "epura", "equivoco", "erario", "erbio", "ereto", "erguido",
            "erisipela", "ermo", "erotizar", "erros", "erupcao", "ervilha", "esburacar", "escutar",
            "esfuziante", "esguio", "esloveno", "esmurrar", "esoterismo", "esperanca", "espirito", "espurio",
            "essencialmente", "esturricar", "esvoacar", "etario", "eterno", "etiquetar", "etnologo", "etos",
            "etrusco", "euclidiano", "euforico", "eugenico", "eunuco", "europio", "eustaquio", "eutanasia",
            "evasivo", "eventualidade", "evitavel", "evoluir", "exaustor", "excursionista", "exercito", "exfoliado",
            "exito", "exotico", "expurgo", "exsudar", "extrusora", "exumar", "fabuloso", "facultativo",
            "fado", "fagulha", "faixas", "fajuto", "faltoso", "famoso", "fanzine", "fapesp",
            "faquir", "fartura", "fastio", "faturista", "fausto", "favorito", "faxineira", "fazer",
            "fealdade", "febril", "fecundo", "fedorento", "feerico", "feixe", "felicidade", "felipe",
            "feltro", "femur", "fenotipo", "fervura", "festivo", "feto", "feudo", "fevereiro",
            "fezinha", "fiasco", "fibra", "ficticio", "fiduciario", "fiesp", "fifa", "figurino",
            "fijiano", "filtro", "finura", "fiorde", "fiquei", "firula", "fissurar", "fitoteca",
            "fivela", "fixo", "flavio", "flexor", "flibusteiro", "flotilha", "fluxograma", "fobos",
            "foco", "fofura", "foguista", "foie", "foliculo", "fominha", "fonte", "forum",
            "fosso", "fotossintese", "foxtrote", "fraudulento", "frevo", "frivolo", "frouxo", "frutose",
            "fuba", "fucsia", "fugitivo", "fuinha", "fujao", "fulustreco", "fumo", "funileiro",
            "furunculo", "fustigar", "futurologo", "fuxico", "fuzue", "gabriel", "gado", "gaelico",
            "gafieira", "gaguejo", "gaivota", "gajo", "galvanoplastico", "gamo", "ganso", "garrucha",
            "gastronomo", "gatuno", "gaussiano", "gaviao", "gaxeta", "gazeteiro", "gear", "geiser",
            "geminiano", "generoso", "genuino", "geossinclinal", "gerundio", "gestual", "getulista", "gibi",
            "gigolo", "gilete", "ginseng", "giroscopio", "glaucio", "glacial", "gleba", "glifo",
            "glote", "glutonia", "gnostico", "goela", "gogo", "goitaca", "golpista", "gomo",
            "gonzo", "gorro", "gostou", "goticula", "gourmet", "governo", "gozo", "graxo",
            "grevista", "grito", "grotesco", "gruta", "guaxinim", "gude", "gueto", "guizo",
            "guloso", "gume", "guru", "gustativo", "gustavo", "gutural", "habitue", "haitiano",
            "halterofilista", "hamburguer", "hanseniase", "happening", "harpista", "hastear", "haveres", "hebreu",
            "hectometro", "hedonista", "hegira", "helena", "helminto", "hemorroidas", "henrique", "heptassilabo",
            "hertziano", "hesitar", "heterossexual", "heuristico", "hexagono", "hiato", "hibrido", "hidrostatico",
            "hieroglifo", "hifenizar", "higienizar", "hilario", "himen", "hino", "hippie", "hirsuto",
            "historiografia", "hitlerista", "hodometro", "hoje", "holograma", "homus", "honroso", "hoquei",
            "horto", "hostilizar", "hotentote", "huguenote", "humilde", "huno", "hurra", "hutu",
            "iaia", "ialorixa", "iambico", "iansa", "iaque", "iara", "iatista", "iberico",
            "ibis", "icar", "iceberg", "icosagono", "idade", "ideologo", "idiotice", "idoso",
            "iemenita", "iene", "igarape", "iglu", "ignorar", "igreja", "iguaria", "iidiche",
            "ilativo", "iletrado", "ilharga", "ilimitado", "ilogismo", "ilustrissimo", "imaturo", "imbuzeiro",
            "imerso", "imitavel", "imovel", "imputar", "imutavel", "inaveriguavel", "incutir", "induzir",
            "inextricavel", "infusao", "ingua", "inhame", "iniquo", "injusto", "inning", "inoxidavel",
            "inquisitorial", "insustentavel", "intumescimento", "inutilizavel", "invulneravel", "inzoneiro", "iodo", "iogurte",
            "ioio", "ionosfera", "ioruba", "iota", "ipsilon", "irascivel", "iris", "irlandes",
            "irmaos", "iroques", "irrupcao", "isca", "isento", "islandes", "isotopo", "isqueiro",
            "israelita", "isso", "isto", "iterbio", "itinerario", "itrio", "iuane", "iugoslavo",
            "jabuticabeira", "jacutinga", "jade", "jagunco", "jainista", "jaleco", "jambo", "jantarada",
            "japones", "jaqueta", "jarro", "jasmim", "jato", "jaula", "javel", "jazz",
            "jegue", "jeitoso", "jejum", "jenipapo", "jeova", "jequitiba", "jersei", "jesus",
            "jetom", "jiboia", "jihad", "jilo", "jingle", "jipe", "jocoso", "joelho",
            "joguete", "joio", "jojoba", "jorro", "jota", "joule", "joviano", "jubiloso",
            "judoca", "jugular", "juizo", "jujuba", "juliano", "jumento", "junto", "jururu",
            "justo", "juta", "juventude", "labutar", "laguna", "laico", "lajota", "lanterninha",
            "lapso", "laquear", "lastro", "lauto", "lavrar", "laxativo", "lazer", "leasing",
            "lebre", "lecionar", "ledo", "leguminoso", "leitura", "lele", "lemure", "lento",
            "leonardo", "leopardo", "lepton", "leque", "leste", "letreiro", "leucocito", "levitico",
            "lexicologo", "lhama", "lhufas", "liame", "licoroso", "lidocaina", "liliputiano", "limusine",
            "linotipo", "lipoproteina", "liquidos", "lirismo", "lisura", "liturgico", "livros", "lixo",
            "lobulo", "locutor", "lodo", "logro", "lojista", "lombriga", "lontra", "loop",
            "loquaz", "lorota", "losango", "lotus", "louvor", "luar", "lubrificavel", "lucros",
            "lugubre", "luis", "luminoso", "luneta", "lustroso", "luto", "luvas", "luxuriante",
            "luzeiro", "maduro", "maestro", "mafioso", "magro", "maiuscula", "majoritario", "malvisto",
            "mamute", "manutencao", "mapoteca", "maquinista", "marzipa", "masturbar", "matuto", "mausoleu",
            "mavioso", "maxixe", "mazurca", "meandro", "mecha", "medusa", "mefistofelico", "megera",
            "meirinho", "melro", "memorizar", "menu", "mequetrefe", "mertiolate", "mestria", "metroviario",
            "mexilhao", "mezanino", "miau", "microssegundo", "midia", "migratorio", "mimosa", "minuto",
            "miosotis", "mirtilo", "misturar", "mitzvah", "miudos", "mixuruca", "mnemonico", "moagem",
            "mobilizar", "modulo", "moer", "mofo", "mogno", "moita", "molusco", "monumento",
            "moqueca", "morubixaba", "mostruario", "motriz", "mouse", "movivel", "mozarela", "muarra",
            "muculmano", "mudo", "mugir", "muitos", "mumunha", "munir", "muon", "muquira",
            "murros", "musselina", "nacoes", "nado", "naftalina", "nago", "naipe", "naja",
            "nalgum", "namoro", "nanquim", "napolitano", "naquilo", "nascimento", "nautilo", "navios",
            "nazista", "nebuloso", "nectarina", "nefrologo", "negus", "nelore", "nenufar", "nepotismo",
            "nervura", "neste", "netuno", "neutron", "nevoeiro", "newtoniano", "nexo", "nhenhenhem",
            "nhoque", "nigeriano", "niilista", "ninho", "niobio", "niponico", "niquelar", "nirvana",
            "nisto", "nitroglicerina", "nivoso", "nobreza", "nocivo", "noel", "nogueira", "noivo",
            "nojo", "nominativo", "nonuplo", "noruegues", "nostalgico", "noturno", "nouveau", "nuanca",
            "nublar", "nucleotideo", "nudista", "nulo", "numismatico", "nunquinha", "nupcias", "nutritivo",
            "nuvens", "oasis", "obcecar", "obeso", "obituario", "objetos", "oblongo", "obnoxio",
            "obrigatorio", "obstruir", "obtuso", "obus", "obvio", "ocaso", "occipital", "oceanografo",
            "ocioso", "oclusivo", "ocorrer", "ocre", "octogono", "odalisca", "odisseia", "odorifico",
            "oersted", "oeste", "ofertar", "ofidio", "oftalmologo", "ogiva", "ogum", "oigale",
            "oitavo", "oitocentos", "ojeriza", "olaria", "oleoso", "olfato", "olhos", "oliveira",
            "olmo", "olor", "olvidavel", "ombudsman", "omeleteira", "omitir", "omoplata", "onanismo",
            "ondular", "oneroso", "onomatopeico", "ontologico", "onus", "onze", "opalescente", "opcional",
            "operistico", "opio", "oposto", "oprobrio", "optometrista", "opusculo", "oratorio", "orbital",
            "orcar", "orfao", "orixa", "orla", "ornitologo", "orquidea", "ortorrombico", "orvalho",
            "osculo", "osmotico", "ossudo", "ostrogodo", "otario", "otite", "ouro", "ousar",
            "outubro", "ouvir", "ovario", "overnight", "oviparo", "ovni", "ovoviviparo", "ovulo",
            "oxala", "oxente", "oxiuro", "oxossi", "ozonizar", "paciente", "pactuar", "padronizar",
            "paete", "pagodeiro", "paixao", "pajem", "paludismo", "pampas", "panturrilha", "papudo",
            "paquistanes", "pastoso", "patua", "paulo", "pauzinhos", "pavoroso", "paxa", "pazes",
            "peao", "pecuniario", "pedunculo", "pegaso", "peixinho", "pejorativo", "pelvis", "penuria",
            "pequno", "petunia", "pezada", "piauiense", "pictorico", "pierro", "pigmeu", "pijama",
            "pilulas", "pimpolho", "pintura", "piorar", "pipocar", "piqueteiro", "pirulito", "pistoleiro",
            "pituitaria", "pivotar", "pixote", "pizzaria", "plistoceno", "plotar", "pluviometrico", "pneumonico",
            "poco", "podridao", "poetisa", "pogrom", "pois", "polvorosa", "pomposo", "ponderado",
            "pontudo", "populoso", "poquer", "porvir", "posudo", "potro", "pouso", "povoar",
            "prazo", "prezar", "privilegios", "proximo", "prussiano", "pseudopode", "psoriase", "pterossauros",
            "ptialina", "ptolemaico", "pudor", "pueril", "pufe", "pugilista", "puir", "pujante",
            "pulverizar", "pumba", "punk", "purulento", "pustula", "putsch", "puxe", "quatrocentos",
            "quetzal", "quixotesco", "quotizavel", "rabujice", "racista", "radonio", "rafia", "ragu",
            "rajado", "ralo", "rampeiro", "ranzinza", "raptor", "raquitismo", "raro", "rasurar",
            "ratoeira", "ravioli", "razoavel", "reavivar", "rebuscar", "recusavel", "reduzivel", "reexposicao",
            "refutavel", "regurgitar", "reivindicavel", "rejuvenescimento", "relva", "remuneravel", "renunciar", "reorientar",
            "repuxo", "requisito", "resumo", "returno", "reutilizar", "revolvido", "rezonear", "riacho",
            "ribossomo", "ricota", "ridiculo", "rifle", "rigoroso", "rijo", "rimel", "rins",
            "rios", "riqueza", "riquixa", "rissole", "ritualistico", "rivalizar", "rixa", "robusto",
            "rococo", "rodoviario", "roer", "rogo", "rojao", "rolo", "rompimento", "ronronar",
            "roqueiro", "rorqual", "rosto", "rotundo", "rouxinol", "roxo", "royal", "ruas",
            "rucula", "rudimentos", "ruela", "rufo", "rugoso", "ruivo", "rule", "rumoroso",
            "runico", "ruptura", "rural", "rustico", "rutilar", "saariano", "sabujo", "sacudir",
            "sadomasoquista", "safra", "sagui", "sais", "samurai", "santuario", "sapo", "saquear",
            "sartriano", "saturno", "saude", "sauva", "saveiro", "saxofonista", "sazonal", "scherzo",
            "script", "seara", "seborreia", "secura", "seduzir", "sefardim", "seguro", "seja",
            "selvas", "sempre", "senzala", "sepultura", "sequoia", "sestercio", "setuplo", "seus",
            "seviciar", "sezonismo", "shalom", "siames", "sibilante", "sicrano", "sidra", "sifilitico",
            "signos", "silvo", "simultaneo", "sinusite", "sionista", "sirio", "sisudo", "situar",
            "sivan", "slide", "slogan", "soar", "sobrio", "socratico", "sodomizar", "soerguer",
            "software", "sogro", "soja", "solver", "somente", "sonso", "sopro", "soquete",
            "sorveteiro", "sossego", "soturno", "sousafone", "sovinice", "sozinho", "suavizar", "subverter",
            "sucursal", "sudoriparo", "sufragio", "sugestoes", "suite", "sujo", "sultao", "sumula",
            "suntuoso", "suor", "supurar", "suruba", "susto", "suturar", "suvenir", "tabuleta",
            "taco", "tadjique", "tafeta", "tagarelice", "taitiano", "talvez", "tampouco", "tanzaniano",
            "taoista", "tapume", "taquion", "tarugo", "tascar", "tatuar", "tautologico", "tavola",
            "taxionomista", "tchecoslovaco", "teatrologo", "tectonismo", "tedioso", "teflon", "tegumento", "teixo",
            "telurio", "temporas", "tenue", "teosofico", "tepido", "tequila", "terrorista", "testosterona",
            "tetrico", "teutonico", "teve", "texugo", "tiara", "tibia", "tiete", "tifoide",
            "tigresa", "tijolo", "tilintar", "timpano", "tintureiro", "tiquete", "tiroteio", "tisico",
            "titulos", "tive", "toar", "toboga", "tofu", "togoles", "toicinho", "tolueno",
            "tomografo", "tontura", "toponimo", "toquio", "torvelinho", "tostar", "toto", "touro",
            "toxina", "trazer", "trezentos", "trivialidade", "trovoar", "truta", "tuaregue", "tubular",
            "tucano", "tudo", "tufo", "tuiste", "tulipa", "tumultuoso", "tunisino", "tupiniquim",
            "turvo", "tutu", "ucraniano", "udenista", "ufanista", "ufologo", "ugaritico", "uiste",
            "uivo", "ulceroso", "ulema", "ultravioleta", "umbilical", "umero", "umido", "umlaut",
            "unanimidade", "unesco", "ungulado", "unheiro", "univoco", "untuoso", "urano", "urbano",
            "urdir", "uretra", "urgente", "urinol", "urna", "urologo", "urro", "ursulina",
            "urtiga", "urupe", "usavel", "usbeque", "usei", "usineiro", "usurpar", "utero",
            "utilizar", "utopico", "uvular", "uxoricidio", "vacuo", "vadio", "vaguear", "vaivem",
            "valvula", "vampiro", "vantajoso", "vaporoso", "vaquinha", "varziano", "vasto", "vaticinio",
            "vaudeville", "vazio", "veado", "vedico", "veemente", "vegetativo", "veio", "veja",
            "veludo", "venusiano", "verdade", "verve", "vestuario", "vetusto", "vexatorio", "vezes",
            "viavel", "vibratorio", "victor", "vicunha", "vidros", "vietnamita", "vigoroso", "vilipendiar",
            "vime", "vintem", "violoncelo", "viquingue", "virus", "visualizar", "vituperio", "viuvo",
            "vivo", "vizir", "voar", "vociferar", "vodu", "vogar", "voile", "volver",
            "vomito", "vontade", "vortice", "vosso", "voto", "vovozinha", "voyeuse", "vozes",
            "vulva", "vupt", "western", "xadrez", "xale", "xampu", "xango", "xarope",
            "xaual", "xavante", "xaxim", "xenonio", "xepa", "xerox", "xicara", "xifopago",
            "xiita", "xilogravura", "xinxim", "xistoso", "xixi", "xodo", "xogum", "xucro",
            "zabumba", "zagueiro", "zambiano", "zanzar", "zarpar", "zebu", "zefiro", "zeloso",
            "zenite", "zumbi"
        ]
    },
    'japanese': {
        prefix_len: 4,
        words: [
            "あいこくしん", "あいさつ", "あいだ", "あおぞら", "あかちゃん", "あきる", "あけがた", "あける",
            "あこがれる", "あさい", "あさひ", "あしあと", "あじわう", "あずかる", "あずき", "あそぶ",
            "あたえる", "あたためる", "あたりまえ", "あたる", "あつい", "あつかう", "あっしゅく", "あつまり",
            "あつめる", "あてな", "あてはまる", "あひる", "あぶら", "あぶる", "あふれる", "あまい",
            "あまど", "あまやかす", "あまり", "あみもの", "あめりか", "あやまる", "あゆむ", "あらいぐま",
            "あらし", "あらすじ", "あらためる", "あらゆる", "あらわす", "ありがとう", "あわせる", "あわてる",
            "あんい", "あんがい", "あんこ", "あんぜん", "あんてい", "あんない", "あんまり", "いいだす",
            "いおん", "いがい", "いがく", "いきおい", "いきなり", "いきもの", "いきる", "いくじ",
            "いくぶん", "いけばな", "いけん", "いこう", "いこく", "いこつ", "いさましい", "いさん",
            "いしき", "いじゅう", "いじょう", "いじわる", "いずみ", "いずれ", "いせい", "いせえび",
            "いせかい", "いせき", "いぜん", "いそうろう", "いそがしい", "いだい", "いだく", "いたずら",
            "いたみ", "いたりあ", "いちおう", "いちじ", "いちど", "いちば", "いちぶ", "いちりゅう",
            "いつか", "いっしゅん", "いっせい", "いっそう", "いったん", "いっち", "いってい", "いっぽう",
            "いてざ", "いてん", "いどう", "いとこ", "いない", "いなか", "いねむり", "いのち",
            "いのる", "いはつ", "いばる", "いはん", "いびき", "いひん", "いふく", "いへん",
            "いほう", "いみん", "いもうと", "いもたれ", "いもり", "いやがる", "いやす", "いよかん",
            "いよく", "いらい", "いらすと", "いりぐち", "いりょう", "いれい", "いれもの", "いれる",
            "いろえんぴつ", "いわい", "いわう", "いわかん", "いわば", "いわゆる", "いんげんまめ", "いんさつ",
            "いんしょう", "いんよう", "うえき", "うえる", "うおざ", "うがい", "うかぶ", "うかべる",
            "うきわ", "うくらいな", "うくれれ", "うけたまわる", "うけつけ", "うけとる", "うけもつ", "うける",
            "うごかす", "うごく", "うこん", "うさぎ", "うしなう", "うしろがみ", "うすい", "うすぎ",
            "うすぐらい", "うすめる", "うせつ", "うちあわせ", "うちがわ", "うちき", "うちゅう", "うっかり",
            "うつくしい", "うったえる", "うつる", "うどん", "うなぎ", "うなじ", "うなずく", "うなる",
            "うねる", "うのう", "うぶげ", "うぶごえ", "うまれる", "うめる", "うもう", "うやまう",
            "うよく", "うらがえす", "うらぐち", "うらない", "うりあげ", "うりきれ", "うるさい", "うれしい",
            "うれゆき", "うれる", "うろこ", "うわき", "うわさ", "うんこう", "うんちん", "うんてん",
            "うんどう", "えいえん", "えいが", "えいきょう", "えいご", "えいせい", "えいぶん", "えいよう",
            "えいわ", "えおり", "えがお", "えがく", "えきたい", "えくせる", "えしゃく", "えすて",
            "えつらん", "えのぐ", "えほうまき", "えほん", "えまき", "えもじ", "えもの", "えらい",
            "えらぶ", "えりあ", "えんえん", "えんかい", "えんぎ", "えんげき", "えんしゅう", "えんぜつ",
            "えんそく", "えんちょう", "えんとつ", "おいかける", "おいこす", "おいしい", "おいつく", "おうえん",
            "おうさま", "おうじ", "おうせつ", "おうたい", "おうふく", "おうべい", "おうよう", "おえる",
            "おおい", "おおう", "おおどおり", "おおや", "おおよそ", "おかえり", "おかず", "おがむ",
            "おかわり", "おぎなう", "おきる", "おくさま", "おくじょう", "おくりがな", "おくる", "おくれる",
            "おこす", "おこなう", "おこる", "おさえる", "おさない", "おさめる", "おしいれ", "おしえる",
            "おじぎ", "おじさん", "おしゃれ", "おそらく", "おそわる", "おたがい", "おたく", "おだやか",
            "おちつく", "おっと", "おつり", "おでかけ", "おとしもの", "おとなしい", "おどり", "おどろかす",
            "おばさん", "おまいり", "おめでとう", "おもいで", "おもう", "おもたい", "おもちゃ", "おやつ",
            "おやゆび", "およぼす", "おらんだ", "おろす", "おんがく", "おんけい", "おんしゃ", "おんせん",
            "おんだん", "おんちゅう", "おんどけい", "かあつ", "かいが", "がいき", "がいけん", "がいこう",
            "かいさつ", "かいしゃ", "かいすいよく", "かいぜん", "かいぞうど", "かいつう", "かいてん", "かいとう",
            "かいふく", "がいへき", "かいほう", "かいよう", "がいらい", "かいわ", "かえる", "かおり",
            "かかえる", "かがく", "かがし", "かがみ", "かくご", "かくとく", "かざる", "がぞう",
            "かたい", "かたち", "がちょう", "がっきゅう", "がっこう", "がっさん", "がっしょう", "かなざわし",
            "かのう", "がはく", "かぶか", "かほう", "かほご", "かまう", "かまぼこ", "かめれおん",
            "かゆい", "かようび", "からい", "かるい", "かろう", "かわく", "かわら", "がんか",
            "かんけい", "かんこう", "かんしゃ", "かんそう", "かんたん", "かんち", "がんばる", "きあい",
            "きあつ", "きいろ", "ぎいん", "きうい", "きうん", "きえる", "きおう", "きおく",
            "きおち", "きおん", "きかい", "きかく", "きかんしゃ", "ききて", "きくばり", "きくらげ",
            "きけんせい", "きこう", "きこえる", "きこく", "きさい", "きさく", "きさま", "きさらぎ",
            "ぎじかがく", "ぎしき", "ぎじたいけん", "ぎじにってい", "ぎじゅつしゃ", "きすう", "きせい", "きせき",
            "きせつ", "きそう", "きぞく", "きぞん", "きたえる", "きちょう", "きつえん", "ぎっちり",
            "きつつき", "きつね", "きてい", "きどう", "きどく", "きない", "きなが", "きなこ",
            "きぬごし", "きねん", "きのう", "きのした", "きはく", "きびしい", "きひん", "きふく",
            "きぶん", "きぼう", "きほん", "きまる", "きみつ", "きむずかしい", "きめる", "きもだめし",
            "きもち", "きもの", "きゃく", "きやく", "ぎゅうにく", "きよう", "きょうりゅう", "きらい",
            "きらく", "きりん", "きれい", "きれつ", "きろく", "ぎろん", "きわめる", "ぎんいろ",
            "きんかくじ", "きんじょ", "きんようび", "ぐあい", "くいず", "くうかん", "くうき", "くうぐん",
            "くうこう", "ぐうせい", "くうそう", "ぐうたら", "くうふく", "くうぼ", "くかん", "くきょう",
            "くげん", "ぐこう", "くさい", "くさき", "くさばな", "くさる", "くしゃみ", "くしょう",
            "くすのき", "くすりゆび", "くせげ", "くせん", "ぐたいてき", "くださる", "くたびれる", "くちこみ",
            "くちさき", "くつした", "ぐっすり", "くつろぐ", "くとうてん", "くどく", "くなん", "くねくね",
            "くのう", "くふう", "くみあわせ", "くみたてる", "くめる", "くやくしょ", "くらす", "くらべる",
            "くるま", "くれる", "くろう", "くわしい", "ぐんかん", "ぐんしょく", "ぐんたい", "ぐんて",
            "けあな", "けいかく", "けいけん", "けいこ", "けいさつ", "げいじゅつ", "けいたい", "げいのうじん",
            "けいれき", "けいろ", "けおとす", "けおりもの", "げきか", "げきげん", "げきだん", "げきちん",
            "げきとつ", "げきは", "げきやく", "げこう", "げこくじょう", "げざい", "けさき", "げざん",
            "けしき", "けしごむ", "けしょう", "げすと", "けたば", "けちゃっぷ", "けちらす", "けつあつ",
            "けつい", "けつえき", "けっこん", "けつじょ", "けっせき", "けってい", "けつまつ", "げつようび",
            "げつれい", "けつろん", "げどく", "けとばす", "けとる", "けなげ", "けなす", "けなみ",
            "けぬき", "げねつ", "けねん", "けはい", "げひん", "けぶかい", "げぼく", "けまり",
            "けみかる", "けむし", "けむり", "けもの", "けらい", "けろけろ", "けわしい", "けんい",
            "けんえつ", "けんお", "けんか", "げんき", "けんげん", "けんこう", "けんさく", "けんしゅう",
            "けんすう", "げんそう", "けんちく", "けんてい", "けんとう", "けんない", "けんにん", "げんぶつ",
            "けんま", "けんみん", "けんめい", "けんらん", "けんり", "こあくま", "こいぬ", "こいびと",
            "ごうい", "こうえん", "こうおん", "こうかん", "ごうきゅう", "ごうけい", "こうこう", "こうさい",
            "こうじ", "こうすい", "ごうせい", "こうそく", "こうたい", "こうちゃ", "こうつう", "こうてい",
            "こうどう", "こうない", "こうはい", "ごうほう", "ごうまん", "こうもく", "こうりつ", "こえる",
            "こおり", "ごかい", "ごがつ", "ごかん", "こくご", "こくさい", "こくとう", "こくない",
            "こくはく", "こぐま", "こけい", "こける", "ここのか", "こころ", "こさめ", "こしつ",
            "こすう", "こせい", "こせき", "こぜん", "こそだて", "こたい", "こたえる", "こたつ",
            "こちょう", "こっか", "こつこつ", "こつばん", "こつぶ", "こてい", "こてん", "ことがら",
            "ことし", "ことば", "ことり", "こなごな", "こねこね", "このまま", "このみ", "このよ",
            "ごはん", "こひつじ", "こふう", "こふん", "こぼれる", "ごまあぶら", "こまかい", "ごますり",
            "こまつな", "こまる", "こむぎこ", "こもじ", "こもち", "こもの", "こもん", "こやく",
            "こやま", "こゆう", "こゆび", "こよい", "こよう", "こりる", "これくしょん", "ころっけ",
            "こわもて", "こわれる", "こんいん", "こんかい", "こんき", "こんしゅう", "こんすい", "こんだて",
            "こんとん", "こんなん", "こんびに", "こんぽん", "こんまけ", "こんや", "こんれい", "こんわく",
            "ざいえき", "さいかい", "さいきん", "ざいげん", "ざいこ", "さいしょ", "さいせい", "ざいたく",
            "ざいちゅう", "さいてき", "ざいりょう", "さうな", "さかいし", "さがす", "さかな", "さかみち",
            "さがる", "さぎょう", "さくし", "さくひん", "さくら", "さこく", "さこつ", "さずかる",
            "ざせき", "さたん", "さつえい", "ざつおん", "ざっか", "ざつがく", "さっきょく", "ざっし",
            "さつじん", "ざっそう", "さつたば", "さつまいも", "さてい", "さといも", "さとう", "さとおや",
            "さとし", "さとる", "さのう", "さばく", "さびしい", "さべつ", "さほう", "さほど",
            "さます", "さみしい", "さみだれ", "さむけ", "さめる", "さやえんどう", "さゆう", "さよう",
            "さよく", "さらだ", "ざるそば", "さわやか", "さわる", "さんいん", "さんか", "さんきゃく",
            "さんこう", "さんさい", "ざんしょ", "さんすう", "さんせい", "さんそ", "さんち", "さんま",
            "さんみ", "さんらん", "しあい", "しあげ", "しあさって", "しあわせ", "しいく", "しいん",
            "しうち", "しえい", "しおけ", "しかい", "しかく", "じかん", "しごと", "しすう",
            "じだい", "したうけ", "したぎ", "したて", "したみ", "しちょう", "しちりん", "しっかり",
            "しつじ", "しつもん", "してい", "してき", "してつ", "じてん", "じどう", "しなぎれ",
            "しなもの", "しなん", "しねま", "しねん", "しのぐ", "しのぶ", "しはい", "しばかり",
            "しはつ", "しはらい", "しはん", "しひょう", "しふく", "じぶん", "しへい", "しほう",
            "しほん", "しまう", "しまる", "しみん", "しむける", "じむしょ", "しめい", "しめる",
            "しもん", "しゃいん", "しゃうん", "しゃおん", "じゃがいも", "しやくしょ", "しゃくほう", "しゃけん",
            "しゃこ", "しゃざい", "しゃしん", "しゃせん", "しゃそう", "しゃたい", "しゃちょう", "しゃっきん",
            "じゃま", "しゃりん", "しゃれい", "じゆう", "じゅうしょ", "しゅくはく", "じゅしん", "しゅっせき",
            "しゅみ", "しゅらば", "じゅんばん", "しょうかい", "しょくたく", "しょっけん", "しょどう", "しょもつ",
            "しらせる", "しらべる", "しんか", "しんこう", "じんじゃ", "しんせいじ", "しんちく", "しんりん",
            "すあげ", "すあし", "すあな", "ずあん", "すいえい", "すいか", "すいとう", "ずいぶん",
            "すいようび", "すうがく", "すうじつ", "すうせん", "すおどり", "すきま", "すくう", "すくない",
            "すける", "すごい", "すこし", "ずさん", "すずしい", "すすむ", "すすめる", "すっかり",
            "ずっしり", "ずっと", "すてき", "すてる", "すねる", "すのこ", "すはだ", "すばらしい",
            "ずひょう", "ずぶぬれ", "すぶり", "すふれ", "すべて", "すべる", "ずほう", "すぼん",
            "すまい", "すめし", "すもう", "すやき", "すらすら", "するめ", "すれちがう", "すろっと",
            "すわる", "すんぜん", "すんぽう", "せあぶら", "せいかつ", "せいげん", "せいじ", "せいよう",
            "せおう", "せかいかん", "せきにん", "せきむ", "せきゆ", "せきらんうん", "せけん", "せこう",
            "せすじ", "せたい", "せたけ", "せっかく", "せっきゃく", "ぜっく", "せっけん", "せっこつ",
            "せっさたくま", "せつぞく", "せつだん", "せつでん", "せっぱん", "せつび", "せつぶん", "せつめい",
            "せつりつ", "せなか", "せのび", "せはば", "せびろ", "せぼね", "せまい", "せまる",
            "せめる", "せもたれ", "せりふ", "ぜんあく", "せんい", "せんえい", "せんか", "せんきょ",
            "せんく", "せんげん", "ぜんご", "せんさい", "せんしゅ", "せんすい", "せんせい", "せんぞ",
            "せんたく", "せんちょう", "せんてい", "せんとう", "せんぬき", "せんねん", "せんぱい", "ぜんぶ",
            "ぜんぽう", "せんむ", "せんめんじょ", "せんもん", "せんやく", "せんゆう", "せんよう", "ぜんら",
            "ぜんりゃく", "せんれい", "せんろ", "そあく", "そいとげる", "そいね", "そうがんきょう", "そうき",
            "そうご", "そうしん", "そうだん", "そうなん", "そうび", "そうめん", "そうり", "そえもの",
            "そえん", "そがい", "そげき", "そこう", "そこそこ", "そざい", "そしな", "そせい",
            "そせん", "そそぐ", "そだてる", "そつう", "そつえん", "そっかん", "そつぎょう", "そっけつ",
            "そっこう", "そっせん", "そっと", "そとがわ", "そとづら", "そなえる", "そなた", "そふぼ",
            "そぼく", "そぼろ", "そまつ", "そまる", "そむく", "そむりえ", "そめる", "そもそも",
            "そよかぜ", "そらまめ", "そろう", "そんかい", "そんけい", "そんざい", "そんしつ", "そんぞく",
            "そんちょう", "ぞんび", "ぞんぶん", "そんみん", "たあい", "たいいん", "たいうん", "たいえき",
            "たいおう", "だいがく", "たいき", "たいぐう", "たいけん", "たいこ", "たいざい", "だいじょうぶ",
            "だいすき", "たいせつ", "たいそう", "だいたい", "たいちょう", "たいてい", "だいどころ", "たいない",
            "たいねつ", "たいのう", "たいはん", "だいひょう", "たいふう", "たいへん", "たいほ", "たいまつばな",
            "たいみんぐ", "たいむ", "たいめん", "たいやき", "たいよう", "たいら", "たいりょく", "たいる",
            "たいわん", "たうえ", "たえる", "たおす", "たおる", "たおれる", "たかい", "たかね",
            "たきび", "たくさん", "たこく", "たこやき", "たさい", "たしざん", "だじゃれ", "たすける",
            "たずさわる", "たそがれ", "たたかう", "たたく", "ただしい", "たたみ", "たちばな", "だっかい",
            "だっきゃく", "だっこ", "だっしゅつ", "だったい", "たてる", "たとえる", "たなばた", "たにん",
            "たぬき", "たのしみ", "たはつ", "たぶん", "たべる", "たぼう", "たまご", "たまる",
            "だむる", "ためいき", "ためす", "ためる", "たもつ", "たやすい", "たよる", "たらす",
            "たりきほんがん", "たりょう", "たりる", "たると", "たれる", "たれんと", "たろっと", "たわむれる",
            "だんあつ", "たんい", "たんおん", "たんか", "たんき", "たんけん", "たんご", "たんさん",
            "たんじょうび", "だんせい", "たんそく", "たんたい", "だんち", "たんてい", "たんとう", "だんな",
            "たんにん", "だんねつ", "たんのう", "たんぴん", "だんぼう", "たんまつ", "たんめい", "だんれつ",
            "だんろ", "だんわ", "ちあい", "ちあん", "ちいき", "ちいさい", "ちえん", "ちかい",
            "ちから", "ちきゅう", "ちきん", "ちけいず", "ちけん", "ちこく", "ちさい", "ちしき",
            "ちしりょう", "ちせい", "ちそう", "ちたい", "ちたん", "ちちおや", "ちつじょ", "ちてき",
            "ちてん", "ちぬき", "ちぬり", "ちのう", "ちひょう", "ちへいせん", "ちほう", "ちまた",
            "ちみつ", "ちみどろ", "ちめいど", "ちゃんこなべ", "ちゅうい", "ちゆりょく", "ちょうし", "ちょさくけん",
            "ちらし", "ちらみ", "ちりがみ", "ちりょう", "ちるど", "ちわわ", "ちんたい", "ちんもく",
            "ついか", "ついたち", "つうか", "つうじょう", "つうはん", "つうわ", "つかう", "つかれる",
            "つくね", "つくる", "つけね", "つける", "つごう", "つたえる", "つづく", "つつじ",
            "つつむ", "つとめる", "つながる", "つなみ", "つねづね", "つのる", "つぶす", "つまらない",
            "つまる", "つみき", "つめたい", "つもり", "つもる", "つよい", "つるぼ", "つるみく",
            "つわもの", "つわり", "てあし", "てあて", "てあみ", "ていおん", "ていか", "ていき",
            "ていけい", "ていこく", "ていさつ", "ていし", "ていせい", "ていたい", "ていど", "ていねい",
            "ていひょう", "ていへん", "ていぼう", "てうち", "ておくれ", "てきとう", "てくび", "でこぼこ",
            "てさぎょう", "てさげ", "てすり", "てそう", "てちがい", "てちょう", "てつがく", "てつづき",
            "でっぱ", "てつぼう", "てつや", "でぬかえ", "てぬき", "てぬぐい", "てのひら", "てはい",
            "てぶくろ", "てふだ", "てほどき", "てほん", "てまえ", "てまきずし", "てみじか", "てみやげ",
            "てらす", "てれび", "てわけ", "てわたし", "でんあつ", "てんいん", "てんかい", "てんき",
            "てんぐ", "てんけん", "てんごく", "てんさい", "てんし", "てんすう", "でんち", "てんてき",
            "てんとう", "てんない", "てんぷら", "てんぼうだい", "てんめつ", "てんらんかい", "でんりょく", "でんわ",
            "どあい", "といれ", "どうかん", "とうきゅう", "どうぐ", "とうし", "とうむぎ", "とおい",
            "とおか", "とおく", "とおす", "とおる", "とかい", "とかす", "ときおり", "ときどき",
            "とくい", "とくしゅう", "とくてん", "とくに", "とくべつ", "とけい", "とける", "とこや",
            "とさか", "としょかん", "とそう", "とたん", "とちゅう", "とっきゅう", "とっくん", "とつぜん",
            "とつにゅう", "とどける", "ととのえる", "とない", "となえる", "となり", "とのさま", "とばす",
            "どぶがわ", "とほう", "とまる", "とめる", "ともだち", "ともる", "どようび", "とらえる",
            "とんかつ", "どんぶり", "ないかく", "ないこう", "ないしょ", "ないす", "ないせん", "ないそう",
            "なおす", "ながい", "なくす", "なげる", "なこうど", "なさけ", "なたでここ", "なっとう",
            "なつやすみ", "ななおし", "なにごと", "なにもの", "なにわ", "なのか", "なふだ", "なまいき",
            "なまえ", "なまみ", "なみだ", "なめらか", "なめる", "なやむ", "ならう", "ならび",
            "ならぶ", "なれる", "なわとび", "なわばり", "にあう", "にいがた", "にうけ", "におい",
            "にかい", "にがて", "にきび", "にくしみ", "にくまん", "にげる", "にさんかたんそ", "にしき",
            "にせもの", "にちじょう", "にちようび", "にっか", "にっき", "にっけい", "にっこう", "にっさん",
            "にっしょく", "にっすう", "にっせき", "にってい", "になう", "にほん", "にまめ", "にもつ",
            "にやり", "にゅういん", "にりんしゃ", "にわとり", "にんい", "にんか", "にんき", "にんげん",
            "にんしき", "にんずう", "にんそう", "にんたい", "にんち", "にんてい", "にんにく", "にんぷ",
            "にんまり", "にんむ", "にんめい", "にんよう", "ぬいくぎ", "ぬかす", "ぬぐいとる", "ぬぐう",
            "ぬくもり", "ぬすむ", "ぬまえび", "ぬめり", "ぬらす", "ぬんちゃく", "ねあげ", "ねいき",
            "ねいる", "ねいろ", "ねぐせ", "ねくたい", "ねくら", "ねこぜ", "ねこむ", "ねさげ",
            "ねすごす", "ねそべる", "ねだん", "ねつい", "ねっしん", "ねつぞう", "ねったいぎょ", "ねぶそく",
            "ねふだ", "ねぼう", "ねほりはほり", "ねまき", "ねまわし", "ねみみ", "ねむい", "ねむたい",
            "ねもと", "ねらう", "ねわざ", "ねんいり", "ねんおし", "ねんかん", "ねんきん", "ねんぐ",
            "ねんざ", "ねんし", "ねんちゃく", "ねんど", "ねんぴ", "ねんぶつ", "ねんまつ", "ねんりょう",
            "ねんれい", "のいず", "のおづま", "のがす", "のきなみ", "のこぎり", "のこす", "のこる",
            "のせる", "のぞく", "のぞむ", "のたまう", "のちほど", "のっく", "のばす", "のはら",
            "のべる", "のぼる", "のみもの", "のやま", "のらいぬ", "のらねこ", "のりもの", "のりゆき",
            "のれん", "のんき", "ばあい", "はあく", "ばあさん", "ばいか", "ばいく", "はいけん",
            "はいご", "はいしん", "はいすい", "はいせん", "はいそう", "はいち", "ばいばい", "はいれつ",
            "はえる", "はおる", "はかい", "ばかり", "はかる", "はくしゅ", "はけん", "はこぶ",
            "はさみ", "はさん", "はしご", "ばしょ", "はしる", "はせる", "ぱそこん", "はそん",
            "はたん", "はちみつ", "はつおん", "はっかく", "はづき", "はっきり", "はっくつ", "はっけん",
            "はっこう", "はっさん", "はっしん", "はったつ", "はっちゅう", "はってん", "はっぴょう", "はっぽう",
            "はなす", "はなび", "はにかむ", "はぶらし", "はみがき", "はむかう", "はめつ", "はやい",
            "はやし", "はらう", "はろうぃん", "はわい", "はんい", "はんえい", "はんおん", "はんかく",
            "はんきょう", "ばんぐみ", "はんこ", "はんしゃ", "はんすう", "はんだん", "ぱんち", "ぱんつ",
            "はんてい", "はんとし", "はんのう", "はんぱ", "はんぶん", "はんぺん", "はんぼうき", "はんめい",
            "はんらん", "はんろん", "ひいき", "ひうん", "ひえる", "ひかく", "ひかり", "ひかる",
            "ひかん", "ひくい", "ひけつ", "ひこうき", "ひこく", "ひさい", "ひさしぶり", "ひさん",
            "びじゅつかん", "ひしょ"
        ]
    }
};

(function() {
    'use strict';
    for (var i in mn_words) {
        if (mn_words.hasOwnProperty(i)) {
            if (mn_words[i].prefix_len === 0) {
                continue;
            }
            mn_words[i].trunc_words = [];
            for (var j = 0; j < mn_words[i].words.length; ++j) {
                mn_words[i].trunc_words.push(mn_words[i].words[j].slice(0, mn_words[i].prefix_len));
            }
        }
    }
})();


;(function(root, undefined) {
  'use strict';

  var NODE_JS = typeof(module) != 'undefined';
  if(NODE_JS) {
    root = global;
    if(root.JS_SHA3_TEST) {
      root.navigator = { userAgent: 'Chrome'};
    }
  }
  var HEX_CHARS = '0123456789abcdef'.split('');
  var SHAKE_PADDING = [31, 7936, 2031616, 520093696];
  var KECCAK_PADDING = [1, 256, 65536, 16777216];
  var PADDING = [6, 1536, 393216, 100663296];
  var SHIFT = [0, 8, 16, 24];
  var RC = [1, 0, 32898, 0, 32906, 2147483648, 2147516416, 2147483648, 32907, 0, 2147483649,
            0, 2147516545, 2147483648, 32777, 2147483648, 138, 0, 136, 0, 2147516425, 0,
            2147483658, 0, 2147516555, 0, 139, 2147483648, 32905, 2147483648, 32771,
            2147483648, 32770, 2147483648, 128, 2147483648, 32778, 0, 2147483658, 2147483648,
            2147516545, 2147483648, 32896, 2147483648, 2147483649, 0, 2147516424, 2147483648];
  var BITS = [224, 256, 384, 512];
  var SHAKE_BITS = [128, 256];
  var OUTPUT_TYPES = ['hex', 'buffer', 'array'];

  var createOutputMethod = function(bits, padding, outputType) {
    return function(message) {
      return new Keccak(bits, padding, bits).update(message)[outputType]();
    }
  };

  var createShakeOutputMethod = function(bits, padding, outputType) {
    return function(message, outputBits) {
      return new Keccak(bits, padding, outputBits).update(message)[outputType]();
    }
  };

  var createMethod = function(bits, padding) {
    var method = createOutputMethod(bits, padding, 'hex');
    method.create = function() {
      return new Keccak(bits, padding, bits);
    };
    method.update = function(message) {
      return method.create().update(message);
    };
    for(var i = 0;i < OUTPUT_TYPES.length;++i) {
      var type = OUTPUT_TYPES[i];
      method[type] = createOutputMethod(bits, padding, type);
    }
    return method;
  };

  var createShakeMethod = function(bits, padding) {
    var method = createShakeOutputMethod(bits, padding, 'hex');
    method.create = function(outputBits) {
      return new Keccak(bits, padding, outputBits);
    };
    method.update = function(message, outputBits) {
      return method.create(outputBits).update(message);
    };
    for(var i = 0;i < OUTPUT_TYPES.length;++i) {
      var type = OUTPUT_TYPES[i];
      method[type] = createShakeOutputMethod(bits, padding, type);
    }
    return method;
  };

  var algorithms = [
    {name: 'keccak', padding: KECCAK_PADDING, bits: BITS, createMethod: createMethod},
    {name: 'sha3', padding: PADDING, bits: BITS, createMethod: createMethod},
    {name: 'shake', padding: SHAKE_PADDING, bits: SHAKE_BITS, createMethod: createShakeMethod}
  ];

  var methods = {};

  for(var i = 0;i < algorithms.length;++i) {
    var algorithm = algorithms[i];
    var bits  = algorithm.bits;
    var createMethod = algorithm.createMethod;
    for(var j = 0;j < bits.length;++j) {
      var method = algorithm.createMethod(bits[j], algorithm.padding);
      methods[algorithm.name +'_' + bits[j]] = method;
    }
  }

  function Keccak(bits, padding, outputBits) {
    this.blocks = [];
    this.s = [];
    this.padding = padding;
    this.outputBits = outputBits;
    this.reset = true;
    this.block = 0;
    this.start = 0;
    this.blockCount = (1600 - (bits << 1)) >> 5;
    this.byteCount = this.blockCount << 2;
    this.outputBlocks = outputBits >> 5;
    this.extraBytes = (outputBits & 31) >> 3;

    for(var i = 0;i < 50;++i) {
      this.s[i] = 0;
    }
  };

  Keccak.prototype.update = function(message) {
    var notString = typeof(message) != 'string';
    if(notString && message.constructor == root.ArrayBuffer) {
      message = new Uint8Array(message);
    }
    var length = message.length, blocks = this.blocks, byteCount = this.byteCount,
        blockCount = this.blockCount, index = 0, s = this.s, i, code;

    while(index < length) {
      if(this.reset) {
        this.reset = false;
        blocks[0] = this.block;
        for(i = 1;i < blockCount + 1;++i) {
          blocks[i] = 0;
        }
      }
      if(notString) {
        for (i = this.start;index < length && i < byteCount; ++index) {
          blocks[i >> 2] |= message[index] << SHIFT[i++ & 3];
        }
      } else {
        for (i = this.start;index < length && i < byteCount; ++index) {
          code = message.charCodeAt(index);
          if (code < 0x80) {
            blocks[i >> 2] |= code << SHIFT[i++ & 3];
          } else if (code < 0x800) {
            blocks[i >> 2] |= (0xc0 | (code >> 6)) << SHIFT[i++ & 3];
            blocks[i >> 2] |= (0x80 | (code & 0x3f)) << SHIFT[i++ & 3];
          } else if (code < 0xd800 || code >= 0xe000) {
            blocks[i >> 2] |= (0xe0 | (code >> 12)) << SHIFT[i++ & 3];
            blocks[i >> 2] |= (0x80 | ((code >> 6) & 0x3f)) << SHIFT[i++ & 3];
            blocks[i >> 2] |= (0x80 | (code & 0x3f)) << SHIFT[i++ & 3];
          } else {
            code = 0x10000 + (((code & 0x3ff) << 10) | (message.charCodeAt(++index) & 0x3ff));
            blocks[i >> 2] |= (0xf0 | (code >> 18)) << SHIFT[i++ & 3];
            blocks[i >> 2] |= (0x80 | ((code >> 12) & 0x3f)) << SHIFT[i++ & 3];
            blocks[i >> 2] |= (0x80 | ((code >> 6) & 0x3f)) << SHIFT[i++ & 3];
            blocks[i >> 2] |= (0x80 | (code & 0x3f)) << SHIFT[i++ & 3];
          }
        }
      }
      this.lastByteIndex = i;
      if(i >= byteCount) {
        this.start = i - byteCount;
        this.block = blocks[blockCount];
        for(i = 0;i < blockCount;++i) {
          s[i] ^= blocks[i];
        }
        f(s);
        this.reset = true;
      } else {
        this.start = i;
      }
    }
    return this;
  };

  Keccak.prototype.finalize = function() {
    var blocks = this.blocks, i = this.lastByteIndex, blockCount = this.blockCount, s = this.s;
    blocks[i >> 2] |= this.padding[i & 3];
    if(this.lastByteIndex == this.byteCount) {
      blocks[0] = blocks[blockCount];
      for(i = 1;i < blockCount + 1;++i) {
        blocks[i] = 0;
      }
    }
    blocks[blockCount - 1] |= 0x80000000;
    for(i = 0;i < blockCount;++i) {
      s[i] ^= blocks[i];
    }
    f(s);
  };

  Keccak.prototype.toString = Keccak.prototype.hex = function() {
    this.finalize();

    var blockCount = this.blockCount, s = this.s, outputBlocks = this.outputBlocks,
        extraBytes = this.extraBytes, i = 0, j = 0;
    var hex = '', block;
    while(j < outputBlocks) {
      for(i = 0;i < blockCount && j < outputBlocks;++i, ++j) {
        block = s[i];
        hex += HEX_CHARS[(block >> 4) & 0x0F] + HEX_CHARS[block & 0x0F] +
               HEX_CHARS[(block >> 12) & 0x0F] + HEX_CHARS[(block >> 8) & 0x0F] +
               HEX_CHARS[(block >> 20) & 0x0F] + HEX_CHARS[(block >> 16) & 0x0F] +
               HEX_CHARS[(block >> 28) & 0x0F] + HEX_CHARS[(block >> 24) & 0x0F];
      }
      if(j % blockCount == 0) {
        f(s);
      }
    }
    if(extraBytes) {
      block = s[i];
      if(extraBytes > 0) {
        hex += HEX_CHARS[(block >> 4) & 0x0F] + HEX_CHARS[block & 0x0F];
      }
      if(extraBytes > 1) {
        hex += HEX_CHARS[(block >> 12) & 0x0F] + HEX_CHARS[(block >> 8) & 0x0F];
      }
      if(extraBytes > 2) {
        hex += HEX_CHARS[(block >> 20) & 0x0F] + HEX_CHARS[(block >> 16) & 0x0F];
      }
    }
    return hex;
  };

  Keccak.prototype.buffer = function() {
    this.finalize();

    var blockCount = this.blockCount, s = this.s, outputBlocks = this.outputBlocks,
        extraBytes = this.extraBytes, i = 0, j = 0;
    var bytes = this.outputBits >> 3;
    var buffer;
    if(extraBytes) {
      buffer = new ArrayBuffer((outputBlocks + 1) << 2);
    } else {
      buffer = new ArrayBuffer(bytes);
    }
    var array = new Uint32Array(buffer);
    while(j < outputBlocks) {
      for(i = 0;i < blockCount && j < outputBlocks;++i, ++j) {
        array[j] = s[i];
      }
      if(j % blockCount == 0) {
        f(s);
      }
    }
    if(extraBytes) {
      array[i] = s[i];
      buffer = buffer.slice(0, bytes);
    }
    return buffer;
  };

  Keccak.prototype.digest = Keccak.prototype.array = function() {
    this.finalize();

    var blockCount = this.blockCount, s = this.s, outputBlocks = this.outputBlocks,
        extraBytes = this.extraBytes, i = 0, j = 0;
    var array = [], offset, block;
    while(j < outputBlocks) {
      for(i = 0;i < blockCount && j < outputBlocks;++i, ++j) {
        offset = j << 2;
        block = s[i];
        array[offset] = block & 0xFF;
        array[offset + 1] = (block >> 8) & 0xFF;
        array[offset + 2] = (block >> 16) & 0xFF;
        array[offset + 3] = (block >> 24) & 0xFF;
      }
      if(j % blockCount == 0) {
        f(s);
      }
    }
    if(extraBytes) {
      offset = j << 2;
      block = s[i];
      if(extraBytes > 0) {
        array[offset] = block & 0xFF;
      }
      if(extraBytes > 1) {
        array[offset + 1] = (block >> 8) & 0xFF;
      }
      if(extraBytes > 2) {
        array[offset + 2] = (block >> 16) & 0xFF;
      }
    }
    return array;
  };

  var f = function(s) {
    var h, l, n, c0, c1, c2, c3, c4, c5, c6, c7, c8, c9,
        b0, b1, b2, b3, b4, b5, b6, b7, b8, b9, b10, b11, b12, b13, b14, b15, b16, b17,
        b18, b19, b20, b21, b22, b23, b24, b25, b26, b27, b28, b29, b30, b31, b32, b33,
        b34, b35, b36, b37, b38, b39, b40, b41, b42, b43, b44, b45, b46, b47, b48, b49;
    for(n = 0; n < 48; n += 2) {
      c0 = s[0] ^ s[10] ^ s[20] ^ s[30] ^ s[40];
      c1 = s[1] ^ s[11] ^ s[21] ^ s[31] ^ s[41];
      c2 = s[2] ^ s[12] ^ s[22] ^ s[32] ^ s[42];
      c3 = s[3] ^ s[13] ^ s[23] ^ s[33] ^ s[43];
      c4 = s[4] ^ s[14] ^ s[24] ^ s[34] ^ s[44];
      c5 = s[5] ^ s[15] ^ s[25] ^ s[35] ^ s[45];
      c6 = s[6] ^ s[16] ^ s[26] ^ s[36] ^ s[46];
      c7 = s[7] ^ s[17] ^ s[27] ^ s[37] ^ s[47];
      c8 = s[8] ^ s[18] ^ s[28] ^ s[38] ^ s[48];
      c9 = s[9] ^ s[19] ^ s[29] ^ s[39] ^ s[49];

      h = c8 ^ ((c2 << 1) | (c3 >>> 31));
      l = c9 ^ ((c3 << 1) | (c2 >>> 31));
      s[0] ^= h;
      s[1] ^= l;
      s[10] ^= h;
      s[11] ^= l;
      s[20] ^= h;
      s[21] ^= l;
      s[30] ^= h;
      s[31] ^= l;
      s[40] ^= h;
      s[41] ^= l;
      h = c0 ^ ((c4 << 1) | (c5 >>> 31));
      l = c1 ^ ((c5 << 1) | (c4 >>> 31));
      s[2] ^= h;
      s[3] ^= l;
      s[12] ^= h;
      s[13] ^= l;
      s[22] ^= h;
      s[23] ^= l;
      s[32] ^= h;
      s[33] ^= l;
      s[42] ^= h;
      s[43] ^= l;
      h = c2 ^ ((c6 << 1) | (c7 >>> 31));
      l = c3 ^ ((c7 << 1) | (c6 >>> 31));
      s[4] ^= h;
      s[5] ^= l;
      s[14] ^= h;
      s[15] ^= l;
      s[24] ^= h;
      s[25] ^= l;
      s[34] ^= h;
      s[35] ^= l;
      s[44] ^= h;
      s[45] ^= l;
      h = c4 ^ ((c8 << 1) | (c9 >>> 31));
      l = c5 ^ ((c9 << 1) | (c8 >>> 31));
      s[6] ^= h;
      s[7] ^= l;
      s[16] ^= h;
      s[17] ^= l;
      s[26] ^= h;
      s[27] ^= l;
      s[36] ^= h;
      s[37] ^= l;
      s[46] ^= h;
      s[47] ^= l;
      h = c6 ^ ((c0 << 1) | (c1 >>> 31));
      l = c7 ^ ((c1 << 1) | (c0 >>> 31));
      s[8] ^= h;
      s[9] ^= l;
      s[18] ^= h;
      s[19] ^= l;
      s[28] ^= h;
      s[29] ^= l;
      s[38] ^= h;
      s[39] ^= l;
      s[48] ^= h;
      s[49] ^= l;

      b0 = s[0];
      b1 = s[1];
      b32 = (s[11] << 4) | (s[10] >>> 28);
      b33 = (s[10] << 4) | (s[11] >>> 28);
      b14 = (s[20] << 3) | (s[21] >>> 29);
      b15 = (s[21] << 3) | (s[20] >>> 29);
      b46 = (s[31] << 9) | (s[30] >>> 23);
      b47 = (s[30] << 9) | (s[31] >>> 23);
      b28 = (s[40] << 18) | (s[41] >>> 14);
      b29 = (s[41] << 18) | (s[40] >>> 14);
      b20 = (s[2] << 1) | (s[3] >>> 31);
      b21 = (s[3] << 1) | (s[2] >>> 31);
      b2 = (s[13] << 12) | (s[12] >>> 20);
      b3 = (s[12] << 12) | (s[13] >>> 20);
      b34 = (s[22] << 10) | (s[23] >>> 22);
      b35 = (s[23] << 10) | (s[22] >>> 22);
      b16 = (s[33] << 13) | (s[32] >>> 19);
      b17 = (s[32] << 13) | (s[33] >>> 19);
      b48 = (s[42] << 2) | (s[43] >>> 30);
      b49 = (s[43] << 2) | (s[42] >>> 30);
      b40 = (s[5] << 30) | (s[4] >>> 2);
      b41 = (s[4] << 30) | (s[5] >>> 2);
      b22 = (s[14] << 6) | (s[15] >>> 26);
      b23 = (s[15] << 6) | (s[14] >>> 26);
      b4 = (s[25] << 11) | (s[24] >>> 21);
      b5 = (s[24] << 11) | (s[25] >>> 21);
      b36 = (s[34] << 15) | (s[35] >>> 17);
      b37 = (s[35] << 15) | (s[34] >>> 17);
      b18 = (s[45] << 29) | (s[44] >>> 3);
      b19 = (s[44] << 29) | (s[45] >>> 3);
      b10 = (s[6] << 28) | (s[7] >>> 4);
      b11 = (s[7] << 28) | (s[6] >>> 4);
      b42 = (s[17] << 23) | (s[16] >>> 9);
      b43 = (s[16] << 23) | (s[17] >>> 9);
      b24 = (s[26] << 25) | (s[27] >>> 7);
      b25 = (s[27] << 25) | (s[26] >>> 7);
      b6 = (s[36] << 21) | (s[37] >>> 11);
      b7 = (s[37] << 21) | (s[36] >>> 11);
      b38 = (s[47] << 24) | (s[46] >>> 8);
      b39 = (s[46] << 24) | (s[47] >>> 8);
      b30 = (s[8] << 27) | (s[9] >>> 5);
      b31 = (s[9] << 27) | (s[8] >>> 5);
      b12 = (s[18] << 20) | (s[19] >>> 12);
      b13 = (s[19] << 20) | (s[18] >>> 12);
      b44 = (s[29] << 7) | (s[28] >>> 25);
      b45 = (s[28] << 7) | (s[29] >>> 25);
      b26 = (s[38] << 8) | (s[39] >>> 24);
      b27 = (s[39] << 8) | (s[38] >>> 24);
      b8 = (s[48] << 14) | (s[49] >>> 18);
      b9 = (s[49] << 14) | (s[48] >>> 18);

      s[0] = b0 ^ (~b2 & b4);
      s[1] = b1 ^ (~b3 & b5);
      s[10] = b10 ^ (~b12 & b14);
      s[11] = b11 ^ (~b13 & b15);
      s[20] = b20 ^ (~b22 & b24);
      s[21] = b21 ^ (~b23 & b25);
      s[30] = b30 ^ (~b32 & b34);
      s[31] = b31 ^ (~b33 & b35);
      s[40] = b40 ^ (~b42 & b44);
      s[41] = b41 ^ (~b43 & b45);
      s[2] = b2 ^ (~b4 & b6);
      s[3] = b3 ^ (~b5 & b7);
      s[12] = b12 ^ (~b14 & b16);
      s[13] = b13 ^ (~b15 & b17);
      s[22] = b22 ^ (~b24 & b26);
      s[23] = b23 ^ (~b25 & b27);
      s[32] = b32 ^ (~b34 & b36);
      s[33] = b33 ^ (~b35 & b37);
      s[42] = b42 ^ (~b44 & b46);
      s[43] = b43 ^ (~b45 & b47);
      s[4] = b4 ^ (~b6 & b8);
      s[5] = b5 ^ (~b7 & b9);
      s[14] = b14 ^ (~b16 & b18);
      s[15] = b15 ^ (~b17 & b19);
      s[24] = b24 ^ (~b26 & b28);
      s[25] = b25 ^ (~b27 & b29);
      s[34] = b34 ^ (~b36 & b38);
      s[35] = b35 ^ (~b37 & b39);
      s[44] = b44 ^ (~b46 & b48);
      s[45] = b45 ^ (~b47 & b49);
      s[6] = b6 ^ (~b8 & b0);
      s[7] = b7 ^ (~b9 & b1);
      s[16] = b16 ^ (~b18 & b10);
      s[17] = b17 ^ (~b19 & b11);
      s[26] = b26 ^ (~b28 & b20);
      s[27] = b27 ^ (~b29 & b21);
      s[36] = b36 ^ (~b38 & b30);
      s[37] = b37 ^ (~b39 & b31);
      s[46] = b46 ^ (~b48 & b40);
      s[47] = b47 ^ (~b49 & b41);
      s[8] = b8 ^ (~b0 & b2);
      s[9] = b9 ^ (~b1 & b3);
      s[18] = b18 ^ (~b10 & b12);
      s[19] = b19 ^ (~b11 & b13);
      s[28] = b28 ^ (~b20 & b22);
      s[29] = b29 ^ (~b21 & b23);
      s[38] = b38 ^ (~b30 & b32);
      s[39] = b39 ^ (~b31 & b33);
      s[48] = b48 ^ (~b40 & b42);
      s[49] = b49 ^ (~b41 & b43);

      s[0] ^= RC[n];
      s[1] ^= RC[n + 1];
    }
  }

  if(!root.JS_SHA3_TEST && NODE_JS) {
    module.exports = methods;
  } else if(root) {
    for(var key in methods) {
      root[key] = methods[key];
    }
  }
}(this));


export const validateAddress = (address_b58, extended=false) => {
  var output = {
    valid: false,
    input_address: address_b58,
    address:"",
    is_subaddress:false,
    is_kurz:false,
    is_integrated:false,
    integrated_id:"",
    network:""
  }

  try {
    var address_hex = cnBase58.decode(address_b58);
  } catch (error) {
    return output;
  }

  var i, found_prefix = false;
  for(i = 0; i < config.length; i++) {
    if(address_hex.substr(0, config[i].prefix_hex.length) == config[i].prefix_hex) {
      found_prefix = true;
      break;
    }
  }

  if(!found_prefix) {
    return output;
  }

  var address_no_prefix = address_hex.slice(config[i].prefix_hex.length);
  var spend = address_no_prefix.slice(0, 64);
  var view = address_no_prefix.slice(64, 128);

  if(config[i].is_integrated) {
    var integrated_id = address_no_prefix.slice(128, 128 + 16);
    var checksum = address_no_prefix.slice(128 + 16, 128 + 16 + (ADDRESS_CHECKSUM_SIZE * 2));
    var expectedChecksum = cnUtil.cn_fast_hash(config[i].prefix_hex + spend + view + integrated_id)
        .slice(0, ADDRESS_CHECKSUM_SIZE * 2);
  } else {
    var checksum = address_no_prefix.slice(128, 128 + (ADDRESS_CHECKSUM_SIZE * 2));
    var expectedChecksum = cnUtil.cn_fast_hash(config[i].prefix_hex + spend + view).slice(0, ADDRESS_CHECKSUM_SIZE * 2);
  }

  if (checksum == expectedChecksum) {
    output.valid = true;
  }

  if(!output.valid) {
    return output;
  }

  if(address_b58.substr(0,1) == "S" || config[i].is_integrated) {
    var j;
    for(j = 0; j < config.length; j++) {
      if(config[i].is_subaddress == config[j].is_subaddress &&
         config[j].is_integrated == false &&
         config[i].is_kurz == config[j].is_kurz &&
         config[i].network == config[j].network)
        break;
    }

    data = config[j].prefix_hex + spend + view;
    checksum = cnUtil.cn_fast_hash(data);
    address_b58 = cnBase58.encode(data + checksum.slice(0, ADDRESS_CHECKSUM_SIZE * 2));
  }

  output.network = config[i].network;
  output.address = address_b58;
  output.is_subaddress = config[i].is_subaddress;
  output.is_kurz = config[i].is_kurz;
  output.is_integrated = config[i].is_integrated;
  if(output.is_integrated) {
    output.integrated_id = integrated_id;
  }
  if(extended) {
    output.view = view;
    output.spend = spend;
    output.noprefix = address_no_prefix;
  }

  return output;
}
