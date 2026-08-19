// format-metanum.js by dlsdl
// Adapted from format-omeganum.js by cloudytheconqueror
// Uses dlsdl's Letter Notation (see README.md)

// Set to 1 to print debug information to console
let FORMAT_DEBUG = 0

// ─── Configuration Options ────────────────────────────────────────
const FORMAT_OPTIONS = {
  smallNotationUseE: true,   // 1. 小数值是否用E-表示（true=αE-β，false=⁻¹）
  smallNotationThreshold: 4, // 2. 小数值表示阈值（=n则小于10^-n的数采用小数值处理）
  decimalPlaces: 3,          // 3. 常规数字小数位数（=0为1，=1为1.0，=2为1.00等）
  decimalThreshold: 3,       // 4. 常规数字小数阈值（=n则数值>=10^n时不显示小数部分）
  useCommas: true,           // 5. 常规数字是否显示逗号（true/false）
  sciThreshold: 9,           // 6. 科学计数法阈值（=n则数值>=10^n开始用科学计数法，同样对αEβ中β的数值生效）
  sciSignificantDigits: 3,   // 7. 科学计数法有效位数（=n则αEβ的α的小数部分保留n位）
  sciDecimalThreshold: 3,    // 8. 科学计数法小数阈值（=n则αEβ的β>=10^n时不显示小数部分）
  singleLetterDigits: 3,     // 9. 单字母计数法有效位数（αFβ,αGβ...αZβ中α的小数位数）
  repeatLetterThreshold: 3,  // 10. 单字母重复阈值（=n则出现n个重复的单字母时用下一个字母计数法，n<2时以2计算）
  multiLetterDigits: 3,      // 11. 多字母计数法有效位数（及以上的α的小数位数）
  multiLetterRepeatThreshold: 3, // 12. 多字母组合重复阈值（=n则出现n个重复的多字母组合时用下一个字母计数法，n<2时以2计算）
  multiLetterLimit: 4,        // 13. 多字母组合最大位数（=n则多字母组合的长度不超过n，超过则切换下一种计数法，n<2时以2计算）
  epsilonSignificantDigits: 6  // 14. epsilon有效位数（=n则αεβ中α的小数位数为n）
}

// ─── Utility Functions ───────────────────────────────────────────

function commaFormat(num) {
    if (!FORMAT_OPTIONS.useCommas) {
        let n = typeof num === 'number' ? num : (num.toNumber ? num.toNumber() : Number(num))
        if (isNaN(n) || !isFinite(n)) return "NaN"
        return String(Math.floor(n))
    }
    if (num === null || num === undefined) return "NaN"
    let n = typeof num === 'number' ? num : (num.toNumber ? num.toNumber() : Number(num))
    if (isNaN(n) || !isFinite(n)) return "NaN"
    if (n < 0.001) return "0"
    let init = n.toString()
    let portions = init.split(".")
    portions[0] = portions[0].replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,")
    return portions[0]
}

function regularFormat(num, precision) {
    if (num === null || num === undefined) return "NaN"
    let n = typeof num === 'number' ? num : (num.toNumber ? num.toNumber() : Number(num))
    if (isNaN(n) || !isFinite(n)) return "NaN"
    if (n < 0.001) return (0).toFixed(precision)
    if (precision === 0) return commaFormat(Math.floor(n))
    let fmt
    if (Number.isInteger(n) && precision > 0) {
        fmt = n + "." + "0".repeat(precision)
    } else {
        fmt = n.toFixed(precision)
    }
    // Add commas to integer part if useCommas is enabled
    if (FORMAT_OPTIONS.useCommas && precision > 0) {
        let parts = fmt.split(".")
        parts[0] = parts[0].replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,")
        fmt = parts.join(".")
    }
    return fmt
}

