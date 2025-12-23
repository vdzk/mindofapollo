import { belongsTo } from "~/server-only/session"
import {_getRecordsByIds } from "~/server-only/select"
import { whoCanGetOneRecordById } from "../getOne/recordById"

export interface ListRecordsByIdsQuery {
  tableName: string,
  ids: number[],
  colNames: string[]
}

export const listRecordsByIds = async (queries: ListRecordsByIdsQuery[]) => {
  "use server"
  for (const query of queries) {
    if (! await belongsTo(whoCanGetOneRecordById(query.tableName, false))) {
      return
    }
  }
  return Promise.all(queries.map(query => _getRecordsByIds(
    query.tableName,
    'id',
    query.ids,
    query.colNames,
    false
  )))
};