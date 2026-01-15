import { ExternalLink, Links } from "~/components/Link"
import { Subtitle } from "~/components/PageTitle"
import { SessionContext } from "~/SessionContext"
import { useContext } from "solid-js"

export const HomeLinks = () => {
  const session = useContext(SessionContext)
  return (
    <div class="flex border-b">
      <div class="flex-1">
        <Subtitle>Internal</Subtitle>
        <div class="px-2 py-3 border-t">
          <Links
            type="button"
            links={[
              {
                label: "Recent activity",
                route: "recent-activity"
              },
              {
                label: "Statements",
                route: "list-records",
                params: { tableName: 'statement' }
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
      </div>
      <div class="flex-1 border-l">
        <Subtitle>External</Subtitle>
        <div class="px-2 py-2 border-t">
          <ExternalLink
            href="https://github.com/vdzk/mindofapollo"
            label="GitHub Repository"
          />
          <br />
          <ExternalLink
            href="https://static.mindofapollo.org/backups/"
            label="Database Dumps"
          />
          <br />
          <ExternalLink
            href="https://suave-cornet-3f8.notion.site/Realise-Apollo-s-Grand-Vision-2c3b9c901c198097a33cd0f9ea3ae1d0"
            label="Project Tasks"
          />
        </div>
      </div>
    </div>
  )
}