import { Title } from "@solidjs/meta"
import { createAsync, redirect, useNavigate } from "@solidjs/router"
import { titleColumnName } from "~/utils/schema"
import { RecordPageTitle } from "../../components/PageTitle"
import { useSafeParams } from "~/client-only/util"
import { getOneExtRecordById } from "~/api/getOne/extRecordById"
import { ShowRecord } from "~/views/ShowRecord"
import { createEffect } from "solid-js"
import { buildUrl } from "~/utils/string"

export default function ShowRecordRoute() {
  const sp = useSafeParams<{
    tableName: string
    id: string
  }>(['tableName', 'id'])
  const recordId = () => parseInt(sp().id)
  const record = createAsync(() => getOneExtRecordById(sp().tableName, recordId()))
  const titleColName = () => titleColumnName(sp().tableName)
  const titleText = () => (record()?.[titleColName()] ?? '') as string
  
  const navigate = useNavigate()
  createEffect(() => {
    console.log('sp', sp())
    console.log('recordId', recordId())
    console.log('record', record())
    if (sp().tableName === 'critical_statement' && record()) {
      console.log('redirecting to statement')
      navigate(buildUrl('statement', {
        argumentId: record()!.argument_id
      }), { replace: true })
    }
  })

  return (
    <main>
      <Title>{titleText()}</Title>
      <RecordPageTitle tableName={sp().tableName} text={titleText()} />
      <ShowRecord tableName={sp().tableName} id={recordId()} />
    </main>
  )
}
