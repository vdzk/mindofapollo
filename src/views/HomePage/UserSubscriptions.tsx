import { For, Show } from "solid-js"
import { createAsync } from "@solidjs/router"
import { getUserSubscriptionsCache } from "~/client-only/query"
import { Subtitle } from "~/components/PageTitle"
import { Link } from "~/components/Link"

export default function UserSubscriptions() {
  const subscriptions = createAsync(() => getUserSubscriptionsCache())

  return (
    <section class="flex-3 border-l pb-2">
      <Subtitle>Subscriptions</Subtitle>
      <Show when={subscriptions()}>
        <Show
          when={subscriptions()?.length}
          fallback={<div class="px-2 text-gray-500">Nothing yet...</div>}
        >
          <div class="px-2 border-t pt-2">
            <For each={subscriptions() || []}>
              {(subscription) => (
                <div class="flex items-center gap-2">
                  {subscription.has_updates && (
                    <div class="w-2 h-2 rounded-full bg-blue-500" title="Has new updates"></div>
                  )}
                  <Link
                    route="root-statement-updates"
                    params={{ id: subscription.id }}
                    label={subscription.label}
                  />
                </div>
              )}
            </For>
          </div>
        </Show>
      </Show>
    </section>
  )
}