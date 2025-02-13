"use server"

import {_insertRecord, _updateRecord, safeWrap} from "~/api/shared/mutate";
import {sql} from "~/db";
import { DataRecord } from "~/schema/type";
import { finishExpl, startExpl } from "~/server-only/expl";
import { getRecordById } from "../shared/select";
import { pickWithExplId } from "~/util";
import { JudgeArgumentExpl } from "~/components/expl/actions/JudgeArgument";

export const getJudgeArgument = safeWrap(async (userId) => {
    // TODO: postpone new entries for a random priod of time to avoid sniping?
    const result = await sql`
    SELECT argument.id, argument.title, argument.statement_id,
           statement.text as statement_text
    FROM argument
    JOIN statement ON statement.id = argument.statement_id
    JOIN expl ON expl.id = argument.id_expl_id
    WHERE argument.judgement_requested
      AND NOT EXISTS (
        SELECT 1
        FROM argument_judgement
        WHERE argument_judgement.id = argument.id
      )
      AND expl.user_id != ${userId}
    ORDER BY random()
    LIMIT 1
  `
    return result[0]
})

export const judgeArgument = safeWrap(async (userId, id: number, record: DataRecord) => {
  // TODO: authorazation
  const argument = await getRecordById('argument', id)
  if (!argument) return
  const statement = await getRecordById('statement', argument.statement_id as number)
  if (!statement) return
  const explId = await startExpl(userId, 'JudgeArgument', 1, 'argument', id)
  await _insertRecord("argument_judgement", {id, ...record}, explId)
  const diff = await _updateRecord('argument', id, explId, {judgement_requested: false})
  const data: JudgeArgumentExpl = {
    argument: pickWithExplId(argument, ['id', 'title', 'statement_id']),
    statement: pickWithExplId(statement, ['text']),
    insert: {argument_judgement: record},
    diff
  }
  await finishExpl(explId, data)
})
