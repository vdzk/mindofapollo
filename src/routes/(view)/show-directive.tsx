import { createAsync } from "@solidjs/router";
import { For, Suspense } from "solid-js";
import { PageTitle } from "~/components/PageTitle";
import { getUserDirectives } from "~/server/userDirectives";
import { indexBy } from "~/util";

export default function ShowDirective() {
  const data = createAsync(getUserDirectives)

  const rows = () => {
    const _data = data()
    if (!_data) return []

    const directivesById = indexBy(_data.directives, 'id')
    const dirConcsById = indexBy(_data.dirConcs, 'id')
    const moralWeightsByGoodId = indexBy(_data.moralWeights, 'moral_good_id')

    for (const dirConcExt of _data.dirConcsWithValues.records) {
      dirConcsById[dirConcExt.id].ext = dirConcExt
    }
    for (const dirConcId in _data.dirConcsWithValues.values) {
      dirConcsById[dirConcId].value = _data.dirConcsWithValues.values[dirConcId]
    }
    for (const directive of _data.directives) {
      directive.concs = []
    }
    for (const dirConc of _data.dirConcs) {
      directivesById[dirConc.directive_id].concs.push(dirConc)
    }
    for (const directive of _data.directives) {
      let sum = 0
      for (const dirConc of directive.concs) {
        const moralWeightRecord = moralWeightsByGoodId[dirConc.moral_good_id]
        if (moralWeightRecord) {
          const weight = parseFloat(moralWeightRecord.weight)
          const { value } = dirConc
          const colType = dirConc.ext.column_type
          let weightedValue = 0
          if (colType === 'boolean') {
            if (value) {
              weightedValue = weight
            }
          } else if (colType === 'integer') {
            weightedValue += weight * value
          }
          dirConc.weightedValue = weightedValue
          sum += weightedValue
        }
      }
      directive.do = sum > 0
    }
    return _data.directives
  }

  return (
    <main>
      <PageTitle>Directives</PageTitle>
      <Suspense fallback="...loading directives">
        <table class="mx-2">
          <tbody>
            <tr>
              <th>deed</th>
              <th>moral factors</th>
              <th>verdict</th>
            </tr>
            <For each={rows()}>
              {(directive) => (
                <tr>
                  <td>
                    <a
                      class="hover:underline"
                      href={`/show-record?tableName=directive&id=${directive.id}`}
                    >
                      {directive.text}
                    </a>
                  </td>
                  <td class="px-2">
                    <For each={directive.concs}>
                      {dirConc => (
                        <span>
                          {`(${dirConc.ext.moral_good} ${dirConc.weightedValue}) `}
                        </span>
                      )}
                    </For>
                  </td>
                  <td class="px-2">
                    {directive.do ? '👍' : "👎"}
                  </td>
                </tr>
              )}
            </For>
          </tbody>
        </table>
      </Suspense>
    </main>
  )
}