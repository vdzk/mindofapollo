import { createAsync } from "@solidjs/router"
import { Component, createMemo } from "solid-js"
import { listConsequencesCache, listForeignRecordsCache, listOwnRecordsCache } from "~/client-only/query"
import { DecisionIndicator } from "~/components/DecisionIndicator"
import { DataRecordWithId } from "~/schema/type"
import { indexBy } from "~/utils/shape"

export function calculateMoralSum(
  consequences: DataRecordWithId[],
  weights: DataRecordWithId[]
) {
  const weighsByGoodId = indexBy(weights, 'moral_good_id')
  let overlap = false
  let sum = 0
  const weightedValues: Record<number, number> = {}
  
  for (const consequence of consequences) {
    const moralWeight = weighsByGoodId[consequence.moral_good_id as number]
    if (!moralWeight) continue
    overlap = true
    const weight = parseFloat(moralWeight.weight)
    const colType = consequence.column_type
    let weightedValue = 0
    if (colType === 'boolean') {
      if (consequence.value) {
        weightedValue = weight
      }
    } else if (colType === 'integer') {
      weightedValue = weight * (consequence.value as number)
    }
    sum += weightedValue
    
    weightedValues[consequence.id] = weightedValue
  }
  return { sum, overlap, weightedValues }
}

export const NormativeConclusion: Component<{
  statementId: number
  moralProfileId: number
}> = props => {
  const moralWeights = createAsync(() => props.moralProfileId
    ? listForeignRecordsCache(
        'moral_weight_of_profile',
        'profile_id',
        props.moralProfileId
      )
    : listOwnRecordsCache('moral_weight_of_person')
  )
  const consequences = createAsync(() => listConsequencesCache(props.statementId))
  const sum = createMemo(() => {
    const weights = moralWeights()
    const concs = consequences()
    
    if (!weights || !concs) return null
    
    const result = calculateMoralSum(concs, weights)
    return result.overlap ? result.sum : null
  })
  return <DecisionIndicator score={sum()} />
}