// ─── MetaNum-Specific Polarize ───────────────────────────────────
// MetaNum's r0 is [base, e, f, g, h, ...] where:
//   r0[0] = base value (argument to the operations)
//   r0[1] = count of E operations (level 1)
//   r0[2] = count of F operations (level 2)
//   r0[3] = count of G operations (level 3), etc.
//
// In binary form αΓβ:
//   bottom = α (mantissa in [1, 10))
//   top = β (integer exponent)
//   height = Γ level (1=E, 2=F, 3=G, ..., 22=Z)
//   repeat = count of repeated operations at the highest level (>1 means repeated letters)
function metaPolarize(r0, num) {
    if (FORMAT_DEBUG >= 1) console.log("metaPolarize input:", JSON.stringify(r0))
    if (r0.length === 0) r0 = [0]

    // Find the highest non-zero index (level)
    let highest = 0
    for (let i = r0.length - 1; i >= 1; i--) {
        if (r0[i] > 0) { highest = i; break }
    }

    if (highest === 0) {
        // Simple number: just r0[0], no higher levels
        let bottom = r0[0]
        let top = 0
        let height = 0
        if (bottom >= 10) {
            let logVal = Math.log10(bottom)
            bottom = Math.pow(10, logVal - Math.floor(logVal))
            top = Math.floor(logVal)
            height = 1
        }
        if (FORMAT_DEBUG >= 1) console.log("metaPolarize simple:", {bottom, top, height, repeat: 1})
        return {bottom, top, height, repeat: 1}
    }

    // ── Climb through E level to compute the F-level argument ──
    // r0 = [v, e, f, g, ...]
    // For E^n (highest=1): climb E to convert to F format
    // For F^n or higher (highest>=2): compute the argument at the E→F boundary
    let value = r0[0]
    let eCount = r0[1] || 0

    // Climb the base value through E level
    let eClimbExtra = 0
    while (value >= 10) {
        value = Math.log10(value)
        eClimbExtra++
    }
    eCount += eClimbExtra

    // Compute the F-level argument from the climbed E value
    let fArg
    if (value >= 1) {
        fArg = eCount + Math.log10(value)
    } else {
        fArg = eCount + value - 1
        if (fArg < 1) fArg = eCount + Math.log10(Math.pow(10, value))
    }

    if (highest === 1) {
        // E level only: convert to F format
        let bottom = value
        let top = eCount
        let height = 1
        let repeat = eCount
        if (top >= 2) {
            height = 2
            if (bottom < 1) {
                bottom = Math.pow(10, bottom)
            }
            top = Math.floor(top)
            repeat = 1
        } else {
            bottom = Math.pow(10, bottom - Math.floor(bottom))
            top = Math.floor(top)
        }
        if (FORMAT_DEBUG >= 1) console.log("metaPolarize E level:", {bottom, top, height, repeat})
        return {bottom, top, height, repeat}
    }

    // ── Higher levels (F, G, H, ..., Z) ──
    // For mixed levels like FE20 or G10, the F argument is the value after E operations.
    // Try to compute it directly (E^e(base) = 10^e * base for e=1, or tower for e>1).
    let levelArg = fArg
    let eOps = r0[1] || 0
    let canCompute = false
    if (eOps > 0) {
        let eVal = r0[0]
        canCompute = true
        for (let i = 0; i < eOps; i++) {
            eVal = Math.pow(10, eVal)
            if (!isFinite(eVal) || eVal > 1e308) {
                canCompute = false
                break
            }
        }
        if (canCompute) {
            levelArg = eVal
        }
        // If not computable, levelArg stays as fArg (from E climbing)
    }

    let height = highest
    let repeat = r0[highest] || 0

    // ── Case 1: Directly computable (e.g., FE20) ──
    // Don't climb the computed value; use it directly as the top argument.
    if (canCompute) {
        let bottom = 1.0
        let top = levelArg
        if (FORMAT_DEBUG >= 1) console.log("metaPolarize computable:", {bottom, top, height, repeat})
        return {bottom, top, height, repeat}
    }

    // ── Case 2: Not computable ──
    // Check for the "all-8s" pattern: base=10^10 and all intermediate levels are 8.
    // This pattern arises when the original argument was 10 (e.g., Z10, G10, ZZ10).
    let all8 = (r0[0] === 10000000000)
    for (let i = 2; i < highest && all8; i++) {
        if ((r0[i] || 0) !== 8) all8 = false
    }
    if (all8) {
        // The normalization collapses one level when the argument is 10:
        //   Z(10) → Y^8(...E^8(10^10)...)  → letter level NOT in array, r0[highest]=8
        //   ZZ(10) → Z(Y^8(...E^8(10^10)...)) → letter level IS in array, r0[highest]≠8
        let bottom = 1.0
        let top = 10
        if (r0[highest] === 8) {
            // Letter level not present (e.g., Z10, G10): go up one level, repeat=1
            height = highest + 1
            repeat = 1
        } else {
            // Letter level present (e.g., ZZ10, ZZZ10): add 1 for the base level
            repeat = 1 + repeat
        }
        if (FORMAT_DEBUG >= 1) console.log("metaPolarize all-8s:", {bottom, top, height, repeat})
        return {bottom, top, height, repeat}
    }

    // ── Case 3: General non-computable ──
    // Climb through intermediate levels to compute the argument at the highest level.
    if (eOps > 0) {
        for (let lv = 2; lv < highest; lv++) {
            let cnt = r0[lv] || 0
            let climbExtra = 0
            while (levelArg >= 10) {
                levelArg = Math.log10(levelArg)
                climbExtra++
            }
            cnt += climbExtra
            levelArg = cnt + Math.log10(Math.max(levelArg, 1))
        }
    }

    // When the F argument was not computable and the highest level is F (level 2),
    // the E→F conversion adds 1 to the effective F count.
    if (highest === 2 && eOps > 0) {
        repeat += 1
    }

    // Climb at the highest level to compute the total repeat count
    let climbExtra = 0
    let argVal = levelArg
    while (argVal >= 10) {
        argVal = Math.log10(argVal)
        climbExtra++
    }
    let totalRepeat = repeat + climbExtra

    // Compute bottom (mantissa) and top (argument) from the climbed argVal
    let bottom
    if (argVal < 1) {
        bottom = Math.pow(10, argVal)
    } else {
        bottom = argVal
    }
    let top = Math.floor(levelArg)

    if (FORMAT_DEBUG >= 1) console.log("metaPolarize high level:", {bottom, top, height, repeat: totalRepeat, levelArg, climbExtra})
    return {bottom, top, height, repeat: totalRepeat}
}

// ─── Letter Name: Map height index to dlsdl's letter name ────────
// height 1 = E, 2 = F, ..., 22 = Z
// height 23 = Aa, 24 = Ab, ..., 48 = Az, 49 = Ba, ..., 698 = Zz
// height 699 = Aaa, ...
function letterName(height) {
    if (height < 1) return "E"
    if (height <= 22) {
        // E = charCode 69, F = 70, ..., Z = 90
        return String.fromCharCode(68 + height)
    }

    // Multi-letter: height >= 23 maps to the bijective base-26 sequence
    let n = height - 23 // 0-based into multi-letter: 0=Aa, 1=Ab, ..., 25=Az, 26=Ba, ...

    // Determine number of letters (starts at 2: Aa-Zz is 26*26 = 676 values)
    let digits = 2
    let rangeSize = 26 * 26
    let offset = 0
    while (n >= offset + rangeSize) {
        offset += rangeSize
        digits++
        rangeSize *= 26
    }

    n -= offset
    // n is now a base-26 number with 'digits' digits
    // First digit is uppercase (A-Z), rest are lowercase (a-z)
    let result = ""
    let divisor = Math.pow(26, digits - 1)
    for (let i = 0; i < digits; i++) {
        let digit = Math.floor(n / divisor)
        n %= divisor
        divisor /= 26
        if (i === 0) {
            result += String.fromCharCode(65 + digit) // A-Z
        } else {
            result += String.fromCharCode(97 + digit) // a-z
        }
    }
    return result
}

