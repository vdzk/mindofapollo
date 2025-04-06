import { Links } from "~/components/Link"
import { Subtitle } from "~/components/PageTitle"

export default function ThingsToDoAndOther() {
  return (
    <div class="flex-2 border-l pt-2">
      <Subtitle>Things to do</Subtitle>
      <div class="px-2 pb-4">
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
              label: "Request rule change",
              route: 'create-record',
              params: { tableName: 'rule_change_request' }
            },
            {
              label: "Your directives",
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
      </div>
    </div>
  )
}