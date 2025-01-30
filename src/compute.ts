//https://docs.google.com/spreadsheets/d/1lwBvNssVy33m0RcAOSJx_n_w56ZnhgSOpOMJ1PdiRio/edit?gid=880944073#gid=880944073
export const calcStatementConfidence = (argStrengths: [number[], number[]]) => {
  const argConfidences = argStrengths.map(
    strengths => strengths.map(strength => (strength + 1) / 2)
  )
  const sideConfidences = argConfidences.map(
    confidences => {
      if (confidences.length === 0) {
        return 0.5
      } else {
        return 1 - confidences.reduce(
          (product, current) => product * (1 - current)
        , 1)
      }
    }
  )
  const [conConf, proConf] = sideConfidences
  const conTotalConf = conConf * (1 - proConf)
  const proTotalConf = proConf * (1 - conConf)
  const confidence = proTotalConf / (proTotalConf + conTotalConf)
  return confidence
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
  pro: boolean,
  weight_lower_limit: number,
  weight_mode: number,
  weight_upper_limit: number
}

export const calcStatementConfidenceAdditively = (
  weightedArguments: WeightedArgument[]
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
    if (totalWeight > 0) {
      hits++
    }
  }
  return hits / n
}