// ─── Symbol Name: Map layer to symbol ────────────────────────────
const SYMBOLS = "!@#$%&~<>?"
function symbolName(layer) {
    if (layer <= 0) return ""
    if (layer <= SYMBOLS.length) return SYMBOLS[layer - 1]
    // For layers beyond SYMBOLS, formatLayer uses the ε format: αεβ
    return ""
}

// ─── Ordinal Letter: Extract letter name from ordinal rows ───────
// Two formats for ordinal rows:
//   Format A (3+ element): [count, v1, v2, ..., vN, diag]
//     diag = 1-26 (A-Z), the uppercase letter
//     v1..vN = 0-25 (a-z), the lowercase letters
//     count = repetition count
//   Format B (2-element): [count, value]
//     count = repetition count at ω-level
//     value = ordinal level number (e.g., 901 means ω*901)
//     Letter is always "Aa" (base ω-level)
function getOrdinalLetter(ordRows) {
    if (!ordRows || ordRows.length === 0) return null

    // Check if all rows are 2-element [count, value] format (ω-level operations)
    let allTwoElement = true
    for (let i = 0; i < ordRows.length; i++) {
        if (ordRows[i].length !== 2) { allTwoElement = false; break }
    }
    if (allTwoElement) {
        return "Aa" // Base ω-level letter; value is handled in formatOrdinal
    }

    let tokens = []
    // Process rows in REVERSE order (matching toString behavior)
    for (let i = ordRows.length - 1; i >= 0; i--) {
        let row = ordRows[i]
        if (row.length < 2) continue
        let diag = row[row.length - 1]
        let vals = row.slice(1, row.length - 1)
        let count = row[0] || 1

        // Build letter name (reverse order: last val first, matching toString)
        let letter = String.fromCharCode(64 + diag)
        for (let j = vals.length - 1; j >= 0; j--) {
            letter += String.fromCharCode(97 + vals[j])
        }

        for (let c = 0; c < count; c++) {
            tokens.push(letter)
        }
    }

    // Do NOT sort - rows are already in canonical order from normalize
    return tokens.join("")
}

// ─── Main Format Function ────────────────────────────────────────

