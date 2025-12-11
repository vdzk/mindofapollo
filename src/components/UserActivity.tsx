import { Component, For, Show } from "solid-js"
import { createAsync } from "@solidjs/router"
import { listUserActivity } from "~/api/list/userActivity"
import { ExplRecord } from "~/server-only/expl"
import { Link } from "~/components/Link"
import { getActionStr, getExplData } from "~/components/expl/Expl"
import { HistoryLink } from "~/components/expl/HistoryLink"
import { formatDate } from "~/utils/string"

// Group activity by date only
const groupActivityByDateOnly = (activity: ExplRecord<any>[]) => {
  if (!activity) return [];

  const groups: Record<string, ExplRecord<any>[]> = {};

  activity.forEach(item => {
    const dateKey = formatDate(item.timestamp);
    
    if (!groups[dateKey]) {
      groups[dateKey] = [];
    }
    
    groups[dateKey].push(item);
  });

  return Object.entries(groups);
};

export const UserActivity: Component<{id: number}> = props => {
  const activity = createAsync(() => listUserActivity(props.id))
  const groupedActivity = () => groupActivityByDateOnly(activity() || []);

  return (
    <div class="px-2">
      <Show when={activity()} fallback={<div>Loading...</div>}>
        <Show when={activity()?.length} fallback={<div class="text-gray-500">No activity found</div>}>
          <For each={groupedActivity()}>
            {([date, items]) => (
              <>
                <div class="mt-4 mb-2 text-lg font-medium text-gray-700">
                  {date}
                </div>
                <For each={items}>
                  {(explRecord) => (
                    <div class="mb-2">
                      <Show when={explRecord.data}>
                        <div class="flex items-start gap-2 flex-1">
                          <div class="flex-1">
                            <Show
                              when={explRecord.table_name && explRecord.record_id}
                              fallback={getActionStr(getExplData(explRecord))}
                            >
                              <Link
                                route="show-record"
                                params={{ tableName: explRecord.table_name!, id: explRecord.record_id! }}
                                label={getActionStr(getExplData(explRecord))}
                              />
                            </Show>
                          </div>
                          <HistoryLink explId={explRecord.id} />
                        </div>
                      </Show>
                    </div>
                  )}
                </For>
              </>
            )}
          </For>
        </Show>
      </Show>
    </div>
  )
}