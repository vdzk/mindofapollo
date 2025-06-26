import { createAsync } from "@solidjs/router"
import { Component, createMemo, createSignal, Match, Switch } from "solid-js"
import { listForeignRecordsCache } from "~/client-only/query"
import { Aggregate } from "~/components/aggregate/Aggregate"
import { Button } from "~/components/buttons"
import { Form } from "~/components/form/Form"
import { Subtitle } from "~/components/PageTitle"
import { CriticalQuestionSelector } from "./CriticalQuestionSelector"
import { CriticalStatementExamples } from "./CriticalStatementExamples"
import { indexBy } from "~/utils/shape"

export const CriticalQuestions: Component<{
  argumentTypeId: number
  argumentId: number
}> = props => {
  const [view, setView] = createSignal<'list' | 'select' | 'examples' | 'create'>('list')
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
  return (
    <div class="flex-2 min-w-0 border-l">
      <Switch>
        <Match when={view() === 'list'}>
          <Subtitle>Critical Questions</Subtitle>
          <div class="border-t h-3" />
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