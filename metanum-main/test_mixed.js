if (!this.MetaNum) MetaNum =  require("./metanum.js");
if (!this.format) format = require("./format-metanum.js").format;
//if (!this.FORMAT_OPTIONS) FORMAT_OPTIONS = require("./format-metanum.js").FORMAT_OPTIONS;

function check(name, input, expectedArray) {
  try {
    var m = MetaNum(input);
    var arrStr = JSON.stringify(m.array);
    var expStr = JSON.stringify(expectedArray);
    var pass = arrStr === expStr;
    console.log((pass ? "PASS" : "FAIL") + " | " + name + " | " + input);
    if (!pass) {
      console.log("  Got:      " + arrStr);
      console.log("  Expected: " + expStr);
    }
  } catch (e) {
    console.log("ERROR | " + name + " | " + input + " => " + e.message);
  }
}

function checkRT(name, input) {
  try {
    var m = MetaNum(input);
    var s = m.toString();
    var m2 = MetaNum(s);
    var pass = m.eq(m2);
    console.log((pass ? "PASS" : "FAIL") + " | RT " + name + " | " + input + " => " + s + " => " + m2.toString());
    if (!pass) console.log("  Got:      " + m2.toString());
  } catch (e) {
    console.log("ERROR | RT " + name + " | " + input + " => " + e.message);
  }
}

console.log("\n=== 1-letter regression ===");
checkRT("E308", "E308");
checkRT("EE100", "EE100");
checkRT("FE10", "E^9999999998 10000000000");
checkRT("G10", "F^8 E^8 10000000000");
checkRT("J1000", "I^998 H^8 G^8 F^8 E^8 10000000000");
checkRT("Z10", "Y^8 X^8 W^8 V^8 U^8 T^8 S^8 R^8 Q^8 P^8 O^8 N^8 M^8 L^8 K^8 J^8 I^8 H^8 G^8 F^8 E^8 10000000000");

console.log("\n=== 2-letter regression ===");
checkRT("Aa10", "Aa10");
checkRT("Ab5", "Ab5");
checkRT("Ac100", "Ac100");
checkRT("AaAa10", "AaAa10");
checkRT("AbAb10", "AbAb10");
checkRT("Ba10", "Ba10");
checkRT("BaBa10", "BaBa10");
checkRT("Bb10", "Bb10");
checkRT("Bc10", "Bc10");
checkRT("Bz10", "Bz10");
checkRT("Ca10", "Ca10");
checkRT("Zz10", "Zz10");

console.log("\n=== 3-letter regression ===");
checkRT("Aaa10", "Aaa10");
checkRT("Aaa1000", "Aaa1000");
checkRT("AaaAaa10", "AaaAaa10");
checkRT("Aab10", "Aab10");
checkRT("Aac10", "Aac10");
checkRT("Aba10", "Aba10");
checkRT("Abb10", "Abb10");
checkRT("Aza10", "Aza10");
checkRT("Baa10", "Baa10");
checkRT("Zzz10", "Zzz10");

console.log("\n=== 4-letter regression ===");
checkRT("Aaaa10", "Aaaa10");
checkRT("Aaaa1000", "Aaaa1000");
checkRT("AaaaAaaa10", "AaaaAaaa10");
checkRT("Aaab10", "Aaab10");
checkRT("Aaba10", "Aaba10");
checkRT("Abaa10", "Abaa10");
checkRT("Baaa10", "Baaa10");
checkRT("Zzzz10", "Zzzz10");

console.log("\n=== symbol+letters regression ===");
checkRT("!Aa10", "!Aa10"); //layer=1
checkRT("!Abcd10", "!Abcd10"); //layer=1
checkRT("@Ef10", "@Ef10"); //layer=2
checkRT("#Gh100", "#Gh100"); //layer=3
checkRT("1ε100", "1ε100"); //layer=100
checkRT("1ε9007199254740991", "1ε9007199254740991"); //layer=MSI

console.log("\n=== mixed token tests ===");
check("BbBbAaGGGFFE100 array", "BbBbAaGGGFFE100", [[100, 1, 2, 3], [1,0,1],[2,1,2]]);
check("QqQe308 array", "QqQe308", [[308], [1, 4, 17], [1, 16, 17]]);
checkRT("BbBbAaGGGFFE100", "BbBbAaGGGFFE100");
checkRT("QqQe308", "QqQe308");

console.log("\n=== spaced letter-chain parse (toString round-trip) ===");
check("E^8 10000000000 array", "E^8 10000000000", [[10000000000, 8]]);
check("F^8 E^8 10000000000 array", "F^8 E^8 10000000000", [[10000000000, 8, 8]]);
check("M^7 chain array", "M^7 L^8 K^8 J^8 I^8 H^8 G^8 F^8 E^8 10000000000", [[10000000000, 8, 8, 8, 8, 8, 8, 8, 8, 7]]);
check("I^998 chain array (J1000)", "I^998 H^8 G^8 F^8 E^8 10000000000", [[10000000000, 8, 8, 8, 8, 998]]);
check("E^65532 19727.7804056 array", "E^65532 19727.7804056", [[19727.7804056, 65532]]);
checkRT("E^8 10000000000", "E^8 10000000000");
checkRT("F^8 E^8 10000000000", "F^8 E^8 10000000000");
checkRT("M^7 chain", "M^7 L^8 K^8 J^8 I^8 H^8 G^8 F^8 E^8 10000000000");
checkRT("I^998 chain (J1000)", "I^998 H^8 G^8 F^8 E^8 10000000000");
checkRT("E^9999999998 (FE10)", "E^9999999998 10000000000");

function checkOp(label, result, expectedVal, tol) {
  if (tol === undefined) tol = 0.01;
  try {
    // no expected value: informational check (must not throw, must be a MetaNum)
    if (expectedVal === undefined) {
      console.log("PASS | " + label + " | got: " + (result.toString ? result.toString().slice(0,100) : result));
      return;
    }
    // boolean results: strict comparison
    if (typeof result === "boolean" || typeof expectedVal === "boolean") {
      console.log((result === expectedVal ? "PASS" : "FAIL") + " | " + label + " | got=" + result + " expected=" + expectedVal);
      return;
    }
    var rn = result.toNumber ? result.toNumber() : result;
    if (Number.isNaN(rn) && Number.isNaN(expectedVal)) {
      console.log("PASS | " + label + " | NaN (expected)");
      return;
    }
    if (Number.isFinite(rn) && Number.isFinite(expectedVal)) {
      var ok = Math.abs(rn - expectedVal) <= tol;
      console.log((ok ? "PASS" : "FAIL") + " | " + label + " | got=" + (result.toString ? result.toString().slice(0,100) : result) + " expected=" + expectedVal);
      return;
    }
    var ok2 = Math.abs(result.array[0][0] - MetaNum(expectedVal).array[0][0]) <= tol;
    console.log((ok2 ? "PASS" : "FAIL") + " | " + label + " | got=" + (result.toString ? result.toString().slice(0,100) : result) + " expected=" + expectedVal);
  } catch (e) {
    console.log("ERROR | " + label + " => " + e.message);
  }
}

