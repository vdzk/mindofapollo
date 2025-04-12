const getAllFailProb = (confidences: number[]) =>
  confidences.reduce((product, c) => product * (1 - c), 1)

export const calcStatementConfidence = (argConfidences: [number[], number[]]) => {
  // Scenario 1: pro side tries to succeed
  const pAllProFail = getAllFailProb(argConfidences[1])
  const pAllConFail = getAllFailProb(argConfidences[0])
  // const pProTrySuccess = (1 - pAllProFail) * pAllConFail

  // Scenario 2: con side tries to succeed
  // const pConTrySuccess = (1 - pAllConFail) * pAllProFail

  // Flip a coin beween the two scenarios
  // const pProWin = (pProTrySuccess + (1 - pConTrySuccess)) / 2

  // Use algebra to substitute and simplify the formula above 
  const pProWin = (1 - pAllProFail + pAllConFail) / 2

  return pProWin
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