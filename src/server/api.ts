import { action, cache, json } from "@solidjs/router";
import { deleteById, listForeignHopRecords, listRecords } from "./db";
import { CrossRecordMutateProps, deleteCrossRecord, insertCrossRecord, listCrossRecords } from "./cross.db";

export const getRecords = cache(listRecords, 'getRecords');
export const listCrossRecordsCache = cache(listCrossRecords, 'listCrossRecords')
export const listForeignHopRecordsCache = cache(listForeignHopRecords, 'listForeignHopRecords')

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
  fkId: string,
  hopColName: string,
  deleteId: string
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