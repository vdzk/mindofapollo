import { Match, Switch, createResource, createSignal } from "solid-js";
import { getJudgeArgument } from "~/server/judge";

export default function ConfirmOrChallenge() {
  const [argument, { refetch }] = createResource(getJudgeArgument)


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
