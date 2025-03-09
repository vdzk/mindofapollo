import { Title } from "@solidjs/meta";
import { For } from "solid-js";
import { createStore } from "solid-js/store";
import { PageTitle } from "~/components/PageTitle";
import { calcStatementConfidence } from "~/compute";
import { etv } from "~/client-only/util";
import { Button } from "~/components/buttons";

export default function ConfidenceCalculator() {
  const [statements, setStatements] = createStore<[number[], number[]][]>([])

  return (
    <main>
      <Title>Confidence calculator</Title>
      <PageTitle>Confidence calculator</PageTitle>
      <div class="px-2">Note: all values are in %</div>
      <div class="flex">
        <For each={statements}>
          {(statement, statementIndex) => (
            <div class="px-2 border-r">
              <Button
                label="XX"
                onClick={() => setStatements(
                  (statements) => statements.filter((s, index) => index !== statementIndex())
                )}
                tooltip="remove statement"
              />
              <br/>
              <For each={[1, 0]}>
                {pro => (
                  <div>
                    <div>{pro ? 'Pro' : 'Con'}</div>
                    <For each={statement[pro]}>
                      {(argumentConfidence, acIndex) => (
                        <div>
                          <input
                            class="w-8"
                            value={argumentConfidence * 100}
                            onChange={etv(val => setStatements(
                              statementIndex(), pro, acIndex(), parseFloat(val) / 100)
                            )}
                          />
                          <br/>
                          <Button
                            label="X"
                            onClick={() => setStatements(
                              statementIndex(), pro, (acs) => acs.filter((ac, index) => index !== acIndex())
                            )}
                            tooltip="remove argument"
                          />
                        </div>
                      )}
                    </For>
                    <Button
                      label="+"
                      onClick={() => setStatements(
                        statementIndex(), pro, statement[pro].length, 0
                      )}
                      tooltip={`add ${pro ? 'pro' : 'con'} argument`}
                    />
                  </div>
                )}
              </For>
              <span title="confidence">
                {(calcStatementConfidence(statement) * 100).toFixed(1)}
              </span>
            </div>
          )}
        </For>
        <Button
          label="++"
          onClick={() => setStatements(
            statements.length, [[], []]
          )}
          tooltip="add statement"
        />
      </div>
    </main>
  )
}