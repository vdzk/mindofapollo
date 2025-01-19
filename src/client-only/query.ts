import {query} from "@solidjs/router";
import {listForeignHopRecords} from "~/api/components/Aggregate";
import {listCrossRecords, listRecords} from "~/api/shared/select";
import {getVisibleActions} from "~/api/tableActions/tableActions";

export const listForeignHopRecordsCache = query(listForeignHopRecords, 'listForeignHopRecords')
export const listCrossRecordsCache = query(listCrossRecords, 'listCrossRecords')
export const getRecords = query(listRecords, 'getRecords')
export const getVisibleActionsCache = query(getVisibleActions, 'getVisibleActions')
