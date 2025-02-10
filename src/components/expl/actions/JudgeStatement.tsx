import { Link } from "~/components/Link"
import { firstCap, getPercent } from "~/util"
import { AddExplId, ExplComponent, ExplDiff } from "../types"
import { DataLiteral } from "~/schema/type"
import { Subtitle } from "../../PageTitle"
import { For, Show } from "solid-js"
import { ExplLink } from "../ExplLink"
import { Checks } from "../Checks"

export interface JudgeStatementExpl {
  triggerExplId: number,
  triggerLabel: string,
  statement?: AddExplId<{ text: DataLiteral }>,
  argumentConfidences: AddExplId<{
    pro: boolean,
    isolated_confidence: number | null,
    conditional_confidence: number | null
  }>[],
  confidences: [number[], number[]]
  diff: ExplDiff<{
    judgement_requested: boolean
    confidence: number
    decided: boolean
  }>
}

export const JudgeStatement: ExplComponent<JudgeStatementExpl> = props => {
  const sideArgs = (pro: boolean) => props.argumentConfidences.filter(arg => arg.pro === pro)

  return (<>
    <Subtitle>Summary</Subtitle>
    The system calculated its confidence in the statement
    <Show when={props.statement}>
      "<Link
        label={props.statement!.text}
        route="show-record"
        params={{ tableName: 'statement', id: props.recordId }}
      />"
      <ExplLink explId={props.statement!.text_expl_id} />
    </Show>
    to be {getPercent(props.diff.after.confidence)}.

    <Checks items={[
      <>All of the arguments have been judged.</>,
      <>For each side, the confidence of each subsequent argument was judged conditionally on all preceding arguments</>
    ]}/>

    <Subtitle>Derivation</Subtitle>
    <For each={[{ label: 'Pro', pro: true }, { label: 'Con', pro: false }]}>
      {({ label, pro }) => (
        <>
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
                            <ExplLink {...{explId}} />
                          </div>
                        )
                      )
                    }}
                  </For>
                </li>
              )}
            </For>
          </ul>
        </>
      )}
    </For>


    <div>
      Final confidences of the arguments
      <ul>
        <For each={[{ label: 'Pro', pro: 1 }, { label: 'Con', pro: 0 }]}>
          {({ label, pro }) => (
            <li>
              {label}: {props.confidences[pro].map(getPercent).join(', ')}
            </li>
          )}
        </For>
      </ul>
    </div>
    <div>
      The system applied the statement confidence formula to the confidences above. You can test it out in the
      <Link label="confidence calculator" route="confience-calculator" />.
    </div>
  </>)
}