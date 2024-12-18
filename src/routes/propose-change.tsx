import { Title } from "@solidjs/meta";
import { RecordPageTitle, Subtitle } from "../components/PageTitle";
import { createAsync, useNavigate, useSearchParams } from "@solidjs/router";
import { getExtRecordById } from "~/server/extRecord.db";
import { humanCase, titleColumnName } from "~/util";
import { createSignal, For, Show } from "solid-js";
import { schema } from "~/schema/schema";
import { Detail } from "~/components/Detail";
import { FormField } from "~/components/FormField";
import { parseForm } from "~/components/Form";
import { saveChangeProposal } from "~/server/changeProposal";

interface ProposeChange {
  tableName: string
  id: number
}

export default function ProposeChange() {
  const [sp] = useSearchParams() as unknown as [ProposeChange]
  const record = createAsync(async () => getExtRecordById(sp.tableName, sp.id))
  const titleText = () => '' + (record()?.[titleColumnName(sp.tableName)] ?? '')
  const columns = () => schema.tables[sp.tableName].columns
  const [colName, setColName] = createSignal('')
  const navigate = useNavigate()
  const backHref = () => `/show-record?tableName=${sp.tableName}&id=${sp.id}`

  const onSubmit = async (event: SubmitEvent & { target: Element, currentTarget: HTMLFormElement; }) => {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    const newValue = parseForm(formData, columns())[colName()]
    const oldValue = record()![colName()]
    const explanation = (formData.get('change_explanation') ?? '') as string
    await saveChangeProposal(
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
      <form onSubmit={onSubmit}>
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
              value={record()![colName()]}
              label="New value"
            />
            <FormField
              tableName="change_proposal"
              colName="change_explanation"
            />
          </div>
        </Show>
        <div class="px-2 pt-2">
          <button type="submit" class="text-sky-800">
            [ Submit ]
          </button>
          <a
            class="text-sky-800 mx-2"
            href={backHref()}
          >
            [ Cancel ]
          </a>
        </div>
      </form>
    </main>
  );
}