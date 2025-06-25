import { createAsync } from "@solidjs/router";
import { For, Show } from "solid-js";
import { getOneDialoguePage } from "~/api/getOne/dialoguePage";
import { listForeignRecordsCache } from "~/client-only/query";
import { useSafeParams } from "~/client-only/util";
import { Link } from "~/components/Link";
import { Subtitle } from "~/components/PageTitle";
import { chatFragementHosts } from "~/constant";
import { DialogueMessage } from "~/tables/other/dialogue_page";
import { indexBy } from "~/utils/shape";
import { getPercent } from "~/utils/string";

export default function Dialogue() {
  const sp = useSafeParams<{ id: number, pageId?: string }>(['id'])
  const pages = createAsync(() => listForeignRecordsCache('dialogue_page', 'statement_id', sp().id))
  const page = () => {
    const { pageId } = sp()
    if (pageId) {
      const _pages = pages()
      if (_pages && _pages.length > 0) {
        return _pages.find(p => p.id === parseInt(pageId))
      }
    }
  }

  const pageData = createAsync(async () => {
    const { pageId } = sp()
    const _page = page()
    if (pageId && _page) {
      return getOneDialoguePage(parseInt(pageId))
    }
  })

  const messages = () => {
    const _page = page()
    const _pageData = pageData()
    if (_page && _pageData) {
      const { records, statementConfidences, argumentConfidences } = _pageData
      const statementDict = indexBy(statementConfidences, 'id')
      const argumentDict = indexBy(argumentConfidences,'id')
      const textDicts = Object.fromEntries(chatFragementHosts.map(
        host => ([host, Object.fromEntries(records[host].map(
          row => [row.id, row.chat_text]
        ))])
      ))
      return (_page.messages as unknown as DialogueMessage[]).map(
        message => ({
          pro: message.pro,
          fragments: message.fragments.map(fragment => {
            let value = null
            if (fragment.table_name === 'statement') {
              const satement = statementDict[fragment.record_id]
              if (satement?.decided) {
                value = satement.confidence as number
              }
            } else if (fragment.table_name === 'argument') {
              const argument = argumentDict[fragment.record_id]
              if (argument) {
                const { isolated_confidence, conditional_confidence } = argument
                value = (conditional_confidence ?? isolated_confidence ?? null) as number | null
              }
            }
            return ({
              ...fragment,
              text: textDicts[fragment.table_name][fragment.record_id],
              value
            })
          })
        })
      )
    }
  }

  return (
    <main class="flex gap-2">
      <section class="pb-2 px-2 w-md">
        <Subtitle>Dialogue Pages</Subtitle>
        <ol class="pl-4 list-decimal">
          <For each={pages()}>{(page) => (
            <li class="pb-2">
              <Link
                route="dialogue"
                params={{
                  id: sp().id,
                  pageId: page.id
                }}
                label={page.title}
                type="block"
              />
            </li>
          )}</For>
        </ol>
      </section>
      <Show
        when={messages()}
        fallback={<div class="py-2 text-gray-500">Please select a page.</div>}
      >
        <section class="flex-1 max-w-xl">
          <Subtitle>{page()!.title}</Subtitle>
          <div class="max-w-xl px-2 pt-4">
            <For each={messages()}>
              {message => (
                <div
                  class="mb-8 px-3 py-2 border-4 rounded-lg"
                  classList={{
                    'mr-28 border-blue-500': message.pro,
                    'ml-28 border-red-500': !message.pro
                  }}
                >
                  <For each={message.fragments}>
                    {fragment => (
                      <Link
                        route={fragment.table_name}
                        params={{ id: fragment.record_id }}
                        label={
                          <Show when={fragment.text}>
                            {' '}
                            {fragment.text}
                            {' '}
                            <span
                              class="text-gray-500"
                              title={fragment.table_name === 'statement'
                                ? "Apollo's confidence in statement"
                                : "Apollo's judgement of argument strength"
                              }
                            >
                              {fragment.table_name === 'statement' ? '(' : '['}
                              {fragment.value ? getPercent(fragment.value) : '?'}
                              {fragment.table_name === 'statement' ? ')' : ']'}
                            </span>
                          </Show>
                        }
                        type="fragment"
                      />
                    )}
                  </For>
                </div>
              )}
            </For>
          </div>
        </section>
      </Show >
    </main >
  )
}
