import { createAsync } from "@solidjs/router";
import { For, Match, Switch, createResource, createSignal } from "solid-js";
import { PageTitle } from "~/components/PageTitle";
import { getRecords } from "~/server/api";

export default function ConfirmOrChallenge() {
  const tags = createAsync(() => getRecords('tag'))
  const questions = createAsync(() => getRecords('question'))

  return (
    <main>
      <PageTitle> We are fox and cat </PageTitle>
      <div class="flex">
        <div class="pl-2">
          <For each={tags()}>
            {tag => (
              <div>
                <a
                  href={`/show-record?tableName=tag&id=${tag.id}`}
                  class="hover:underline"
                >
                  {tag.name}
                </a>
              </div>
            )}
          </For>
        </div>
        <div class="pl-2">
          <For each={questions()}>
            {question => (
              <div>
                <a
                  href={`/show-record?tableName=question&id=${question.id}`}
                  class="hover:underline"
                >
                  {question.text}
                </a>
              </div>
            )}
          </For>
        </div>
      </div>
    </main>
  )
}
