import { Title } from "@solidjs/meta"
import { createAsync } from "@solidjs/router"
import { titleColumnName } from "~/utils/schema"
import { PageTitle, RecordPageTitle } from "../../components/PageTitle"
import { useSafeParams } from "~/client-only/util"
import { getOneExtRecordById } from "~/api/getOne/extRecordById"
import { ShowRecord } from "~/views/ShowRecord"
import { Show } from "solid-js"
import { Link } from "~/components/Link"

export default function ShowRecordRoute() {
  const sp = useSafeParams<{
    tableName: string
    id: string
  }>(['tableName', 'id'])
  const recordId = () => parseInt(sp().id)
  const record = createAsync(() => getOneExtRecordById(sp().tableName, recordId()))
  const titleColName = () => titleColumnName(sp().tableName)
  const titleText = () => (record()?.[titleColName()] ?? '') as string

  return (
    <>
      <Show when={sp().tableName !== 'critical_statement'}>
        <main>
          <Title>{titleText()}</Title>
          <RecordPageTitle tableName={sp().tableName} text={titleText()} />
          <ShowRecord tableName={sp().tableName} id={recordId()} />
        </main>
      </Show>
      <Show when={sp().tableName === 'critical_statement'}>
        <main>
          <Title>Critical statement redirect</Title>
          <PageTitle>Critical statement redirect</PageTitle>
          <div class="px-2">
            <div class="pb-2">
              Please open the critical questions on the argument page to see the critical statements.
            </div>
            <Link
              type="button"
              label="View the argument"
              route="statement"
              params={{
                argumentId: record()?.argument_id
              }}
            />
          </div>
        </main>
      </Show>
    </>
  )
}
