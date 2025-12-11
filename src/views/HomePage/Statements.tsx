import { createAsync, useAction } from "@solidjs/router"
import { createSignal, For, Show, useContext } from "solid-js"
import { getHomePageStatementsCache, listRecordsCache } from "~/client-only/query"
import { Link, Links } from "~/components/Link"
import { MasterDetail } from "~/components/MasterDetail"
import { H2, Subtitle } from "~/components/PageTitle"
import { setSubscriptionAction } from "~/client-only/action"
import { Button } from "~/components/buttons"
import { withDialogueStatementId } from "~/constant"
import { SessionContext } from "~/SessionContext"

export default function Statements() {
  const session = useContext(SessionContext)
  const authenticated = () => !!session?.userSession()?.authenticated
  const tags = createAsync(() => listRecordsCache('tag'))

  const featuredOption = {
    id: -1, label: 'featured',
    // groupId: 'distinct'
  }
  const tagOptions = () => tags()?.map(
    tag => ({
      id: tag.id,
      label: tag.name as string,
      // groupId: tag.name === 'examples' ? 'distinct' : 'common'
    })
  ) ?? []
  const options = () => [featuredOption, ...tagOptions()]

  const [selectedId, setSelectedId] = createSignal(featuredOption.id)
  const selectedTag = () => options().find(option => option.id === selectedId())

  const featured = () => selectedId() === featuredOption.id
  const tagId = () => featured() ? undefined : selectedId()
  const statements = createAsync(() => getHomePageStatementsCache(featured(), tagId()))

  const setSubscription = useAction(setSubscriptionAction)

  return (
    <div class="flex-4 flex flex-col">
      <Show when={authenticated()}>
        <div class="px-2 py-10 text-center border-b">
          <Link
            type="heroButton"
            label="Make a new claim"
            route="create-record"
            params={{tableName: 'statement'}}
          />
        </div>
      </Show>
      <Subtitle>Tags</Subtitle>
      <div class="flex-1">
        <MasterDetail
          options={options()}
          optionsClass="pl-1"
          // groups={[{id: 'distinct', label: ''}, {id: 'common', label: ''}]}
          selectedId={selectedId()}
          onChange={setSelectedId}
          horizontal
          pills
        >
          <Subtitle>Claims ({selectedTag()?.label})</Subtitle>
          <div class="pl-2">
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
                    {/* //TODO
                    This button was hidden because new users were clicking it instead of the statemetns 
                    {authenticated() && !directive && (
                      <Button
                        label={subscribed ? 'unsub' : 'sub'}
                        onClick={() => setSubscription(id, !subscribed)}
                        leading={5}
                        class="text-sm"
                      />
                    )} */}
                  </div>
                )
              }}
            </For>
          </div>
        </MasterDetail>
      </div>
      <div class="px-2 py-2 border-t">
        <Link
          type="button"
          label="Show all statements"
          route="list-records"
          params={{ tableName: 'statement' }}
        />
      </div>
    </div>
  )
}