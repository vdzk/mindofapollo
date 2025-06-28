import { createAsync } from "@solidjs/router"
import { Component, createMemo, For } from "solid-js"
import { listArgumentsCache } from "~/client-only/query"
import { Link } from "~/components/Link"
import { calcProbSuccess } from "~/compute"
import { argumentSideLabels } from "~/tables/argument/argument"
import { getPercent } from "~/utils/string"

export const Arguments: Component<{ id: number }> = props => {
  const _arguments = createAsync(async () => listArgumentsCache(props.id))


  const sideProbs = createMemo(() => {
    const sideUnknown = [false, false]
    const sideStrengths: [number[], number[]] = [[], []]
    for (const arg of _arguments() ?? []) {
      const i = Number(arg.pro) // side index
      if (sideUnknown[i]) continue
      const strength = arg.conditional_confidence ?? arg.isolated_confidence
      if (typeof strength === 'number') {
        sideStrengths[i].push(strength)
      } else {
        sideUnknown[i] = true
      }
    }
    return [0, 1].map(i => sideUnknown[i]
      ? undefined
      : calcProbSuccess(sideStrengths[i])
    )
  })

  return (
    <div class="flex-1 max-w-2xl">
      <For each={[true, false]}>
        {pro => (
          <div class="p-2 flex-1">
            <h2 class="text-xl font-semibold py-2">
              {`[${getPercent(sideProbs()[Number(pro)])}] ${argumentSideLabels[Number(pro)]}`}
            </h2>
            <For each={_arguments()?.filter(arg => arg.pro === pro)}>
              {argument => (
                <Link
                  route="argument"
                  params={{ id: argument.id }}
                  class="min-w-10 mr-1"
                  type="block"
                  label={
                    <div class="flex gap-2">
                      <div>{`[${getPercent(
                        (argument.conditional_confidence
                          ?? argument.isolated_confidence
                        ) as number | undefined
                      )}]`}
                      </div>
                      <div class="flex-1">{argument.title}</div>
                    </div>
                  }
                />
              )}
            </For>
          </div>
        )}
      </For >
    </div >
  )
}
