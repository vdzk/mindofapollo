import { Title } from "@solidjs/meta"
import { RecordPageTitle, Subtitle } from "../../components/PageTitle"
import { createAsync, useNavigate, useSearchParams } from "@solidjs/router"
import { humanCase, titleColumnName } from "~/util"
import { createSignal, For, Show } from "solid-js"
import { schema } from "~/schema/schema"
import { Detail } from "~/components/details"
import { FormField } from "~/components/FormField"
import { DataRecord } from "~/schema/type"
import { Button } from "~/components/buttons"
import { Link } from "~/components/Link"
import { createStore } from "solid-js/store"
import { getOneExtRecordById } from "~/api/getOne/extRecordById"
import { submitChangeProposal } from "~/api/submit/changeProposal"

interface ProposeChange {
  tableName: string
  id: number
}

export default function ProposeChange() {
  const [diff, setDiff] = createStore<DataRecord>({})
  const [sp] = useSearchParams() as unknown as [ProposeChange]
  const record = createAsync(async () => getOneExtRecordById(sp.tableName, sp.id))
  const titleText = () => '' + (record()?.[titleColumnName(sp.tableName)] ?? '')
  const columns = () => schema.tables[sp.tableName].columns
  const [colName, setColName] = createSignal('')
  const navigate = useNavigate()
  const backHref = () => `/show-record?tableName=${sp.tableName}&id=${sp.id}`

  const onSubmit = async () => {
    const newValue = diff[colName()]
    const oldValue = record()![colName()]
    const explanation = (diff.change_explanation ?? '') as string
    await submitChangeProposal(
      sp.tableName, sp.id, colName(), oldValue, newValue, explanation
    )
    navigate(backHref())
  }

  return (
    <main>
      <Title>{titleText()}</Title>
      <RecordPageTitle tableName={sp.tableName} text={titleText()} />
      <Subtitle>Change proposal</Subtitle>
      <label class="block pb-2 px-2">
        <div class="font-bold" >
          Field
        </div>
        <select
          name="column_name"
          onChange={event => setColName(event.currentTarget.value)}
        >
          <option></option>
          <For each={Object.entries(columns())}>
            {([colName, column]) => (
              <option value={colName} >
                {humanCase(column.label ?? colName)}
              </option>
            )}
          </For>
        </select>
      </label>
      <Show when={record() && colName()}>
        <Detail
          tableName={sp.tableName}
          colName={colName()}
          record={record()!}
          label="Old value"
        />
        <div class="px-2">
          <FormField
            tableName={sp.tableName}
            colName={colName()}
            record={record()}
            {...{ diff, setDiff }}
            label="New value"
          />
          <FormField
            tableName="change_proposal"
            colName="change_explanation"
            {...{ diff, setDiff }}
          />
        </div>
      </Show>
      <div class="px-2 pt-2">
        <Button
          label="Submit"
          onClick={onSubmit}
        />
        <span class="inline-block w-2" />
        <Link
          route="show-record"
          params={{
            tableName: sp.tableName,
            id: sp.id
          }}
          type="button"
          label="Cancel"
        />
      </div>
    </main>
  )
}
