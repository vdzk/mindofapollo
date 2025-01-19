"use server";

import {safeWrap, updateRecord} from "~/api/shared/mutate";
import {sql} from "~/db";
import {calcQuestionConfidence} from "~/compute";

export const attemptJudgeQuestion = safeWrap(async (userId, questionId: number) => {
  const results = await sql`
  SELECT *, argument.id
  FROM argument
  LEFT JOIN argument_judgement
    ON argument_judgement.id = argument.id
  LEFT JOIN argument_conditional
    ON argument_conditional.id = argument.id
  WHERE argument.question_id = ${questionId}
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

    await updateRecord("question", questionId, {
      judgement_requested: false,
      confidence: calcQuestionConfidence(confidences),
      decided: true
    })
  } else {
    return false
  }
})
