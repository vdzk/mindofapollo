import {action, json, redirect} from "@solidjs/router"
import { setSubscription } from "~/api/set/subscription"
import { getUserSubscriptionsCache} from "~/client-only/query"
import { updateSubscriptionLastOpened } from "~/api/set/subscriptionLastOpened"

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

