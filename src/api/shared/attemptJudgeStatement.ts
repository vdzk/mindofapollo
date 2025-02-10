"use server";

import {_updateRecord, safeWrap} from "~/api/shared/mutate"
import {sql} from "~/db"
import {calcStatementConfidence} from "~/compute"
import { finishExpl, startExpl } from "~/server-only/expl";
import { JudgeStatementExpl } from "~/components/expl/actions/JudgeStatement";
import { AddExplId } from "~/components/expl/types";
import { getRecordById } from "./select";
import { pickWithExplId } from "~/util";

export const attemptJudgeStatement = safeWrap(async (
  userId,
  statementId: number,
  triggerExplId: number,
  triggerLabel: string
) => {
  const colNames = ['pro', 'isolated_confidence', 'conditional_confidence']
  const explIdColNames = colNames.map(colName => colName + '_expl_id')
  
  const argumentConfidences: AddExplId<{
      pro: boolean,
      isolated_confidence: number | null,
      conditional_confidence: number | null
    }>[] = await sql`
    SELECT ${sql([...colNames, ...explIdColNames])}
    FROM argument
    LEFT JOIN argument_judgement
      ON argument_judgement.id = argument.id
    LEFT JOIN argument_conditional
      ON argument_conditional.id = argument.id
    WHERE argument.statement_id = ${statementId}
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
    const statement = await getRecordById('statement', statementId)
    const data: JudgeStatementExpl = {
      triggerExplId,
      triggerLabel,
      statement: statement && pickWithExplId(statement, ['text']),
      argumentConfidences,
      confidences,
      diff
    }
    await finishExpl(explId, data)
  } else {
    return false
  }
})
