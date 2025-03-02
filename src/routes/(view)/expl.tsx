import { createAsync } from "@solidjs/router"
import { Show } from "solid-js"
import { getOneExpl } from "~/api/getOne/expl"
import { useSafeParams } from "~/client-only/util"
import { Expl } from "~/components/expl/Expl"
import { ExplRecord } from "~/server-only/expl"

export default function ExplRoute() {
  const sp = useSafeParams<{ id: number }>(['id'])
  const expl = createAsync<ExplRecord<any>>(() => getOneExpl(sp().id))

  return (
    <Show when={expl()}>
      <Expl explRecord={expl()!} />
    </Show>
  )
}