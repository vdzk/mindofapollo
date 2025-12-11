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
            {
              label: 'Compete to convince',
              route: 'compete-to-convince'
            },
            ...(openRegistration ? [] : [
              {
                label: "Invites",
                route: "list-records",
                params: { tableName: 'invite' }
              }
            ])
          ]}
        />
      </div>
      <Subtitle>Other</Subtitle>
      <div class="px-2 pb-2">
        <Links
          type="button"
          links={[
            {
              label: "Recent activity",
              route: "recent-activity"
            },
            {
              label: "Definitions",
              route: "list-records",
              params: { tableName: 'definition' }
            },
            {
              label: "Tables",
              route: "list-tables"
            },
            {
              label: "Sandboxes",
              route: "list-sandboxes",
              params: { tableName: 'directive' }
            }
          ]}
        />
      </div>
      <Subtitle>Links</Subtitle>
      <div class="px-2 pb-4">
        <ExternalLink
          href="https://github.com/vdzk/mindofapollo"
          label="GitHub Repository"
        />
        <br/>
        <ExternalLink
          href="https://static.mindofapollo.org/backups/"
          label="Database Dumps"
        />
        <br/>
        <ExternalLink
          href="https://suave-cornet-3f8.notion.site/Realise-Apollo-s-Grand-Vision-2c3b9c901c198097a33cd0f9ea3ae1d0"
          label="Project Tasks"
        />
      </div>
    </div>
  )
}