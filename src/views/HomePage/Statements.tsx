import { createAsync, useAction } from "@solidjs/router"
import { createSignal, For, Show, useContext } from "solid-js"
import { getHomePageStatementsCache, listRecordsCache } from "~/client-only/query"
import { Link, Links } from "~/components/Link"
import { MasterDetail } from "~/components/MasterDetail"
import { Subtitle } from "~/components/PageTitle"
import { setSubscriptionAction } from "~/client-only/action"
import { Button } from "~/components/buttons"
import { withDialogueStatementId } from "~/constant"
import { SessionContext } from "~/SessionContext"

export default function Statements() {
  const session = useContext(SessionContext)
  const authenticated = () => !!session?.userSession()?.authenticated
  const tags = createAsync(() => listRecordsCache('tag'))

  const featuredOption = { id: -1, label: '⭐ featured ⭐' }
  const tagOptions = () => tags()?.map(
    tag => ({ id: tag.id, label: tag.name as string })
  ) ?? []
  const options = () => [featuredOption, ...tagOptions()]

  const [selectedId, setSelectedId] = createSignal(featuredOption.id)

  const featured = () => selectedId() === featuredOption.id
  const tagId = () => featured() ? undefined : selectedId()
  const statements = createAsync(() => getHomePageStatementsCache(featured(), tagId()))

  const setSubscription = useAction(setSubscriptionAction)

  return (
    <div class="flex-4 pt-2">
      <Subtitle>Statements</Subtitle>
      <div class="px-2">
        <MasterDetail
          options={options()}
          selectedId={selectedId()}
          onChange={setSelectedId}
        >
          <div class="pt-1 pl-2">
            <For each={statements()}>
              {statement => {
                const { id, directive, subscribed, label } = statement
                const hasDialogue = id === withDialogueStatementId
                const linkParams: Record<string, any> = { id }
                if (!hasDialogue) {
                  linkParams.tableName = directive ? 'directive' : 'statement'
                }
                return (
                  <div class="flex items-center gap-2">
                    <Link
                      label={label}
                      route={hasDialogue ? 'dialogue' : 'show-record'}
                      params={linkParams}
                      class="flex-1"
                    />
                    {authenticated() && !directive && (
                      <Button
                        label={subscribed ? 'unsub' : 'sub'}
                        onClick={() => setSubscription(id, !subscribed)}
                        leading={5}
                        class="text-sm"
                      />
                    )}
                  </div>
                )
              }}
            </For>
          </div>
        </MasterDetail>
      </div>
      <Show when={authenticated()}>
        <div class="px-2 mt-3 pb-6">
          <Links
            type="button"
            links={[
              {
                label: "Show all",
                route: "list-records",
                params: { tableName: 'statement' }
              },
              {
                label: "Add new",
                route: "create-record",
                params: { tableName: 'statement' }
              }
            ]}
          />
        </div>
      </Show>
    </div>
  )
}