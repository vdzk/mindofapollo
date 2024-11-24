import { Match, Switch, createResource, createSignal } from "solid-js";
import { FormField } from "~/components/FormField";
import { insertExtRecord } from "~/server/extRecord.db";
import { getjudgeargument } from "~/server/judge";
import { updateRecord } from "~/server/mutate.db";

export default function ConfirmOrChallenge() {
  const [argument, { refetch }] = createResource(getjudgeargument)


  return (
    <main class="pl-2 max-w-md">
      <Switch>
        <Match when={argument.state === 'pending' || argument.state === 'refreshing'}>
          Loading task data...
        </Match>
        <Match when={argument.state === 'ready' && !argument()}>
          All done
        </Match>
        <Match when={argument.state === 'ready' && argument()}>
          <div>
            <a
              class="hover:underline"
              href={`/show-record?tableName=argument&id=${argument()!.id}`}
            >
              {argument()!.title}
            </a>
          </div>
        </Match>
      </Switch>
    </main>
  )
}