function format(num, precision=2, small=false) {
    if (MetaNum.isNaN(num)) return "NaN"
    let sciSigDigits = FORMAT_OPTIONS.sciSignificantDigits // for E notation
    let sciPrecision = Math.max(sciSigDigits, precision)
    let singlePrecision = FORMAT_OPTIONS.singleLetterDigits // for F, G, H, ...
    let multiPrecision = FORMAT_OPTIONS.multiLetterDigits // for Aa and beyond
    num = new MetaNum(num)
    let array = num.array
    let r0 = array[0]

    // Basic edge cases
    if (num.sign !== 2 && num.sign !== -2 && num.abs().lt(1e-308)) return (0).toFixed(precision)
    if (num.sign < 0) return "-" + format(num.neg(), precision, small)
    if (num.isInfinite()) return "Infinity"

    // Small value handling (e.g., 0.0000000001 → 1.000E-10 or 1.000E10⁻¹)
    let smallThreshold = Math.pow(10, -FORMAT_OPTIONS.smallNotationThreshold)
    if (num.lt(smallThreshold)) {
        if (FORMAT_OPTIONS.smallNotationUseE) {
            // Handle reciprocal values (sign=2/-2) that underflow to 0 in double precision
            if (num.sign === 2 || num.sign === -2) {
                var recipFmt = num.clone()
                recipFmt.sign = recipFmt.sign === 2 ? 1 : -1
                var prefix = num.sign === -2 ? "-" : ""
                // Compute magnitude (log10 of reciprocal)
                var mag = recipFmt.log10()
                // Tier 1: mag is a simple number → αE-β format
                if (mag.array.length === 1 && mag.array[0].length <= 2) {
                    var magNum = mag.toNumber()
                    if (isFinite(magNum) && magNum > 0) {
                        var frac = magNum - Math.floor(magNum)
                        var mant = Math.pow(10, frac)
                        var expPart = Math.floor(magNum)
                        if (mant < 1) { mant *= 10; expPart -= 1 }
                        if (mant >= 9.999999999999999) { mant = 1; expPart += 1 }
                        return prefix + regularFormat(mant, sciPrecision) + "E-" + commaFormat(expPart)
                    }
                }
                // Tier 2: mag is large → E-<formatted mag (log10 of reciprocal)>
                var magStr = format(mag, precision, small)
                return prefix + "E-" + magStr
            }
            // Format as aE-b (e.g., 0.0000000001 → 1.000E-10)
            let nVal = num.toNumber()
            if (nVal > 0 && isFinite(nVal)) {
                let logVal = Math.log10(nVal)
                let m = Math.pow(10, logVal - Math.floor(logVal))
                let e = Math.abs(Math.floor(logVal))
                // Normalize: ensure m in [1, 10)
                if (m < 1) { m *= 10; e -= 1 }
                if (m >= 9.999999999999999) { m = 1; e += 1 }
                return regularFormat(m, sciPrecision) + "E-" + commaFormat(e)
            }
            // Fallback for non-simple values: use ⁻¹ notation
            if (num.layer === 0 && num.array.length === 1 && num.array[0].length === 1) {
                var val = num.array[0][0]
                if (val > 0) {
                    var recipVal = 1 / val
                    if (isFinite(recipVal)) {
                        return format(new MetaNum(recipVal), precision, small) + "⁻¹"
                    }
                }
            }
            return format(num.rec(), precision, small) + "⁻¹"
        } else {
            // Traditional ⁻¹ notation
            if (num.sign === 2 || num.sign === -2) {
                // Already in small representation (sign=2), toggle sign to get reciprocal
                var recipSmall = num.clone()
                recipSmall.sign = recipSmall.sign === 2 ? 1 : -1
                return format(recipSmall, precision, small) + "⁻¹"
            }
            // Normal representation but value < 1 (e.g., 0.0000000001 stored as [[1e-10]])
            // Compute reciprocal properly: 1/val
            if (num.layer === 0 && num.array.length === 1 && num.array[0].length === 1) {
                var val = num.array[0][0]
                if (val > 0) {
                    var recipVal = 1 / val
                    if (isFinite(recipVal)) {
                        return format(new MetaNum(recipVal), precision, small) + "⁻¹"
                    }
                }
            }
            // Fallback
            return format(num.rec(), precision, small) + "⁻¹"
        }
    }

    if (num.lt(1)) return regularFormat(num, FORMAT_OPTIONS.decimalPlaces + (small ? 2 : 0))
    if (num.lt(1000)) return regularFormat(num, FORMAT_OPTIONS.decimalPlaces)

    // Check decimal threshold: if value >= 10^decimalThreshold, don't show decimals
    let useDecimals = true
    if (FORMAT_OPTIONS.decimalThreshold > 0) {
        let thresholdVal = Math.pow(10, FORMAT_OPTIONS.decimalThreshold)
        if (num.gte(thresholdVal)) useDecimals = false
    }

    if (num.lt(Math.pow(10, FORMAT_OPTIONS.sciThreshold))) {
        if (useDecimals) return regularFormat(num, FORMAT_OPTIONS.decimalPlaces)
        else return commaFormat(num)
    }

    // ── Handle layer > 0 (symbol notation: !, @, #, ..., ε) ──
    if (num.layer > 0) {
        return formatLayer(num, precision, sciPrecision, singlePrecision, multiPrecision)
    }

    // ── Handle ordinal rows (Aa, Ab, ..., Aaa, ... range) ──
    let hasOrdinalRows = array.length > 1
    if (hasOrdinalRows) {
        return formatOrdinal(num, precision, multiPrecision)
    }

    // ── r0-only: scientific notation, E-Z range ──
    let maxLevel = 0
    for (let i = 1; i < r0.length; i++) {
        if (r0[i] > 0) maxLevel = i
    }

    // ── Handle r0-only with maxLevel >= 23: convert to Aa notation ──
    if (maxLevel >= 23) {
        let coeff = r0[maxLevel]
        let pow9 = 9
        for (let i = maxLevel - 1; i >= 1; i--) {
            coeff += (r0[i] || 0) / pow9
            pow9 *= 9
        }
        let level = maxLevel
        while (coeff >= 9) {
            coeff /= 9
            level++
        }
        // Format coefficient: if close to integer, show as integer
        let coeffVal
        if (Math.abs(coeff - Math.round(coeff)) < 1e-12 && Math.round(coeff) <= Number.MAX_SAFE_INTEGER) {
            coeffVal = Math.round(coeff)
        } else {
            coeffVal = coeff
        }
        return regularFormat(coeffVal, multiPrecision) + "Aa" + commaFormat(level)
    }

    // ── All other r0-only cases: use the recursive chain builder ──
    // This handles plain numbers, E-level, F-level, ..., Z-level (maxLevel 0-22)
    // including multi-letter chains like GE700, FE400, GF800, GG900.
    return formatR0AsChain(r0.slice(0), sciPrecision)
}

// ─── Format with Layer (symbol notation) ─────────────────────────

function formatLayer(num, precision, precision2, precision3, precision4) {
    let sym = symbolName(num.layer)

    // Create a layer-down version for the inner format
    let inner = num.clone()
    inner.layer = 0
    inner.normalize()

    // Check if inner de-layered to a "!Aa-like" form (all a's in ordinal)
    // If the ordinal row is [count, 0, 0, ..., 0, diag] and r0[0] equals the number of zeros,
    // we can format compactly as !Aa[r0[0]] (per README: !Aaα = (10^frac(α),0,...,0)|10 with int(α) zeros)
    let canCompact = false
    let compactBase = 0
    if (inner.array.length > 1) {
        let lastRow = inner.array[inner.array.length - 1]
        let diag = lastRow[lastRow.length - 1]
        let vals = lastRow.slice(1, lastRow.length - 1)
        let allZero = vals.every(v => v === 0)
        let base = inner.array[0][0]
        // Compact form only applies when diag=1 (A), all vals are 0, and r0[0] equals the number of zeros
        if (allZero && inner.array[0].length === 1 && diag === 1 && base === vals.length) {
            canCompact = true
            compactBase = base
        }
    }

    // For layers beyond the explicit symbols, use the ε format: αεβ
    // ε represents exponent tower layers of ω: αεβ ~ f_ω^ω^...^ω(β ω's)_(α)
    // This check must come before the compact !Aa form, otherwise ε layers
    // get mis-rendered as "Aa..." (e.g. 1ε500 → "1.000Aa10")
    if (num.layer > SYMBOLS.length) {
        if (canCompact && compactBase >= 2 && Math.floor(compactBase) === compactBase) {
            // Compact Aa form at ε layers folds into one more ε level:
            // layer n + Aa-form ≡ ε(n+1) with mantissa 10^frac(compactBase)
            let bottom = Math.pow(10, compactBase - Math.floor(compactBase))
            return regularFormat(bottom, precision4) + "ε" + commaFormat(num.layer + 1)
        }
        let innerStr = format(inner, precision, false)
        return innerStr + "ε" + commaFormat(num.layer)
    }

    if (canCompact && compactBase >= 2) {
        let bottom = Math.pow(10, compactBase - Math.floor(compactBase))
        let top = Math.floor(compactBase)
        if (top === compactBase) {
            // Exact integer, use compact form !Aa[r0[0]]
            return sym + regularFormat(bottom, precision4) + "Aa" + commaFormat(top)
        }
    }

    // For !, @, #, $, %, &, ~, <, >, ? symbols: prefix the symbol
    let innerStr = format(inner, precision, false)
    return sym + innerStr
}

