import { Links } from "~/components/Link"
import { Subtitle } from "~/components/PageTitle"

export default function ThingsToDoAndOther() {
  return (
    <>
      <Subtitle>Things to do</Subtitle>
      <div class="px-2 pb-6">
        <Links
          type="button"
          links={[
            {
              label: "Invites",
              route: "list-records",
              params: { tableName: 'invite' }
            },
            {
              label: "Chat",
              route: "chat"
            },
            {
              label: "My directives",
              route: "show-directive"
            }
          ]}
        />
      </div>
      <Subtitle>Other</Subtitle>
      <div class="px-2">
        <Links
          type="button"
          links={[
            {
              label: "Tables",
              route: "list-tables",
              params: { tableName: 'statement' }
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
      </div>
    </>
  )
}