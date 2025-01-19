import { getSession } from "./api/shared/session"
import { schema } from "./schema/schema"

const excludeCols = (tableName: string, colNames: string[]) =>
  Object.keys(schema.tables[tableName].columns)
    .filter(colName => !colNames.includes(colName))

const noEditCols: Record<string, string[]> = {
  question: ['judgement_requested', 'decided'],
  argument: ['judgement_requested']
}

export const getPermission = async (
  action: 'create' | 'read' | 'update' | 'delete',
  tableName: string,
  recordId?: number,
  parentId?: number // id of the parent record
) => {
  const session = await getSession()
  const create = action === 'create'
  const read = action === 'read'
  const update = action === 'update'
  const _delete = action === 'delete'
  const mutate = create || update || _delete
  const userId = session.data?.userId
  const loggedIn = !!userId
  const self = recordId === userId
  const ofSelf = parentId === userId
  const f = { granted: false, colNames: undefined }
  let colNames

  if (loggedIn) {

    if (tableName === 'person') {
      if (self) {
        if (create || _delete) return f
      } else {
        if (mutate) {
          return f
        } else {
          colNames = ['name']
        }
      }
    } else if (tableName === 'moral_weight') {
      if (!ofSelf) return f
    } else if (tableName === 'invite') {
      if (update || _delete) return f
    } else if (tableName === 'argument_aggregation_type') {
      if (create || _delete) return f
    } if (tableName === 'argument_type') {
      if (create || _delete) return f
    } if (tableName === 'role') {
      if (create || _delete) return f
    }

    if (update) {
      if (tableName in noEditCols) {
        colNames = excludeCols(tableName, noEditCols[tableName])
      }
    }

  } else return f

  return { granted: true, colNames }
}