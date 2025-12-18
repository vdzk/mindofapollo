import { descriptiveStatementTypeId } from "~/tables/statement/statement_type"
import { onError, sql } from "./db"
import { calcStatementConfidence } from "~/calc/statementConfidence"
import { calcArgumentStrength, Premise } from "~/calc/argumentStrength"
import { finishExpl, startExpl } from "./expl"
import { ExplData } from "~/components/expl/types"
import { Component, For, Show } from "solid-js"
import { Subtitle } from "~/components/PageTitle"
import { Link } from "~/components/Link"
import { HistoryLink } from "~/components/expl/HistoryLink"
import { tableStyle } from "~/components/table"
import { injectTranslations } from "./injectTranslations"

// TODO: get and update the whole hierarchy in one go for improved performance?
// TODO: debounce cascades?
export const cascadeUpdateScores = async (
  argumentIds: number[],
  triggerExplId: number | null,
  triggerLabel: string
) => {
  "use server" // this is a hack to prevent vinxi issues. It's not supposed to be called from the client
  const explId = await startExpl(null, 'cascadeUpdateScores', 1, null, null)
  const cascadeScoreChanges = await Promise.all(argumentIds.map(argumentId => {
    return cascadeUpdateScoresRec(argumentId, explId)
  }))
  const scoreChanges = cascadeScoreChanges.flat().filter(x => !!x)
  if (scoreChanges.length > 0) {
    const data: ExplCascadeUpdateScoresData = {
      triggerExplId,
      triggerLabel,
      scoreChanges
    }
    await finishExpl(explId, data)
  }
}

// TODO: ancestors that have multiple paths leading to them will be updated multiple times
// TODO: cover the case of deleting satement, arguments and premises
const cascadeUpdateScoresRec = async (argumentId: number, explId: number) => {
  "use server" // this is a hack to prevent vinxi issues. It's not supposed to be called from the client
  let scoreChanges: ScoreChange[] = []

  // check that the parent statement has type "descriptive"
  const argumentRecords = await sql`
    SELECT
      argument.id,
      argument.statement_id,
      argument.strength,
      argument.strength_expl_id
    FROM argument
    JOIN statement ON statement.id = argument.statement_id
    WHERE argument.id = ${argumentId}
      AND statement.statement_type_id = ${descriptiveStatementTypeId}
  `.catch(onError)
  if (argumentRecords.length === 0) return
  await injectTranslations('argument', argumentRecords, ['title'])
  const originalArgument = argumentRecords[0]

  // update argument strength
  const premises = await sql`
    SELECT premise.invert, statement.confidence
    FROM premise
    JOIN statement ON statement.id = premise.statement_id
    WHERE premise.argument_id = ${argumentId}
  `.catch(onError) as Premise[]
  if (premises.length === 0) return

  const strength = calcArgumentStrength(premises)

  await sql`
    UPDATE argument
    SET ${sql({ strength, strength_expl_id: explId })}
    WHERE argument.id = ${argumentId}
  `.catch(onError)

  scoreChanges.push({
    tableName: 'argument',
    recordId: argumentId,
    recordLabel: originalArgument.title,
    oldValue: originalArgument.strength,
    oldExplId: originalArgument.strength_expl_id,
    newValue: strength
  })

  //update confidence in conclusion
  const conclusionRecords = await sql`
    SELECT
      statement.id,
      statement.confidence,
      statement.confidence_expl_id
    FROM statement
    WHERE statement.id = ${originalArgument.statement_id}
  `.catch(onError)
  if (conclusionRecords.length === 0) return
  await injectTranslations('statement', conclusionRecords, ['title'])
  const originalConclusion = conclusionRecords[0]

  const _arguments = await sql`
    SELECT pro, strength
    FROM argument
    WHERE statement_id = ${originalConclusion.id}
      AND strength IS NOT NULL
  `.catch(onError)
  if (_arguments.length === 0) return

  const strengths: [number[], number[]] = [[], []]
  for (const argument of _arguments) {
    const side = Number(argument.pro)
    strengths[side].push(argument.strength)
  }
  const confidence = calcStatementConfidence(strengths)
  await sql`
    UPDATE statement
    SET ${sql({ confidence, confidence_expl_id: explId })}
    WHERE id = ${originalConclusion.id}
  `.catch(onError)

  scoreChanges.push({
    tableName: 'statement',
    recordId: originalConclusion.id,
    recordLabel: originalConclusion.text,
    oldValue: originalConclusion.confidence,
    oldExplId: originalConclusion.confidence_expl_id,
    newValue: confidence
  })

  // in turn update entries that rely on this conclusion
  const parentPremises = await sql`
    SELECT argument_id
    FROM premise
    WHERE premise.statement_id = ${originalConclusion.id}
  `.catch(onError)

  if (parentPremises.length > 0) {
    const cascadeScoreChanges =  (await Promise.all(parentPremises.map(parentPremise => {
      return cascadeUpdateScoresRec(parentPremise.argument_id, explId)
    })))
    cascadeScoreChanges.flat().forEach(x => x && scoreChanges.push(x))
  }

  return scoreChanges
}

interface ScoreChange {
  tableName: string,
  recordId: number,
  recordLabel: string,
  oldValue: number | null,
  oldExplId: number | null,
  newValue: number | null
}

interface ExplCascadeUpdateScoresData {
  triggerExplId: number | null
  triggerLabel: string
  scoreChanges: ScoreChange[]
}

export const explCascadeUpdateScores = (data: ExplCascadeUpdateScoresData): ExplData => {
  return {
    actor: { type: 'system' },
    action: 'cascade updates of argument strengths and statement confidences up the hierarchy',
    trigger: {
      explId: data.triggerExplId,
      label: data.triggerLabel
    },
    customSections: {
      derivation: {
        label: 'Score changes',
        component: ScoreChanges
      }
    }
  }
}

const ScoreChanges: Component<ExplCascadeUpdateScoresData> = data => {
  return (
    <main>
      <Subtitle>Score changes</Subtitle>
      <table>
        <thead class={tableStyle.tHeadTr}>
          <tr>
            <th class={tableStyle.th}>Record type</th>
            <th class={tableStyle.th}>Record</th>
            <th class={tableStyle.th}>Score change</th>
          </tr>
        </thead>
        <tbody>
          <For each={data.scoreChanges}>
            {scoreChange => (
              <tr>
                <td class={tableStyle.td}>
                  {scoreChange.tableName}
                </td>
                <td class={tableStyle.td}>
                  <Link
                    label={scoreChange.recordLabel}
                    route="show-record"
                    params={{
                      tableName: scoreChange.tableName,
                      id: scoreChange.recordId
                    }}
                  />
                </td>
                <td class={tableStyle.td}>
                  {scoreChange.oldValue}
                  <Show when={scoreChange.oldExplId}>
                    {' '}
                    <HistoryLink explId={scoreChange.oldExplId!} /> 
                  </Show>
                  {' → '}
                  {scoreChange.newValue}
                </td>
              </tr>
            )}
          </For>
        </tbody>
      </table>
    </main>
  )
}