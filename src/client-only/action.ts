import {action, json} from "@solidjs/router"
import { deleteById } from "~/api/delete/byId"
import { deleteCrossRecord } from "~/api/delete/crossRecord"
import { executeAction } from "./tableActions"
import { CrossRecordMutateProps, insertCrossRecord } from "~/api/insert/crossRecord"
import {getVisibleActionsCache, listCrossRecordsCache, listForeignHopRecordsCache} from "~/client-only/query"


export const deleteForeignHopRecordAction = action(async (
  tableName: string,
  fkName: string,
  fkId: number,
  hopColName: string,
  deleteId: number
) => {
  await deleteById(tableName, deleteId)
  return json(
    'ok',
    {
      revalidate: [
        listForeignHopRecordsCache.keyFor(tableName, fkName, fkId, hopColName)
      ]
    }
  )
})
export const deleteCrossRecordAction = action(
  async (props: CrossRecordMutateProps) => {
    await deleteCrossRecord(props)
    return json(
      'ok',
      {
        revalidate: [
          listCrossRecordsCache.keyFor(
            props.b, props.a, props.a_id, props.first
          )
        ]
      }
    )
  }
)
export const insertCrossRecordAction = action(
  async (props: CrossRecordMutateProps) => {
    await insertCrossRecord(props)
    return json(
      'ok',
      {
        revalidate: [
          listCrossRecordsCache.keyFor(
            props.b, props.a, props.a_id, props.first
          )
        ]
      }
    )
  }
)
export const executeTableAction = action(
  async (
    tableName: string,
    actionName: string,
    recordId: number
  ) => {
    const error = await executeAction(tableName, actionName, recordId)
    if (error) {
      return error
    } else {
      return json(
        undefined,
        {
          revalidate: [
            getVisibleActionsCache.keyFor(tableName, recordId)
          ]
        }
      )
    }
  }
)
