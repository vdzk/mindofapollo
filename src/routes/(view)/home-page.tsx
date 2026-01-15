import { Title } from "@solidjs/meta"
import UserSubscriptions from "~/views/HomePage/UserSubscriptions"
import Statements from "~/views/HomePage/Statements"
import { SessionContext } from "~/SessionContext"
import { Match, Switch, useContext } from "solid-js"
import { Subtitle } from "~/components/PageTitle"
import { MasterDetail } from "~/components/MasterDetail"
import { useSearchParams } from "@solidjs/router"
import { HomeLinks } from "~/views/HomePage/HomeLinks"
import { ExternalLink, Link } from "~/components/Link"

export type HomeTabId = 'claims' | 'subs' | 'links'

export default function HomePage() {
  const session = useContext(SessionContext)
  const [searchParams, setSearchParams] = useSearchParams()
  const tabId = () => (searchParams.tabId as HomeTabId | undefined) ?? 'claims'
  return (
    <main>
      <Title>Home</Title>
      <div class="border-b flex flex-wrap items-center justify-between">
        <Subtitle>Home</Subtitle>
        <div class="w-30" />
        <div class="flex gap-3">
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
        </div>
        <div class="w-1" />
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
