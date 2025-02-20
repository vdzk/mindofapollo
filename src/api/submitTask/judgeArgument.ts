import { DataRecord } from "~/schema/type"
import {_insertRecord, _updateRecord} from "~/server-only/mutate"
import { finishExpl, startExpl } from "~/server-only/expl"
import { _getRecordById } from "~/server-only/select"
import { pickWithExplId } from "~/util"
import { JudgeArgumentExpl } from "~/components/expl/actions/JudgeArgument"
import { getUserSession } from "~/server-only/session"

export const submitTaskJudgeArgument = async (id: number, record: DataRecord) => {
  "use server"
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