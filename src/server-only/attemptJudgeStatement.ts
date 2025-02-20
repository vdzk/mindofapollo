import {_updateRecord} from "~/server-only/mutate"
import {sql} from "~/server-only/db"
import {calcStatementConfidence} from "~/compute"
import { finishExpl, startExpl } from "~/server-only/expl"
import { JudgeStatementExpl } from "~/components/expl/actions/JudgeStatement"
import { AddExplId } from "~/components/expl/types"
import { addExplIdColNames, pickWithExplId } from "~/util"
import { getUserSession } from "./session"
import { _getRecordById } from "./select";

export const attemptJudgeStatement = async (
  statementId: number,
  triggerExplId: number,
  triggerLabel: string
) => {
  const userSession = await getUserSession()
  const colNames = ['pro', 'isolated_confidence', 'conditional_confidence']
  
  const argumentConfidences: AddExplId<{
      pro: boolean,
      isolated_confidence: number | null,
      conditional_confidence: number | null
    }>[] = await sql`
    SELECT ${sql(addExplIdColNames(colNames))}
    FROM argument a
    LEFT JOIN argument_judgement aj ON aj.id = a.id
    LEFT JOIN argument_conditional ac ON ac.id = a.id
    WHERE a.statement_id = ${statementId}
      `
  let canJudge = true
  let hasNonConditional = [false, false] // [con, pro]
  const confidences: [number[], number[]] = [[], []]
  for (const argument of argumentConfidences) {
    if (argument.isolated_confidence === null) {
      canJudge = false
    }

    const side = Number(argument.pro)
    if (argument.conditional_confidence === null) {
      if (hasNonConditional[side]) {
        // Only one non-conditional argument is allowed
        canJudge = false
      } else {
        hasNonConditional[side] = true
      }
      confidences[side].push(argument.isolated_confidence as number)
    } else {
      confidences[side].push(argument.conditional_confidence)
    }
    if (!canJudge) {
      break
    }
  }
  if (canJudge) {
    const explId = await startExpl(
      null, 'JudgeStatement', 1, 'statement', statementId)
    const newFragment = {
      judgement_requested: false,
      confidence: calcStatementConfidence(confidences),
      decided: true
    }
    const diff = await _updateRecord(
      'statement', statementId, explId, newFragment
    )
    const statement = await _getRecordById('statement', statementId, ['text'])
    const data: JudgeStatementExpl = {
      triggerExplId,
      triggerLabel,
      statement: statement && pickWithExplId(statement, ['text']),
      argumentConfidences,
      confidences,
      diff
    }
    await finishExpl(explId, data)
    return explId
  } else {
    return
  }
}