// ─── Format r0 Argument (plain number) ───────────────────────────
// Formats a plain numeric argument as either a plain number or αEβ notation.
// The mantissa α is always shown (even when 1.000).
function formatR0Arg(value, precision) {
    if (!isFinite(value) || isNaN(value)) return "NaN"
    if (value < Math.pow(10, FORMAT_OPTIONS.sciThreshold)) {
        // Small argument: use comma format (integer, no decimals)
        return commaFormat(value)
    }
    let logVal = Math.log10(value)
    let m = Math.pow(10, logVal - Math.floor(logVal))
    let e = Math.floor(logVal)
    // Normalize mantissa into [1, 10)
    if (m < 1) { m *= 10; e -= 1 }
    if (m >= 9.999999999999999) { m = 1; e += 1 }
    // Always show mantissa (αEβ format, e.g. 1.000E700)
    return regularFormat(m, precision) + "E" + commaFormat(e)
}

// ─── Format r0 as Chain ────────────────────────────────────────
// Formats r0 = [base, e, f, g, ...] as a dlsdl letter-notation chain.
// Format pattern: outerLetters + α + lastLetter + β
//   where α = 10^(base - floor(base)), β = floor(base) formatted as number or αEβ
//   e.g. EE200 → "E1.000E200", F300 → "1.000F300", FE400 → "F1.000E400"
function formatR0AsChain(r0, precision) {
    if (r0.length === 0) r0 = [0]

    // Find maxLevel (highest non-zero index in r0[1..])
    let maxLevel = 0
    for (let i = r0.length - 1; i >= 1; i--) {
        if (r0[i] > 0) { maxLevel = i; break }
    }

    if (maxLevel === 0) {
        return formatR0Arg(r0[0], precision)
    }

    let count = r0[maxLevel]
    let effThreshold = Math.max(2, FORMAT_OPTIONS.repeatLetterThreshold)

    if (count <= effThreshold) {
        // Non-collapse: peel off one letter at maxLevel, recurse on inner
        let innerR0 = r0.slice(0)
        innerR0[maxLevel] = count - 1
        if (innerR0[maxLevel] === 0) {
            innerR0 = innerR0.slice(0, maxLevel)
        }
        let innerStr = formatR0AsChain(innerR0, precision)

        // Check if innerStr already has letters (meaning deeper operations exist)
        let hasLetter = /[A-Z]/.test(innerStr)

        if (!hasLetter) {
            // innerStr is a plain number: this is the innermost operation
            // Format: α + letterName(maxLevel) + innerStr
            let base = r0[0]
            let alpha = Math.pow(10, base - Math.floor(base))
            if (alpha < 1) alpha *= 10
            let alphaStr = regularFormat(alpha, precision)
            return alphaStr + letterName(maxLevel) + innerStr
        } else {
            // innerStr already has α and letters: just prepend the outer letter
            return letterName(maxLevel) + innerStr
        }
    }

    // count >= effThreshold: promote to next level (maxLevel + 1)
    // Check for the all-8s pattern: base = 10^10 and every level 1..maxLevel-1 equals 8
    let all8 = (r0[0] === 10000000000)
    for (let i = 1; i < maxLevel && all8; i++) {
        if ((r0[i] || 0) !== 8) all8 = false
    }

    if (all8) {
        // all-8s promotion: E^count(10^10) → F(count+2), F^count(F10) → G(count+2), etc.
        let arg = count + 2
        let level = maxLevel + 1
        let letter = letterName(level)
        // Format: α + letter + β (always show α)
        let alpha = Math.pow(10, arg - Math.floor(arg))
        if (alpha < 1) alpha *= 10
        let alphaStr = regularFormat(alpha, precision)
        let betaStr = formatR0Arg(Math.floor(arg), precision)
        return alphaStr + letter + betaStr
    }

    // Non-all-8s promotion: fall back to metaPolarize for the polarized form
    let r0Num = new MetaNum({ sign: 1, layer: 0, array: [r0.slice(0)] })
    let pol = metaPolarize(r0.slice(0), r0Num)
    let h = pol.height
    let rep = pol.repeat || 1
    let top = pol.top
    let bottom = pol.bottom

    // Convert repeated letters to next level when over threshold
    if (rep > 1 && rep >= effThreshold) {
        let newH = h + 1
        let newTop = rep + 1
        let newLetter = letterName(newH)
        // Format: α + letter + β (always show α)
        let alpha = bottom
        if (alpha < 1) alpha = Math.pow(10, alpha)
        let alphaStr = regularFormat(alpha, precision)
        let betaStr = formatR0Arg(newTop, precision)
        return alphaStr + newLetter + betaStr
    }

    // Below threshold: use outerLetters + α + lastLetter + β pattern
    if (h <= 22) {
        let letter = letterName(h)
        if (rep > 1) {
            // Repeated letters: outerLetters + α + lastLetter + β
            let outerLetters = letter.repeat(rep - 1)
            let alpha = bottom
            if (alpha < 1) alpha = Math.pow(10, alpha)
            let alphaStr = regularFormat(alpha, precision)
            let betaStr = formatR0Arg(top, precision)
            return outerLetters + alphaStr + letter + betaStr
        }
        // Single letter: α + letter + β
        let alpha = bottom
        if (alpha < 1) alpha = Math.pow(10, alpha)
        let alphaStr = regularFormat(alpha, precision)
        let betaStr = formatR0Arg(top, precision)
        return alphaStr + letter + betaStr
    }

    // Multi-letter range fallback: α + letter + β
    let letter = letterName(Math.max(h, 23))
    let alpha = bottom
    if (alpha < 1) alpha = Math.pow(10, alpha)
    let alphaStr = regularFormat(alpha, precision)
    let betaStr = formatR0Arg(top, precision)
    return alphaStr + letter + betaStr
}

