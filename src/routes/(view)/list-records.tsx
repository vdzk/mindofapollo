import { createSignal, For, Match, Show, Switch } from "solid-js"
import { Title } from "@solidjs/meta"
import { firstCap, nbsp } from "~/utils/string"
import { pluralTableName } from "~/utils/schema"
import { titleColumnName } from "~/utils/schema"
import { action, createAsync, json, useAction } from "@solidjs/router"
import { schema } from "~/schema/schema"
import { listRecordsCache } from "~/client-only/query"
import { PageTitle } from "~/components/PageTitle"
import { useSafeParams } from "~/client-only/util"
import { Link } from "~/components/Link"
import { Button } from "~/components/buttons"
import { insertRecord, whoCanInsertRecord } from "~/api/insert/record"
import { useBelongsTo } from "~/client-only/useBelongsTo"
import { deleteByIds, whoCanDeleteByIds } from "~/api/delete/byIds"
import { NestPanel } from "~/components/NestPanel"
import { UserExplField } from "~/components/form/UserExplField"

export default function ListRecords() {
  const sp = useSafeParams<{tableName: string}>(['tableName'])
  const [selectedIds, setSelectedIds] = createSignal<number[]>([])
  const [userExpl, setUserExpl] = createSignal('')

  const records = createAsync(() => listRecordsCache(sp().tableName))
  const title = () => firstCap(pluralTableName(sp().tableName))
  const table = () => schema.tables[sp().tableName]

  const canInsertRecord = () => useBelongsTo(whoCanInsertRecord(sp().tableName))  
  const canDeleteByIds = () => useBelongsTo(whoCanDeleteByIds(sp().tableName))

  const addAction = useAction(action(async () => {
    const record = table().createRecord!()
    await insertRecord(sp().tableName, record)
    return json( 'ok', { revalidate: [ listRecordsCache.keyFor(sp().tableName) ] })
  }))

  const deleteSelected = useAction(action(async () => {
    await deleteByIds(sp().tableName, selectedIds(), userExpl())
    setSelectedIds([])
    return json('ok', { revalidate: [listRecordsCache.keyFor(sp().tableName)] })
  }))

  return (
    <main>
      <Title>{title()}</Title>
      <PageTitle>
        {title()}
      </PageTitle>
      <section class="pb-2">
        <For each={records()}>{(record) => (
          <div class="px-2 flex items-center gap-2">
            <Show when={canDeleteByIds()}>
              <input
                type="checkbox"
                checked={selectedIds().includes(record.id)}
                onChange={(e) => {
                  if (e.currentTarget.checked) {
                    setSelectedIds([...selectedIds(), record.id])
                  } else {
                    setSelectedIds(selectedIds().filter(id => id !== record.id))
                  }
                }}
              />
            </Show>
            <Link
              route="show-record"
              params={{
                tableName: sp().tableName,
                id: record.id
              }}
              label={record[titleColumnName(sp().tableName)] || nbsp}
            />
          </div>
        )}</For>
      </section>
      <section class="px-2 pb-2">
        <Show when={canInsertRecord()}>
          <Switch>
            <Match when={table().createRecord}>
              <Button
                onClick={addAction}
                label="+ Add"
                tooltip="Add new record"
              />
            </Match>
            <Match when>
              <Link
                route="create-record"
                params={{ tableName: sp().tableName }}
                type="button"
                label="+ Add"
                tooltip="Add new record"
              />
            </Match>
          </Switch>
        </Show>
        <Show when={canDeleteByIds() && selectedIds().length > 0}>
          <NestPanel title="Delete selected" class="my-2">
            <UserExplField value={userExpl()} onChange={setUserExpl} />
            <Button
              label="Delete"
              onClick={() => deleteSelected()}
            />
          </NestPanel>
        </Show>
      </section>
    </main>
  );
}
