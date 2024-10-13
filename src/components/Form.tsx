import { action, createAsync, redirect, useAction, useParams } from "@solidjs/router";
import { Component, For, Match, Switch } from "solid-js";
import { insertRecord, multiListRecords } from "~/server/db";
import { ForeignKey, schema } from "~/schema";
import { getRecords } from "~/server/api";

const inputTypes = {
  varchar: 'text',
  text: 'hidden',
  boolean: 'checkbox',
  integer: 'text',
  fk: 'hidden'
}

const save = action(async (
  tableName: string,
  record: Record<string, string | boolean>
) => {
  await insertRecord(tableName, record)
  throw redirect(
    `/table/list/${tableName}`,
    { revalidate: getRecords.keyFor(tableName) }
  );
})

export const Form: Component<{ tableName: string }> = (props) => {

  const params = useParams();
  const saveAction = useAction(save);

  const columns = () => schema.tables[props.tableName].columns
  const colNames = () => Object.keys(columns())

  const foreignTableNames = () => Object.values(columns())
    .filter((column => column.type === 'fk'))
    .map(column => column.fk.table)

  const allForeignRecords = createAsync(async () => {
    const tableNames = foreignTableNames()
    return Object.fromEntries(
      (await multiListRecords(tableNames)).map(
        (records, index) => [tableNames[index], records]
      )
    )
  })

  const foreignRecords = (colName: string) => {
    const column = columns()[colName] as ForeignKey
    const foreignTableName = column.fk.table
    const records = allForeignRecords()?.[foreignTableName]
    return records
  }

  const onSubmit = async (event: SubmitEvent & { target: Element, currentTarget: HTMLFormElement; }) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget)
    const record: Record<string, string | boolean> = {};
    for (const [colName, column] of Object.entries(columns())) {
      if (column.type === 'boolean') {
        record[colName] = formData.has(colName)
      } else {
        record[colName] = formData.get(colName) + ''
      }
    }
    saveAction(params.name, record)
  }

  return (
    <form onSubmit={onSubmit} class="px-2">
      <For each={colNames()}>
        {colName => <label>
          {colName}:&nbsp;
          <Switch>
            <Match when={columns()[colName].type === 'text'}>
              <textarea name={colName} />
            </Match>
            <Match when={columns()[colName].type !== 'fk'}>
              <input
                name={colName}
                type={inputTypes[columns()[colName].type]}
                class="pl-1"
                autocomplete="off"
              />
            </Match>
            <Match when={columns()[colName].type === 'fk'}>
              <select name={colName}>
                <For each={foreignRecords(colName)}>
                  {record => <option value={record.id}>
                    {record[(columns()[colName] as ForeignKey).fk.labelColumn]}
                  </option>}
                </For>
              </select>
            </Match>
          </Switch>
          &nbsp;<br />
        </label>}
      </For>
      <button type="submit" class="text-sky-800">[ + Add ]</button>
    </form>
  )
}