import { Component, For, Show } from "solid-js";
import { Form } from "~/components/Form";
import { TableSchema } from "~/schema.type";
import postgres from "postgres";

export const BulkTableView: Component<{
  loggedIn: boolean,
  tableName: string,
  tableSchema: TableSchema,
  records?: postgres.RowList<postgres.Row[]>
}> = (props) => {
  const colNames = () => Object.keys(props.tableSchema.columns)

  return (
    <div style={{ display: 'flex' }}>
      <Show when={props.loggedIn}>
        <Form tableName={props.tableName} />
      </Show>
      <table>
        <tbody>
          <tr>
            <th>id</th>
            <For each={colNames()}>
              {colName => <th>{colName}</th>}
            </For>
          </tr>
          <For each={props.records}>{(record) => <tr>
            <For each={Object.values(record)}>
              {value => <td><pre>{value + ''}</pre></td>}
            </For>
          </tr>}</For>
        </tbody>
      </table>
    </div>
  );
}