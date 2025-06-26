import { Title } from "@solidjs/meta"
import { createAsync } from "@solidjs/router"
import { For, Show } from "solid-js"
import { getOneDialoguePage } from "~/api/getOne/dialoguePage"
import { Link } from "~/components/Link"
import { chatFragementHosts } from "~/constant"
import { messages } from "~/dialogue_messages"
import { indexBy } from "~/utils/shape"
import { getPercent } from "~/utils/string"

export default function Dialogue() {
  const pageData = createAsync(async () => getOneDialoguePage())

  const fullMessages = () => {
    const _pageData = pageData()
    if (_pageData) {
      const { records, statementConfidences, argumentConfidences } = _pageData
      const statementDict = indexBy(statementConfidences, 'id')
      const argumentDict = indexBy(argumentConfidences, 'id')
      const textDicts = Object.fromEntries(chatFragementHosts.map(
        host => ([host, Object.fromEntries(records[host].map(
          row => [row.id, row.chat_text]
        ))])
      ))
      return (messages).map(
        message => ({
          title: message.title,
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
    <main class="self-center">
      <Title>Dialogue - Is Climate Change Anthropogenic?</Title>
      <h1 class="text-4xl text-center mt-8 mb-5 font-bold">
        Is Climate Change Anthropogenic?
      </h1>
      <Show
        when={fullMessages()}
        fallback={<div class="py-2 text-gray-500">Loading...</div>}
      >
        <div class="px-2 py-4">
          <For each={fullMessages()}>
            {message => (
              <div class="mb-6">
                <div class="font-bold mb-2 lg:hidden">
                  {message.title}
                </div>
                <div class="flex lg:mb-6">
                  <div class="hidden lg:block font-bold self-center w-58 pr-12 text-right flex-shrink-0">
                    {message.title}
                  </div>
                  <div
                    class="px-3 py-2 border-4 rounded-lg flex-1 min-w-0 max-w-4xl"
                    classList={{
                      'lg:mr-28 border-blue-500': message.pro,
                      'lg:ml-28 border-red-500': !message.pro
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
                </div>
              </div>
            )}
          </For>
        </div>
      </Show >
    </main >
  )
}
