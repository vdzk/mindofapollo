import { Match, Switch, createResource, createSignal } from "solid-js";
import { FormField } from "~/components/FormField";
import { Task } from "~/components/Task";
import { addConfirmation, getConfirnmationStatement } from "~/api/do-task/confirm-or-challenge";
import { insertExtRecord } from "~/api/shared/extRecord";
import { createStore } from "solid-js/store";
import { DataRecord } from "~/schema/type";

export default function ConfirmOrChallenge() {
  const [diff, setDiff] = createStore<DataRecord>({})
  const [statement, { refetch }] = createResource(getConfirnmationStatement)

  const [challenge, setChallenge] = createSignal(false)

  // TODO: refactor using solid-js actions
  const onConfirm = async (statementId: number) => {
    await addConfirmation(statementId)
    refetch()
  }

  const onArgument = async (statementId: number) => {
    const title = (diff.title as string).trim()
    if (title) {
      await insertExtRecord('argument', {
        statementId,
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
    <Task resource={statement}>
      <main class="px-2 max-w-md">
        <div>
          <a
            class="hover:underline"
            href={`/show-record?tableName=statement&id=${statement()!.id}`}
          >
            {statement()!.text}
          </a>
        </div>
        <div>
          <Switch>
            <Match when={!challenge()}>
              <button
                class="text-sky-800"
                onClick={() => onConfirm(statement()!.id)}
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
                onClick={() => onArgument(statement()!.id)}
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
