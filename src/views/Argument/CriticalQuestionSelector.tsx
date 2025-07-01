import { Component, For, Show, useContext } from "solid-js"
import { Button } from "~/components/buttons";
import { H2, Subtitle } from "~/components/PageTitle"
import { DataRecordWithId } from "~/schema/type"
import { SessionContext } from "~/SessionContext";

const QuestionsSection: Component<{
  title: string;
  questions?: DataRecordWithId[];
  selectedQuestionId?: number;
  setSelectedQuestionId: (id: number) => void;
}> = (props) => {
  return (
    <div class="pb-2">
      <H2>{props.title}</H2>
      <For each={props.questions}>
        {(question) => (
          <label class="flex px-2 gap-2 items-start cursor-pointer">
            <input
              type="radio"
              name="criticalQuestion"
              value={question.id}
              checked={props.selectedQuestionId === question.id}
              onChange={() => props.setSelectedQuestionId(question.id)}
              class="mt-2" />
            {question.text}
          </label>
        )}
      </For>
    </div>
  )
}

export const CriticalQuestionSelector: Component<{
  setView: (view: 'list' | 'create' | 'examples') => void
  selectedQuestionId?: number
  setSelectedQuestionId: (id: number) => void
  generalQuestions?: DataRecordWithId[]
  typeQuestions?: DataRecordWithId[]
}> = (props) => {
  const session = useContext(SessionContext)
  return (
    <>
      <Subtitle>Select a critical question</Subtitle>
      <For each={[
        ['General', props.generalQuestions],
        ['Argument type specific', props.typeQuestions]
      ] as const}>
        {([title, questions]) => (
          <QuestionsSection
            {...{ title, questions }}
            setSelectedQuestionId={props.setSelectedQuestionId}
            selectedQuestionId={props.selectedQuestionId}
          />
        )}
      </For>
      <div class="px-2 flex gap-2">
        <Show when={session?.userSession?.()?.authenticated}>
          <Button
            label="Next"
            onClick={() => props.setView('create')}
            disabled={!props.selectedQuestionId}
          />
        </Show>
        <Button
          label="Examples"
          onClick={() => props.setView('examples')}
          disabled={!props.selectedQuestionId}
        />
        <Button
          label="Cancel"
          onClick={() => props.setView('list')}
        />
      </div>
    </>
  )
}
