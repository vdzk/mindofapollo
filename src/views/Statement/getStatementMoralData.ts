import { listConsequencesCache, listForeignRecordsCache, listOwnRecordsCache } from "~/client-only/query"
import { calcMoralSum } from "../../calc/moralSum"

export const getStatementMoralData = async (
  statementId: number,
  moralProfileId: number
) => {
  const [ moralWeights, consequences ] = await Promise.all([
    moralProfileId
    ? listForeignRecordsCache(
        'moral_weight_of_profile',
        'profile_id',
        moralProfileId
      )
    : listOwnRecordsCache('moral_weight_of_person'),
    listConsequencesCache(statementId)
  ])
  const calcResult = calcMoralSum(consequences, moralWeights)
  return {
    moralWeights,
    consequences,
    ...calcResult
  }
}