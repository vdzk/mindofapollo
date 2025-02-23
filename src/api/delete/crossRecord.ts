import { sql } from "~/server-only/db";
import { humanCase, titleColumnName, xName } from "~/util";
import { belongsTo, getUserId } from "~/server-only/session";
import { CrossRecordMutateProps } from "../insert/crossRecord";
import { ExplData, UserActor } from "~/components/expl/types";
import { finishExpl, startExpl } from "~/server-only/expl";
import { _getRecordById } from "~/server-only/select";
import { DataRecord } from "~/schema/type";

export const whoCanDeleteCrossRecord = (tableName: string) => {
  if (tableName === 'person') {
    return []
  } else {
    return ['invited']
  }
}

export const deleteCrossRecord = async (
  params: CrossRecordMutateProps
) => {
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

  const user = await _getRecordById('person', userId, ['id', 'name', 'auth_role'], false) as UserActor['user']
  const recordA = (await _getRecordById(params.a, params.a_id))!
  const recordB = (await _getRecordById(params.b, params.b_id))!

  if (result[0]) {
    const { target, cross } = params.first
      ? {
        target: { table: params.a, id: params.a_id, record: recordA },
        cross: { table: params.b, id: params.b_id, record: recordB }
      }
      : {
        target: { table: params.b, id: params.b_id, record: recordB },
        cross: { table: params.a, id: params.a_id, record: recordA }
      }

    const data: DeleteCrossRecordData = {
      user,
      target: {
        tableName: target.table,
        id: target.id,
        label: target.record[titleColumnName(target.table)] as string
      },
      cross: {
        tableName: cross.table,
        id: cross.id,
        label: cross.record[titleColumnName(cross.table)] as string
      },
      deletedRecord: result[0]
    }
    await finishExpl(explId, data)
  }

  return result;
}

interface DeleteCrossRecordData {
  user: UserActor['user']
  target: {
    tableName: string
    id: number
    label: string
  }
  cross: {
    tableName: string
    id: number
    label: string
  }
  deletedRecord: DataRecord
}

export const explDeleteCrossRecord = (data: DeleteCrossRecordData): ExplData => ({
  actor: { type: 'user', user: data.user },
  action: `removed ${humanCase(data.cross.tableName)} "${data.cross.label}" from`,
  target: {
    tableName: data.target.tableName,
    id: data.target.id,
    label: data.target.label
  },
  deletedCrossRecord: {
    tableNames: {
      target: data.target.tableName,
      cross: data.cross.tableName
    },
    data: data.deletedRecord
  }
})