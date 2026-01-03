import { Component, For, Show, useContext } from "solid-js"
import { acceptDebate } from "~/api/execute/acceptDebate"
import { Button, importantButtonStyle } from "~/components/buttons"
import { StaticDetail } from "~/components/details"
import { Link } from "~/components/Link"
import { Subtitle } from "~/components/PageTitle"
import { DataRecordWithId } from "~/schema/type"
import { SessionContext } from "~/SessionContext"
import { getConfidenceFromLabel, getTextFromLabel } from "~/tables/statement/statement"
import { statementTypeIds } from "~/tables/statement/statement_type"
import { getPercent, nbsp } from "~/utils/string"

const aboutStatus = {
  open: 'nobody picked up the challenge yet',
  closed: 'one of the opponents has quit',
  ongoing: 'the debate is in progress'
}

export const Debate: Component<{
  record: DataRecordWithId
  refresh: () => Promise<void>
}> = props => {
  const session = useContext(SessionContext)
  const userId = () => session?.userSession?.()?.userId
  const authenticated = () => !!session?.userSession?.()?.authenticated
  const status = () => {
    if (props.record.taker_id) {
      if (typeof props.record.creator_won === 'boolean') {
        return 'closed'
      } else {
        return 'ongoing'
      }
    } else {
      return 'open'
    }
  }
  const statementText = () => getTextFromLabel(props.record.statement_label as string)
  const statementConfidence = () => getConfidenceFromLabel(props.record.statement_label as string)
  const prescriptive = () => props.record.statement_type_id === statementTypeIds['prescriptive']
  const isCreator = () => userId() === props.record.creator_id
  const proWinning = () => parseInt(statementConfidence()) >= (props.record.threshold_value as number) * 100

  const onAccept = async () => {
    await acceptDebate(props.record.id)
    props.refresh()
  }

  return (
    <main>
      <div class="border-b mb-2">
        <Subtitle>
          Debate <span
            class="cursor-default"
            title={aboutStatus[status()]}
          >
            ({status()})
          </span>
        </Subtitle>
      </div>
      <div class="max-w-xl">
        <StaticDetail label="Claim">
          <Link
            route="statement"
            type="block"
            params={{id: props.record.statement_id}}
            label={statementText()}
          />
        </StaticDetail>
        <Show when={status() === 'open'}>
          <StaticDetail label="Your side">
            {props.record.creator_above
              ? 'Con - oppose the claim'
              : 'Pro - support the claim'
            }
          </StaticDetail>
          <StaticDetail label="Opponent">
            <Link
              route="show-record"
              params={{
                tableName: 'person',
                id: props.record.creator_id,
                "person-section": 'activity'
              }}
              label={props.record.creator_name}
            />
          </StaticDetail>
        </Show>
        <Show when={!prescriptive()}>
          <Show when={status() === 'open'}>
            <StaticDetail label="How to win?">
              Add arguments under the claim to shift its confidence score in your direction.
            </StaticDetail>
          </Show>
          <StaticDetail label="Current confidence score">
            <Link
              route="statement"
              params={{id: props.record.statement_id}}
              label={statementConfidence()}
            />
          </StaticDetail>
          <Show when={status() === 'open'}>
            <StaticDetail label="Your goal">
              Keep it {props.record.creator_above ? 'below' : 'above'}
              {nbsp}
              {getPercent(props.record.threshold_value as number)}
            </StaticDetail>
          </Show>
          <Show when={status() === 'ongoing'}> 
            <StaticDetail label="Winning threshold">
              {getPercent(props.record.threshold_value as number)}
            </StaticDetail>
          </Show>
          <Show when={status() === 'ongoing'}> 
            <StaticDetail label="How winning is determined?">
              At any given time, a side is winning if the claim's confidence score lies on its side of the threshold.
            </StaticDetail>
          </Show>
        </Show>
        <Show when={status() === 'ongoing'}>
          <For each={[true, false]} >
            {pro => (
              <StaticDetail
                label={`${pro ? 'Supporting' : 'Opposing'} side`}
              >
                <div class="flex gap-1 items-center">
                  <div class="text-3xl">
                    {pro === proWinning() ? '😎' : '😮‍💨'}
                  </div>
                  <div>
                    <Link
                      route="show-record"
                      params={{
                        tableName: 'person',
                        id: props.record.creator_above === pro
                          ? props.record.creator_id
                          : props.record.taker_id
                        ,
                        "person-section": 'activity'
                      }}
                      label={props.record.creator_above === pro
                        ? props.record.creator_name
                        : props.record.taker_name
                      }
                    />
                    <br/>
                    {pro === proWinning() ? 'winning' : 'loosing'}
                  </div>
                </div>
              </StaticDetail>
            )}
          </For>
        </Show>
        <Show when={authenticated()}>
          <div class="pt-2 pb-2 px-2">
            <Show when={status() === 'open'}>
              <Show when={isCreator()}>
                <Button
                  label="Delete"
                  onClick={() => {}}
                />
              </Show>
              <Show when={!isCreator()}>
                <Button
                  label="Accept challenge"
                  class={importantButtonStyle}
                  onClick={onAccept}
                />
              </Show>
            </Show>
          </div>
        </Show>
      </div>
    </main>
  )
}