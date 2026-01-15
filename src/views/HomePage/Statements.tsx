import { createAsync } from "@solidjs/router"
import { createSignal, For, Show, useContext } from "solid-js"
import { getHomePageStatementsCache, listRecordsCache } from "~/client-only/query"
import { ExternalLink, Link } from "~/components/Link"
import { MasterDetail } from "~/components/MasterDetail"
import { H2, Subtitle } from "~/components/PageTitle"
import { SessionContext } from "~/SessionContext"
import { createMediaQuery } from "@solid-primitives/media"

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
  const stackHeroLinks = createMediaQuery('(max-width: 640px)')

  return (
    <div class="flex-4 flex flex-col">
      <div class="flex border-b items-center">
        <Subtitle>Tags</Subtitle>
        <MasterDetail
          options={options()}
          optionsClass="px-1 justify-end"
          // groups={[{id: 'distinct', label: ''}, {id: 'common', label: ''}]}
          selectedId={selectedId()}
          onChange={setSelectedId}
          horizontal
          pills
          small
        />
      </div>
        <div class="flex justify-between items-center">
          <Subtitle>Claims</Subtitle>
          <Link
            type="button"
            label="➕ Add"
            class="mr-2 py-1"
            route="create-record"
            params={{ tableName: 'statement' }}
          />
        </div>
        <div class="pl-2 border-t pt-2">
          <For each={statements()}>
            {statement => {
              const { id, directive, subscribed, label } = statement
              // TODO: remove dialogue system
              // const hasDialogue = id === withDialogueStatementId
              const hasDialogue = false
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
                    This button was hidden because new users were clicking it instead of the statements
                    const setSubscription = useAction(setSubscriptionAction)
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
    </div>
  )
}