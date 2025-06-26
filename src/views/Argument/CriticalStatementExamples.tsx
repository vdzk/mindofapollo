import { createAsync } from "@solidjs/router";
import { Component, Show, For } from "solid-js";
import { listForeignRecordsCache, listRecordsCache } from "~/client-only/query";
import { Button } from "~/components/buttons";
import { Detail } from "~/components/details";
import { Subtitle } from "~/components/PageTitle";
import { indexBy } from "~/utils/shape";

export const CriticalStatementExamples: Component<{
  questionId: number;
  questionText: string;
  onBack: () => void;
}> = (props) => {
  const criticalStatements = createAsync(() => listForeignRecordsCache(
    'critical_statement_example', 'critical_question_id', props.questionId
  ));
  const _arguments = createAsync(async () => {
    const _criticalStatements = criticalStatements();
    if (!_criticalStatements || _criticalStatements.length === 0) return;
    const argumentExamplesIds = _criticalStatements.map(cs => cs.argument_type_example_id as number);
    const records = await listRecordsCache('argument_type_example', null, argumentExamplesIds);
    return indexBy(records, 'id');
  });
  return (
    <>
      <Subtitle>Critical Statement Example</Subtitle>
      <Show when={criticalStatements() && _arguments()}>
        <For each={criticalStatements()}>
          {criticalStatement => {
            const argument = _arguments()![criticalStatement.argument_type_example_id as number];
            return (
              <div class="pb-2">
                <Detail
                  tableName="argument_type_example"
                  colName="argument"
                  record={argument} />
                <Detail
                  tableName="argument_type_example"
                  colName="conclusion"
                  record={argument} />
                <Detail
                  tableName="critical_question"
                  label="Critical question"
                  colName="text"
                  record={{ text: props.questionText }} />
                <Detail
                  tableName="critical_statement_example"
                  label="Critical statement"
                  colName="statement"
                  record={criticalStatement} />
              </div>
            );
          }}
        </For>
      </Show>
      <Show when={criticalStatements()?.length === 0}>
        <div class="px-2 pb-2">
          No critical statement examples found.
        </div>
      </Show>
      <div class="px-2 flex gap-2 pb-2">
        <Button
          label="Back"
          onClick={props.onBack} />
      </div>
    </>
  );
};
