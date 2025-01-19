import { Match, Switch, createResource, createSignal } from "solid-js";
import { FormField } from "~/components/FormField";
import { Task } from "~/components/Task";
import { addConfirmation, getConfirnmationQuestion } from "~/api/do-task/confirm-or-challenge";
import { insertExtRecord } from "~/api/shared/extRecord";
import { updateRecord } from "~/api/shared/mutate";
import { createStore } from "solid-js/store";
import { DataRecord } from "~/schema/type";

export default function ConfirmOrChallenge() {
  const [diff, setDiff] = createStore<DataRecord>({})
  const [question, { refetch }] = createResource(getConfirnmationQuestion)

  const [challenge, setChallenge] = createSignal(false)

  // TODO: refactor using solid-js actions
  const onConfirm = async (questionId: number) => {
    const count = await addConfirmation(questionId)
    // TODO: make this number dynamic, depending on the number of users
    const requiredConfirmations = 2
    if (count && (count >= requiredConfirmations)) {
      await updateRecord('question', questionId, { decided: true })
    }
    refetch()
  }

  const onArgument = async (questionId: number) => {
    const title = (diff.title as string).trim()
    if (title) {
      await insertExtRecord('argument', {
        questionId,
        pro: false,
        title,
        // TODO: change to null and handle that case
        argument_type_id: 'other'
      }, 'argument_other', { text: '' })
      setChallenge(false)
      refetch()
    }
  }

  return (
    <Task resource={question}>
      <main class="px-2 max-w-md">
        <div>
          <a
            class="hover:underline"
            href={`/show-record?tableName=question&id=${question()!.id}`}
          >
            {question()!.answer}
          </a>
        </div>
        <div>
          <Switch>
            <Match when={!challenge()}>
              <button
                class="text-sky-800"
                onClick={() => onConfirm(question()!.id)}
              >
                [ Confirm ]
              </button>
              <button
                class="pl-2 text-sky-800"
                onClick={() => setChallenge(true)}
              >
                [ Challenge ]
              </button>
            </Match>
            <Match when={challenge()}>
              <FormField
                tableName="argument"
                colName="title"
                label="Argument against"
                {...{ diff, setDiff }}
              />
              <button
                class="text-sky-800"
                onClick={() => onArgument(question()!.id)}
              >
                [ Submit ]
              </button>
              <button
                class="pl-2 text-sky-800"
                onClick={() => setChallenge(false)}
              >
                [ Cancel ]
              </button>
            </Match>
          </Switch>
        </div>
      </main>
    </Task>
  )
}