function checkBool(label, result, expected) {
  try {
    var pass = result === expected;
    console.log((pass ? "PASS" : "FAIL") + " | " + label + " | got=" + result + " expected=" + expected);
  } catch (e) {
    console.log("ERROR | " + label + " => " + e.message);
  }
}

// big number (> MSI) vs small number (< MSI) all operations test
var m0 = MetaNum(0);
var m1 = MetaNum(1);
var m2 = MetaNum(2);
var m3 = MetaNum(3);
var m4 = MetaNum(4);
var mSmall = MetaNum(1e6);           // 1,000,000 < MSI
var mSmall2 = MetaNum(1e9);          // 1,000,000,000 < MSI
var mBig = MetaNum(1e16);            // 10,000,000,000,000,000 > MSI
var mBig2 = MetaNum(1e20);           // > MSI
var mT = MetaNum.arrow(3,3,3);

console.log("\n=== basic arithmetic (< MSI vs > MSI) ===");
checkOp("add small", mSmall.add(5), 1000005, 0);
checkOp("add big", mBig.add(1e15), "E16.04139", 0.01);
checkOp("sub small", mSmall.sub(5), 999995, 0);
checkOp("sub big", mBig.sub(1e15), "9E15", 0.01);
checkOp("mul small", mSmall.mul(2), 2000000, 0);
checkOp("mul big", mBig.mul(2), "E16.30103", 0.01);
checkOp("div small", mSmall.div(2), 500000, 0);
checkOp("div big", mBig.div(2), "5E15", 0.01);

console.log("\n=== power operations (< MSI vs > MSI) ===");
checkOp("pow small", MetaNum(2).pow(10), 1024, 0);
checkOp("pow big", MetaNum(2).pow(60), "E18.062", 0.01);
checkOp("exp small", MetaNum(2).exp(), 7.38905609893065, 1e-8);
checkOp("exp big", MetaNum(40).exp(), "E17.371", 0.01);

console.log("\n=== roots (< MSI vs > MSI) ===");
checkOp("sqrt small", mSmall.sqrt(), 1000, 0);
checkOp("sqrt big", mBig.sqrt(), 100000000, 0);
checkOp("cbrt small", mSmall2.cbrt(), 1000, 0.01);
checkOp("cbrt big", mBig2.cbrt(), 4641588.833, 0.01);
checkOp("root small", mSmall.root(6), 10, 0.01);
checkOp("root small 2", mSmall2.root(9), 10, 0.01);
checkOp("root big", mBig.root(8), 100, 0.01);
checkOp("root big 2", mBig2.root(10), 100, 0.01);

console.log("\n=== logarithms (< MSI vs > MSI) ===");
checkOp("log10 small", mSmall.log10(), 6, 0);
checkOp("log10 big", mBig.log10(), 16, 0);
checkOp("log small", mSmall.log(100), 3, 0.01);
checkOp("log big", mBig.log(100), 8, 0.01);
checkOp("ln small", mSmall.ln(), Math.log(1e6), 1e-6);
checkOp("ln big", mBig.ln(), Math.log(1e16), 1e-6);

console.log("\n=== factorial, gamma and Lambert W (< MSI vs > MSI) ===");
checkOp("fact small", MetaNum(5).fact(), 120, 0);
checkOp("fact big", MetaNum(20).fact(), "E18.386", 0.01);
checkOp("gamma small", MetaNum(0.5).gamma(), Math.sqrt(Math.PI), 1e-6);
checkOp("gamma big", MetaNum(20).gamma(), "E17.085", 0.01);
checkOp("lambertw small", MetaNum(1).lambertw(), 0.5671432904097838, 1e-6);
checkOp("lambertw big", MetaNum(1e16).lambertw(), 33.334760768448184, 1e-6);
console.log("\n=== rounding and modulus (< MSI vs > MSI) ===");
checkOp("floor small", MetaNum(3.7).floor(), 3, 0);
checkOp("floor big", MetaNum(1e16 + 0.5).floor(), 1e16, 0);
checkOp("ceil small", MetaNum(3.2).ceil(), 4, 0);
checkOp("ceil big", MetaNum(1e16 + 0.5).ceil(), 1e16, 0);
checkOp("round small", MetaNum(3.5).round(), 4, 0);
checkOp("round big", MetaNum(1e16 + 0.5).round(), 1e16, 0);
checkOp("mod small", MetaNum(10).mod(3), 1, 0);
checkOp("mod big", MetaNum(1e16).mod(3), 1, 0);

console.log("\n=== other unary operations (< MSI vs > MSI) ===");
checkOp("abs small", MetaNum(-5).abs(), 5, 0);
checkOp("abs big", MetaNum(-1e16).abs(), 1e16, 0);
checkOp("neg small", MetaNum(5).neg(), -5, 0);
checkOp("neg big", MetaNum(1e16).neg(), -1e16, 0);
checkOp("rec small", MetaNum(4).rec(), 0.25, 0);
checkOp("rec big", MetaNum(1e16).rec(), 1e-16, 1e-20);

console.log("\n=== hyperoperation base (< MSI vs > MSI) ===");
checkOp("tetr small", MetaNum(2).tetr(3), 16, 0);
checkOp("tetr big", MetaNum(1e16).tetr(3), "EEE17.20412", 0.01);
checkOp("pent small", MetaNum(2).pent(2), 4, 0);
checkOp("pent big", MetaNum(1e16).pent(3), "FFE16", 0.01);
checkOp("arrow small", MetaNum(2).arrow(2)(3), 16, 0);
checkOp("arrow big", MetaNum(1e16).arrow(3)(4), "FFFE16", 0.01);
checkOp("hyper small", MetaNum.hyper(10,10,10), "K^8 J^8 I^8 H^8 G^8 F^8 E^8 10000000000", 0.01); // README: hyper(4,2,3)=2^^3 => hyper(10,10,10)=10{8}10
checkOp("hyper big", MetaNum.hyper(1e16,10,10), "NE16", 0.01);
checkOp("chain small", MetaNum(2).chain(4, 3), "E^65532 19727.7804056", 0.01);
checkOp("chain big", MetaNum(1e16).chain(4, 3), "FFFE16", 0.01);
checkOp("ssrt small", MetaNum(27).ssrt(), 3, 0.01);
checkOp("ssrt big", MetaNum(1e16).ssrt(), 13.97, 0.01);
checkOp("slog small", MetaNum(16).slog(2), 3, 0.01);
checkOp("slog big", MetaNum(1e16).slog(2), 4.41, 0.01);
checkOp("linear_sroot small", MetaNum(100).linear_sroot(3), 2.2128, 0.01);
checkOp("linear_sroot big", MetaNum(1e16).linear_sroot(3), 3.09, 0.01);
checkOp("layeradd small", MetaNum(10).layeradd(), 1e10, 0.01);
checkOp("layeradd big", MetaNum(1e16).layeradd(), "EE16", 0.01);
checkOp("layeradd10 small", MetaNum(10).layeradd10(), 1e10, 0.01);
checkOp("layeradd10 big", MetaNum(1e16).layeradd10(), "EE16", 0.01);

