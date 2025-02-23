import {humanCase, titleColumnName, xName} from "~/util"
import { getUserId } from "../../server-only/session"
import { ExplData, UserActor } from "~/components/expl/types"
import { finishExpl, startExpl } from "~/server-only/expl"
import { _getRecordById } from "~/server-only/select"
import { DataRecord } from "~/schema/type"
import { _insertRecord } from "~/server-only/mutate"

export interface CrossRecordMutateProps {
  a: string
  b: string
  first: boolean
  a_id: number
  b_id: number
}

export const insertCrossRecord = async (props: CrossRecordMutateProps) => {
  "use server"
  const userId = await getUserId()
  const tableName = xName(props.a, props.b, props.first)

  const explId = await startExpl(userId, 'insertCrossRecord', 1, tableName, props.a_id)
  const record = {
    [`${props.a}_id`]: props.a_id,
    [`${props.b}_id`]: props.b_id
  }
  const result = [await _insertRecord(tableName, record, explId)]

  if (result[0]) {
    const data = await prepareCrossRecordData(props, userId, result[0])
    await finishExpl(explId, data)
  }

  return result;
}

export const prepareCrossRecordData = async (
  props: CrossRecordMutateProps,
  userId: number,
  record: DataRecord
): Promise<CrossRecordData> => {
  const user = await _getRecordById('person', userId, ['id', 'name', 'auth_role'], false) as UserActor['user']
  const recordA = (await _getRecordById(props.a, props.a_id))!
  const recordB = (await _getRecordById(props.b, props.b_id))!

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

export const createCrossRecordExplData = (data: CrossRecordData, action: string): ExplData => ({
  actor: { type: 'user', user: data.user },
  action: `${action} ${humanCase(data.cross.tableName)} "${data.cross.label}" ${action === 'added' ? 'to' : 'from'}`,
  target: {
    tableName: data.target.tableName,
    id: data.target.id,
    label: data.target.label
  },
  [`${action === 'added' ? 'inserted' : 'deleted'}CrossRecord`]: {
    tableNames: {
      target: data.target.tableName,
      cross: data.cross.tableName
    },
    data: data.record
  }
})

export const explInsertCrossRecord = (data: CrossRecordData): ExplData => createCrossRecordExplData(data, 'added')
