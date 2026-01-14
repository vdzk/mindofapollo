import { createMediaQuery } from "@solid-primitives/media"
import { Title } from "@solidjs/meta"
import { useNavigate } from "@solidjs/router"
import { Component, For, Show, useContext } from "solid-js"
import { deleteDebate } from "~/api/delete/debate"
import { acceptDebate } from "~/api/execute/acceptDebate"
import { quitDebate } from "~/api/execute/quitDebate"
import { Button, importantButtonStyle } from "~/components/buttons"
import { StaticDetail } from "~/components/details"
import { Link } from "~/components/Link"
import { Subtitle } from "~/components/PageTitle"
import { DataRecordWithId } from "~/schema/type"
import { SessionContext } from "~/SessionContext"
import { getTextFromLabel } from "~/tables/statement/statement"
import { statementTypeIds } from "~/tables/statement/statement_type"
import { getPercent, nbsp } from "~/utils/string"

const aboutStatus = {
  invite: 'nobody picked up the challenge yet',
  closed: 'one of the opponents has quit',
  ongoing: 'the debate is in progress'
}

export const getResultColor = (win: boolean, ongoing: boolean) => ongoing
  ? (win ? 'text-green-700' : 'text-red-700')
  : (win ? 'text-teal-600' : 'text-gray-400')

export const getResultText = (win: boolean, ongoing: boolean) => ongoing
  ? (win ? 'winning' : 'losing')
  : (win ? 'victory' : 'quit')

export const getDebateStatus = (debate: DataRecordWithId) => {
  if (debate.taker_id) {
    if (typeof debate.creator_won === 'boolean') {
      return 'closed'
    } else {
      return 'ongoing'
    }
  } else {
    return 'invite'
  }
}

