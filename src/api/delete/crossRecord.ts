import { onError, sql } from "~/server-only/db";
import { xName } from "~/utils/schema";
import { belongsTo, getUserId, getUserActorUser } from "~/server-only/session";
import { CrossRecordMutateProps, prepareCrossRecordData, createCrossRecordExplData, CrossRecordData } from "../insert/crossRecord";
import { finishExpl, startExpl } from "~/server-only/expl";
import { ExplData } from "~/components/expl/types";
import { _getRecordById } from "~/server-only/select";

export const whoCanDeleteCrossRecord = (tableName: string) => {
  if (tableName === 'person') {
    return []
  } else {
    return ['invited']
  }
}

export const deleteCrossRecord = async (params: CrossRecordMutateProps) => {
  "use server"
  if (! await belongsTo(whoCanDeleteCrossRecord(
    params.first ? params.a : params.b
  ))) return

  const userId = await getUserId()
  const tableName = xName(params.a, params.b, params.first)

  const firstTableName = params.first ? params.a : params.b
  const firstId = params.first ? params.a_id : params.b_id

  const explId = await startExpl(userId, 'deleteCrossRecord', 1, firstTableName, firstId)
  const result = await sql`
    DELETE FROM ${sql(tableName)}
    WHERE ${sql(params.a + '_id')} = ${params.a_id}
      AND ${sql(params.b + '_id')} = ${params.b_id}
    RETURNING *
  `.catch(onError)

  if (result[0]) {
    const user = await getUserActorUser()
    const recordA = (await _getRecordById(params.a, params.a_id))!
    const recordB = (await _getRecordById(params.b, params.b_id))!
    const data = await prepareCrossRecordData(params, user, recordA, recordB, result[0])
    await finishExpl(explId, data)
  }

  return result;
}

export const explDeleteCrossRecord = (data: CrossRecordData): ExplData => 
  createCrossRecordExplData(
    data,
    (crossStr) => `removed ${crossStr} from`,
    'deletedCrossRecord'
  )