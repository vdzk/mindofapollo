

// Requirements for calcStatementConfidence c():
// c([[x/2, x/2], [x]]]) > 0.5
// c([[x], [1]]) = 1  for x < 1
// c([[1], [x]]) = 0  for x < 1
// c([[x], [y]]) < c([[], [y]])
// c(a, b) + c(b, a) = 1

const inRange = (x: number) => x >= 0 && x <= 1

export function calcStatementConfidence(
  [consRaw, prosRaw]: [number[], number[]]
): number {
  const pros = prosRaw.filter(inRange)
  const cons = consRaw.filter(inRange)

  // s = 1 ⇒ absolute certainty
  const proCertain = pros.some(s => s === 1)
  const conCertain = cons.some(s => s === 1)
  if (proCertain && conCertain) return 0.5
  if (proCertain) return 1
  if (conCertain) return 0

/* --------------------------------------------------------------
   From individual strengths to a single confidence score
   --------------------------------------------------------------
   1. Weight of one argument        w(s) = −ln(1 − s)
        • 0 ≤ s < 1  →  0 ≤ w < ∞      (stronger s ⇒ larger weight)
        • Interprets an argument as “information against its own failure”.
        • Weights add because information in nats is additive.

   2. Net evidence                  diff = Σ w(pros) − Σ w(cons)
        • Positive diff → pros dominate, negative → cons dominate.

   3. Probability                   p = 1 / (1 + e^(−diff))
        • Logistic turns log-odds into a bounded 0–1 probability.
        • Symmetric: swapping pros/cons flips p ↔ 1 − p.
        • |diff| → ∞ pushes p to 0 or 1 automatically.

   Assumptions: arguments are independent; prior belief is 0.5.
   -------------------------------------------------------------- */

  const weight = (s: number) => -Math.log(1 - s)

  const diff =
    pros.reduce((sum, s) => sum + weight(s), 0) -
    cons.reduce((sum, s) => sum + weight(s), 0)

  return 1 / (1 + Math.exp(-diff))
}

function createTriangularRandomGenerator(a: number, m: number, b: number) {
  // Pre-calculate constants
  const range = b - a;
  const leftRange = m - a;
  const rightRange = b - m;
  const modeFactor = leftRange / range;

  // Return a function that generates random samples
  return function() {
      const u = Math.random();
      if (u < modeFactor) {
          // Sample from the lower segment
          return a + Math.sqrt(u * range * leftRange);
      } else {
          // Sample from the upper segment
          return b - Math.sqrt((1 - u) * range * rightRange);
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