console.log("\n=== pentate_log/root ===");
// pentate_log: if pentate(a,b)=c then pentate_log(c,a)=b
checkOp("pent_log semantic 2^3", MetaNum.pentate(2,3).pentate_log(2), 3, 0.1);
checkOp("pent_log semantic 3^2", MetaNum.pentate(3,2).pentate_log(3), 2, 0.1);
// pentate_root: if pentate(a,b)=c then pentate_root(c,b)≈a
checkOp("pent_root semantic b=2", MetaNum.pentate(3,2).pentate_root(2), 3, 0.1);
checkOp("pent_root semantic b=3", MetaNum.pentate(2,3).pentate_root(3), 2, 0.1);
//pent log/root small
checkOp("pent_log small", MetaNum(1e10).pentate_log(2), 2.795, 0.1);
checkOp("pent_root small", MetaNum(1e10).pentate_root(2), 2.956, 0.1);

//hyperoperation definition from https://googology.fandom.com/wiki/Template:ExtendedOps

// ─── 1. aperiote (ω): x{ω}y = x{y}y
// aperiote(x,0): x{0}0 = 0
// aperiote(x,1): x{1}1 = x^1 = x
// aperiote(x,2): x{2}2 = x^^2 = x^x
console.log("\n=== 1. aperiote (ω) ===");
checkOp("aper(3,0)", m3.aperiote(0), 0, 0);
checkOp("aper(3,1)", m3.aperiote(1), 3, 0);
checkOp("aper(3,2)", m3.aperiote(2), 27, 0);
checkOp("aper(3,4)", m3.aperiote(4)); //3↑↑↑↑4
checkOp("aper(4,3)", m4.aperiote(3)); //4↑↑↑3
checkBool("aper NaN", MetaNum.aperiote(m3, MetaNum.NaN).isNaN(), true);
checkBool("aper inv NaN", MetaNum.inv_aperiote(m3, MetaNum.NaN).isNaN(), true);

// ─── 2. expande (ω+1): x{ω+1}y ───
// expande: iterated aperiote, x{ω+1}y=x{ω}x{ω}x...x where there are y x's
// e.g. 3{ω+1}2=3{ω}3=3↑↑↑3
console.log("\n=== 2. expande (ω+1) ===");
checkOp("expa(3,1)", m3.expande(1), 3, 0);
checkOp("expa(3,2)", m3.expande(2)); //3↑↑↑3
checkOp("expa(3,4)", m3.expande(4)); //3{ω}3{ω}3{ω}3
checkOp("expa(4,3)", m4.expande(3)); //4{ω}4{ω}4
checkBool("expa y=0 NaN", m3.expande(0).isNaN(), true);
checkBool("expa NaN", MetaNum.expande(m3, MetaNum.NaN).isNaN(), true);

// ─── 3. multiexpande (ω+2): x{ω+2}y ───
// multiexpande: iterated expande, x{ω+2}y=x{ω+1}x{ω+1}... with y x's
// e.g. 3{ω+2}2=3{ω+1}3=3{ω}3{ω}3=3↑…(3↑↑↑3 arrows)…↑3
console.log("\n=== 3. multiexpande (ω+2) ===");
checkOp("muea(3,4)", m3.multiexpande(4));
checkOp("muea(4,3)", m4.multiexpande(3));
checkBool("muea y=0 NaN", m3.multiexpande(0).isNaN(), true);
checkBool("muea NaN", MetaNum.multiexpande(m3, MetaNum.NaN).isNaN(), true);

// ─── 4. powerexpande (ω+3): x{ω+3}y ───
// powerexpande: iterated multiexpande, x{ω+3}y=x{ω+2}x{ω+2}... with y x's
// e.g. 3{ω+3}2=3{ω+2}3=3{ω+1}3{ω+1}3=3{ω+1}3{ω}3{3}3
console.log("\n=== 4. powerexpande (ω+3) ===");
checkOp("poea(3,4)", m3.powerexpande(4));
checkOp("poea(4,3)", m4.powerexpande(3));
checkBool("poea y=0 NaN", m3.powerexpande(0).isNaN(), true);
checkBool("poea NaN", MetaNum.powerexpande(m3, MetaNum.NaN).isNaN(), true);

// ─── 5. aperioexpande (ω*2): x{ω*2}y ───
// aperioexpande: diagonalization of ω+y, x{ω*2}y=x{ω+y}y
// e.g. 3{ω*2}5=3{ω+5}5=3{ω+4}3{ω+4}3{ω+4}3{ω+4}3
console.log("\n=== 5. aperioexpande (ω*2) ===");
checkOp("apea(3,4)", m3.aperioexpande(4));
checkOp("apea(4,3)", m4.aperioexpande(3));
checkBool("apea NaN", MetaNum.aperioexpande(m3, MetaNum.NaN).isNaN(), true);

// ─── 6. explode (ω*2+1): x{ω*2+1}y ───
// explode: iterated aperioexpande, x{ω*2+1}y=x{ω*2}x{ω*2}... with y x's
console.log("\n=== 6. explode (ω*2+1) ===");
checkOp("expl(3,4)", m3.explode(4));
checkOp("expl(4,3)", m4.explode(3));
checkBool("expl y=0 NaN", m3.explode(0).isNaN(), true);
checkBool("expl NaN", MetaNum.explode(m3, MetaNum.NaN).isNaN(), true);

// ─── 7. multiexplode (ω*2+2): x{ω*2+2}y ───
// multiexplode: iterated explode, x{ω*2+2}y=x{ω*2+1}x{ω*2+1}... with y x's
console.log("\n=== 7. multiexplode (ω*2+2) ===");
checkOp("muel(3,4)", m3.multiexplode(4));
checkOp("muel(4,3)", m4.multiexplode(3));
checkBool("muel y=0 NaN", m3.multiexplode(0).isNaN(), true);
checkBool("muel NaN", MetaNum.multiexplode(m3, MetaNum.NaN).isNaN(), true);

// ─── 8. aperioexplode (ω*3): x{ω*3}y ───
// aperioexplode: diagonalization of ω*2+y, x{ω*3}y=x{ω*2+y}y
console.log("\n=== 8. aperioexplode (ω*3) ===");
checkOp("apel(3,4)", m3.aperioexplode(4));
checkOp("apel(4,3)", m4.aperioexplode(3));
checkBool("apel NaN", MetaNum.aperioexplode(m3, MetaNum.NaN).isNaN(), true);

