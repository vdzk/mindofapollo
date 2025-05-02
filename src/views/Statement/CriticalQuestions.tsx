import { createAsync } from "@solidjs/router"
import { Component, createEffect, createMemo, createSignal, Match, Show, Switch } from "solid-js"
import { listForeignRecordsCache } from "~/client-only/query"
import { Aggregate } from "~/components/aggregate/Aggregate"
import { Button } from "~/components/buttons"
import { Form } from "~/components/form/Form"
import { Subtitle } from "~/components/PageTitle"
import { CriticalQuestionSelector } from "./CriticalQuestionSelector"
import { CriticalStatementExamples } from "./CriticalStatementExamples"
import { indexBy } from "~/utils/shape"
import { getToggleLabel } from "~/utils/string"
import { ToggleWrap } from "~/components/ToggleWrap"

export const CriticalQuestions: Component<{
  argumentTypeId: number
  argumentId: number
}> = props => {
  const [view, setView] = createSignal<'list' | 'select' | 'examples' | 'create'>('list')
  const [collapsed, setCollapsed] = createSignal(true)
  const [wishedToSelect, setWishedToSelect] = createSignal(false)
  const [selectedQuestionId, setSelectedQuestionId] = createSignal<number | undefined>()
  const typeQuestions = createAsync(async () => wishedToSelect()
    ? await listForeignRecordsCache(
      'critical_question', 'argument_type_id', props.argumentTypeId
    ) : undefined
  )
  const generalQuestions = createAsync(async () => wishedToSelect()
    ? await listForeignRecordsCache(
      'critical_question', 'argument_type_id', null
    ) : undefined
  )
  const questionsById = createMemo(() => indexBy(
    [...typeQuestions() ?? [], ...generalQuestions() ?? []], 'id'
  ))
  createEffect(() => {
    props.argumentId
    setView('list')
    setWishedToSelect(false)
    setSelectedQuestionId(undefined)
  })
  return (
    <div class="flex-3 min-w-0 border-l">
      <Switch>
        <Match when={view() === 'list'}>
          <ToggleWrap
            collapsed={collapsed()}
            setCollapsed={setCollapsed}
          >
            <Subtitle>Critical Questions</Subtitle>
          </ToggleWrap>
          <Show when={!collapsed()}>
            <Aggregate
              tableName="argument"
              id={props.argumentId}
              aggregateName="critical_statements"
            />
            <Button
              label="Add"
              onClick={() => {
                setWishedToSelect(true)
                setView('select')
              }}
              class="ml-2"
            />
          </Show>
        </Match>
        <Match when={view() === 'select'}>
          <CriticalQuestionSelector
            setView={setView}
            selectedQuestionId={selectedQuestionId()}
            setSelectedQuestionId={setSelectedQuestionId}
            generalQuestions={generalQuestions()}
            typeQuestions={typeQuestions()}
          />
        </Match>
        <Match when={view() === 'create'}>
          <Subtitle>Add Critical Statement</Subtitle>
          <Form
            tableName="critical_statement"
            preset={{
              argument_id: props.argumentId,
              critical_question_id: selectedQuestionId()!
            }}
            hideColumns={['argument_id']}
            disableColumns={['critical_question_id']}
            exitSettings={{ onExit: () => setView('list') }}
          />
        </Match>
        <Match when={view() === 'examples'}>
          <CriticalStatementExamples
            questionId={selectedQuestionId()!}
            questionText={questionsById()[selectedQuestionId()!].text as string}
            onBack={() => setView('select')}
          />
        </Match>
      </Switch>
    </div>
  )
}