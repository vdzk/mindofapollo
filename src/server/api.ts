import { action, cache, json } from "@solidjs/router";
import { listRecords } from "./db";
import { CrossRecordMutateProps, deleteCrossRecord, insertCrossRecord, listCrossRecords } from "./cross.db";

export const getRecords = cache(listRecords, 'getRecords');
export const listCrossRecordsCache = cache(listCrossRecords, 'listCrossRecords')

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