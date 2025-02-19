"use server"

import {_insertRecord, _updateRecord} from "~/server-only/mutate";
import {sql} from "~/server-only/db";
import { DataRecord } from "~/schema/type";
import { finishExpl, startExpl } from "~/server-only/expl";
import { _getRecordById } from "../../server-only/select";
import { pickWithExplId } from "~/util";
import { JudgeArgumentExpl } from "~/components/expl/actions/JudgeArgument";
import { getUserSession } from "../../server-only/session";

export const getTaskJudgeArgument = async () => {
  const userSession = await getUserSession()
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
      AND expl.user_id != ${userSession.userId}
    ORDER BY random()
    LIMIT 1
  `
  return result[0]
}

export const submitTaskJudgeArgument = async (id: number, record: DataRecord) => {
  const userSession = await getUserSession()
  const argument = await _getRecordById('argument', id, ['id', 'title', 'statement_id'])
  if (!argument) return
  const statement = await _getRecordById('statement', argument.statement_id as number, ['text'])
  if (!statement) return
  const explId = await startExpl(userSession.userId, 'JudgeArgument', 1, 'argument', id)
  await _insertRecord("argument_judgement", {id, ...record}, explId)
  const diff = await _updateRecord('argument', id, explId, {judgement_requested: false})
  const data: JudgeArgumentExpl = {
    argument: pickWithExplId(argument, ['id', 'title', 'statement_id']),
    statement: pickWithExplId(statement, ['text']),
    insert: {argument_judgement: record},
    diff
  }
  await finishExpl(explId, data)
}
