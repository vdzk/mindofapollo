"use server";

import {_updateRecord, safeWrap} from "~/api/shared/mutate";
import {sql} from "~/db";
import {calcStatementConfidence} from "~/compute";
import { Id } from "~/types";

export const attemptJudgeStatement = safeWrap(async (userId, statementId: Id) => {
  const results = await sql`
    SELECT *, argument.id
    FROM argument
    LEFT JOIN argument_judgement
      ON argument_judgement.id = argument.id
    LEFT JOIN argument_conditional
      ON argument_conditional.id = argument.id
    WHERE argument.statement_id = ${statementId}
  `
  let canJudge = true
  let hasNonConditional = [false, false]
  const confidences: [number[], number[]] = [[], []]
  for (const argument of results) {
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
      confidences[side].push(argument.isolated_confidence)
    } else {
      confidences[side].push(argument.conditional_confidence)
    }
    if (!canJudge) {
      break
    }
  }
  if (canJudge) {

    await _updateRecord(userId, "statement", statementId, {
      judgement_requested: false,
      confidence: calcStatementConfidence(confidences),
      decided: true
    })
  } else {
    return false
  }
})
