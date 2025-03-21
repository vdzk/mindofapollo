import {action, json, redirect} from "@solidjs/router"
import { deleteById } from "~/api/delete/byId"
import { deleteCrossRecord } from "~/api/delete/crossRecord"
import { executeAction } from "./tableActions"
import { CrossRecordMutateProps, insertCrossRecord } from "~/api/insert/crossRecord"
import { setSubscription } from "~/api/set/subscription"
import {getVisibleActionsCache, listCrossRecordsCache, listForeignHopRecordsCache, getUserSubscriptionsCache, getRecords} from "~/client-only/query"
import { updateSubscriptionLastOpened } from "~/api/set/subscriptionLastOpened"
import { deleteExtById } from "~/api/delete/extById"


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

export const setSubscriptionAction = action(
  async (id: number, subscribe: boolean, redirectPath?: string) => {
    await setSubscription(id, subscribe)
    const options = {
      revalidate: [
        getUserSubscriptionsCache.keyFor(),
        'getHomePageStatements'
      ]
    }
    if (redirectPath) {
      throw redirect(redirectPath, options)
    } else {
      return json('ok', options)
    }
  }
)

export const updateSubscriptionLastOpenedAction = action(
  async (statementId: number) => {
    await updateSubscriptionLastOpened(statementId)
    return json(
      'ok',
      {
        revalidate: [
          getUserSubscriptionsCache.keyFor()
        ]
      }
    )
  }
)

export const _delete = action(async (
  tableName: string,
  id: number
) => {
  await deleteExtById(tableName, id)
  throw redirect(
    `/list-records?tableName=${tableName}`,
    // TODO: this doesn't seem to do anything
    { revalidate: getRecords.keyFor(tableName) }
  )
})

