import { Title } from "@solidjs/meta"
import { Form } from "../../components/Form"
import { RecordPageTitle } from "../../components/PageTitle"
import { createAsync, useSearchParams } from "@solidjs/router"
import { humanCase, titleColumnName } from "~/util"
import { Suspense } from "solid-js"
import { getOneExtRecordById } from "~/api/getOne/extRecordById"

interface EditRecord {
  tableName: string
  id: string
}

export default function EditRecord() {
  const [sp] = useSearchParams() as unknown as [EditRecord]
  const recordId = () => parseInt(sp.id)
  const record = createAsync(async () => getOneExtRecordById(sp.tableName, recordId()))
  const titleText = () => '' + (record()?.[titleColumnName(sp.tableName)] ?? '')

  return (
    <main>
      <Suspense fallback={`loading ${humanCase(sp.tableName)}...`}>
        <Title>{titleText()}</Title>
        <RecordPageTitle tableName={sp.tableName} text={titleText()} />
        <Form id={recordId()} tableName={sp.tableName} record={record()} />
      </Suspense>
    </main>
  );
}
