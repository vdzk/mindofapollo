import { DataRecordWithId } from "~/schema/type"
import { getSession } from "./session"
import { hasOwner, isSystem } from "~/permissions"
import { onError, sql } from "./db"
import { hasOwnFields } from "~/utils/schema"

const filterPersonalIds = async (
  userId: number, tableName: string, ids: number[]
) => {
  const results = await sql`
    SELECT id
    FROM ${sql(tableName)}
    WHERE id IN ${sql(ids)}
      AND owner_id = ${userId}
  `.catch(onError)
  return results.map(row => row.id as number)
}

const filterIdsRecentlyCreatedByUser = async (
  userId: number, tableName: string, ids: number[]
) => {
  const results = await sql`
    SELECT record_id
    FROM expl
    WHERE user_id = ${userId}
      AND action IN ('insertRecord', 'insertExtRecord')
      AND table_name = ${tableName}
      AND record_id IN ${sql(ids)}
      AND timestamp > NOW() - INTERVAL '24 hours'; 
  `.catch(onError)
  return results.map(row => row.record_id as number)
}

const filterCanUpdateIds = async (tableName:string, ids: number[] ) => {
  const session = await getSession()
  const { userId, authRole } = session.data
  if (ids.length === 0) return ids
  if (authRole === 'admin') {
    return ids
  } else if (authRole === 'invited') {
    if (
      !hasOwnFields(tableName)
      || isSystem(tableName)
    ) {
      return []
    } else if (tableName === 'person') {
      const self = ids.every(id => id === userId)
      return self ? ids : []
    } else if (hasOwner(tableName)) {
      return await filterPersonalIds(userId, tableName, ids)
    } else {
      return filterIdsRecentlyCreatedByUser(userId, tableName, ids)
    }
  } else {
    return []
  }
}

const filterCanDeleteIds = async (tableName: string, ids: number[]) => {
  const session = await getSession()
  const { userId, authRole } = session.data
  if (ids.length === 0) return ids
  if (authRole === 'admin') {
    return ids
  } else if (authRole === 'invited') {
    if (tableName === 'person' || isSystem(tableName)) {
      return []
    } else if (hasOwner(tableName)) {
      return await filterPersonalIds(userId, tableName, ids)
    } else {
      return await filterIdsRecentlyCreatedByUser(userId, tableName, ids)
    }
  } else {
    return []
  }
}

export const canUpdate = async (tableName: string, ids: number[]) => {
  const filteredIds = await filterCanUpdateIds(tableName, ids)
  return filteredIds.length === ids.length
}

export const canDelete = async (tableName: string, ids: number[]) => {
  const filteredIds = await filterCanDeleteIds(tableName, ids)
  return filteredIds.length === ids.length
}

export const injectPermissions = async (
  tableName: string,
  records: DataRecordWithId[]
) => {
  const ids = records.map(record => record.id)
  const canUpdateIds = await filterCanUpdateIds(tableName, ids)
  const canDeleteIds = await filterCanDeleteIds(tableName, ids)
  for (const record of records) {
    record.canUpdate = canUpdateIds.includes(record.id)
    record.canDelete = canDeleteIds.includes(record.id)
  }
}