import { sql } from "~/server-only/db";
import { xName } from "~/util";
import { belongsTo, getUserId, getUserActorUser } from "~/server-only/session";
import { CrossRecordMutateProps, prepareCrossRecordData, createCrossRecordExplData, CrossRecordData } from "../insert/crossRecord";
import { finishExpl, startExpl } from "~/server-only/expl";
import { ExplData } from "~/components/expl/types";

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

  const explId = await startExpl(userId, 'deleteCrossRecord', 1, tableName, params.a_id)
  const result = await sql`
    DELETE FROM ${sql(tableName)}
    WHERE ${sql(params.a + '_id')} = ${params.a_id}
      AND ${sql(params.b + '_id')} = ${params.b_id}
    RETURNING *
  `

  if (result[0]) {
    const data = await prepareCrossRecordData(params, userId, result[0])
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