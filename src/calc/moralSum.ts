import { DataRecordWithId } from "~/schema/type"
import { indexBy } from "~/utils/shape"

export function calcMoralSum(
  consequences: DataRecordWithId[],
  weights: DataRecordWithId[]
) {
  const weighsByGoodId = indexBy(weights, 'moral_good_id')
  let overlap = false
  let sum = 0
  const sideSums: [number, number] = [0, 0]
  const weightedValues: Record<number, number> = {}

  for (const consequence of consequences) {
    const moralWeight = weighsByGoodId[consequence.moral_good_id as number]
    if (!moralWeight) continue
    overlap = true
    const weight = moralWeight.weight as number
    const colType = consequence.column_type
    let weightedValue = 0
    if (colType === 'boolean') {
      if (consequence.value) {
        weightedValue = weight
      }
    } else if (colType === 'integer' || colType === 'weight') {
      weightedValue = weight * (consequence.value as number)
    }
    sum += weightedValue
    sideSums[Number(consequence.pro)] += weightedValue

    weightedValues[consequence.id] = weightedValue
  }
  return { sum, sideSums, overlap, weightedValues }
}
