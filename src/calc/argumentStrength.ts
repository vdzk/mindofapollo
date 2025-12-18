export interface Premise {
  invert: boolean,
  confidence: number
}

export const calcArgumentStrength = (premises: Premise[]) => {
  if (premises.length === 0) return 0
  let strength = 1
  for (const premise of premises) {
    const { invert, confidence } = premise
    strength *= invert ? (1 - confidence) : confidence
  }
  return strength
}