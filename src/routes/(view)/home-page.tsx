import { Title } from "@solidjs/meta"
import UserSubscriptions from "~/views/HomePage/UserSubscriptions"
import Statements from "~/views/HomePage/Statements"
import { SessionContext } from "~/SessionContext"
import { Match, Show, Switch, useContext } from "solid-js"
import { Subtitle } from "~/components/PageTitle"
import { MasterDetail } from "~/components/MasterDetail"
import { useSearchParams } from "@solidjs/router"
import { HomeLinks } from "~/views/HomePage/HomeLinks"
import { ExternalLink, Link } from "~/components/Link"
import { createMediaQuery } from "@solid-primitives/media"

export type HomeTabId = 'claims' | 'subs' | 'links'

const mainLinks = (
  <>
    <Link
      type='button'
      label="⚔️ Debate"
      route="debates"
      class="py-1"
    />
    <ExternalLink
      label="📖 About"
      href="/about.html"
      button
      class="py-1"
    />
  </>
)

export default function HomePage() {
  const session = useContext(SessionContext)
  const [searchParams, setSearchParams] = useSearchParams()
  const tabId = () => (searchParams.tabId as HomeTabId | undefined) ?? 'claims'
  const centerMainLinks = createMediaQuery('(min-width: 860px)')
  const stackView = createMediaQuery('(max-width: 480px)')
  return (
    <main>
      <Title>Home</Title>
      <div class="border-b flex flex-wrap items-center justify-between">
        <Subtitle>Home</Subtitle>
        <Show when={centerMainLinks()}>
          <div class="w-30" />
        </Show>
        <Show when={!stackView()}>
          <div class="flex gap-3">
            {mainLinks}
          </div>
        </Show>
        <Show when={centerMainLinks()}>
          <div class="w-1" />
        </Show>
        <MasterDetail
          options={[
            { id: 'claims', label: 'Claims' },
            ...(session?.userSession?.()?.authenticated
              ? [{ id: 'subs', label: 'Subs' }] : []
            ),
            { id: 'links', label: 'Links' }
          ]}
          class="pr-1 flex-none"
          pills
          selectedId={tabId()}
          onChange={id => setSearchParams({ tabId: id })}
        />
      </div>
      <Show when={stackView()}>
        <div class="flex gap-2 border-b px-2 py-2 justify-end">
          {mainLinks}
        </div>
      </Show>
      <Switch>
        <Match when={tabId() === 'claims'}>
          <Statements />
        </Match>
        <Match when={tabId() === 'subs'}>
          <UserSubscriptions />
        </Match>
        <Match when={tabId() === 'links'}>
          <HomeLinks />
        </Match>
      </Switch>
    </main>
  )
}
