import { Component, For } from "solid-js"
import { createAsync } from "@solidjs/router"
import { Link } from "./Link"
import { getUserActivity } from "~/api/components/UserActivity"

interface ActivityRecord {
  id: number;
  user_id: number;
  action: string;
  version: number;
  table_name: string | null;
  record_id: number | null;
  data: any;
  timestamp: string;
  title_text: string | null;
}

const getActivityLabel = (activity: ActivityRecord) => {
  const title = activity.title_text ? `: ${activity.title_text}` : '';
  if (activity.action === 'genericChange') {
    return `${activity.table_name}${title}`;
  }
  const tablePart = activity.table_name ? `on ${activity.table_name}` : '';
  return `${activity.action} ${tablePart}${title}`;
}

export const UserActivity: Component<{id: number}> = props => {
    const activities = createAsync(() => getUserActivity(props.id))

  return (
    <div class="px-2">
      <For each={activities()}>
        {(activity: ActivityRecord) => (
          <div>
            <Link
              route="expl"
              params={{ id: activity.id }}
              label={getActivityLabel(activity)}
            />
          </div>
        )}
      </For>
    </div>
  )
}