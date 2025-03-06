import {query} from "@solidjs/router"
import { listCrossRecords } from "~/api/list/crossRecords"
import { listForeignHopRecords } from "~/api/list/foreignHopRecords"
import { listRecords } from "~/api/list/records"
import { listUserSubscriptions } from "~/api/list/userSubscriptions"
import { listVisibleActions } from "./tableActions"
import { listHomePageStatements } from "~/api/list/homePageStatements"

export const listForeignHopRecordsCache = query(listForeignHopRecords, 'listForeignHopRecords')
export const listCrossRecordsCache = query(listCrossRecords, 'listCrossRecords')
export const getRecords = query(listRecords, 'getRecords')
export const getVisibleActionsCache = query(listVisibleActions, 'getVisibleActions')
export const getUserSubscriptionsCache = query(listUserSubscriptions, 'getUserSubscriptions')
export const getHomePageStatementsCache = query(listHomePageStatements, 'getHomePageStatements')

