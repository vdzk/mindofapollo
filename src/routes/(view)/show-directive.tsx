import { Title } from "@solidjs/meta"
import { createAsync } from "@solidjs/router"
import { For, Show, Suspense, useContext } from "solid-js"
import { listUserDirectives } from "~/api/list/userDirectives"
import { listOwnRecordsCache } from "~/client-only/query"
import { DecisionIndicator } from "~/components/DecisionIndicator"
import { Link } from "~/components/Link"
import { PageTitle } from "~/components/PageTitle"
import { tableStyle } from "~/components/table"
import { DataRecord, DataRecordWithId } from "~/schema/type"
import { SessionContext } from "~/SessionContext"
import { indexBy } from "~/utils/shape"
import { calculateMoralSum } from "~/views/Statement/PrescriptiveConclusion"

export default function ShowDirective() {
  const data = createAsync(listUserDirectives)
  const moralWeights = createAsync(() => listOwnRecordsCache('moral_weight_of_person'))
  const session = useContext(SessionContext)

  const rows = () => {
    const _data = data()
    if (!_data || !moralWeights()) return []
    const directives: (DataRecordWithId
      & { concs?: (DataRecord & { ext: DataRecord })[] }
    )[] = _data.directives

    const directivesById = indexBy(directives, 'id') as Record<string | number, DataRecord & { concs: DataRecordWithId[] }>
    const dirConcsById = indexBy(_data.dirConcs, 'id') as Record<string | number, DataRecord & { ext?: DataRecordWithId }>

    // Setup the data structure
    for (const dirConcExt of _data.dirConcsWithValues.records) {
      dirConcsById[dirConcExt.id].ext = dirConcExt
    }
    for (const dirConcId in _data.dirConcsWithValues.values) {
      dirConcsById[dirConcId].value = _data.dirConcsWithValues.values[dirConcId]
    }
    for (const directive of directives) {
      directive.concs = []
    }
    for (const dirConc of _data.dirConcs) {
      directivesById[dirConc.directive_id as number].concs.push(dirConc)
    }

    for (const directive of directives) {
      // Prepare consequences array in the format expected by calculateMoralSum
      const processedConcs = directive.concs!.map(dirConc => ({
        id: dirConc.id as number,
        moral_good_id: dirConc.moral_good_id,
        value: dirConc.value,
        column_type: dirConc.ext.column_type
      }));

      const result = calculateMoralSum(processedConcs, moralWeights()!);
      directive.sum = result.overlap ? result.sum : null;

      // Assign the weighted values directly from the calculation result
      for (const dirConc of directive.concs!) {
        dirConc.weightedValue = result.weightedValues[dirConc.id as number]
      }
    }
    return directives
  }

  return (
    <main>
      <Title>Your Directives</Title>
      <PageTitle>Your Directives</PageTitle>
      <Suspense fallback="...loading directives">
        <Show when={rows().length === 0}>
          <div class="px-2">
            There are no directives that match your person's categories.{' '}
            <Link
              type="button"
              route="edit-cross-ref"
              params={{
                a: 'person',
                b: 'person_category',
                id: session?.userSession()?.userId,
                first: true
              }}
              label="Add"
            />
          </div>
        </Show>
        <Show when={rows().length > 0}>
          <table class="mx-2">
            <tbody>
              <tr class={tableStyle.tHeadTr}>
                <For each={['Deed', 'Moral factors', 'Total', 'Verdict']}>
                  {header => (
                    <th class={tableStyle.th}>{header}</th>
                  )}
                </For>
              </tr>
              <For each={rows()}>
                {(directive) => (
                  <tr>
                    <td class={tableStyle.td}>
                      <a
                        class="hover:underline"
                        href={`/show-record?tableName=directive&id=${directive.id}`}
                      >
                        {directive.text}
                      </a>
                    </td>
                    <td class={tableStyle.td}>
                      <For each={directive.concs}>
                        {dirConc => (
                          <span>
                            {`(${dirConc.ext.moral_good} ${dirConc.weightedValue ?? 'n/a'}) `}
                          </span>
                        )}
                      </For>
                    </td>
                    <td class={tableStyle.td}>
                      {directive.sum !== null ? (
                        <span>{directive.sum}</span>
                      ) : (
                        <span class="text-gray-500">n/a</span>
                      )}
                    </td>
                    <td class={tableStyle.td}>
                      <DecisionIndicator score={directive.sum as number | null} />
                    </td>
                  </tr>
                )}
              </For>
            </tbody>
          </table>
        </Show>
      </Suspense>
    </main>
  )
}