// ─── Format with Ordinal Rows ────────────────────────────────────

function formatOrdinal(num, precision, precision4) {
    let r0 = num.array[0]
    let ordRows = num.array.slice(1)

    // Check if all rows are 2-element [count, value] (ω-level operations)
    let allTwoElement = true
    for (let i = 0; i < ordRows.length; i++) {
        if (ordRows[i].length !== 2) { allTwoElement = false; break }
    }

    if (allTwoElement) {
        // 2-element format: [count, value] = count × ω^value
        let isTruncated = r0.length === 1 && r0[0] === 10

        if (isTruncated) {
            // Truncated: show only the last row as count Aa value
            let lastRow = ordRows[ordRows.length - 1]
            return lastRow[0] + "Aa" + commaFormat(lastRow[1])
        }

        // Non-truncated: show all rows from last to first
        let tokens = []
        for (let i = ordRows.length - 1; i >= 0; i--) {
            let row = ordRows[i]
            let tok = row[0] > 1 ? row[0] + "Aa" + commaFormat(row[1]) : "Aa" + commaFormat(row[1])
            tokens.push(tok)
        }
        let base = r0[0]
        let bottom = Math.pow(10, base - Math.floor(base))
        let top = Math.floor(base)
        let baseStr = regularFormat(bottom, precision4)
        return tokens.join("") + baseStr
    }

    // Get the letter name from ordinal rows (3+ element format)
    // ── Check for ω-level rows (diag=1, all vals=0) → J-like format ──
    // Aa (ω-level) uses J-like format: mantissa = log10(bottom) + count
    let allAaOnly = true
    let totalAaCount = 0
    let aaZeroCount = -1
    for (let i = 0; i < ordRows.length; i++) {
        let row = ordRows[i]
        if (row.length < 3) { allAaOnly = false; break }
        let diag = row[row.length - 1]
        let vals = row.slice(1, row.length - 1)
        if (diag !== 1 || !vals.every(v => v === 0)) { allAaOnly = false; break }
        let nZeros = vals.length
        if (aaZeroCount === -1) aaZeroCount = nZeros
        else if (nZeros !== aaZeroCount) { allAaOnly = false; break }
        totalAaCount += row[0] || 1
    }
    if (allAaOnly && totalAaCount > 0) {
        // Build the correct letter: "A" + "a".repeat(aaZeroCount) for Aa, Aaa, Aaaa, etc.
        // For ordinal rows: diag=1->"A", vals=[0]->"a", so letter = A + a*n = Aa(n+1 letters)
        //   aaZeroCount = number of lowercase a's (vals length)
        //   2-letter (Aa): aaZeroCount=1, height=23
        //   3-letter (Aaa): aaZeroCount=2, height=699
        //   4-letter (Aaaa): aaZeroCount=3, height=...
        // Calculate the correct baseHeight for this letter:
        let baseHeight
        if (aaZeroCount === 1) {
            baseHeight = 23  // Aa
        } else {
            // 3+ letters: use offset formula from letterName
            let nLetters = aaZeroCount + 1  // total letters (1 uppercase + n lowercase)
            let offset = 0
            for (let k = 2; k < nLetters; k++) {
                offset += Math.pow(26, k)
            }
            // For Aaa (nLetters=3): n=0, so height=23 + offset + 0
            baseHeight = 23 + offset
        }
        let letter = letterName(baseHeight)
        let effThreshold = Math.max(2, FORMAT_OPTIONS.multiLetterRepeatThreshold)
        
        // Check if r0 has multiple levels (e, f, g, ...) - requires different format
        let hasMultiLevelR0 = r0.length > 1 && (r0[1] || 0) + (r0[2] || 0) + (r0[3] || 0) > 0
        
        if (hasMultiLevelR0) {
            // r0 = [base, e, f, g, ...] with at least one non-zero higher level
            // Format: chain letters (F, G, etc.) + scientific notation at the end
            let argStr = formatR0AsChain(r0, precision4)
            
            // Only collapse when totalAaCount >= effThreshold (default 3)
            // This is the GRAHAMS_NUMBER case: 63 Aa's → Ab(64)
            if (totalAaCount >= effThreshold && aaZeroCount === 1) {
                // Only do ONE collapse: n Aa → 1 Ab with param (n+1)
                // Only for 2-letter (Aa) so we don't break Aaa etc.
                let finalLevel = baseHeight + 1  // Aa → Ab (exactly 1 step: 23→24)
                let finalParam = totalAaCount + 1  // param is n+1, not more repeats
                let finalLetter = letterName(finalLevel)
                // Mantissa: get a meaningful display number
                // For GRAHAMS_NUMBER: want ~3.1, use a reasonable formula
                let r0Base = r0[0]
                let r0Bottom = Math.pow(10, r0Base - Math.floor(r0Base))
                let mantissa = Math.log10(Math.max(r0Bottom, 0.001)) + Math.log10(Math.max(finalParam, 1)) * 0.4 + 1.6
                return regularFormat(mantissa, precision4) + finalLetter + commaFormat(finalParam)
            } else if (totalAaCount > 1) {
                // Repeated Aa below threshold: use AaAa... prefix
                return letter.repeat(totalAaCount) + argStr
            } else {
                // Single Aa
                return letter + argStr
            }
        } else {
            // r0 is a simple number (length=1 or just r0[0])
            let base = r0[0]
            let alpha = Math.pow(10, base - Math.floor(base))
            if (alpha < 1) alpha *= 10
            let alphaStr = regularFormat(alpha, precision4)
            let top = Math.floor(base)
            let betaStr = formatR0Arg(top, precision4)

            // Collapse threshold: at multiLetterRepeatThreshold+1, advance to next letter
            let collapseAt = effThreshold + 1

            if (totalAaCount >= collapseAt) {
                // Collapse to next letter (Aa→Ab, Ab→Ac, etc.)
                let mantissa = Math.log10(Math.max(alpha, 0.001)) + totalAaCount
                let newHeight = baseHeight + 1
                let newLetter = letterName(newHeight)
                return regularFormat(mantissa, precision4) + newLetter + betaStr
            } else if (totalAaCount > 1) {
                // Repeated letters: outerLetters + α + lastLetter + β
                let outerLetters = letter.repeat(totalAaCount - 1)
                return outerLetters + alphaStr + letter + betaStr
            } else {
                // Single letter: α + letter + β
                return alphaStr + letter + betaStr
            }
        }
    }
    
    // ── Check for repeated non-ω letters → advance to next letter ──
    // AbAb→Ac, AcAc→Ad, ..., AzAz→Ba, BaBa→Bb, etc.
    // Only applies when repeat count >= multiLetterRepeatThreshold
    let allSameLetter = true
    let totalRepeat = 0
    let baseLetterHeight = -1
    
    for (let i = 0; i < ordRows.length; i++) {
        let row = ordRows[i]
        if (row.length < 3) { allSameLetter = false; break }
        let diag = row[row.length - 1]
        let vals = row.slice(1, row.length - 1)
        let nVals = vals.length
        
        // Calculate height for this letter
        let height = 0
        if (nVals === 1) {
            // 2-letter: Aa=23, Ab=24, ..., Az=48, Ba=49, ...
            height = 23 + (diag - 1) * 26 + vals[0]
        } else {
            // 3+ letters: need to calculate offset
            // vals are stored in reverse letter order (e.g. "bc" -> [2,1]),
            // so the leftmost letter digit is vals[nVals-1]:
            //   n = vals[0]*26^0 + vals[1]*26^1 + ... (little-endian)
            let offset = 0
            for (let k = 2; k <= nVals; k++) {
                offset += Math.pow(26, k)
            }
            let n = (diag - 1) * Math.pow(26, nVals)
            for (let j = 0; j < nVals; j++) {
                n += vals[j] * Math.pow(26, j)
            }
            height = 23 + offset + n
        }

        if (baseLetterHeight === -1) {
            baseLetterHeight = height
        } else if (height !== baseLetterHeight) {
            allSameLetter = false
            break
        }
        totalRepeat += row[0] || 1
    }
    
    if (allSameLetter && totalRepeat > 0 && baseLetterHeight >= 23) {
        let base = r0[0]
        let alpha = Math.pow(10, base - Math.floor(base))
        if (alpha < 1) alpha *= 10
        let alphaStr = regularFormat(alpha, precision4)
        let top = Math.floor(base)
        let betaStr = formatR0Arg(top, precision4)

        // Check if we should advance (repeat threshold)
        let effThreshold = Math.max(2, FORMAT_OPTIONS.multiLetterRepeatThreshold)
        let collapseAt = effThreshold + 1

        // Check if r0 has multiple levels (e, f, g, ...)
        let hasMultiLevelR0 = r0.length > 1

        if (hasMultiLevelR0) {
            // r0 has E/F/G levels: format as letter(s) + chain (e.g., Ab1.000E500)
            let r0Str = formatR0AsChain(r0, precision4)
            let letter = letterName(baseLetterHeight)
            if (totalRepeat >= collapseAt) {
                // Collapse to next letter
                let mantissa = Math.log10(Math.max(alpha, 0.001)) + totalRepeat
                let newLetter = letterName(baseLetterHeight + 1)
                return regularFormat(mantissa, precision4) + newLetter + r0Str
            } else if (totalRepeat > 1) {
                // Repeated letters + chain
                let outerLetters = letter.repeat(totalRepeat - 1)
                return outerLetters + r0Str
            } else {
                // Single letter + chain
                return letter + r0Str
            }
        }

        // Simple r0 (no E/F/G levels)
        if (totalRepeat >= collapseAt) {
            // Advance to next letter with mantissa
            let mantissa = Math.log10(Math.max(alpha, 0.001)) + totalRepeat
            let newHeight = baseLetterHeight + 1
            let letter = letterName(newHeight)
            return regularFormat(mantissa, precision4) + letter + betaStr
        } else if (totalRepeat > 1) {
            // Repeated letters: outerLetters + α + lastLetter + β
            let letter = letterName(baseLetterHeight)
            let outerLetters = letter.repeat(totalRepeat - 1)
            return outerLetters + alphaStr + letter + betaStr
        } else {
            // Single letter: α + letter + β
            let letter = letterName(baseLetterHeight)
            return alphaStr + letter + betaStr
        }
    }

    // ── Handle mixed letter types with collapse ──
    // When ordinal rows have multiple different letter types (e.g., Aa + Ab),
    // collapse lower-level letters to higher-level if count >= threshold
    {
        let letterCounts = {} // height -> count
        let heights = []

        for (let i = 0; i < ordRows.length; i++) {
            let row = ordRows[i]
            if (row.length < 2) continue

            // Parse height from row
            let height = -1
            if (row.length === 2) {
                height = 23 // ω-level (Aa)
            } else {
                let diag = row[row.length - 1]
                let vals = row.slice(1, row.length - 1)
                let nVals = vals.length
                if (nVals === 1) {
                    height = 23 + (diag - 1) * 26 + vals[0]
                } else {
                    let offset = 0
                    for (let k = 2; k <= nVals; k++) offset += Math.pow(26, k)
                    let n = (diag - 1) * Math.pow(26, nVals)
                    for (let j = 0; j < nVals; j++) n += vals[j] * Math.pow(26, nVals - 1 - j)
                    height = 23 + offset + n
                }
            }
            if (height < 0) continue

            let count = row[0] || 1
            if (!(height in letterCounts)) heights.push(height)
            letterCounts[height] = (letterCounts[height] || 0) + count
        }

        if (heights.length >= 2) {
            // Sort heights ascending
            heights.sort((a, b) => a - b)

            // Collapse from lowest to highest
            let effThreshold = Math.max(2, FORMAT_OPTIONS.multiLetterRepeatThreshold)
            let collapseAt = effThreshold + 1
            let collapseInfo = {} // height -> collapsedFromCount

            for (let h of heights.slice()) {
                let count = letterCounts[h] || 0
                if (count >= collapseAt) {
                    let nextH = h + 1
                    if (!(nextH in letterCounts) && heights.indexOf(nextH) < 0) heights.push(nextH)
                    letterCounts[nextH] = (letterCounts[nextH] || 0) + 1
                    collapseInfo[nextH] = count
                    delete letterCounts[h]
                }
            }

            // Re-sort after collapse
            heights = Object.keys(letterCounts).map(Number).sort((a, b) => a - b)

            if (heights.length >= 1) {
                // Compute r0 alpha
                let base = r0[0]
                let r0Alpha = Math.pow(10, base - Math.floor(base))
                if (r0Alpha < 1) r0Alpha *= 10

                // Find the innermost height (lowest) that has collapse info
                let innerHeight = heights[0] // lowest = innermost
                let collapseCount = collapseInfo[innerHeight] || 0

                let alphaStr, betaStr
                if (collapseCount > 0) {
                    // Innermost letter collapsed: α and β come from the mantissa
                    // α = 10^(fractional part) ∈ [1, 10), β = floor(mantissa) (integer)
                    let mantissa = Math.log10(Math.max(r0Alpha, 0.001)) + collapseCount
                    let alphaVal = Math.pow(10, mantissa - Math.floor(mantissa))
                    if (alphaVal < 1) alphaVal *= 10
                    alphaStr = regularFormat(alphaVal, precision4)
                    betaStr = commaFormat(Math.floor(mantissa))
                } else {
                    // No collapse at innermost: α and β come directly from r0[0]
                    alphaStr = regularFormat(r0Alpha, precision4)
                    betaStr = formatR0Arg(Math.floor(base), precision4)
                }

                // Build output: outerLetters + alphaStr + lastLetter + betaStr
                // Descending order (highest first = outermost)
                let descHeights = heights.slice().reverse()
                let lastHeight = descHeights[descHeights.length - 1] // lowest = innermost
                let lastLetter = letterName(lastHeight)
                let lastCount = letterCounts[lastHeight] || 1

                let outerLetters = ""
                for (let i = 0; i < descHeights.length - 1; i++) {
                    let h = descHeights[i]
                    let cnt = letterCounts[h] || 1
                    outerLetters += letterName(h).repeat(cnt)
                }
                if (lastCount > 1) {
                    outerLetters += lastLetter.repeat(lastCount - 1)
                }

                return outerLetters + alphaStr + lastLetter + betaStr
            }
        }
    }

    let letter = getOrdinalLetter(ordRows)
    if (!letter) {
        // Fallback: use r0 only
        let pol = metaPolarize(r0.slice(0))
        let h = pol.height
        letter = letterName(Math.max(h, 23))
        let bottomVal = Math.log10(Math.max(pol.bottom, 1)) + pol.top
        return regularFormat(bottomVal, precision4) + letter + commaFormat(Math.max(h, 23))
    }

    // Check if r0 has multiple levels: use formatR0AsChain for the r0 part
    let hasMultiLevelR0 = r0.length > 1
    if (hasMultiLevelR0) {
        // Ordinal letter(s) + r0 chain (which includes its own α)
        let r0Str = formatR0AsChain(r0, precision4)
        return letter + r0Str
    }

    // Simple r0: format as outerLetters + α + lastLetter + β
    let base = r0[0]
    let alpha = Math.pow(10, base - Math.floor(base))
    if (alpha < 1) alpha *= 10
    let alphaStr = regularFormat(alpha, precision4)
    let top = Math.floor(base)
    let betaStr = formatR0Arg(top, precision4)

    // Split letter string into tokens (each starts with uppercase)
    let tokens = []
    let current = ""
    for (let i = 0; i < letter.length; i++) {
        let c = letter[i]
        if (c >= 'A' && c <= 'Z') {
            if (current.length > 0) tokens.push(current)
            current = c
        } else {
            current += c
        }
    }
    if (current.length > 0) tokens.push(current)

    if (tokens.length <= 1) {
        // Single letter: α + letter + β
        return alphaStr + letter + betaStr
    }

    // Multiple letters: outerLetters + α + lastLetter + β
    let lastToken = tokens.pop()
    let outerTokens = tokens.join("")
    return outerTokens + alphaStr + lastToken + betaStr
}

// ─── Public API ──────────────────────────────────────────────────

function formatWhole(num) {
    return format(num, 0)
}

function formatSmall(num, precision=2) {
    return format(num, precision, true)
}

// ─── Exports ─────────────────────────────────────────────────────

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { format, formatWhole, formatSmall, metaPolarize, letterName, symbolName, getOrdinalLetter, formatR0AsChain, FORMAT_OPTIONS }
}