export const Debate: Component<{
  record: DataRecordWithId
  refresh: () => Promise<void>
}> = props => {
  const session = useContext(SessionContext)
  const navigate = useNavigate()
  const userId = () => session?.userSession?.()?.userId
  const authenticated = () => !!session?.userSession?.()?.authenticated
  const status = () => getDebateStatus(props.record)
  const statementText = () => getTextFromLabel(props.record.statement_label as string)
  const prescriptive = () => props.record.statement_type_id === statementTypeIds['prescriptive']
  const scoreName = () => prescriptive() ? 'consequence' : 'confidence'
  const isCreator = () => userId() === props.record.creator_id
  const isTaker = () => (userId() === props.record.taker_id) && props.record.taker_id
  const isDebater = () => isCreator() || isTaker()
  const proWinning = () => props.record.current_value as number >= (props.record.threshold_value as number)
  const getDisplayValue = (current: boolean) => {
    const rawValue = props.record[current ? 'current_value' : 'threshold_value'] as number
    return prescriptive() ? Math.round(rawValue) : getPercent(rawValue)
  }

  const onAccept = async () => {
    await acceptDebate(props.record.id)
    props.refresh()
  }

  const onDelete = async () => {
    await deleteDebate(props.record.id)
    navigate('/debates')
  }

  const onQuitDebate = async () => {
    await quitDebate(props.record.id)
    props.refresh()
  }

  const debaterLink = (creator: boolean) => (
    <Link
      route="show-record"
      params={{
        tableName: 'person',
        id: props.record[creator ? 'creator_id' : 'taker_id'],
        "person-section": 'activity'
      }}
      label={props.record[creator ? 'creator_name' : 'taker_name']}
    />
  )
  
  const stackSections = createMediaQuery('(max-width: 640px)')

  return (
    <main class="flex-1 flex" classList={{ 'flex-col': stackSections() }}>
      <div class="flex-1">
        <Title>Debate: {statementText()}</Title>
        <div class="border-b">
          <Subtitle>
            Debate <span
              class="cursor-default"
              title={aboutStatus[status()]}
            >
              ({isCreator() ? 'my ' : ''}{status()})
            </span>
          </Subtitle>
        </div>
        <div class="flex-1 pt-2">
          <StaticDetail label="Claim">
            <Link
              route="statement"
              type="block"
              params={{ id: props.record.statement_id }}
              label={statementText()}
            />
          </StaticDetail>
          <Show when={status() === 'invite'}>
            <StaticDetail label="Your side">
              {props.record.creator_above === isCreator()
                ? 'Pro - support the claim'
                : 'Con - oppose the claim'
              }
            </StaticDetail>
            <StaticDetail label="Opponent">
              {isCreator()
                ? <span class="opacity-50">no one yet</span>
                : debaterLink(true)
              }
            </StaticDetail>
          </Show>
          <Show when={status() !== 'invite'}>
            <For each={[true, false]} >
              {pro => (
                <StaticDetail
                  label={pro ? 'Supporting' : 'Opposing'}
                >
                  {debaterLink(props.record.creator_above === pro)}
                </StaticDetail>
              )}
            </For>
          </Show>
          <Show when={status() === 'invite'}>
            <StaticDetail label="How to win?">
              {`Add arguments under the claim to shift its ${scoreName()} score in your direction.`}
            </StaticDetail>
          </Show>
          <Show when={status() === 'ongoing'}>
            <StaticDetail label="How winning is determined?">
              {`At any given time, a debater is winning if the claim's ${scoreName()} score lies on their side of the threshold.`}
            </StaticDetail>
          </Show>
          <Show when={status() !== 'closed'}>
            <StaticDetail label={
              `Current ${scoreName()} score`
            }>
              <Link
                route="statement"
                params={{ id: props.record.statement_id }}
                label={getDisplayValue(true)}
              />
            </StaticDetail>
          </Show>
          <Show when={status() === 'invite'}>
            <StaticDetail label="Your goal">
              Keep it
              {nbsp}
              {props.record.creator_above === isCreator()
                ? 'above' : 'below'
              }
              {nbsp}
              {getDisplayValue(false)}
            </StaticDetail>
          </Show>
          <Show when={status() !== 'invite'}>
            <StaticDetail label="Winning threshold">
              {getDisplayValue(false)}
            </StaticDetail>
          </Show>
          <Show when={authenticated()}>
            <div class="pt-2 pb-2 px-2">
              <Show when={status() === 'invite'}>
                <Show when={isCreator()}>
                  <Button
                    label="Delete"
                    onClick={onDelete}
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
              <Show when={status() === 'ongoing' && isDebater()}>
                <Button
                  label="Give up"
                  tooltip="End the debate and accept your opponent's victory."
                  onClick={onQuitDebate}
                />
              </Show>
            </div>
          </Show>
        </div>
      </div>
      <Show when={status() === 'invite'}>
        <div class="flex-1 border-l" />
      </Show>
      <Show when={status() !== 'invite'}>
        <div class="flex-1 border-l flex flex-col">
          <div class="border-b">
            <Subtitle>
              {status() === 'ongoing' ? "Who's ahead?" : 'Outcome'}
            </Subtitle>
          </div>
          <div class="flex-1 flex items-center justify-center">
            <div class="mx-auto w-fit">
              <For each={[true, false]} >
                {win => (
                  <div
                    class="flex gap-2 items-center px-6"
                    classList={{ 'pb-6 mb-6 border-b-8 border-gray-800': win }}
                  >
                    <Show when={status() === 'ongoing'}>
                      <div class="text-5xl">
                        {win ? '😎' : '😮‍💨'}
                      </div>
                    </Show>
                    <Show when={status() === 'closed' && win}>
                      <div class="text-5xl">
                        {win ? '🥇' : '😮‍💨'}
                      </div>
                    </Show>
                    <Show when={status() === 'closed' && !win}>
                      <img
                        class="w-12 h-12 block mx-1.5"
                        src="/icons/exit.svg"
                      />
                    </Show>
                    <div>
                      {debaterLink(
                        (status() === 'ongoing'
                          ? props.record.creator_above === proWinning()
                          : props.record.creator_won
                        ) === win
                      )}
                      <div>
                        <Show when={status() === 'ongoing'}>
                          {' is '}
                        </Show>
                        <span
                          class="font-bold"
                          classList={{
                            [getResultColor(win, status() === 'ongoing')]: true
                          }}
                        >
                          {getResultText(win, status() === 'ongoing')}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </For>
            </div>
          </div>
        </div>
      </Show>
    </main>
  )
}