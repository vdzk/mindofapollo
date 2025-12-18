import { createAsync } from "@solidjs/router"
import { Component, createMemo, For, Match, Show, Switch } from "solid-js"
import { listArgumentsCache, listForeignCrossRecordsCache } from "~/client-only/query"
import { Link } from "~/components/Link"
import { calcProbSuccess } from "~/calc/statementConfidence"
import { DataRecordWithId } from "~/schema/type"
import { argumentSideLabels } from "~/tables/argument/argument"
import { getPercent } from "~/utils/string"
import { tableStyle } from "~/components/table"
import { useBelongsTo } from "~/client-only/useBelongsTo"
import { whoCanInsertRecord } from "~/api/insert/record"
import { Button, importantButtonStyle } from "~/components/buttons"

export const Arguments: Component<{
  id: number,
  tabData?: {
    moralData?: {
      sideSums: [number, number],
      consequences: DataRecordWithId[],
      weightedValues: Record<number, number>,
    }
  },
  setSectionId: (sectionId?: string) => void
}> = props => {
  const argsData = createAsync(async () => listArgumentsCache(props.id))
  const parentArguments = createAsync(async () => listForeignCrossRecordsCache(
    'premise',
    'statement_id',
    'argument_id',
    props.id
  ))

  const args = () => argsData()?.arguments ?? []
  const isThreshold = () => argsData()?.statement_type_name === 'threshold'
  const isPrescriptive = () => argsData()?.statement_type_name === 'prescriptive'

  const sideScores = createMemo(() => {
    if (isPrescriptive()) {
      const sideSums = props.tabData?.moralData?.sideSums ?? [0, 0]
      return [-sideSums[0], sideSums[1]].map(Math.round)
    }
    const sideUnknown = [false, false]
    const sideStrengths: [number[], number[]] = [[], []]
    for (const arg of args()) {
      const i = Number(arg.pro) // side index
      if (sideUnknown[i]) continue
      if (typeof arg.strength === 'number') {
        sideStrengths[i].push(arg.strength)
      } else {
        sideUnknown[i] = true
      }
    }
    return [0, 1].map(i => getPercent(sideUnknown[i]
      ? undefined
      : calcProbSuccess(sideStrengths[i])
    ))
  })

  const getStrengthStr = (argument: DataRecordWithId) => {
    if (isThreshold()) {
      if (argument.weight_mode === null) {
        return '?'
      } else {
        return [
          argument.weight_lower_limit,
          argument.weight_mode,
          argument.weight_upper_limit
        ].map(x => String(x).padStart(2)).join('/')
      }
    } else {
      return getPercent((
        argument.strength
      ) as number | undefined)
    }
  }

  const concsByArgumentId = createMemo(() => {
    if (!props.tabData?.moralData) return {}
    const { consequences, weightedValues } = props.tabData.moralData
    const result: Record<number, {
      moral_good: string,
      value: any,
      unit: string,
      weightedValue: number,
    }[]> = {}
    for (const conc of consequences) {
      const argumentId = conc.argument_id as number
      if (!result[argumentId]) {
        result[argumentId] = []
      }
      result[argumentId].push({
        moral_good: conc.moral_good as string,
        value: conc.value,
        unit: conc.unit as string,
        weightedValue: (conc.pro ? 1 : -1) * (weightedValues[conc.id] ?? 0),
      })
    }
    return result
  })

  const canCreateNew = () => useBelongsTo(whoCanInsertRecord('argument'))

  return (
    <div class="flex-1 max-w-2xl">
      <Show when={canCreateNew}>
        <Button
          label="➕ Add argument"
          onClick={() => props.setSectionId('createArgument')}
          class={"mx-2 mb-4 " + importantButtonStyle}
        />
      </Show>
      <For each={[true, false]}>
        {pro => (
          <div class="px-2 pb-4">
            <h2 class="text-xl font-bold pb-2">
              <Show when={!isThreshold()}>
                [{sideScores()[Number(pro)]}]{' '}
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
                    <Switch>
                      <Match when={isPrescriptive()}>
                        <div class="pl-12">{argument.title}</div>
                        <For each={concsByArgumentId()[argument.id]}>
                          {consequence => (
                            <div class="flex gap-2">
                              <div class="min-w-10">[{Math.round(consequence.weightedValue)}]</div>
                              <div class="flex-1">
                                <span class="font-bold">
                                  {consequence.moral_good}:
                                </span>
                                {' '}{consequence.value + ''}
                                {' '}{consequence.unit}
                              </div>
                            </div>
                          )}
                        </For>
                      </Match>
                      <Match when={!isPrescriptive()}>
                        <div class="flex gap-2">
                          <div class={isThreshold() ? 'font-mono' : ''}>
                            [{getStrengthStr(argument)}]
                          </div>
                          <div class="flex-1">{argument.title}</div>
                        </div>
                      </Match>
                    </Switch>
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
          <table>
            <thead>
              <tr class={tableStyle.tHeadTr}>
                <th class={tableStyle.th}>Claim</th>
                <th class={tableStyle.th}>Side</th>
                <th class={tableStyle.th}>Argument</th>
              </tr>
            </thead>
            <tbody>
              <For each={parentArguments()}>
                {parentArgument => (
                  <tr>
                    <td class={tableStyle.td}>
                      <Link
                        route="statement"
                        params={{ id: parentArgument.statement_id }}
                        type="block"
                        class="mb-1"
                        label={parentArgument.statement_label}
                      />
                    </td>
                    <td class={tableStyle.td}>
                      {argumentSideLabels[Number(parentArgument.pro)]}
                    </td>
                    <td class={tableStyle.td}>
                      <Link
                        route="argument"
                        params={{ id: parentArgument.id }}
                        type="block"
                        class="mb-1"
                        label={parentArgument.title}
                      />
                    </td>
                  </tr>
                )}
              </For>
            </tbody>
          </table>
        </div>
      </Show>
    </div >
  )
}
