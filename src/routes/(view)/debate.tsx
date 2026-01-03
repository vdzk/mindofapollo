import { createAsync, revalidate } from "@solidjs/router"
import { Show } from "solid-js"
import { getOneExtRecordByIdCache } from "~/client-only/query"
import { useSafeParams } from "~/client-only/util"
import { Debate } from "~/views/Debate/Debate"

export default function DebateRoute() {
  const sp = useSafeParams<{ id: number }>(['id'])
  const record = createAsync(() => getOneExtRecordByIdCache('debate', sp().id))
  const refresh = () => revalidate(getOneExtRecordByIdCache.keyFor('debate', sp().id))

  return (
    <Show when={record()}>
      <Debate record={record()!} refresh={refresh} />
    </Show>
  )
}