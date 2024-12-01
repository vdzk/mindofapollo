import { action, cache, json } from "@solidjs/router";
import { deleteById } from "./mutate.db";
import { listForeignHopRecords } from "./select.db";
import { listRecords } from "./select.db";
import {CrossRecordMutateProps, deleteCrossRecord, insertCrossRecord, listCrossRecords} from "./cross.db";
import { executeAction, getVisibleActions } from "./tableActions";

export const getRecords = cache(listRecords, 'getRecords');
export const listCrossRecordsCache = cache(listCrossRecords, 'listCrossRecords')
export const listForeignHopRecordsCache = cache(listForeignHopRecords, 'listForeignHopRecords')
export const getVisibleActionsCache = cache(getVisibleActions, 'getVisibleActions')

export const deleteCrossRecordAction = action(
  async (props: CrossRecordMutateProps) => {
    await deleteCrossRecord(props)
    return json(
      'ok',
      { revalidate: [
        listCrossRecordsCache.keyFor(
          props.b, props.a, props.a_id, props.first
        )
      ] }
    )
  }
)

export const insertCrossRecordAction = action(
  async (props: CrossRecordMutateProps) => {
    await insertCrossRecord(props)
    return json(
      'ok',
      { revalidate: [
        listCrossRecordsCache.keyFor(
          props.b, props.a, props.a_id, props.first
        )
      ] }
    )
  }
)

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
        { revalidate: [
          getVisibleActionsCache.keyFor(tableName, recordId)
        ]}
      )
    }
  }
)
