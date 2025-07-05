import { sql, onError } from "~/server-only/db"
import { _updateRecord } from "~/server-only/mutate"
import { finishExpl, startExpl } from "~/server-only/expl"
import { ExplData } from "~/components/expl/types"
import { DataRecord, DataRecordWithId } from "~/schema/type"
import { calcStatementConfidenceAdditively } from "~/calc/statementConfidenceAdditively"
import { getWeightedArguments } from "~/server-only/getWeightedArguments"
import { _getRecordById } from "~/server-only/select"

export const attemptAggregateArguments = async (
  statementId: number,
  triggerExplId: number,
  triggerLabel: string
) => {
  "use server"
  const checkResults = await sql`
    SELECT NOT EXISTS (
      SELECT 1
      FROM argument a
      WHERE a.statement_id = ${statementId}
        AND NOT EXISTS (
          SELECT 1
          FROM argument_weight aw
          WHERE aw.id = a.id
        )
    ) AS all_arguments_have_weights
  `.catch(onError)
  
  if (!checkResults[0].all_arguments_have_weights) return

  const weightedArguments = await getWeightedArguments(statementId)
  if (!weightedArguments) return

  const confidence = calcStatementConfidenceAdditively(weightedArguments as any)
  const explId = await startExpl(null, 'attemptAggregateArguments', 1, 'statement', statementId)
  const statement = await _getRecordById('statement', statementId, ['id', 'text'])
  if (!statement) return
  
  const diff = await _updateRecord('statement', statementId, explId, {
    confidence,
    decided: true
  })
  
  const data: ExplAggregateArgumentsData = {
    statement,
    weightedArguments: weightedArguments as unknown as DataRecord[],
    diff,
    triggerExplId,
    triggerLabel
  }
  
  await finishExpl(explId, data)
  return explId
}

interface ExplAggregateArgumentsData {
  statement: DataRecordWithId
  weightedArguments: DataRecord[]
  diff: ExplData['diff']
  triggerExplId: number
  triggerLabel: string
}

export const explAttemptAggregateArguments = (data: ExplAggregateArgumentsData): ExplData => {
  return {
    actor: { type: 'system' },
    action: 'calculated its confidence in',
    target: {
      tableName: 'statement',
      id: data.statement.id,
      label: data.statement.text as string
    },
    trigger: {
      explId: data.triggerExplId,
      label: data.triggerLabel
    },
    diff: data.diff,
    relevantRecords: {
      argument_weight: data.weightedArguments,
      statement: [data.statement]
    }
  }
}
