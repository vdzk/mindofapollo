import { Match, Switch, createResource, createSignal } from "solid-js"
import { FormField } from "~/components/FormField"
import { Task } from "~/components/Task"
import { createStore } from "solid-js/store"
import { DataRecord } from "~/schema/type"
import { Link } from "~/components/Link"
import { Button } from "~/components/buttons"
import { getTaskConfirmOrChallenge } from "~/api/getTask/confirmOrChallenge"
import { submitTaskConfirmOrChallenge } from "~/api/submitTask/confirmOrChallenge"
import { insertExtRecord } from "~/api/insert/extRecord"

export default function ConfirmOrChallenge() {
  const [diff, setDiff] = createStore<DataRecord>({})
  const [statement, { refetch }] = createResource(getTaskConfirmOrChallenge)

  const [challenge, setChallenge] = createSignal(false)

  // TODO: refactor using solid-js actions
  const onConfirm = async (statementId: number) => {
    await submitTaskConfirmOrChallenge(statementId)
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
      <main>
        <div class="px-2">
          <Link
            route="show-record"
            params={{tableName: "statement", id: statement()!.id}}
            label={statement()!.text}
          />
        </div>
        <div>
          <Switch>
            <Match when={!challenge()}>
              <Button
                label="Confirm"
                onClick={() => onConfirm(statement()!.id)}
              />
              <span class="inline-block w-2" />
              <Button
                label="Challenge"
                onClick={() => setChallenge(true)}
              />
            </Match>
            <Match when={challenge()}>
              <FormField
                tableName="argument"
                colName="title"
                label="Argument against"
                {...{ diff, setDiff }}
              />
              <Button
                label="Submit"
                onClick={() => onArgument(statement()!.id)}
              />
              <span class="inline-block w-2" />
              <Button
                label="Cancel"
                onClick={() => setChallenge(false)}
              />
            </Match>
          </Switch>
        </div>
      </main>
    </Task>
  )
}
