import { For, Show, useContext } from "solid-js";
import { Form } from "~/components/Form";
import { createAsync, useSearchParams } from "@solidjs/router";
import { SessionContext } from "~/SessionContext";
import { schema } from "~/schema/schema";
import { getRecords } from "~/server/api";

interface ManageRecordProps {
  tableName: string
}

export default function ManageRecords() {
  const [sp] = useSearchParams() as unknown as [ManageRecordProps]
  const session = useContext(SessionContext)
  const records = createAsync(() => getRecords(sp.tableName))
  const colNames = () => Object.keys(schema.tables[sp.tableName].columns)

  return (
    <div style={{ display: 'flex' }}>
      <Show when={session?.loggedIn()}>
        <Form tableName={sp.tableName} />
      </Show>
      <table>
        <tbody>
          <tr>
            <th>id</th>
            <For each={colNames()}>
              {colName => <th>{colName}</th>}
            </For>
          </tr>
          <For each={records()}>{(record) => <tr>
            <For each={Object.values(record)}>
              {value => <td><pre>{value + ''}</pre></td>}
            </For>
          </tr>}</For>
        </tbody>
      </table>
    </div>
  );
}
