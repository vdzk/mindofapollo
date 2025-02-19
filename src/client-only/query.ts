import {query} from "@solidjs/router";
import {listForeignHopRecords} from "~/api/components/Aggregate";
import { listCrossRecords } from "~/server-only/listCrossRecords";
import { listRecords } from "~/server-only/listRecords";
import {listVisibleActions} from "~/api/tableActions/tableActions";

export const listForeignHopRecordsCache = query(listForeignHopRecords, 'listForeignHopRecords')
export const listCrossRecordsCache = query(listCrossRecords, 'listCrossRecords')
export const getRecords = query(listRecords, 'getRecords')
export const getVisibleActionsCache = query(listVisibleActions, 'getVisibleActions')