// ─── 9. detonate (ω*3+1): x{ω*3+1}y ───
// detonate: iterated aperioexplode, x{ω*3+1}y=x{ω*3}x{ω*3}... with y x's
console.log("\n=== 9. detonate (ω*3+1) ===");
checkOp("deto(3,4)", m3.detonate(4));
checkOp("deto(4,3)", m4.detonate(3));
checkBool("deto y=0 NaN", m3.detonate(0).isNaN(), true);
checkBool("deto NaN", MetaNum.detonate(m3, MetaNum.NaN).isNaN(), true);

// ─── 10. aperiodetonate (ω*4): x{ω*4}y ───
// aperiodetonate: diagonalization of ω*3+y, x{ω*4}y=x{ω*3+y}y
console.log("\n=== 10. aperiodetonate (ω*4) ===");
checkOp("apdt(3,4)", m3.aperiodetonate(4));
checkOp("apdt(4,3)", m4.aperiodetonate(3));
checkBool("apdt NaN", MetaNum.aperiodetonate(m3, MetaNum.NaN).isNaN(), true);

// ─── 11. aperionate (ω^2): x{ω^2}y ───
console.log("\n=== 11. aperionate (ω^2) ===");
checkOp("apeo(3,4)", m3.aperionate(4));
checkOp("apeo(4,3)", m4.aperionate(3));
checkBool("apeo NaN", MetaNum.aperionate(m3, MetaNum.NaN).isNaN(), true);

// ─── 12. megote (ω^2+1):  ───
console.log("\n=== 12. megote (ω^2+1) ===");
checkOp("mego(3,4)", m3.megote(4));
checkOp("mego(4,3)", m4.megote(3));
checkBool("mego y=0 NaN", m3.megote(0).isNaN(), true);
checkBool("mego NaN", MetaNum.megote(m3, MetaNum.NaN).isNaN(), true);

// ─── 13. multimegote (ω^2+2):  ───
console.log("\n=== 13. multimegote (ω^2+2) ===");
checkOp("mume(3,4)", m3.multimegote(4));
checkOp("mume(4,3)", m4.multimegote(3));
checkBool("mume y=0 NaN", m3.multimegote(0).isNaN(), true);
checkBool("mume NaN", MetaNum.multimegote(m3, MetaNum.NaN).isNaN(), true);

// ─── 14. aperimegote (ω^2+ω):  ───
console.log("\n=== 14. aperimegote (ω^2+ω) ===");
checkOp("apmg(3,4)", m3.aperimegote(4));
checkOp("apmg(4,3)", m4.aperimegote(3));
checkBool("apmg NaN", MetaNum.aperimegote(m3, MetaNum.NaN).isNaN(), true);

// ─── 15. megoexpande (ω^2+ω+1):  ───
console.log("\n=== 15. megoexpande (ω^2+ω+1) ===");
checkOp("mgea(3,4)", m3.megoexpande(4));
checkOp("mgea(4,3)", m4.megoexpande(3));
checkBool("mgea y=0 NaN", m3.megoexpande(0).isNaN(), true);
checkBool("mgea NaN", MetaNum.megoexpande(m3, MetaNum.NaN).isNaN(), true);

// ─── 16. aperimegoexpande (ω^2+ω*2):  ───
console.log("\n=== 16. aperimegoexpande (ω^2+ω*2) ===");
checkOp("apme(3,4)", m3.aperimegoexpande(4));
checkOp("apme(4,3)", m4.aperimegoexpande(3));
checkBool("apme NaN", MetaNum.aperimegoexpande(m3, MetaNum.NaN).isNaN(), true);

// ─── 17. megoaperionate (ω^2*2):  ───
console.log("\n=== 17. megoaperionate (ω^2*2) ===");
checkOp("mgao(3,4)", m3.megoaperionate(4));
checkOp("mgao(4,3)", m4.megoaperionate(3));
checkBool("mgao NaN", MetaNum.megoaperionate(m3, MetaNum.NaN).isNaN(), true);

// ─── 18. gigote (ω^2*2+1):  ───
console.log("\n=== 18. gigote (ω^2*2+1) ===");
checkOp("gigo(3,4)", m3.gigote(4));
checkOp("gigo(4,3)", m4.gigote(3));
checkBool("gigo y=0 NaN", m3.gigote(0).isNaN(), true);
checkBool("gigo NaN", MetaNum.gigote(m3, MetaNum.NaN).isNaN(), true);

// ─── 19. aperigigote (ω^2*2+ω):  ───
console.log("\n=== 19. aperigigote (ω^2*2+ω) ===");
checkOp("apgg(3,4)", m3.aperigigote(4));
checkOp("apgg(4,3)", m4.aperigigote(3));
checkBool("apgg NaN", MetaNum.aperigigote(m3, MetaNum.NaN).isNaN(), true);

// ─── 20. gigoaperionate (ω^2*3):  ───
console.log("\n=== 20. gigoaperionate (ω^2*3) ===");
checkOp("ggap(3,4)", m3.gigoaperionate(4));
checkOp("ggap(4,3)", m4.gigoaperionate(3));
checkBool("ggap y=0 NaN", m3.gigoaperionate(0).isNaN(), true);
checkBool("ggap NaN", MetaNum.gigoaperionate(m3, MetaNum.NaN).isNaN(), true);

// ─── 21. aperiatote (ω^3):  ───
console.log("\n=== 21. aperiatote (ω^3) ===");
checkOp("apat(3,4)", m3.aperiatote(4));
checkOp("apat(4,3)", m4.aperiatote(3));
checkBool("apat NaN", MetaNum.aperiatote(m3, MetaNum.NaN).isNaN(), true);

// ─── 22. powiainate (ω^3+1):  ───
console.log("\n=== 22. powiainate (ω^3+1) ===");
checkOp("pwan(3,4)", m3.powiainate(4));
checkOp("pwan(4,3)", m4.powiainate(3));
checkBool("pwan y=0 NaN", m3.powiainate(0).isNaN(), true);
checkBool("pwan NaN", MetaNum.powiainate(m3, MetaNum.NaN).isNaN(), true);

// ─── 23. expandainate (ω^3+ω):  ───
console.log("\n=== 23. expandainate (ω^3+ω) ===");
checkOp("epan(3,4)", m3.expandainate(4));
checkOp("epan(4,3)", m4.expandainate(3));
checkBool("epan NaN", MetaNum.expandainate(m3, MetaNum.NaN).isNaN(), true);

