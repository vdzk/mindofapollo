import { createAsync } from "@solidjs/router"
import { Component, createMemo, For, Show } from "solid-js"
import { listArgumentsCache, listForeignCrossRecordsCache } from "~/client-only/query"
import { Link } from "~/components/Link"
import { calcProbSuccess } from "~/compute"
import { DataRecord, DataRecordWithId } from "~/schema/type"
import { argumentSideLabels } from "~/tables/argument/argument"
import { getPercent } from "~/utils/string"

export const Arguments: Component<{ id: number }> = props => {
  const argsData = createAsync(async () => listArgumentsCache(props.id))
  const parentArguments = createAsync(async () => listForeignCrossRecordsCache(
    'critical_statement',
    'statement_id',
    'argument_id',
    props.id
  ))

  const args = () => argsData()?.arguments ?? []
  const isThreshold = () => argsData()?.statement_type_name === 'threshold'

  const sideProbs = createMemo(() => {
    const sideUnknown = [false, false]
    const sideStrengths: [number[], number[]] = [[], []]
    for (const arg of args()) {
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

  const getStrengthStr = (argument: DataRecordWithId) => {
    if (isThreshold()) {
      return [
        argument.weight_lower_limit,
        argument.weight_mode,
        argument.weight_upper_limit
      ].map(x => String(x).padStart(2)).join('/')
    } else {
      return getPercent((
        argument.conditional_confidence ?? argument.isolated_confidence
      ) as number | undefined)
    }
  }

  return (
    <div class="flex-1 max-w-2xl">
      <For each={[true, false]}>
        {pro => (
          <div class="px-2 pb-4">
            <h2 class="text-xl font-bold pb-2">
              <Show when={!isThreshold()}>
                [{getPercent(sideProbs()[Number(pro)])}]
              </Show>
              {argumentSideLabels[Number(pro)]}
            </h2>
            <For each={args().filter(arg => arg.pro === pro)}>
              {argument => (
                <Link
                  route="argument"
                  params={{ id: argument.id }}
                  class="min-w-10 mb-1"
                  type="block"
                  label={
                    <div class="flex gap-2">
                      <div class={isThreshold() ? 'font-mono' : ''}>
                        [{getStrengthStr(argument)}]
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
      <Show when={(parentArguments()?.length ?? 0) > 0}>
        <div class="px-2 pb-4">
          <h2 class="text-xl font-bold pb-2">
            Used In
          </h2>
          <For each={parentArguments()}>
            {parentArgument => (
              <Link
                route="argument"
                params={{ id: parentArgument.id }}
                type="block"
                class="mb-1"
                label={parentArgument.title}
              />
            )}
          </For>
        </div>
      </Show>
    </div >
  )
}
