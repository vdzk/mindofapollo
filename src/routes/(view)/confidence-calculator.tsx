import { Title } from "@solidjs/meta";
import { For } from "solid-js";
import { createStore } from "solid-js/store";
import { PageTitle } from "~/components/PageTitle";
import { calcStatementConfidence } from "~/calc/statementConfidence";
import { etv } from "~/client-only/util";
import { Button } from "~/components/buttons";
import { tableStyle } from "~/components/table";
import { debounce } from "@solid-primitives/scheduled";

export default function ConfidenceCalculator() {
  const [statements, setStatements] = createStore<[number[], number[]][]>([[[], []]])
  const onChange = (i: number, pro: number, value: string) => {
    let strenghts: number[] = []
    const trimmedValue = value.trim()
    if (trimmedValue !== '') {
      strenghts = trimmedValue.split(' ').map((s) => parseFloat(s) / 100)
      setStatements(i, pro, [])
    }
    setStatements(i, pro, strenghts)
  }
  const onInput = debounce(onChange, 500)

  return (
    <main>
      <Title>Descriptive statement confidence calculator</Title>
      <PageTitle>Descriptive statement confidence calculator</PageTitle>
      <div class="px-2 pt-2">
        <table>
          <thead>
            <tr class={tableStyle.tHeadTr}>
              <For each={[
                'Pro arguments strengths (%)',
                'Con arguments strengths (%)',
                'Statement confidence (%)',
                ''
              ]}>
                {header => (
                  <th class={tableStyle.th}>{header}</th>
                )}
              </For>
            </tr>
          </thead>
          <tbody>
            <For each={statements}>
              {(statement, i) => (
                <tr>
                  <For each={[1, 0]}>
                    {pro => (
                      <td class={tableStyle.td}>
                        <input
                          class="pl-1"
                          placeholder="80 5.5 33.3"
                          type="text"
                          onChange={etv(val => onChange(i(), pro, val))}
                          onInput={etv(val => onInput(i(), pro, val))}
                        />
                      </td>
                    )}
                  </For>
                  <td class={tableStyle.td}>
                    {(calcStatementConfidence(statement) * 100).toFixed(1)}
                  </td>
                  <td class={tableStyle.td}>
                    <Button
                      label="X"
                      onClick={() => setStatements(
                        (statements) => statements.filter((s, index) => index !== i())
                      )}
                      tooltip="remove statement"
                    />
                  </td>
                </tr>
              )}
            </For>
          </tbody>
        </table>
        <div class="pt-2">
          <Button
            label="Add statement"
            onClick={() => setStatements(
              statements.length, [[], []]
            )}
          />
        </div>
      </div>
    </main>
  )
}