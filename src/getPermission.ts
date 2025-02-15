import { schema } from "./schema/schema"
import { UserSession } from "./types"

const excludeCols = (tableName: string, colNames: string[]) =>
  Object.keys(schema.tables[tableName].columns)
    .filter(colName => !colNames.includes(colName))

const noEditCols: Record<string, string[]> = {
  statement: ['judgement_requested', 'decided', 'confidence', 'featured'],
  argument: ['judgement_requested']
}

// TODO: it doesn't make sense for a normal user to adit a critical statment, only delete and create a new one instead. 

export const getPermission = (
  userSession: UserSession | undefined,
  action: 'create' | 'read' | 'update' | 'delete',
  tableName: string,
  recordId?: string | number,
  parentId?: number // id of the parent record
) => {
  const create = action === 'create'
  const read = action === 'read'
  const update = action === 'update'
  const _delete = action === 'delete'
  const mutate = create || update || _delete
  const t = { granted: true, colNames: undefined }
  const f = { granted: false, colNames: undefined }

  // Only logged in users have permissions
  if (!userSession) return f

  const { userId, authorizationCategory } = userSession
  
  // Admin has full access
  if (authorizationCategory === 'admin') return t

  const self = recordId === userId
  const ofSelf = parentId === userId
  let colNames

  // Invited user permissions
  if (authorizationCategory === 'invited') {
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
    } else if (tableName === 'argument_type') {
      if (create || _delete) return f
    } else if (tableName === 'role') {
      if (create || _delete) return f
    }

    if (update) {
      if (tableName in noEditCols) {
        colNames = excludeCols(tableName, noEditCols[tableName])
      }
    }

    return { granted: true, colNames }
  }

  return f
}
