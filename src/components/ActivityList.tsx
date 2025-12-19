import { createEffect, For, Match, Show, Switch } from "solid-js"
import { Link } from "~/components/Link"
import { getActionStr, getActorStr, getExplData } from "~/components/expl/Expl"
import { ExplRecord } from "~/server-only/expl"
import { HistoryLink } from "~/components/expl/HistoryLink"
import { schema } from "~/schema/schema"

// Format date for display as "YYYY-MM-DD"
export const formatDate = (date: Date) => {
  return date.toISOString().split('T')[0];
}

// Format time to show hour without leading zero
export const formatHour = (date: Date) => {
  return parseInt(date.toISOString().split('T')[1].substring(0, 2)).toString();
}

// Format time to show only minutes
export const formatMinutes = (date: Date) => {
  return date.toISOString().split('T')[1].substring(3, 5);
}

// Extended type to include optional isNew property
type ExplRecordWithOptionalIsNew<T> = ExplRecord<T> & { is_new?: boolean }

// Define a type for the return value of groupActivityByDate
type GroupedActivity = [string, [string, [string, ExplRecordWithOptionalIsNew<any>[]][]][]][];

// Group activity by date, hour, and user_id
export const groupActivity = (activity: ExplRecordWithOptionalIsNew<any>[]): GroupedActivity => {
  if (!activity) return [];

  const groups: Record<string, Record<string, Record<string, ExplRecordWithOptionalIsNew<any>[]>>> = {};

  activity.forEach(item => {
    const dateKey = formatDate(item.timestamp);
    const hourKey = formatHour(item.timestamp);
    const userKey = item.user_id || 'system';
    
    if (!groups[dateKey]) {
      groups[dateKey] = {};
    }
    if (!groups[dateKey][hourKey]) {
      groups[dateKey][hourKey] = {};
    }
    if (!groups[dateKey][hourKey][userKey]) {
      groups[dateKey][hourKey][userKey] = [];
    }
    groups[dateKey][hourKey][userKey].push(item);
  });

  return Object.entries(groups).map(([date, hours]) => {
    return [date, Object.entries(hours)
      // Sort hours in descending order (later hours first)
      .sort((a, b) => parseInt(b[0]) - parseInt(a[0]))
      .map(([hour, users]) => {
        return [hour, Object.entries(users)];
      })];
  });
};

export function ActivityList(props: {
  activity: ExplRecordWithOptionalIsNew<any>[] | undefined
  goToRecord?: boolean
}) {
  const groupedActivity = () => groupActivity(props.activity || [])

  return (
    <div class="px-2">
      <Show when={props.activity} fallback={<div>Loading...</div>}>
        <Show when={props.activity?.length} fallback={<div class="text-gray-500">No activity found</div>}>
          <For each={groupedActivity()}>
            {([date, hourGroups]) => (
              <>
                <div class="mt-4 mb-2 text-lg font-medium text-gray-700">
                  {date}
                </div>
                <For each={hourGroups}>
                  {([hour, userGroups]) => (
                    <>
                      <div class="mt-3 mb-1 text-md text-gray-600">
                        {hour}h
                      </div>
                      <For each={userGroups}>
                        {([userId, items]) => {
                          const firstItem = items[0];
                          return (
                            <>
                              <div class="mt-2 mb-1 font-medium text-gray-700">
                                {userId !== 'system' && firstItem.user_id ? (
                                  <Link
                                    route="show-record"
                                    params={{ tableName: 'person', id: firstItem.user_id }}
                                    label={getActorStr(getExplData(firstItem))}
                                  />
                                ) : (
                                  getActorStr(getExplData(firstItem))
                                )}
                              </div>
                              <For each={items}>
                                {(explRecord) => (
                                  <div class="mb-2 flex gap-2">
                                    <div class="text-sm text-gray-500 shrink-0">
                                      {formatMinutes(explRecord.timestamp)}
                                    </div>
                                    <Show when={explRecord.data}>
                                      <div class="flex items-start gap-2 flex-1">
                                        {explRecord.is_new && (
                                          <span class="inline-block w-2 h-2 bg-blue-500 rounded-full shrink-0 mt-1.5" title="New update"></span>
                                        )}
                                        <Switch>
                                          <Match when={props.goToRecord}>
                                            <div class="flex-1">
                                              <Show
                                                when={explRecord.table_name && explRecord.record_id}
                                                fallback={getActionStr(getExplData(explRecord))}
                                              >
                                                <Show
                                                  when={explRecord.table_name! in schema.tables}
                                                  fallback={getActionStr(getExplData(explRecord))}
                                                >
                                                  <Link
                                                    route="show-record"
                                                    params={{ tableName: explRecord.table_name!, id: explRecord.record_id! }}
                                                    label={getActionStr(getExplData(explRecord))}
                                                  />
                                                </Show>
                                              </Show></div>
                                            <HistoryLink explId={explRecord.id} />
                                          </Match>
                                          <Match when>
                                            <Link
                                              route="expl"
                                              params={{ id: explRecord.id }}
                                              label={getActionStr(getExplData(explRecord))}
                                            />
                                          </Match>
                                        </Switch>
                                      </div>
                                    </Show>
                                  </div>
                                )}
                              </For>
                            </>
                          );
                        }}
                      </For>
                    </>
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
