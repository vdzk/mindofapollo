import { humanCase } from "~/utils/string"
import { addExplIds } from "~/utils/expl"
import { xName } from "~/utils/schema"
import { titleColumnName } from "~/utils/schema"
import { getUserId, getUserActorUser } from "~/server-only/session"
import { ExplData, UserActor } from "~/components/expl/types"
import { finishExpl, startExpl } from "~/server-only/expl"
import { _getRecordById } from "~/server-only/select"
import { DataRecord } from "~/schema/type"
import { onError, sql } from "~/server-only/db"

export interface CrossRecordMutateProps {
  a: string
  b: string
  first: boolean
  a_id: number
  b_id: number
}

export const insertCrossRecord = async (params: CrossRecordMutateProps) => {
  "use server"
  const userId = await getUserId()
  const tableName = xName(params.a, params.b, params.first)

  const firstTableName = params.first ? params.a : params.b
  const firstId = params.first ? params.a_id : params.b_id

  const explId = await startExpl(userId, 'insertCrossRecord', 1, firstTableName, firstId)
  const record = {
    [`${params.a}_id`]: params.a_id,
    [`${params.b}_id`]: params.b_id
  }

  const result = await sql`
    INSERT INTO ${sql(tableName)} ${sql(addExplIds(record, explId))}
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

export const prepareCrossRecordData = async (
  props: CrossRecordMutateProps,
  user: UserActor['user'],
  recordA: DataRecord,
  recordB: DataRecord,
  record: DataRecord
): Promise<CrossRecordData> => {

  const { target, cross } = props.first
    ? {
      target: { table: props.a, id: props.a_id, record: recordA },
      cross: { table: props.b, id: props.b_id, record: recordB }
    }
    : {
      target: { table: props.b, id: props.b_id, record: recordB },
      cross: { table: props.a, id: props.a_id, record: recordA }
    }

  return {
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
    record
  }
}

export interface CrossRecordData {
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
  record: DataRecord
}

export const createCrossRecordExplData = (
  data: CrossRecordData, 
  actionFn: (crossStr: string) => string,
  recordActionProp: string
): ExplData => {
  const crossStr = `${humanCase(data.cross.tableName)} "${data.cross.label}"`
  return {
    actor: { type: 'user', user: data.user },
    action: actionFn(crossStr),
    target: {
      tableName: data.target.tableName,
      id: data.target.id,
      label: data.target.label
    },
    [recordActionProp]: {
      target: data.target,
      cross: data.cross,
      data: data.record
    }
  }
}

export const explInsertCrossRecord = (data: CrossRecordData): ExplData => 
  createCrossRecordExplData(
    data, 
    (crossStr) => `added ${crossStr} to`,
    'insertedCrossRecord'
  )
