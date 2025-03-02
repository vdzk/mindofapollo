import { _updateRecord } from "~/server-only/mutate"
import { sql } from "~/server-only/db"
import { calcStatementConfidence } from "~/compute"
import { finishExpl, startExpl } from "~/server-only/expl"
import { AddExplId, ExplData } from "~/components/expl/types"
import { addExplIdColNames, firstCap, getPercent, pickWithExplId } from "~/util"
import { _getRecordById } from "./select";
import { DataRecordWithId } from "~/schema/type"
import { Link } from "~/components/Link"
import { Component, For } from "solid-js"
import { ExplLink } from "~/components/expl/ExplLink"


export const attemptJudgeStatement = async (
  statementId: number,
  triggerExplId: number,
  triggerLabel: string
) => {
  const colNames = ['pro', 'isolated_confidence', 'conditional_confidence']

  const argumentConfidences: AddExplId<{
    pro: boolean,
    isolated_confidence: number | null,
    conditional_confidence: number | null
  }>[] = await sql`
    SELECT ${sql(addExplIdColNames(colNames))}
    FROM argument a
    LEFT JOIN argument_judgement aj ON aj.id = a.id
    LEFT JOIN argument_conditional ac ON ac.id = a.id
    WHERE a.statement_id = ${statementId}
      `
  let canJudge = true
  let hasNonConditional = [false, false] // [con, pro]
  const confidences: [number[], number[]] = [[], []]
  for (const argument of argumentConfidences) {
    if (argument.isolated_confidence === null) {
      canJudge = false
    }

    const side = Number(argument.pro)
    if (argument.conditional_confidence === null) {
      if (hasNonConditional[side]) {
        // Only one non-conditional argument is allowed
        canJudge = false
      } else {
        hasNonConditional[side] = true
      }
      confidences[side].push(argument.isolated_confidence as number)
    } else {
      confidences[side].push(argument.conditional_confidence)
    }
    if (!canJudge) {
      break
    }
  }
  if (canJudge) {
    const explId = await startExpl(
      null, 'attemptJudgeStatement', 1, 'statement', statementId)
    const newFragment = {
      judgement_requested: false,
      confidence: calcStatementConfidence(confidences),
      decided: true
    }
    const diff = await _updateRecord(
      'statement', statementId, explId, newFragment
    )
    const statement = await _getRecordById('statement', statementId, ['text'])
    if (!statement) return
    const data: ExplJudgeStatementData = {
      triggerExplId,
      triggerLabel,
      statement,
      argumentConfidences,
      confidences,
      diff
    }
    await finishExpl(explId, data)
    return explId
  } else {
    return
  }
}

interface ExplJudgeStatementData {
  triggerExplId: number
  triggerLabel: string
  statement: DataRecordWithId
  argumentConfidences: AddExplId<{
    pro: boolean,
    isolated_confidence: number | null,
    conditional_confidence: number | null
  }>[]
  confidences: [number[], number[]]
  diff: ExplData['diff']
}

export const explAttemptJudgeStatement = (data: ExplJudgeStatementData): ExplData => {
  return {
    actor: { type: 'system' },
    action: 'calculated its confidence in',
    target: {
      tableName: 'statement',
      id: data.statement.id,
      label: data.statement.text as string
    },
    trigger: {
      explId: data.triggerExplId,
      label: data.triggerLabel
    },
    diff: data.diff,
    relevantRecords: {
      argument: data.argumentConfidences,
      statement: [data.statement]
    },
    customSections: {
      derivation: {
        label: 'Derivation',
        component: Derivation
      }
    },
    checks: [
      'All of the arguments have been judged.',
      'For each side, the confidence of each subsequent argument was judged conditionally on all preceding arguments'
    ],
    notes: [
      <>
        The system applied the statement confidence formula to the confidences above. You can test it out in the{' '}
        <Link label="confidence calculator" route="confidence-calculator" />.
      </>
    ]
  }
}

const Derivation: Component<ExplJudgeStatementData> = (data) => {
  const sideArgs = (pro: boolean) => data.argumentConfidences.filter(arg => arg.pro === pro)
  return (
    <main>
      <For each={[{ label: 'Pro', pro: true }, { label: 'Con', pro: false }]}>
        {({ label, pro }) => (
          <div class="px-2">
            <h3>{label}</h3>
            <ul>
              <For each={sideArgs(pro)}>
                {arg => (
                  <li>
                    <For each={['isolated', 'conditional'] as const}>
                      {type => {
                        const value = arg[`${type}_confidence`]
                        const explId = arg[`${type}_confidence_expl_id`]
                        return (
                          value !== null && (
                            <div>
                              {firstCap(type)} confidence: {value}{' '}
                              <ExplLink {...{ explId }} />
                            </div>
                          )
                        )
                      }}
                    </For>
                  </li>
                )}
              </For>
            </ul>
          </div>
        )}
      </For>


      <div class="px-2">
        Final confidences of the arguments
        <ul>
          <For each={[{ label: 'Pro', pro: 1 }, { label: 'Con', pro: 0 }]}>
            {({ label, pro }) => (
              <li>
                {label}: {data.confidences[pro].map(getPercent).join(', ')}
              </li>
            )}
          </For>
        </ul>
      </div>
    </main>
  )
}
