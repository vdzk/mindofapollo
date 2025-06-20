

// Requirements for calcStatementConfidence c():
// c([[x/2, x/2], [x]]]) > 0.5
// c([[x], [1]]) = 1  for x < 1
// c([[1], [x]]) = 0  for x < 1
// c([[x], [y]]) < c([[], [y]])
// c(a, b) + c(b, a) = 1
// as soon as the strength of any con argument edges ever closer to absolute certainty (1.0), the overall confidence in the statement must slide smoothly and monotonically toward 0—-we’re after a continuous “approaches 0” behaviour, not a one-off hard cut only when the strength is exactly 1.
// confidence raises linearly with argument strength

const inRange = (x: number) => x >= 0 && x <= 1

export const calcProbSuccess = (strengths: number[]) =>
  1 - strengths.reduce((prod, strength) => prod * (1 - strength), 1)

export function calcStatementConfidence(
  [consRaw, prosRaw]: [number[], number[]]
): number {
  const pros = prosRaw.filter(inRange)
  const cons = consRaw.filter(inRange)

  const P = calcProbSuccess(pros)
  const C = calcProbSuccess(cons)

  if (P === 1 && C === 1) return 0.5

  /*
    Step 1: start with the obvious antisymmetric core
    h₀ = P – C
    (swapping P↔C flips the sign, nice and simple).

    Problem:  If the con side becomes virtually certain ( C → 1 ) while the pro side is still less than certain ( P < 1 ), the simple difference h₀ = P − C tends toward P − 1, which is still above −1.
      So confidence bottoms out above 0.
      We want it to slide all the way to 0.

    Step 2: scale the difference by a factor that
      • is 1 when the other side is silent   (keeps linear rise)
      • grows as P and C grow together       (lets near-certainty dominate)
      • stays symmetric                      (g(P,C)=g(C,P))
  */

  const h = (P - C) / (1 - P * C)      // antisymmetric, bounded in [–1,1]
  return 0.5 + 0.5 * h                 // 0 ≤ confidence ≤ 1
}

function createTriangularRandomGenerator(a: number, m: number, b: number) {
  // Pre-calculate constants
  const range = b - a
  const leftRange = m - a
  const rightRange = b - m
  const modeFactor = leftRange / range

  // Return a function that generates random samples
  return function () {
    const u = Math.random()
    if (u < modeFactor) {
      // Sample from the lower segment
      return a + Math.sqrt(u * range * leftRange)
    } else {
      // Sample from the upper segment
      return b - Math.sqrt((1 - u) * range * rightRange)
    }
  };
}

export interface WeightedArgument {
  id: number,
  title: string,
  pro: boolean,
  weight_lower_limit: number,
  weight_mode: number,
  weight_upper_limit: number
}

export const calcStatementConfidenceAdditively = (
  weightedArguments: WeightedArgument[],
  threshold: number = 0
) => {
  const generators = weightedArguments.map(
    wArg => {
      const side = wArg.pro ? 1 : -1
      return createTriangularRandomGenerator(
        side * wArg.weight_lower_limit,
        side * wArg.weight_mode,
        side * wArg.weight_upper_limit
      )
    }
  )
  const n = 1000
  let hits = 0
  for (let i = 0; i < n; i++) {
    let totalWeight = 0
    for (const generator of generators) {
      totalWeight += generator()
    }
    if (totalWeight > threshold) {
      hits++
    }
  }
  return hits / n
}