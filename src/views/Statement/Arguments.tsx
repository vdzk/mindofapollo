import { createAsync } from "@solidjs/router"
import { Component, createMemo, createSignal, For, Show } from "solid-js"
import { listArgumentsCache } from "~/client-only/query"
import { Aggregate } from "~/components/aggregate/Aggregate"
import { Link } from "~/components/Link"
import { calcProbSuccess } from "~/compute"
import { argumentSideLabels } from "~/tables/argument/argument"
import { getPercent } from "~/utils/string"

export const Arguments: Component<{ statementId: number }> = props => {
  const _arguments = createAsync(async () => listArgumentsCache(props.statementId))
  const [selectedArg, setSelectedArg] = createSignal<number | null>(null)
  const toggleSelectedArg = (x: number) =>
    setSelectedArg(y => x === y ? null : x)


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
                <div class="flex">
                  <Link
                    route="argument"
                    params={{ id: argument.id }}
                    label={`[${getPercent(
                      (argument.conditional_confidence
                        ?? argument.isolated_confidence
                      ) as number | undefined
                    )}]`}
                    class="min-w-10 mr-1"
                  />
                  <div>
                    <div
                      class="cursor-pointer px-1.5 border border-transparent hover:border-gray-600 rounded"
                      onClick={() => toggleSelectedArg(argument.id)}
                    >
                      {argument.title}
                      <span class="font-bold">
                        {argument.critical_statements_count ? ` {${argument.critical_statements_count}}` : ''}
                      </span>
                    </div>
                    <Show when={argument.id === selectedArg()}>
                      <div class="pl-6">
                        <Aggregate
                          tableName="argument"
                          id={argument.id}
                          aggregateName="critical_statements"
                        />
                      </div>
                    </Show>
                  </div>
                </div>
              )}
            </For>
          </div>
        )}
      </For>
    </div>
  )
}
