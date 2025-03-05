import { _updateRecord } from "~/server-only/mutate"
import { onError, sql } from "~/server-only/db"
import { calcStatementConfidence } from "~/compute"
import { finishExpl, startExpl } from "~/server-only/expl"
import { AddExplId, ExplData } from "~/components/expl/types"
import { addExplIdColNames, getPercent } from "~/util"
import { _getRecordById } from "./select";
import { DataRecordWithId } from "~/schema/type"
import { Link } from "~/components/Link"
import { Component, For } from "solid-js"
import { ExplLink } from "~/components/expl/ExplLink"
import { Subtitle } from "~/components/PageTitle"


export const attemptJudgeStatement = async (
  statementId: number,
  triggerExplId: number,
  triggerLabel: string
) => {
  "use server" // this is a hack to prevent vinxi issues. It's not supposed to be called from the client
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
      `.catch(onError) as any[]
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
    const statement = await _getRecordById('statement', statementId, ['id', 'text'])
    if (!statement) return

    const statementArguments = await sql`
      SELECT *
      FROM argument
      WHERE statement_id = ${statementId}
    `.catch(onError) as DataRecordWithId[]

    const data: ExplJudgeStatementData = {
      triggerExplId,
      triggerLabel,
      statement,
      argumentConfidences,
      confidences,
      diff,
      statementArguments
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
  statementArguments: DataRecordWithId[]
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
      statement: [data.statement],
      argument: data.statementArguments
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
    ]
  }
}

const Derivation: Component<ExplJudgeStatementData> = data => {
  const sideArgs = (pro: boolean) => data.argumentConfidences.filter(arg => arg.pro === pro)
  return (
    <main>
      <Subtitle>Argument confidences</Subtitle>
      <For each={[{ label: 'Pro', pro: true }, { label: 'Con', pro: false }]}>
        {({ label, pro }) => {
          const args = sideArgs(pro);
          return (
            <div class="px-2">
              <h3 class="font-bold">{label}</h3>
              {args.length === 0 ? (
                <div>n/a</div>
              ) : (
                <ul class="list-disc pl-6">
                  <For each={args}>
                    {arg => (
                      <li>
                        <For each={['isolated', 'conditional'] as const}>
                          {type => {
                            const value = arg[`${type}_confidence`]
                            const explId = arg[`${type}_confidence_expl_id`]
                            return (
                              value !== null && (
                                <span class="inline-block pr-2">
                                  {type}: {getPercent(value)}{' '}
                                  <ExplLink {...{ explId }} />
                                </span>
                              )
                            )
                          }}
                        </For>
                      </li>
                    )}
                  </For>
                </ul>
              )}
            </div>
          )
        }}
      </For>

      <Subtitle>Final confidences</Subtitle>
      <div class="px-2">
        <ul>
          <For each={[{ label: 'Pro', pro: 1 }, { label: 'Con', pro: 0 }]}>
            {({ label, pro }) => (
              <li>
                {label}: {data.confidences[pro].length === 0 ? "n/a" : data.confidences[pro].map(getPercent).join(', ')}
              </li>
            )}
          </For>
        </ul>
      </div>

      <Subtitle>Result</Subtitle>
      <div class="px-2 max-w-screen-sm">
        The system applied the statement confidence formula to the confidences above.
        <br/>You can test it out in the{' '}
        <Link label="confidence calculator" route="confidence-calculator" />.
      </div>
      <div class="px-2 font-bold pt-2">
        {getPercent(data.diff!.after.confidence as number)}
      </div>
    </main>
  )
}
