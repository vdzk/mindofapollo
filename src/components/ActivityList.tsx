import { For, Show } from "solid-js"
import { Link } from "~/components/Link"
import { getExplSummaryStr } from "~/components/expl/Expl"
import { ExplRecord } from "~/server-only/expl"

// Format date for display as "YYYY-MM-DD"
export const formatDate = (date: Date) => {
  return date.toISOString().split('T')[0];
}

// Extended type to include optional isNew property
type ExplRecordWithOptionalIsNew<T> = ExplRecord<T> & { isNew?: boolean }

// Group activity by date
export const groupActivityByDate = (activity: ExplRecordWithOptionalIsNew<any>[]) => {
  if (!activity) return [];

  const groups: Record<string, ExplRecordWithOptionalIsNew<any>[]> = {};

  activity.forEach(item => {
    const dateKey = formatDate(item.timestamp);
    if (!groups[dateKey]) {
      groups[dateKey] = [];
    }
    groups[dateKey].push(item);
  });

  return Object.entries(groups);
};

export function ActivityList(props: {
  activity: ExplRecordWithOptionalIsNew<any>[] | undefined
}) {
  const groupedActivity = () => groupActivityByDate(props.activity || []);

  return (
    <div class="px-2">
      <Show when={props.activity} fallback={<div>Loading...</div>}>
        <Show when={props.activity?.length} fallback={<div class="text-gray-500">No activity found</div>}>
          <For each={groupedActivity()}>
            {([date, items]) => (
              <>
                <div class="mt-4 mb-2 text-lg font-medium text-gray-700">
                  {date}
                </div>
                <For each={items}>
                  {(explRecord) => (
                    <div class="mb-2 flex gap-2">
                      <div class="text-sm text-gray-500 flex-shrink-0">
                        {explRecord.timestamp.toISOString().split('.')[0].split('T')[1]}
                      </div>
                      <Show when={explRecord.data}>
                        <div class="flex items-center gap-2">
                          {explRecord.is_new && (
                            <span class="inline-block w-2 h-2 bg-blue-500 rounded-full" title="New update"></span>
                          )}
                          <Link
                            route="expl"
                            params={{ id: explRecord.id }}
                            label={getExplSummaryStr(explRecord)}
                          />
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
