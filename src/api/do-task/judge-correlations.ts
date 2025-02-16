"use server"

import {safeWrap} from "~/api/shared/mutate";
import {DataRecordWithId, DataRecord} from "~/schema/type";
import {sql} from "~/db";
import { _insertRecordsOneByOne } from "~/api/shared/mutate";
import { attemptJudgeStatement } from "~/api/shared/attemptJudgeStatement";
import { startExpl } from "~/server-only/expl";
import { UserSession } from "~/types";

export const getJudgeCorrelationsData = safeWrap(async (userId) => {
    const sides = Math.random() > 0.5 ? [true, false] : [false, true]
    let data: { pro: boolean, statement: DataRecordWithId } | undefined
    for (const pro of sides) {
        /* query to randomly select a statement.id for which the statement has the following criteria.
          1) statement.judgement_requested = true;
          2) statement has two or more arguments attached to it for which:
            2.1) agument.pro = pro, and
            2.2) there is no argument_conditional with argument_conditional.id = argument.id
        */
        const result = await sql`
      SELECT s.*
      FROM statement s
      JOIN argument a ON s.id = a.question_id
      LEFT JOIN argument_conditional ac ON a.id = ac.id
      WHERE s.judgement_requested = true
        AND EXISTS (
          SELECT 1 FROM argument_aggregation_type aat 
          WHERE aat.id = s.argument_aggregation_type_id 
          AND aat.name = 'evidential'
        )
        AND a.pro = ${pro}
        AND ac.id IS NULL
      GROUP BY s.id
      HAVING COUNT(a.id) >= 2
      ORDER BY RANDOM()
      LIMIT 1;
    `
        if (result.length > 0) {
            data = {statement: result[0] as DataRecordWithId, pro}
            break
        }
    }
    if (data) {
        const results: DataRecordWithId[] = await sql`
      SELECT *
      FROM argument
      JOIN argument_judgement
        ON argument_judgement.id = argument.id
      WHERE question_id = ${data.statement.id}
        AND pro = ${data.pro}
      ORDER BY argument_judgement.isolated_confidence DESC
    `
        return {...data, arguments: results}
    }
})

export const submitCorrelations = safeWrap(async (userSession: UserSession, statementId: number, records: DataRecord[]) => {
    const explId = await startExpl(null, 'JudgeCorrelations', 1, 'statement', statementId)
    await _insertRecordsOneByOne('argument_conditional', records, explId)
    await attemptJudgeStatement(statementId, explId, 'user submitted correlations')
})
