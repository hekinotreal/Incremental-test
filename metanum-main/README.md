# MetaNum

[![NPM](https://img.shields.io/npm/v/metanum.svg)](https://www.npmjs.com/package/metanum)

- MetaNum v1.4 by dlsdl

A huge number library holding up to X↑↑X&9e15.

This reaches level f<sub>ε₀</sub>, which is the limit of well-defined expressions in BEAF, hence the name.

MetaNum provides a robust implementation of hierarchical number representation based on ordinal arithmetic. It can handle numbers far beyond standard JavaScript Number limits, using a sophisticated multi-dimensional array structure to represent ordinal numbers up to ε₀ (ω^ω^ω^……with ω floors). Internally, each MetaNum instance is represented as:

- **sign**: 1 (positive), -1 (negative), 2 (reciprocal positive), -2 (reciprocal negative)
- **array**: 2-dimensional array `[[r0, r1, r2, ...,rn], [acount, a1, a2, ...,ax], [bcount, b1, b2, ...,by], ...,[mcount, m1, m2, ...,mz]]` where the first row holds the base value and finite hyper-operation exponents and subsequent rows hold ordinal terms, ordinal terms are sorted by levels from small to big
- **layer**: Non-negative integer representing the ω exponent tower height of hyperoperation level(ω^ω^……(ω polynomial) with layer ω^'s)

Using extended arrow operations(see #Mathematical Background), a metanum number can be represented as \[none(sign=1)|-(sign=-1)|1/(sign=2)|-1/(sign=-2)] \[mcount(10{ω^(z-1)\*mz+...+ω^2\*m3+ω\*m2+m1})'s ... bcount(10{ω^(y-1)\*by+...+ω^2\*b3+ω\*b2+b1})'s acount(10{ω^(x-1)\*ax+...+ω^2\*a3+ω\*a2+a1})'s rn(10{n})'s ... r3(10{3})'s r2(10{2})'s r1(10{1})'s r0 (layer=0)|10{ω^ω^...(layer-1 ω^'s) (ω^(ω^(z-1)\*mz+...+ω^2\*m3+ω\*m2+m1)\*mcount+...+ω^(ω^(y-1)\*by+...+ω^2\*b3+ω\*b2+b1)\*bcount+ω^(ω^(x-1)\*ax+...+ω^2\*a3+ω\*a2+a1)\*acount+ω^n\*rn+...+ω^3\*r3+ω^2\*r2+ω\*r1+r0)}10 (layer>=1)]

In Fast Growing Hierarchy, a metanum number is nearly `f_ω^ω^…(layer-1 ω^'s)…(ω^(ω^(z-1)*mz+…+ω^2*m3+ω^*m2+m1)*mcount+…+ω^(ω^(y-1)*by+…+ω^2*b3+ω*b2+b1)*bcount+ω^(ω^(x-1)*ax+…+ω^2*a3+ω*a2+a1)*acount+ω^n*rn+…+ω^3*r3+ω^2*r2+ω*r1+r0)[10](layer>=1)` or `f^mcount_(ω^(z-1)*mz+…+ω^2*m3+ω^*m2+m1)[…[f^bcount_(ω^(y-1)*by+…+ω^2*b3+ω^*b2+b1)[f^acount_(ω^(x-1)*ax+…+…ω^2*a3+ω*a2+a1)[rn 10{n}'s … r3 10^^^'s r2 10^^'s r1 10^'s r0]]…](layer=0)`

## Installation

```bash
npm install metanum
```

## Creating Instances

```javascript
// From a plain number
const a = new MetaNum(428571);
const b = MetaNum.fromNumber(-2.71828);

// From a string (supports scientific notation, hyper-operations, letter notation, brackets, etc.)
const c = new MetaNum("1.5e308");
const d = MetaNum.fromString("F5");            // tetration: 10^^5
const e = MetaNum.fromString("E100#2");           // Hyper-E: 10^10^100 (googolplex)
const f = MetaNum.fromString("GF^2 E^3 123");     // letter notation
const g = MetaNum.fromString("Aa100");            // letter notation
const h = MetaNum.fromString("[[10], [1, 3]]");   // bracket notation

// From an array
const i = MetaNum.fromArray([2.71828, 1, 2]);        // [[3.14, 1, 2]]
const j = MetaNum.fromArray([10], 1, 1);          // layer 1

// From an object / JSON
const k = MetaNum.fromJSON('{"sign":1,"array":[[428571]],"layer":0}');
const l = MetaNum.fromObject({ sign: 1, array: [[1, 2]], layer: 0 });

// From BigInt
const m = MetaNum.fromBigInt(10n ** 100n);

// From Hyper-E notation
const n = MetaNum.fromHyperE("EE100");
```

## Constants

```javascript
MetaNum.MAX_SAFE_INTEGER   // 9007199254740991
MetaNum.E                  // log10(MSI)=15.954589770191
MetaNum.POSITIVE_INFINITY  // Infinity
MetaNum.NEGATIVE_INFINITY  // -Infinity
MetaNum.GRAHAMS_NUMBER     // Graham's number (approximation)
MetaNum.TRITRI             // 3↑↑↑3 = 3^^^3
MetaNum.QqQe308            // QqQe308 (for incremental games)
```

## Basic Usage

```javascript
// Arithmetic
const sum = MetaNum.add(15, 27);           // 42 (static)
const diff = new MetaNum(27).sub(15);      // 12 (instance)
const product = new MetaNum(15).mul(27);   // 405
const quotient = new MetaNum(27).div(15);  // 1.8

// Power & roots
new MetaNum(2).pow(10);          // 1024
new MetaNum(100).sqrt();         // 10
new MetaNum(27).cbrt();          // 3
new MetaNum(8).root(3);          // 2
new MetaNum(10).exp();           // e^10

// Logarithms
new MetaNum(100).log10();               // 2
new MetaNum(8).log(2);                  // 3
new MetaNum(Math.E).ln();               // 1

// Comparison
const x = new MetaNum(10), y = new MetaNum(20);
x.lt(y);     // true
x.gt(y);     // false
x.eq(y);     // false
x.lte(y);    // true
x.gte(y);    // false
x.neq(y);    // true
x.min(y);    // 10
x.max(y);    // 20

// Comparison with tolerance
x.eq_tolerance(new MetaNum(10.0001), 1e-3);  // true
x.cmp_tolerance(y, 1e-7);                     // -1

// Sign checks
x.ispos();   // true
x.isneg();   // false
x.isNaN();   // false
x.isFinite(); // true
x.isint();   // true

// Rounding
new MetaNum(3.7).floor();   // 3
new MetaNum(3.2).ceil();    // 4
new MetaNum(3.5).round();   // 4

// Reciprocal & absolute
new MetaNum(4).rec();       // 0.25
new MetaNum(-5).abs();      // 5
new MetaNum(5).neg();       // -5

// Factorial & Gamma
new MetaNum(5).fact();      // 120
new MetaNum(0.5).gamma();   // Γ(0.5) = √π

// Modulo
new MetaNum(10).mod(3);     // 1

// Lambert W function
new MetaNum(1).lambertw();  // Ω ≈ 0.5671
```

## Hyper-Operations (Tetration & Beyond)

```javascript
// Tetration: a^^b
new MetaNum(2).tetr(3);         // 2^^3 = 2^2^2 = 16
new MetaNum(2).tetr(4);         // 2^^4 = 65536
MetaNum.tetr(2, 5);             // 2^^5

// With payload (offset)
new MetaNum(10).tetr(2, new MetaNum(5));  // 10^^2 with payload 5

// Pentation: a^^^b
new MetaNum(2).pent(3);         // 2^^^3

// General arrow notation: a↑^n b
new MetaNum(2).arrow(3)(4);     // 2↑↑↑4 (pentation)
MetaNum.arrow(3, 4, 3);         // 3↑↑↑↑3 = g_1

// Chain notation
new MetaNum(2).chain(4, 3);     // 2→4→3

// Aperiation: a↑^a a
new MetaNum(2).aper(3);         // 2↑↑↑2 = 4
```

## Super-logarithm & Super-root

```javascript
// Super-logarithm (inverse of tetration)
new MetaNum(16).slog(2);        // slog_2(16) = 3
new MetaNum(65536).slog();      // slog_10(65536) ≈ 2

// Super-square-root
new MetaNum(27).ssrt();         // ssqrt(27)

// Linear super-root
new MetaNum(100).linear_sroot(3); // ³ss̅r̅t̅(100)

// Layer arithmetic
new MetaNum(10).layeradd(3);    // add 3 layers of exponentiation
new MetaNum(10).layeradd10(3);  // 10^^3 (explicit base 10)
```

## Hyper-Operations up to ε₀

These functions represent iterated diagonalizations at increasing ordinal levels from ω to ε₀:

```javascript
const x = new MetaNum(10);

// Level ω: diagonalize ω*y (→ a↑^a a)
x.aperiote(3);            // aper(3) = h10

// Level ω+1: iterate aperiote
x.expande(3);             // expa(3) = h11

// Level ω+2: iterate expande
x.multiexpande(3);        // muea(3) = h12

// Level ω+3: iterate multiexpande
x.powerexpande(3);        // poea(3) = h13

// Level ω*2: diagonalize ω+y
x.aperioexpande(3);       // apea(3) = h20

// Level ω*2+1: iterate aperioexpande
x.explode(3);             // expl(3) = h21

// Level ω*2+2: iterate explode
x.multiexplode(3);        // muel(3) = h22

// Level ω*3: diagonalize ω*2+y
x.aperioexplode(3);       // apel(3) = h30

// Level ω*3+1: iterate aperioexplode
x.detonate(3);            // deto(3) = h31

// Level ω*4: diagonalize ω*3+y
x.aperiodetonate(3);      // apdt(3) = h40

// Level ω^2: diagonalize ω*y
x.aperionate(3);          // apeo(3) = h100

// Level ω^2+1: iterate aperionate
x.megote(3);              // mego(3) = h101

// Level ω^2+2: iterate megote
x.multimegote(3);         // mume(3) = h102

// Level ω^2+ω: diagonalize ω^2+y
x.aperimegote(3);         // apmg(3) = h110

// Level ω^2+ω+1: iterate aperimegote
x.megoexpande(3);         // mgea(3) = h111

// Level ω^2+ω*2: diagonalize ω^2+ω+y
x.aperimegoexpande(3);    // apme(3) = h120

// Level ω^2*2: diagonalize ω^2+ω*y
x.megoaperionate(3);    // mgao(3) = h200

// Level ω^2*2+1: iterate megoaperionate
x.gigote(3);              // gigo(3) = h201

// Level ω^2*2+ω: diagonalize ω^2*2+y
x.aperigigote(3);         // apgg(3) = h210

// Level ω^2*3: diagonalize ω^2*2+ω*y
x.gigoaperionate(3);      // ggap(3) = h300

// Level ω^3: diagonalize ω^2*y
x.aperiatote(3);        // apat(3) = h1000

// Level ω^3+1: iterate aperiatote
x.powiainate(3);          // pwan(3) = h1001

// Level ω^3+ω: diagonalize ω^3+y
x.expandainate(3);        // epan(3) = h1010

// Level ω^3+ω^2: diagonalize ω^3+ω*y
x.megodainate(3);         // mgan(3) = h1100

// Level ω^3*2: diagonalize ω^3+ω^2*y
x.powiairate(3);          // pwar(3) = h2000

// Level ω^4: diagonalize ω^3*y
x.aperioguate(3);         // apgu(3) = h10000

// Level ω^ω: diagonalize ω^x (layer 1 transition)
x.iterate(3);                // iter(3) = hww

// Level ω^ω+1: iterate ω^ω level operations
x.itermult(3);            // itmu(3) = hw01

// Level ω^ω*2: (ω^ω)*2 = ω^ω + ω^base
x.cuboiter(3);            // cube(3) = hwx2

// Level ω^(ω+1): ω^(ω+1) = ω^ω*ω → ω^(ω*y)
x.expoiter(3);            // expo(3) = hwa1

// Level ω^(ω*2): ω^(ω*2) = ω^(ω+base)
x.trioterate(3);          // tria(3) = hwm2

// Level ω^(ω^2): diagonalize ω^(ω*y) (layer 2)
x.trixxate(3);            // trix(3) = hwp2

// Level ω^(ω^ω): diagonalize ω^(ω^y) (layer 3)
x.aperixxate(3);          // apix(3) = hwpw

// Level ε₀ = ω↑↑ω: diagonalize ω↑↑y (layer 4)
x.epsilonate(3);          // epsl(3) = hepsl
```

## Inverse Operations

Each expansion operation has a corresponding inverse for decrementing ordinal structure:

```javascript
x.i_aper(z)     // i10 = inverse of aperiote
x.i_expa(z)     // i11 = inverse of expande
x.i_muea(z)     // i12 = inverse of multiexpande
x.i_poea(z)     // i13 = inverse of powerexpande
x.i_apea(z)     // i20 = inverse of aperioexpande
x.i_expl(z)     // i21 = inverse of explode
x.i_muel(z)     // i22 = inverse of multiexplode
x.i_apel(z)     // i30 = inverse of aperioexplode
x.i_deto(z)     // i31 = inverse of detonate
x.i_apdt(z)     // i40 = inverse of aperiodetonate
x.i_apeo(z)     // i100 = inverse of aperionate
x.i_mego(z)     // i101 = inverse of megote
x.i_mume(z)     // i102 = inverse of multimegote
x.i_apmg(z)     // i110 = inverse of aperimegote
x.i_mgea(z)     // i111 = inverse of megoexpande
x.i_apme(z)     // i120 = inverse of aperimegoexpande
x.i_mgao(z)     // i200 = inverse of megoaperionation
x.i_gigo(z)     // i201 = inverse of gigote
x.i_apgg(z)     // i210 = inverse of aperigigote
x.i_ggap(z)     // i300 = inverse of gigoaperionate
x.i_apat(z)     // i1000 = inverse of aperiatotion
x.i_pwan(z)     // i1001 = inverse of powiainate
x.i_epan(z)     // i1010 = inverse of expandainate
x.i_mgan(z)     // i1100 = inverse of megodainate
x.i_pwar(z)     // i2000 = inverse of powiairate
x.i_apgu(z)     // i10000 = inverse of aperioguate
x.i_iter(z)      // iww = inverse of iter
x.i_itmu(z)     // iw01 = inverse of itermult
x.i_cube(z)     // iwx2 = inverse of cuboiter
x.i_expo(z)     // iwa1 = inverse of expoiter
x.i_tria(z)     // iwm2 = inverse of trioterate
x.i_trix(z)     // iwp2 = inverse of trixxate
x.i_apix(z)     // iwpw = inverse of aperixxate
x.i_epsl(z)     // iepsl = inverse of epsilonate
```

## BEAF Operations

Bowers' Exploding Array Function (BEAF) is supported via ordinal arithmetic for 3+ arguments:

```javascript
// BEAF(a,b,c,d,e,f,...) = a{...+ω^3*(f-1)+ω^2*(e-1)+ω*(d-1)+(c-1)}b

// 3-entry: {a,b,c} = a↑^c b (standard up-arrow notation)
MetaNum.BEAF(3, 3, 2);       // 3↑↑3 = 7625597484987
MetaNum.BEAF(3, 3, 3);       // 3↑↑↑3 = tritri

// 4-entry: {a,b,c,d} = a(ω*d+c level operation)b
MetaNum.BEAF(2, 2, 1, 2);    // 2{ω}2
MetaNum.BEAF(3, 3, 3, 3);    // 3{ω*2+2}3

// 5+ entry: ordinal arithmetic
MetaNum.BEAF(10, 2, 1, 1, 2); // 10{ω^2}2
MetaNum.BEAF(3, 3, 3, 3, 2);  // 3{ω^2+ω+1}3
MetaNum.BEAF(4, 5, 6, 7, 8, 9);  // 4{ω^3*8+ω^2*7+ω*6+5}5

// nested BEAF: {a,{b,c,d,e},f,g,h}
// An argument exceeding MSI supremum-collapses (use fundamental sequences rules):
// ω*i+HUGE ≈ ω*(i+1), ω^i*HUGE ≈ ω^(i+1), etc.
// (lower coefficients are swallowed), and the result anchors at that argument's value.
MetaNum.BEAF(4, MetaNum.BEAF(4, 2, 3, 5), 3, 5); // 4{ω*4+2}4{ω*4+2}2

// Parse BEAF string notation
MetaNum.fromBeaf("{3,3,3}");         // 3↑↑↑3
MetaNum.fromBeaf("{3,3,3,3}");       // 3{ω*2+2}3
MetaNum.fromBeaf("{10,2,1,1,2}");    // 10{ω^2}2

// Convert to BEAF string
new MetaNum(7625597484987).toBeaf();  // "{7625597484987}"
MetaNum.BEAF(3,3,3).toBeaf();        // "{3638334640023.7783}"
```

## Layer & Serialization

```javascript
// Layer manipulation
new MetaNum(10).layerUp();     // promote to layer+1
new MetaNum(10).layerDown();   // demote to layer-1

// Output formats
new MetaNum(123).toString();               // "123"
new MetaNum(1e308).toString();             // "E308"
new MetaNum(100).toNumber();               // 100
new MetaNum(100).valueOf();                // "100"
new MetaNum(100).toFixed(2);               // "100.00"
new MetaNum(100).toExponential(2);         // "1.00e+2"
new MetaNum(100).toPrecision(3);           // "100"
new MetaNum(100).toHyperE();               // "100"
new MetaNum(100).toStringWithDecimalPlaces(4); // "100.0000"
new MetaNum(100).toJSON();                 // {sign:1, array:[[100]], layer:0}
```

## Utility Functions

```javascript
// Binomial coefficient
new MetaNum(10).choose(3);     // C(10,3) = 120

// Hyper-operation
MetaNum.hyper(4, 2, 3);        // 2^^3 = 16  (n=4 means tetration)

// Geometric series
MetaNum.sumGeometricSeries(5, 1, 2);       // 1+2+4+8+16 = 31
MetaNum.affordGeometricSeries(100, 1, 2, 0);

// Arithmetic series
MetaNum.sumArithmeticSeries(5, 1, 2);      // 1+3+5+7+9 = 25
MetaNum.affordArithmeticSeries(100, 1, 2, 0);

// Configuration
MetaNum.config({ maxRows: 50, maxCols: 50, maxArrow: 1e6, debug: 1 });
```

# Mathematical Background

The library implements the extended arrow operation which is a hierarchy of functions indexed by ordinal numbers. The representation uses Cantor normal form for ordinals, where:

- ω represents the first infinite ordinal
- ω^ω represents ω raised to the power of ω
- ε₀ is the limit of ω, ω^ω, ω^ω^ω, ...

For more information, see: <https://en.wikipedia.org/wiki/Ordinal_arithmetic>

## Definition

Let n and b be natural numbers, and α be a countable ordinal

- rule 1: If α=0, n{α}b=n×b
- rule 2: If α is a successor ordinal, then n{α}b =n if b=1, =n{α-1}n{α}(b-1) if b>1
- rule 3: If α is a limit ordinal, then n{α}b=n{α\[b]}n
- rule 4: Operations are calculated from right to left

where α\[b] denotes the b-th element of the fundamental sequence assign to the limit ordinal of α, see also fundamental sequences for limit ordinals written in Cantor normal form:

- ω\[n]=n
- ω^(α+1)\[n]=ω^α×n where ω^α×n=ω^α+ω^α+...+ω^α with n ω^α's
- ω^α\[n]=ω^(α\[n]) if and only if α is a limit ordinal
- (ω^(α_1)+ω^(α_2)+...+ω^(α_k))\[n]=ω^(α_1)+ω^(α_2)+...+ω^(α_k)\[n], where α_1>=α_2>=...>=α_k
- ε₀\[0]=1 and ε₀\[n+1]=ω^ε₀\[n]

## Examples

642663{0}178187=642663×178187=114514191981

10{1}5=10{0}10{1}4=10{0}10{0}10{1}3=10{0}10{0}10{0}10{1}2=10{0}10{0}10{0}10{0}10{1}1=10×10×10×10×10=10^5=100000

10{2}4=10{1}10{2}3=10{1}10{1}10{2}2=10{1}10{1}10{1}10{2}1=10{1}10{1}10{1}10=10^(10^(10000000000))

10{3}3=10{2}10{2}10=10{2} 9(10{1})'s 10=10↑↑(10^10^10^10^10^10^10^10^10000000000)

3{ω}5=3{5}5=3{4}3{4}3{4}3{4}3=3{4}3{4}3{4}3{3}3{3}3=3{4}3{4}3{4}3{3}3{2}3{2}3=3{4}3{4}3{4}3{3}3{2}3{1}3{1}3=3↑↑↑↑3↑↑↑↑3↑↑↑↑3↑↑↑3↑↑7625597484987

5{ω+1}4=5{ω}5{ω+1}3=5{ω}5{ω}5{ω+1}2=5{ω}5{ω}5{ω}5{ω+1}1=5{ω}5{ω}5{ω}5=5{ω}5{ω}5{5}5=5{ω}5{5{5}5}5=5{5{5{5}5}5}5

4{ω+2}3=4{ω+1}4{ω+1}4=4{ω+1}4{ω}4{ω}4{ω}4=4{ω+1}4{4{4{4}4}4}4=4{ω}4{ω}... with 4{4{4{4}4}4}4 4's

10{ω×2}10=10{ω+10}10=9(10{ω+9})'s 10=8(10{ω+9})'s 9(10{ω+8})'s 10=8(10{ω+9})'s 8(10{ω+8})'s ... 8(10{ω+1})'s 8(10{ω})'s 8(10{9})'s ... 8(10{1})'s 10000000000

10{ω^2}4=10{ω×4}4=10{ω×3+4}4=10{ω×3+3}10{ω×3+3}10{ω×3+3}10=10{ω×3+3}10{ω×3+3} 8(10{ω×3+2})'s 8(10{ω×3+1})'s 8(10{ω×3})'s 8(10{ω×2+9})'s ... 8(10{ω×2})'s ... 8(10{ω})'s ... 8(10{1})'s 10000000000

10{ω^ω}4=10{ω^4}4=10{ω^3×4}4=10{ω^3×3+ω^3}4=10{ω^3×3+ω^2×4}4=...=10{ω^3×3+ω^2×3+ω×3+4}4=3(10{ω^3×3+ω^2×3+ω×3+3})'s 10=2(10{ω^3×3+ω^2×3+ω×3+3})'s 8(10{ω^3×3+ω^2×3+ω×3+2})'s 8(10{ω^3×3+ω^2×3+ω×3+1})'s ... 8(10{1})'s 10000000000

10{ω^(ω^2)}4=10{ω^(ω×ω)}4=10{ω^(ω×4)}4=10{ω^(ω×3+4)}4=10{ω^(ω×3+3)×ω}4=10{ω^(ω×3+3)×4}4=10{ω^(ω×3+3)×3+ω^(ω×3+2)×3+ω^(ω×3+1)×3+...+ω^2×3+ω×3+4}4

10{ε₀}4=10{ω^(ω^(ω^ω))}4=10{ω^(ω^(ω^4))}4=10{ω^(ω^(ω^3×3+ω^2×3+ω×3+4))}4=10{ω^(ω^(ω^3×3+ω^2×3+ω×3+3)×3+ω^(ω^3×3+ω^2×3+ω×3+2)×3+...++ω^2×3+ω×3+4)}4

# dlsdl's Letter Notation

Modified from PsiCubed's letter notation(<https://googology.fandom.com/wiki/User_blog:PsiCubed2/My_Letter_Notation>)

The idea here is to extend the PsiCubed's letter notation to much larger numbers reach level ε0 of FGH or HH. The properties we wish to preserve here are:

(1) Any number has a unique standard representation in the system.

(2) Given the standard representation of two numbers, one can immediately tell which one is larger without any calculations.

## The format of the proposed notation

Our final notation will look like this:

\[symbol]\[letter]\[number]

where \[symbol] can be one of the following: empty,!,@,#,$,%,&,……

where \[letter] can be one of the following: E,F,G,H,……,Aa,Ab,Ac,……,Ba,Bb,……,Aaa,……

and \[number] can be any positive real number (nonintegers included).

## Single letter notation

### The First Levels: A Continuous version of Knuth Arrows

We'll define:

Eα = 10^α = 10{1}α

Fα = EEEE...EEE(10^frac(α)) with int(α) E's = 10{2}α

Gα = FFFF...FFF(10^frac(α)) with int(α) F's = 10{3}α

Hα = GGGG...GGG(10^frac(α)) with int(α) G's = 10{4}α

then we'll have I,J,K,... to Z ,each with the same definition as Hα.

Note that according to these definitions we have:

(1) For α≤1: Eα = Fα = Gα = Hα = ... = Zα = 10^α

(2) For any integer β: Eβ = 10{1}β, Fβ = 10{2}β, Gβ = 10{3}β, Hβ = 10{4}β

the γ-th letter β represents 10(γ-4 arrows)β = 10{γ-4}β

So the above definitions are indeed an extention of Knuth arrows to nonintegers.

### Letter-Canonical Forms

If α is a number greater than 1 and Γ is a one of the letters E,F,G,H,...,ζ then there is a unique number β such that:

α = Γβ.

And we call "Γβ" the Γ-Canonical Form of the number α.

For example, the E-Canonical form of 1000 is E3:

E3 = 10^3 = 1000.

And the F-Canonical form of 1000 is about F1.47712:

F1.47712 = E(10^0.47712) ≈ E3 = 10^3 = 1000.

### Binary-Letter-Canonical Forms

To recreate ordinary scientific notation, we'll define a binary version of the letter functions like this:

Let Γ be one of the letters E,F,G,H,...,ζ Let β be a nonnegative integer and α be a real number between 1 and 10. Then:

αΓβ = Γ(β+log(α))

For Example:

7E3 = E(3+log(7)) = 10^(3+log(7)) = 7\*10^3 = 7000

7F3 = F(3+log(7)) = EEE(10^log(7)) = EEE7 = 10^10^10^7

So αEβ is nothing more than ordinary scientific notation.

And αFβ is a power tower of β 10's topped by an α.

And again, given any specific letter (E,F,G,H,...,ζ), ANY number greater than 1 has a unique representation as αΓβ (with 1≤α<β). So we can call this the Binary-Γ-Canonical Form of α.

## Multi letter notation

### Defining Aa - The First Diagonalization

In the previous section we've defined an infinite sequence of functions, so we can diagonalize over them:

let 1|α = Eα, 2|α = Fα, 3|α = Gα, ..., 22|α = Zα.

we had: Aaα = α|10 = 10{α}10.

So Aa is comparable to f\_ω\_(n) in the FGH.

But there are a couple of problems here:

(1) α|10 isn't yet defined for noninteger α.

(2) Aa1 would be 1|10 = 10^10 rather than 10 = E1 = F1 = G1 =...= Z1. This would have caused trouble later on, when we define the higher levels.To solve these two problems, we'll give a definition for α|10 and amend the definition of Aa:

(i) α|10 = (int(α)+1)|2\*5^frac(α)

(ii) For α<2: Aaα = Gα

(iii) For α≥2: Aaα = α|10

The seemingly complex expression in rule (i) simply gives us a smooth geometric curve between 2 and 10. This ensures that Aa would be continuous, given the identity 10↑(β)10 = 10↑(β+1)2.

### Ab,Ac,Ad,...,Az and their Universal Canonical Forms

The definitions of Ab,Ac,Ad,...,Az are simple enough:

Abα = AaAa...AaAa(10^frac(α)) with int(α) Aa's

Acα = AbAb...AbAb(10^frac(α)) with int(α) Ab's

then we have Ad,Ae,...,Az, each with the same definition as Ab and Ac.

And that's it. So A(the β+1-th letter) is comparable to f\_ω+β\_(n) in the FGH.

Again we have Ab0=Ac0=Ad0=...=Az0=1, Ab1=Ac1=Ad1=...=Az1=10, and Ab,Ac,Ad,...,Az are all continuous. So any number greater than 1 has a unique Ab to Az Canonical Form.

Moreover, since Aa10=Ab2 and Ab10=Ac2, we can extend our definition of the "Universal Canonical Form" up to Az10:

(1) if α<100 (that's E2) then we write down the E-Canonical Form of α.

(2) Otherwise, we write α as Γβ for some letter combinations Γ and 2≤β<10. If there is more than one possible choice, we choose the letter combination which comes first in order.

### Defining from Ba to Bz

We already know how to do recursion (F,G,H,I,...,ζ) and simple diagonalization (Aa) in our continuous system, so we can easily extend our system up to ω×2-level in the FGH. In order to track our progress, we'll use the format (1,β)|α and define:

(1,0)|α = Aaα

(1,β+1)|α = (1,β)|(1,β)|...|(1,β)|10^frac(α) with int(α) (1,β)'s

And define Baα in a way similar to Aaα:

(i) (1,α)|10 = (1,int(α)+1)|2\*5^frac(α)

(ii) For α<2: Baα = (1,3)|α

(iii) For α≥2: Baα = (1,α)|10

This gives rise to writing numbers in Ba-Canonical form and extend the Universal Canonical Form up to Ba10 ,which is about f\_ω×2\_(10) in the FGH.

Then we can define Bb,Bc, Bd,...,Bz with recursions in a similar way. Bbα = BaBa...BaBa(10^frac(α)) with int(α) Ba's, and Bcα = BbBb...BbBb(10^frac(α)) with int(α) Bb's, etc. B(the β+1-th letter) is comparable to f\_ω\*2+β\_(n) in the FGH.

### A Supporting Array Notation and Aaa

We can, of-course, repeat what we did in the previous section as many times as we wish and get the following ω^2-level notation (β,γ ≥ 0 are integers, and α≥0 is real):

(i) (0,1)|α = 10^α

(ii) (β,γ+1)|α = (β,γ)|(β,γ)|...|(β,γ)|10^frac(α) with int(α) (β,γ)'s

(iii) (β,α)|10 = (β,int(α)+1)|2\*5^frac(α)

(iv) For α<2: (β+1,0)|α = (β,3)|α

(v) For α≥2: (β+1,0)|α = (β,α)|10

Note that (β,γ) is comparable to f\_ω\*β+γ\_(α) in the FGH. Also, if we read (0,γ)|α as γ|α, this notation is a direct extension of everything we did before this section. Also, in this new notation we can write Baα = (2,0)|α, Bbα = (2,1)|α,... Bzα = (2,25)|α.

So QqQe308=10{ω17+16}10{ω17+4}308 is about f\_ω17+16\_(f\_ω17+4\_(308)).

And with this new supporting notation we can now to define Aaaα:

(i) For α<2: Aaaα = (2,1)|α

(ii) For α≥2: Aaaα = (int(α),10\*frac(α))|10

With rule (ii) containing a very neat trick that allows us to do the double-diagonalization with a single number: Aaa1.5 = (2,1)|1.5, Aaa2.5 = (2,5)|10

At any rate, it isn't too difficult to see that Aaa behaves "nicely" and allows us to speak of Aaa-Canonical Forms of any number. And since Aaa2=Ba10, Aaa3=Ca10,..., Aaa26=Za10, this also enables us to write the Unversal Canonical Form of any number about f\_ω^2\_(10) in the FGH.

## Symbol and letter notation

### Arrays with more than two variable, and !Aa

Array notations can be easily extended to a multivariable array notation, like so:

(i) For α≤1: (anything)|α = 10^α

(ii) (β,γ,δ,...,ν+1)|α = (β,γ,δ,...,ν)|(β,γ,δ,...,ν)|...|(β,γ,δ,...,ν)|10^frac(α) with int(α) (β,γ,δ,...,ν)'s

(iii) (β,γ,δ,...,ν,α)|10 = (β,γ,δ,...,ν,int(α+1))|2\*5^frac(α)

(iv) For 1<α<2: (β,γ,δ,...,μ+1,<κ zeros>)|α = (β,γ,δ,...,μ,2,<κ-1 zeros>)|10^(α-1)

(v) For α≥2: (β,γ,δ,...,μ+1,<κ zeros>)|α = (β,γ,δ,...,μ,α,<κ-1 zeros>)|10

(vi) (β,γ,δ,...,α,<κ zeros>)|10 = (β,γ,δ,...,int(α),frac(α)\*10,<κ-1 zeros>)|10

(vii) (0,...,0,β,γ,δ,...,μ)|α = (β,γ,δ,...,μ)|α

The first 5 rules are a simple and direct extention of the 2-variable arrays notation, and Rule vii simply states that leading zeros can be ommitted.

Rule vi is an interesting one, though. It basically tells us that if we have an array which ends with (...,α,0,0,...,0) then the digits of the fractional part of α are to be distributed among the zeros. For example:

- (114,514,1.9198,0,0,0,0)|10 = (114,514,1,9,1,9,8)|10.

Now, all that is left to do is to define !Aa, which is about f\_ω^ω\_(10) in the FGH.

For α<2: !Aaα = (1,0,1)|α

For α≥2: !Aaα = (10^frac(α),0,...,0)|10 with int(α) zeros.

Then we have !Aa2 = Aaa10, !Aa3 = Aaaa10,... Just like the previous letters, any number can be written as !Aaα. Here, it is actually the binary form of α!Aaβ = !Aa(β+logα) which has the most intuitive meaning for β≥2:

In terms of the array notation, β+1 tells us how many numbers are in the array and the digits of α tell us the what those numbers are. For example: 1.2345!Aa4 = (1,2,3,4,5)|10

And in terms of FGH ordinals, β gives us the maximum power of ω and the digits of α give us the coefficents of the various powers of ω: 1.2345!Aa4 \~ f\_ω^4+ω^3\*2+ω^2\*3+ω\*4+5\_(10). Actually, these neat relations are also true for β=1 and α≥2, so 2.5!Aa1 = (2,5)|10.

### Higher dimensional arrays and @Aa

With the definition of the array notation and the symbol !, one can easily define palanar array notation function. In this notation, the comma is short for \[0], and the dimensional seperator is \[1], ζ's represent 0's and dimensional seperators (or can be empty) and κ zeroes. κ+1 zerores means a group of zeroes and dimensional seperators starting with at least 1 zero. κ zeroes is that but it doesn't need to start with a zero.

(i) Other rules are the same from linear array notation

(ii) (β,γ,δ,...,μ+1\[1]0,ζ)|α = (β,γ,δ,...,μ\[1]1,0,0,ζ)|10^(x-1) for 1\<x<2

(iii) (β,γ,δ,...,μ+1\[1]0,ζ)|α = (β,γ,δ,...,μ\[1]10^frac(x),0,...,0,ζ)|10 with int(x) 0's for x=>2

(iv) (β,γ,δ,...,α\[1]0,ζ)|10, κ = frac(α)\*10

It equals to (β,γ,δ,...,int(α)\[1]10^frac(κ),0,...,0,ζ)|10 with int(κ) 0's where κ >=1 or there is only 1 \[1] and there is a 1 before it, or (β,γ,δ,...,int(α)\[1]frac(κ),ζ)|10 otherwise

(v) (...\[1]0,...,0,β,γ...)|α = (...\[1]β,γ...)|α

Rule 2 and 3 are the case where the last nonzero entry is at the end of a plane and is an integer. Rule 4 is when the last nonzero entry is at the end of a plane, you use the fractional part of the last entry, and put it in the next row.

By adding ! before a letter notation, it changes from HH to FGH. Aa represents H\_ω, so !Aa represents f\_ω which equals to H\_ω^ω. Then we can define !Ab (f\_ω^(ω+1)_(10) in FGH), !Ac, !Ad,..., !Az with the same meaning as !Aa, and !Ba(f\_ω^(ω2)_(10) in FGH), !Bb, !Bc, ..., !Bz, !Aaa, etc. Comparing these with the previous letters, we can see that notations with ! symbol have a more ω^ in FGH than those without ! symbol.

Fractional number of rows, columns, etc.. are defined in the same way as in the linear array notation, \[0] is the comma. ζ is an array of 0's and dimensional seperators.

For level comparison, first compare the levels of the highest-leveled seperators. If they are equal, then compare the number of highest-leveled subseperators. If there are the same number, compare everything in the seperator after the last occurance of the highest-leveled seperator in a seperator. If they are equal, do that with the string before the last ocurrence of the highest-leveled seperator. If they are the same, the seperators have the same level.

Now, all that is left to do is to define @Aa, which is about f\_ω^ω^ω\_(10) in the FGH.

For α<2: @Aaα = (1\[1,0,0]0)|α

For α≥2: @Aaα = (1\[10^frac(α),0,...,0]0)|10 with int(α) zeros.

### Nested arrays and more symbols

The Definiton of more symbols is similar to the definition of @Aa.

\#Aa \~ f\_ω^ω^ω^ω\_(10)

\$Aa \~ f\_ω^ω^ω^ω^ω\_(10)

Then we can define (the β-th symbol or symbol combination)Aa = f\_ω^ω^...^ω(β+1 ω's)\_(10)

### Definition of the final letter: ε

ε represents exponent tower layers of ω, and it is comparable to f\_ε0\_(10) in the FGH.

αεβ \~ f\_ω^ω^...^ω(β ω's)\_(α)

#### Using dlsdl's letter notation, the biggest number we can define in Metanum is about ε9.007E15

# Changelog

- 2026-8-18 v1.4 Support hyper operation >MSI and fix format-metanum bugs
- 2026-7-31 v1.3 Add format-metanum.js, fix basic operations, hyper operations and BEAF bugs
- 2026-7-9 v1.2 Add more hyper operations up to ε₀, add BEAF operation and fix bugs
- 2026-6-3 v1.1 Add support for very small numbers ,add more hyper operations and fix bugs
- 2026-5-23 v1.0 Rewritten and add even more hyper operations
- 2026-2-24 v0.4 Add hyper operations and extend fromString
- 2026-2-11 v0.3 Reconstruct code and correct calculating functions
- 2026-2-6 v0.2 New Metanum data structure with Cantor normal form
- 2026-2-1 v0.1 First commit