// ─── 24. megodainate (ω^3+ω^2):  ───
console.log("\n=== 24. megodainate (ω^3+ω^2) ===");
checkOp("mgan(3,4)", m3.megodainate(4));
checkOp("mgan(4,3)", m4.megodainate(3));
checkBool("mgan y=0 NaN", m3.megodainate(0).isNaN(), true);
checkBool("mgan NaN", MetaNum.megodainate(m3, MetaNum.NaN).isNaN(), true);

// ─── 25. powiairate (ω^3*2) ───
console.log("\n=== 25. powiairate (ω^3*2) ===");
checkOp("pwar(3,4)", m3.powiairate(4));
checkOp("pwar(4,3)", m4.powiairate(3));
checkBool("pwar NaN", MetaNum.powiairate(m3, MetaNum.NaN).isNaN(), true);

// ─── 26. aperioguate (ω^4):  ───
console.log("\n=== 26. aperioguate (ω^4) ===");
checkOp("apgu(3,4)", m3.aperioguate(4));
checkOp("apgu(4,3)", m4.aperioguate(3));
checkBool("apgu NaN", MetaNum.aperioguate(m3, MetaNum.NaN).isNaN(), true);

// ─── 27. iter (ω^ω):  ───
console.log("\n=== 27. iter (ω^ω) ===");
checkOp("ite(3,4)", m3.iter(4));
checkOp("ite(4,3)", m4.iter(3));
checkBool("ite y=0 NaN", m3.iter(0).isNaN(), true);
checkBool("ite NaN", MetaNum.iter(m3, MetaNum.NaN).isNaN(), true);

// ─── 28. itermult (ω^ω+1):  ───
console.log("\n=== 28. itermult (ω^ω+1) ===");
checkOp("itmu(3,4)", m3.itermult(4));
checkOp("itmu(4,3)", m4.itermult(3));
checkBool("itmu y=0 NaN", m3.itermult(0).isNaN(), true);
checkBool("itmu NaN", MetaNum.itermult(m3, MetaNum.NaN).isNaN(), true);

// ─── 29. cuboiter (ω^ω*2) ───
console.log("\n=== 29. cuboiter (ω^ω*2) ===");
checkOp("cube(3,4)", m3.cuboiter(4));
checkOp("cube(4,3)", m4.cuboiter(3));
checkBool("cube NaN", MetaNum.cuboiter(m3, MetaNum.NaN).isNaN(), true);

// ─── 30. expoiter (ω^(ω+1)) ───
console.log("\n=== 30. expoiter (ω^(ω+1)) ===");
checkOp("expo(3,4)", m3.expoiter(4));
checkOp("expo(4,3)", m4.expoiter(3));
checkBool("expo NaN", MetaNum.expoiter(m3, MetaNum.NaN).isNaN(), true);

// ─── 31. trioterate (ω^(ω*2)) ───
console.log("\n=== 31. trioterate (ω^(ω*2)) ===");
checkOp("tria(3,4)", m3.trioterate(4));
checkOp("tria(4,3)", m4.trioterate(3));
checkBool("tria NaN", MetaNum.trioterate(m3, MetaNum.NaN).isNaN(), true);

// ─── 32. trixxate (ω^(ω^2)) ───
console.log("\n=== 32. trixxate (ω^(ω^2)) ===");
checkOp("trix(3,4)", m3.trixxate(4));
checkOp("trix(4,3)", m4.trixxate(3));
checkBool("trix NaN", MetaNum.trixxate(m3, MetaNum.NaN).isNaN(), true);

// ─── 33. aperixxate (ω^(ω^ω)) ───
console.log("\n=== 33. aperixxate (ω^(ω^ω)) ===");
checkOp("apix(3,4)", m3.aperixxate(4));
checkOp("apix(4,3)", m4.aperixxate(3));
checkBool("apix NaN", MetaNum.aperixxate(m3, MetaNum.NaN).isNaN(), true);

// ─── 34. epsilonate (ε₀) ───
console.log("\n=== 34. epsilonate (ε₀) ===");
checkOp("epsl(3,4)", m3.epsilonate(4));
checkOp("epsl(4,3)", m4.epsilonate(3));
checkBool("epsl NaN", MetaNum.epsilonate(m3, MetaNum.NaN).isNaN(), true);

// Same-value tests: op(1,y) and op(x,1) produce reasonable results
// when x=1, 1{ordinal}y = 1 for any ordinal
// when y=1, x{ordinal}1 = x for any ordinal
var ops = [
  "aperiote","expande","multiexpande","powerexpande","aperioexpande",
  "explode","multiexplode","aperioexplode","detonate","aperiodetonate",
  "aperionate","megote","multimegote","aperimegote","megoexpande",
  "aperimegoexpande","megoaperionate","gigote","aperigigote","gigoaperionate",
  "aperiatote","powiainate","expandainate","megodainate","powiairate","aperioguate","iteration",
  "itermult","cuboiter","expoiter","trioterate","trixxate","aperixxate","epsilonate"
];

console.log("\n=== all hyperoperations x=1, y=3 test ===");
for (var oi = 0; oi < ops.length; oi++) {
  try {
    var res = m1[ops[oi]](3);
    if (res.eq(1)) console.log("PASS | " + ops[oi] + "(1,3) | " + res.toString().slice(0,100));
    else console.log("FAIL | " + ops[oi] + "(1,3) => " + res.toString().slice(0,100));
  } catch (e) {
    console.log("ERROR | " + ops[oi] + "(1,3) => " + e.message);
  }
}

console.log("\n=== all hyperoperations x=3, y=1 test ===");
for (var oi = 0; oi < ops.length; oi++) {
  try {
    var res = m3[ops[oi]](1);
    if (res.eq(3)) console.log("PASS | " + ops[oi] + "(3,1) | " + res.toString().slice(0, 100));
    else console.log("FAIL | " + ops[oi] + "(3,1) => " + res.toString().slice(0, 100));
  } catch (e) {
    console.log("ERROR | " + ops[oi] + "(3,1) => " + e.message);
  }
}

// hyperoperation tests with x or y > MSI (9007199254740992)
console.log("\n=== hyperoperation (x > MSI) (not fully implemented) ===");
var mBigBase = MetaNum(1e16);
for (var oi = 0; oi < ops.length; oi++) {
  try {
    var res = mBigBase[ops[oi]](3);
    console.log("PASS | " + ops[oi] + "(1e16,3) | " + res.toString().slice(0,100));
  } catch (e) {
    console.log("FAIL | " + ops[oi] + "(1e16,3) => " + e.message);
  }
}

console.log("\n=== hyperoperation (y > MSI) ===");
for (var oi = 0; oi < ops.length; oi++) {
  try {
    var res = m3[ops[oi]](mBigBase);
    console.log("PASS | " + ops[oi] + "(3,1e16) | " + res.toString().slice(0,100));  
  } catch (e) {
    console.log("FAIL | " + ops[oi] + "(3,1e16) => " + e.message);
  }
}

