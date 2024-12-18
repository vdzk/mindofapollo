"use server"

import { DataRecordWithId } from "~/schema/type"
import { sql } from "./db"
import { safeWrap, updateRecord } from "./mutate.db"
import { calcQuestionConfidence } from "~/compute"

export const getJudgeArgument = safeWrap(async (userId) => {
  // TODO: postpone new entries for a random priod of time to avoid sniping? 
  const result = await sql`
    SELECT argument.id, argument.title
    FROM argument
    WHERE argument.judgement_requested
      AND NOT EXISTS (
        SELECT 1
        FROM argument_judgement
        WHERE argument_judgement.id = argument.id
      )
    ORDER BY random()
    LIMIT 1
  `
  return result[0]
})

export const addedCriticalStatement = safeWrap(async (userId, argumentId: number) => {
  const result = await sql`
    SELECT csh.id
    FROM critical_statement_h csh
    LEFT JOIN argument a
      ON csh.argument_id = a.id
      AND a.judgement_requested = true
    WHERE csh.argument_id = ${argumentId}
      AND csh.op_user_id = ${userId}
      AND csh.data_op = 'INSERT'
      AND a.id IS NULL
    LIMIT 1
  `
  return result.length > 0
})

export const hasArguments = safeWrap(async (userId, questionId: number) => {
  const result = await sql`
    SELECT id
    FROM argument
    WHERE question_id = ${questionId}
    LIMIT 1
  `
  return result.length > 0
})

export const hasUnjudgedArguments = safeWrap(async (userId, questionId: number) => {
  const result = await sql`
    SELECT id
    FROM argument
    WHERE question_id = ${questionId}
      AND ( judgement_requested  OR NOT EXISTS (
        SELECT 1
        FROM argument_judgement
        WHERE argument_judgement.id = argument.id
      ))
    LIMIT 1
  `
  return result.length > 0
})

export const getJudgeCorrelationsData = safeWrap(async (userId) => {
  const sides = Math.random() > 0.5 ? [true, false] : [false, true]
  let data: {pro: boolean, question: DataRecordWithId} | undefined
  for (const pro of sides) {
    /* query to randomly select a question.id for which the question has the following criteria.
      1) question.judgement_requested = true;
      2) question has two or more arguments attached to it for which: 
        2.1) agument.pro = pro, and
        2.2) there is no argument_conditional with argument_conditional.id = argument.id
    */
    const result = await sql`
      SELECT q.*
      FROM question q
      JOIN argument a ON q.id = a.question_id
      LEFT JOIN argument_conditional ac ON a.id = ac.id
      WHERE q.judgement_requested = true
        AND a.pro = ${pro}
        AND ac.id IS NULL
      GROUP BY q.id
      HAVING COUNT(a.id) >= 2
      ORDER BY RANDOM()
      LIMIT 1;
    `
    if (result.length > 0) {
      data = {question: result[0] as DataRecordWithId, pro}
      break
    }
  }
  if (data) {
    const results: DataRecordWithId[] = await sql`
      SELECT *
      FROM argument
      JOIN argument_judgement
        ON argument_judgement.id = argument.id
      WHERE question_id = ${data.question.id}
        AND pro = ${data.pro}
      ORDER BY argument_judgement.isolated_confidence DESC
    `
    return {...data, arguments: results}
  }
})

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
  const confidences: [number[], number[]] = [[],[]]
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

