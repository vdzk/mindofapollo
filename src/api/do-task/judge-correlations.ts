"use server"

import {safeWrap} from "~/api/shared/mutate";
import {DataRecordWithId} from "~/schema/type";
import {sql} from "~/db";

export const getJudgeCorrelationsData = safeWrap(async (userId) => {
    const sides = Math.random() > 0.5 ? [true, false] : [false, true]
    let data: { pro: boolean, question: DataRecordWithId } | undefined
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
        AND q.argument_aggregation_type_id = 'evidential'
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