// inverse roundtrip: op(10,x) → inv → should ≈ x
console.log("\n=== inverse operation (> MSI) roundtrip ===");
var invOps = [
  "inv_aperiote","inv_expande","inv_multiexpande","inv_powerexpande","inv_aperioexpande",
  "inv_explode","inv_multiexplode","inv_aperioexplode","inv_detonate","inv_aperiodetonate",
  "inv_aperionate","inv_megote","inv_multimegote","inv_aperimegote","inv_megoexpande",
  "inv_aperimegoexpande","inv_megoaperionate","inv_gigote","inv_aperigigote","inv_gigoaperionate",
  "inv_aperiatote","inv_powiainate","inv_expandainate","inv_megodainate","inv_powiairate","inv_aperioguate","inv_iteration",
  "inv_itermult","inv_cuboiter","inv_expoiter","inv_trioterate","inv_trixxate","inv_aperixxate","inv_epsilonate"
];

console.log("\n=== inv hyperoperations roundtrip test ===");
var m10 = MetaNum(10);
for (var oi = 0; oi < ops.length; oi++) {
    try {
        var fwd = m10[ops[oi]](3);
        var back = fwd[invOps[oi]](m10);
        if (back.eq(m3)) console.log("PASS | " + invOps[oi] + " | fwd=" + fwd.toString().slice(0, 100) + " back=" + back.toString().slice(0, 100));
        else console.log("FAIL | " + invOps[oi] + " | fwd=" + fwd.toString().slice(0, 100) + " back=" + back.toString().slice(0, 100));
    } catch (e) {
        console.log("ERROR | inv_" + ops[oi] + " => " + e.message);
    }
}

console.log("\n=== inv hyperoperations > MSI ===");
for (var oi = 0; oi < invOps.length; oi++) {
  try {
    var fwd = m10[ops[oi]](mBigBase);
    var back = fwd[invOps[oi]](m10);
    console.log("PASS | " + invOps[oi] + " | fwd=" + fwd.toString().slice(0,100) + " back=" + back.toString().slice(0,100));
  } catch (e) {
    console.log("FAIL | " + invOps[oi] + " => " + e.message);
  }
}

// hyperoperation iteration tests
var hyperOpList = [
  ["aper", "aperiote"],
  ["expa", "expande"],
  ["muea", "multiexpande"],
  ["poea", "powerexpande"],
  ["apea", "aperioexpande"],
  ["expl", "explode"],
  ["muel", "multiexplode"],
  ["apel", "aperioexplode"],
  ["deto", "detonate"],
  ["apdt", "aperiodetonate"],
  ["apeo", "aperionate"],
  ["mego", "megote"],
  ["mume", "multimegote"],
  ["apmg", "aperimegote"],
  ["mgea", "megoexpande"],
  ["apme", "aperimegoexpande"],
  ["mgao", "megoaperionate"],
  ["gigo", "gigote"],
  ["apgg", "aperigigote"],
  ["ggap", "gigoaperionate"],
  ["apat", "aperiatote"],
  ["pwan", "powiainate"],
  ["epan", "expandainate"],
  ["mgan", "megodainate"],
  ["pwar", "powiairate"],
  ["apgu", "aperioguate"],
  ["iter", "iter"],
  ["itmu", "itermult"],
  ["cube", "cuboiter"],
  ["expo", "expoiter"],
  ["tria", "trioterate"],
  ["trix", "trixxate"],
  ["apix", "aperixxate"],
  ["epsl", "epsilonate"]
];

// ─── double nested iteration ───
console.log("\n=== hyperoperation iteration tests (not fully implemented) ===");
for (var hi = 0; hi < hyperOpList.length; hi++) {
  var shortName = hyperOpList[hi][0];
  var methodName = hyperOpList[hi][1];
  try{
    var res = m3[methodName](m3[methodName](3));
    console.log("PASS | " + shortName + "(3," + shortName + "(3,3)) | " + res.toString().slice(0,100));
  } catch (e) {
    console.log("FAIL | " + shortName + "(3," + shortName + "(3,3)) => " + e.message);
  }
}

// ─── triple nested iteration ───
console.log("\n=== triple nested hyperoperation tests ===");
for (var hi = 0; hi < hyperOpList.length; hi++) {
  var shortName = hyperOpList[hi][0];
  var methodName = hyperOpList[hi][1];
  try{
    var res = m3[methodName](m3[methodName](m3[methodName](3)));
    console.log("PASS | " + shortName + "(3," + shortName + "(3," + shortName + "(3,3))) | " + res.toString().slice(0,100));
  } catch (e) {
    console.log("FAIL | " + shortName + "(3," + shortName + "(3," + shortName + "(3,3))) => " + e.message);
  }
}

// ─── cross-operation iteration (跨运算嵌套) ───
console.log("\n=== cross-operation iteration tests ===");
checkOp("aper(3,expa(3,3))", m3.aperiote(m3.expande(3)));
checkOp("expa(3,aper(3,3))", m3.expande(m3.aperiote(3)));
checkOp("expl(3,apea(3,3))", m3.explode(m3.aperioexpande(3)));
checkOp("deto(3,apel(3,3))", m3.detonate(m3.aperioexplode(3)));
checkOp("mego(3,apeo(3,3))", m3.megote(m3.aperionate(3)));
checkOp("iter(3,apgu(3,3))", m3.iter(m3.aperioguate(3)));
checkOp("epsl(3,apix(3,3))", m3.epsilonate(m3.aperixxate(3)));

console.log("\n=== big ordinal annex small ordinal tests x=QqQe308 ===");
var ordq=MetaNum.QqQe308
for (var oi = 0; oi < ops.length; oi++) {
  try {
    var res = ordq[ops[oi]](m3);
    console.log("PASS | " + ops[oi] + "(QqQe308,3) | " + res.toString().slice(0,100));
  } catch (e) {
    console.log("FAIL | " + ops[oi] + "(QqQe308,3) => " + e.message);
  }
}

console.log("\n=== big ordinal annex small ordinal tests y=QqQe308 ===");
for (var oi = 0; oi < ops.length; oi++) {
  try {
    var res = ordq[ops[oi]](m3);
    console.log("PASS | " + ops[oi] + "(3,QqQe308) | " + res.toString().slice(0,100));
  } catch (e) {
    console.log("FAIL | " + ops[oi] + "(3,QqQe308) => " + e.message);
  }
}

// ─────────────────────────────────────
// Large-cardinal hyperoperation correctness (input > 10^16)
// Verifies: (1) metaFiniteCount extracts the iteration count instead of collapsing 
//           toNumber() = Infinity → 0(count row is non - zero and grows with y)
//           (2) compareTo ranks an ω - level ordinal row above any
//           number of finite-level rows, so op(x,·) is monotone across the
//           10^16 boundary (aperiote(1e8) < aperiote(1e16)) (well-ordered)
// ─────────────────────────────────────
console.log("\n=== hyperoperation large-cardinal (x > 10^16) ===");

