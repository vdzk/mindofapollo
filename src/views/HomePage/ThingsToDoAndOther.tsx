import { ExternalLink, Link, Links } from "~/components/Link"
import { Subtitle } from "~/components/PageTitle"
import { CurrentTaskBtn } from "./CurrentTaskBtn"
import { SessionContext } from "~/SessionContext"
import { Show, useContext } from "solid-js"
import { openRegistration } from "~/constant"

export default function ThingsToDoAndOther() {
  const session = useContext(SessionContext)
  const authenticated = () => !!session?.userSession?.()?.authenticated
  return (
    <div class="flex-2 border-l pt-2">
      <Subtitle>Learn</Subtitle>
      <div class="px-2 pb-4">
        <ExternalLink
          label="📖 Mind of Apollo Explained"
          href="/about.html"
          class="block"
        />
        <ExternalLink
          label="▶️ Introducing Mind of Apollo (27 min)"
          href="https://www.youtube.com/watch?v=LU36JGwA6HQ"
          class="block"
        />
        <ExternalLink
          label="▶️ Quick Start Guide for Editors (9 min)"
          href="https://www.youtube.com/watch?v=OEx4yj1nsPk"
          class="block"
        />
      </div>
      <Subtitle>Things to do</Subtitle>
      <div class="px-2">
        <Links
          type="button"
          links={[
            ...(openRegistration ? [] : [
              {
                label: "Invites",
                route: "list-records",
                params: { tableName: 'invite' }
              }
            ]),
            {
              label: "Chat",
              route: "chat"
            },
            {
              label: "Issues",
              route: 'list-records',
              params: { tableName: 'issue' }
            },
            ...(authenticated() ? [
              {
                label: "Your directives",
                route: "show-directive"
              }
            ] : [])
          ]}
        />
      </div>
      <Subtitle>Other</Subtitle>
      <div class="px-2 pb-4">
        <Links
          type="button"
          links={[
            {
              label: "Tables",
              route: "list-tables"
            },
            {
              label: "Sandboxes",
              route: "list-sandboxes",
              params: { tableName: 'directive' }
            },
            {
              label: "Recent activity",
              route: "recent-activity"
            }
          ]}
        />
        <Show when={authenticated()}>
          <span class="w-2 inline-block" />
          <Link
            type="button"
            label="Tasks"
            route="list-records"
            params={{ tableName: 'task' }}
          />
          <span class="w-2 inline-block" />
          <CurrentTaskBtn />
        </Show>
      </div>
      <Show when={authenticated()}>
        <Subtitle>Your Permissions</Subtitle>
        <div class="px-2 pb-4 text-sm">
          You can create new entries, as well as update or delete any entries you've created within the past 24 hours.
          As the platform's permission system evolves, and as you continue to create high-quality entries, additional permissions will be granted.
        </div>
      </Show>
      <Subtitle>Source Code</Subtitle>
      <div class="px-2 pb-4">
        <ExternalLink
          href="https://github.com/Mind-of-Apollo/apollo/tree/main"
          label="GitHub Repository"
        />
      </div>
    </div>
  )
}