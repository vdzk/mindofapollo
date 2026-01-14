import { JSX, Show } from "solid-js"
import { DebateTabId } from "~/routes/(view)/debates"
import { DataRecord, DataRecordWithId } from "~/schema/type"
import { getTextFromLabel } from "~/tables/statement/statement"
import { getResultColor, getResultText } from "./Debate"
import { getPercent } from "~/utils/string"

const getDisplayValue = (debate: DataRecord, current: boolean) => {
  const rawValue = debate[current ? 'current_value' : 'threshold_value'] as number
  return debate.extTableName === 'debate_confidence'
    ? getPercent(rawValue)
    : Math.round(rawValue)
}

export type ColumnCtx = {
  tabId: DebateTabId
  userId: number | undefined
  deltas: Record<number, number>
}

type ColumnDef = {
  key: string
  label: string
  description?: string
  showWhen: (tabId: DebateTabId) => boolean
  getCell: (debate: DataRecordWithId, ctx: ColumnCtx) => JSX.Element
}

export const columns: ColumnDef[] = [
  {
    key: 'claim',
    label: 'Claim',
    description: 'the subject of the debate',
    showWhen: () => true,
    getCell: (debate) => (
      <>
        {getTextFromLabel(debate.statement_label as string)}
        <Show when={debate.moral_weight_profile_name}>
          <span
            title="Different people value things differently. A moral profile determines how outcomes of a prescription are evaluated."
            class="inline-block px-2 cursor-default"
          >
            ⚖️
          </span>
          {debate.moral_weight_profile_name}
        </Show>
      </>
    )
  },
  {
    key: 'now',
    label: 'Now',
    description: 'current confidence / consequence score',
    showWhen: (tabId) => tabId === 'invite',
    getCell: (debate) => getDisplayValue(debate, true)
  },
  {
    key: 'goal',
    label: 'Goal',
    description: 'win condition for the person who will accepts the invite',
    showWhen: (tabId) => tabId === 'invite',
    getCell: (debate, ctx) =>
      (debate.creator_above === (ctx.userId === debate.creator_id) ? '> ' : '< ')
      + getDisplayValue(debate, false)
  },
  {
    key: 'opponent',
    label: 'Opponent',
    description: 'the person who created the invite',
    showWhen: (tabId) => tabId === 'invite',
    getCell: (debate, ctx) => ctx.userId === debate.creator_id
      ? <span class="opacity-50">your invite</span>
      : debate.creator_name
  },
  ...([true, false] as const).map((pro): ColumnDef => ({
    key: pro ? 'supporting' : 'opposing',
    label: pro ? 'Supporting' : 'Opposing',
    description: pro ? 'pro side debater' : 'con side debater',
    showWhen: (tabId) => tabId !== 'invite',
    getCell: (debate, ctx) => {
      const win = (ctx.tabId === 'ongoing')
        ? (ctx.deltas[debate.id] > 0) === pro
        : (debate.creator_above === pro) === debate.creator_won

      return (
        <>
          <span
            class="font-bold [-webkit-text-stroke:1.5px] mr-1 font-serif"
            classList={{ [getResultColor(win, ctx.tabId === 'ongoing')]: true }}
            title={getResultText(win, ctx.tabId === 'ongoing')}
          >
            <Show when={ctx.tabId === 'ongoing'}>{win ? 'W' : 'L'}</Show>
            <Show when={ctx.tabId === 'closed'}>{win ? 'V' : 'Q'}</Show>
          </span>
          <span>
            {debate.creator_above === pro ? debate.creator_name : debate.taker_name}
          </span>
        </>
      )
    }
  })),
  {
    key: 'gap',
    label: 'Score gap',
    description: 'gap between the current score and the winning threshold',
    showWhen: (tabId) => tabId === 'ongoing',
    getCell: (debate, ctx) => debate.extTableName === 'debate_confidence'
      ? getPercent(Math.abs(ctx.deltas[debate.id]))
      : Math.round(Math.abs(ctx.deltas[debate.id]))
  },
  {
    key: 'threshold',
    label: 'Threshold',
    description: 'confidence / consequence score threshold that determined who was winning',
    showWhen: (tabId) => tabId === 'closed',
    getCell: (debate) => getDisplayValue(debate, false)
  }
]