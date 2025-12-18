import { createAsync } from "@solidjs/router"
import { Component, createMemo, createSignal, For, Match, Switch } from "solid-js"
import { listForeignRecordsCache } from "~/client-only/query"
import { Aggregate } from "~/components/aggregate/Aggregate"
import { Button } from "~/components/buttons"
import { Form } from "~/components/form/Form"
import { H2, Subtitle } from "~/components/PageTitle"
import { CriticalQuestionSelector } from "./CriticalQuestionSelector"
import { CriticalStatementExamples } from "./CriticalStatementExamples"
import { indexBy } from "~/utils/shape"
import { getToggleLabel, nbsp } from "~/utils/string"
import { createMediaQuery } from "@solid-primitives/media"

export const CriticalQuestions: Component<{
  argumentTypeId: number
  argumentId: number
}> = props => {
  const [view, setView] = createSignal<
    'list' | 'select' | 'examples' | 'create' | 'instructions'
  >('list')
  const [loadQuestions, setLoadQuestions] = createSignal(false)
  const [selectedQuestionId, setSelectedQuestionId] = createSignal<number | undefined>()
  const typeQuestions = createAsync(async () => loadQuestions()
    ? await listForeignRecordsCache(
      'critical_question', 'argument_type_id', props.argumentTypeId
    ) : undefined
  )
  const generalQuestions = createAsync(async () => loadQuestions()
    ? await listForeignRecordsCache(
      'critical_question', 'argument_type_id', null
    ) : undefined
  )
  const questionsSections = createMemo(() => ({
    'General': generalQuestions(),
    'Argument type specific': typeQuestions()
  }))
  const questionsById = createMemo(() => indexBy(
    [...typeQuestions() ?? [], ...generalQuestions() ?? []], 'id'
  ))
  const isLarge = createMediaQuery('(min-width: 1024px)')
  const isLarger = createMediaQuery('(min-width: 1300px)')
  const instructionsBtnLabel = () => isLarge() && !isLarger() ? 'ℹ️' : 'instructions'
  return (
    <div class="flex-2 min-w-0 border-l">
      <Switch>
        <Match when={view() === 'list'}>
          <div class="flex justify-between border-b">
            <Subtitle>Critical Questions</Subtitle>
            <Button
              label={getToggleLabel(false, instructionsBtnLabel())}
              onClick={() => {
                setLoadQuestions(true)
                setView('instructions')
              }}
              class="self-center mx-2"
            />
          </div>
          <div class="h-3" />
          <Aggregate
            tableName="argument"
            id={props.argumentId}
            aggregateName="critical_statements"
          />
          <Button
            label="Add"
            onClick={() => {
              setLoadQuestions(true)
              setView('select')
            }}
            class="ml-2"
          />
        </Match>
        <Match when={view() === 'instructions'}>
          <div class="flex justify-between border-b">
            <Subtitle>Critical Questions</Subtitle>
            <Button
              label={getToggleLabel(true, instructionsBtnLabel())}
              onClick={() => setView('list')}
              class="self-center mx-2"
            />
          </div>
          <div class="px-2 pt-2">
            1) Please ask yourself the following questions:
          </div>
          <For each={Object.entries(questionsSections())}>
            {([title, questions]) => (
            <div class="pb-2">
              <H2>{title}</H2>
              <ul class="list-disc pl-6 pr-2">
                <For each={questions}>
                  {(question) => (
                    <li>{question.text}</li>
                  )}
                </For>
              </ul>
            </div>
            )}
          </For>
          <div class="px-2 pt-1 pb-2">
            2) Please research criticisms of this argument.
          </div>
          <div class="px-2 pb-2">
            3) Please add significant relevant critical statements that you think are missing under the corresponding critical questions. 
          </div>
          <div class="px-2 pb-2">
            The judgement of the strength of the argument will be based in large part on Apollo's confidences in these critical statements. You don't need to include statements that are so obvious the judge will already take them into account (e.g., "2{nbsp}+{nbsp}2{nbsp}={nbsp}4").
          </div>
        </Match>
        <Match when={view() === 'select'}>
          <CriticalQuestionSelector
            setView={setView}
            selectedQuestionId={selectedQuestionId()}
            setSelectedQuestionId={setSelectedQuestionId}
            questionsSections={questionsSections()}
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