import {query} from "@solidjs/router"
import { listCrossRecords } from "~/api/list/crossRecords"
import { listForeignHopRecords } from "~/api/list/foreignHopRecords"
import { listRecords } from "~/api/list/records"
import { listVisibleActions } from "./tableActions"

export const listForeignHopRecordsCache = query(listForeignHopRecords, 'listForeignHopRecords')
export const listCrossRecordsCache = query(listCrossRecords, 'listCrossRecords')
export const getRecords = query(listRecords, 'getRecords')
export const getVisibleActionsCache = query(listVisibleActions, 'getVisibleActions')
