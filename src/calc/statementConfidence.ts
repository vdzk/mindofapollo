// Requirements for calcStatementConfidence c():
// c([[x/2, x/2], [x]]]) > 0.5
// c([[x], [1]]) = 1  for x < 1
// c([[1], [x]]) = 0  for x < 1
// c([[x], [y]]) < c([[], [y]])
// c(a, b) + c(b, a) = 1
// as soon as the strength of any con argument edges ever closer to absolute certainty (1.0), the overall confidence in the statement must slide smoothly and monotonically toward 0—-we’re after a continuous “approaches 0” behaviour, not a one-off hard cut only when the strength is exactly 1.
// confidence raises linearly with argument strength
const inRange = (x: number) => x >= 0 && x <= 1;

export const calcProbSuccess = (strengths: number[]) => 1 - strengths.reduce((prod, strength) => prod * (1 - strength), 1);

export function calcStatementConfidence(
  [consRaw, prosRaw]: [number[], number[]]
): number {
  const pros = prosRaw.filter(inRange);
  const cons = consRaw.filter(inRange);

  const P = calcProbSuccess(pros);
  const C = calcProbSuccess(cons);

  if (P === 1 && C === 1) return 0.5;

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
  const h = (P - C) / (1 - P * C); // antisymmetric, bounded in [–1,1]
  return 0.5 + 0.5 * h; // 0 ≤ confidence ≤ 1
}
