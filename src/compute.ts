//https://docs.google.com/spreadsheets/d/1lwBvNssVy33m0RcAOSJx_n_w56ZnhgSOpOMJ1PdiRio/edit?gid=880944073#gid=880944073
export const calcQuestionConfidence = (argStrengths: [number[], number[]]) => {
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
  const confidence = proConf / (proConf + conConf)
  return confidence
}