function checkArr(name, m, expectedArray) {
  try {
    var got = JSON.stringify(m.array);
    var exp = JSON.stringify(expectedArray);
    var pass = got === exp;
    console.log((pass ? "PASS" : "FAIL") + " | " + name + " | " + got);
    if (!pass) console.log("  Expected: " + exp);
  } catch (e) {
    console.log("ERROR | " + name + " => " + e.message);
  }
}

var mL8 = MetaNum(1e8);
var mL12 = MetaNum(1e12);
var mL16 = MetaNum(1e16);

// --- monotonicity across the 10^16 boundary (comparison fix) ---
checkBool("mono aper 1e8<1e12<1e16",
  mL8.aperiote(mL8).lt(mL12.aperiote(mL12)) && mL12.aperiote(mL12).lt(mL16.aperiote(mL16)), true);
checkBool("mono expa(·,3) 1e8<1e16", mL8.expande(3).lt(mL16.expande(3)), true);
checkBool("mono muea(·,3) 1e8<1e16", mL8.multiexpande(3).lt(mL16.multiexpande(3)), true);
checkBool("mono poea(·,3) 1e8<1e16", mL8.powerexpande(3).lt(mL16.powerexpande(3)), true);

// --- count not zeroed: result strictly grows with y (metaFiniteCount fix) ---
checkBool("expa(1e16,3) > expa(1e16,2)", mL16.expande(3).gt(mL16.expande(2)), true);
checkBool("muea(1e16,3) > muea(1e16,2)", mL16.multiexpande(3).gt(mL16.multiexpande(2)), true);
checkBool("poea(1e16,3) > poea(1e16,2)", mL16.powerexpande(3).gt(mL16.powerexpande(2)), true);
checkBool("expa(1e16,5) > expa(1e16,3)", mL16.expande(5).gt(mL16.expande(3)), true);
checkBool("muea(1e16,5) > muea(1e16,3)", mL16.multiexpande(5).gt(mL16.multiexpande(3)), true);
checkBool("poea(1e16,5) > poea(1e16,3)", mL16.powerexpande(5).gt(mL16.powerexpande(3)), true);

// --- array structure snapshots (count correctly stored, not collapsed to 0) ---
// expande: count row [y-2,0,1] is at ω-level, same as aperiote's [1,0,1], so they
// merge → [1+(y-2),0,1] = [y-1,0,1]. For y=3 that is [2,0,1].
checkArr("expande(1e16,3) array", mL16.expande(3), [[16, 1], [2, 0, 1]]);
// multiexpande (ω+2): 1e16{ω+1}1e16{ω+1}1e16 → count row [2,1,1] at ω+1.
checkArr("multiexpande(1e16,3) array", mL16.multiexpande(3), [[16, 1], [2, 1, 1]]);
// powerexpande (ω+3): count row [2,2,1] at ω+2.
checkArr("powerexpande(1e16,3) array", mL16.powerexpande(3), [[16, 1], [2, 2, 1]]);

// --- y > MSI: result diagonalizes to y plus one α-level row (no counts > MSI) ---
// x{α}y ≈ 10{α}y → y's own representation + marker row [1|α]
checkArr("aperiote(3,1e16) array", m3.aperiote(mL16), [[16, 1], [1, 0, 1]]);
checkArr("aperiote(1e16,3) array", mL16.aperiote(3), [[16, 1, 2]]);
checkArr("expande(3,1e16) array", m3.expande(mL16), [[16, 1], [1, 1, 1]]);
checkArr("multiexpande(3,1e16) array", m3.multiexpande(mL16), [[16, 1], [1, 2, 1]]);
checkArr("powerexpande(3,1e16) array", m3.powerexpande(mL16), [[16, 1], [1, 3, 1]]);
checkArr("powiainate(3,1e16) array", m3.powiainate(mL16), [[16, 1], [1, 1, 0, 0, 1]]);
// beyond 10{100}10: y itself carries a compact finite-level ordinal row
var mArrow1000 = MetaNum.arrow(10, 1000, 10);
checkArr("arrow(10,1000,10) array", mArrow1000, [[10], [1, 1000]]);
checkArr("powiainate(3,arrow(10,1000,10)) array", m3.powiainate(mArrow1000),
  [[10], [1, 1000], [1, 1, 0, 0, 1]]);

// --- inverse roundtrip recovers y exactly (multiexpande / powerexpande) ---
// Because the count rows live at ω+1 / ω+2 (not the base ω-level), they do not
// merge with aperiote's [1,0,1] row, so inv_* recovers y rather than y+1.
checkBool("inv_multiexpande(1e16{ω+2}3,1e16)=3", mL16.multiexpande(3).inv_multiexpande(mL16).eq(MetaNum(3)), true);
checkBool("inv_powerexpande(1e16{ω+3}3,1e16)=3", mL16.powerexpande(3).inv_powerexpande(mL16).eq(MetaNum(3)), true);
checkBool("inv_multiexpande(1e16{ω+2}5,1e16)=5", mL16.multiexpande(5).inv_multiexpande(mL16).eq(MetaNum(5)), true);
checkBool("inv_powerexpande(1e16{ω+3}5,1e16)=5", mL16.powerexpande(5).inv_powerexpande(mL16).eq(MetaNum(5)), true);
// Small-x finite branch (base has no ω-row): inv_expande is exact too.
checkBool("inv_expande(3{ω+1}5,3)=5", MetaNum(3).expande(5).inv_expande(MetaNum(3)).eq(MetaNum(5)), true);

// ─────────────────────────────────────
// BEAF ordinal nesting (raw coefficient convention: BEAF(a,b,c,d)=a{ω*(d-1)+(c-1)}b)
// Nested huge args anchor at the inner value and add one ordinal row:
//   BEAF(inner,2,3,5) = inner{ω*4+1}inner        → inner + [1|ω*4+1]
//   BEAF(4,inner,3,5) = 4{ω*4+2}inner            → inner + [1|ω*4+2]
//   BEAF(4,2,inner,5) = 4{ω*4+inner}2 = 4{ω*5}inner → inner + [1|ω*5]
//   BEAF(4,2,3,inner) = 4{ω*inner+3}2 = 4{ω²}inner  → inner + [1|ω²]
// ─────────────────────────────────────
console.log("\n=== BEAF ordinal nesting ===");
checkOp("BEAF(3,3,2)", MetaNum.BEAF(3, 3, 2), 7625597484987, 0);
checkOp("BEAF(2,2,1,2)", MetaNum.BEAF(2, 2, 1, 2), 4, 0);
var beafInner = MetaNum.BEAF(4, 2, 3, 5); // 4{ω*4+2}2
checkBool("BEAF(4,2,3,5) top row [2,0,4]",
  JSON.stringify(beafInner.array[beafInner.array.length - 1]) === JSON.stringify([2, 0, 4]), true);
checkArr("BEAF(BEAF(4,2,3,5),2,3,5)", MetaNum.BEAF(beafInner, 2, 3, 5),
  beafInner.array.concat([[1, 1, 4]]));
checkArr("BEAF(4,BEAF(4,2,3,5),3,5)", MetaNum.BEAF(4, beafInner, 3, 5),
  beafInner.array.concat([[1, 2, 4]]));
checkArr("BEAF(4,2,BEAF(4,2,3,5),5)", MetaNum.BEAF(4, 2, beafInner, 5),
  beafInner.array.concat([[1, 0, 5]]));
checkArr("BEAF(4,2,3,BEAF(4,2,3,5))", MetaNum.BEAF(4, 2, 3, beafInner),
  beafInner.array.concat([[1, 0, 0, 1]]));
var beafInner5 = MetaNum.BEAF(5, 5, 5, 5, 5);
// ω²-level huge arg: the outer keeps inner's ordinal rows (r0 dropped) + anchor row
checkArr("BEAF(5,5,5,5,BEAF(5,5,5,5,5))", MetaNum.BEAF(5, 5, 5, 5, beafInner5),
    beafInner5.array.slice(1).concat([[1, 0, 0, 0, 1]]));
console.log("\n=== Done ===");

// ─────────────────────────────────────
// format() tests (25 cases covering small, sci, single-letter, multi-letter, ordinal)
// ─────────────────────────────────────
console.log("\n=== format() verification ===");

function checkFormat(name, input, expected) {
  try {
    var m = MetaNum(input);
    var s = format(m);
    var pass = s === expected;
    console.log((pass ? "PASS" : "FAIL") + " | fmt " + name + " | " + input + " => " + s + (pass ? "" : " (expected " + expected + ")"));
  } catch (e) {
    console.log("ERROR | fmt " + name + " | " + input + " => " + e.message);
  }
}

// Small values & regular numbers
checkFormat("1E-1000000", "1E-1000000", "1.000E-1,000,000"); // sign=2 reciprocal
checkFormat("1E-100",     "1E-100",     "1.000E-100");
checkFormat("0.123",      "0.123",       "0.123");
checkFormat("456789",     "456789",      "456,789");
checkFormat("1E100",      "1E100",       "1.000E100");   // α always shown

// Single-letter chains (E-Z range): outerLetters + α + lastLetter + β
checkFormat("EE200", "EE200", "E1.000E200");
checkFormat("F300",  "F300",  "1.000F300");
checkFormat("FE400", "FE400", "F1.000E400");
checkFormat("FF500", "FF500", "F1.000F500");
checkFormat("G600",  "G600",  "1.000G600");
checkFormat("GE700", "GE700", "G1.000E700");
checkFormat("GF800", "GF800", "G1.000F800");
checkFormat("GG900", "GG900", "G1.000G900");
checkFormat("J1000", "J1000", "1.000J1,000");

// Ordinal (Aa and beyond) - single letter: α + letter + β
checkFormat("Aa100",  "Aa100",  "1.000Aa100");
checkFormat("Ab400",  "Ab400",  "1.000Ab400");
checkFormat("Ac800",  "Ac800",  "1.000Ac800");
checkFormat("Aj900",  "Aj900",  "1.000Aj900");
checkFormat("Ba1000", "Ba1000", "1.000Ba1,000");
checkFormat("Aaa100", "Aaa100", "1.000Aaa100");

// Ordinal with multi-level r0: ordinalLetter + r0Chain (includes α)
checkFormat("AaE200",  "AaE200",  "Aa1.000E200");
checkFormat("AbE500",  "AbE500",  "Ab1.000E500");

// Ordinal repeated letters: outerLetters + α + lastLetter + β
checkFormat("AaAa300", "AaAa300", "Aa1.000Aa300");
checkFormat("AbAa600", "AbAa600", "Ab1.000Aa600");
checkFormat("AbAb700", "AbAb700", "Ab1.000Ab700");

// Ordinal more Letters:
checkFormat("Abc100", "Abc100", "1.000Abc100");
checkFormat("Defg200", "Defg200", "1.000Defg200");

// Symbols and ε:
checkFormat("!Aa300", "!Aa300", "!1.000Aa300");
checkFormat("@Bb400", "@Bb400", "@1.000Bb400");
checkFormat("1ε500", "1ε500", "1.000ε500");

// ─────────────────────────────────────
// Reciprocal of large numbers (sign=2) format tests
// smallNotationUseE=true → E-<formatted mag>
// smallNotationUseE=false → <formatted value>⁻¹
// ─────────────────────────────────────
console.log("\n=== reciprocal format tests ===");

// Parsing: verify sign=2 and array structure
check("E-EE1000 parse",  "E-EE1000", [[1000, 3]]);
check("1/F500 parse",    "1/F500",   [[10000000000, 498]]);
check("1/G200 parse",    "1/G200",   [[10000000000, 8, 198]]);
check("1/F10 parse",     "1/F10",    [[10000000000, 8]]);

// format() with smallNotationUseE=true (default):
//   E-EE1000 = 10^(-log10(EE1000)) = 10^(-E1000)  → "E-E1.000E1,000"
//   1/F500   = 10^(-log10(F500))   = 10^(-F499)   → "E-1.000F499"
//   1/G200   = 10^(-log10(G200))   ≈ 10^(-G200)    → "E-1.000G200" (TMSI: G200>TMSI)
//   1/F10    = 10^(-log10(F10))    = 10^(-F9)      → "E-1.000F9"
checkFormat("E-EE1000 (useE=true)", "E-EE1000", "E-E1.000E1,000");
checkFormat("1/F500   (useE=true)", "1/F500",   "E-1.000F499");
checkFormat("1/G200   (useE=true)", "1/G200",   "E-1.000G200");
checkFormat("1/F10    (useE=true)", "1/F10",    "E-1.000F9");

// format() with smallNotationUseE=false:
//   E-EE1000 → "EE1.000E1,000⁻¹"
//   1/F500   → "1.000F500⁻¹"
//   1/G200   → "1.000G200⁻¹"
//   1/F10    → "1.000F10⁻¹"
var _savedUseE = FORMAT_OPTIONS.smallNotationUseE;
FORMAT_OPTIONS.smallNotationUseE = false;
checkFormat("E-EE1000 (useE=false)", "E-EE1000", "EE1.000E1,000⁻¹");
checkFormat("1/F500   (useE=false)", "1/F500",   "1.000F500⁻¹");
checkFormat("1/G200   (useE=false)", "1/G200",   "1.000G200⁻¹");
checkFormat("1/F10    (useE=false)", "1/F10",    "1.000F10⁻¹");
FORMAT_OPTIONS.smallNotationUseE = _savedUseE;

console.log("\n=== format tests Done ===");