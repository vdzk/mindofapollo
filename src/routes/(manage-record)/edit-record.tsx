import { Title } from "@solidjs/meta"
import { Form } from "../../components/form/Form"
import { RecordPageTitle } from "../../components/PageTitle"
import { createAsync, useSearchParams } from "@solidjs/router"
import { humanCase } from "~/utils/string"
import { titleColumnName } from "~/utils/schema"
import { Suspense } from "solid-js"
import { getOneExtRecordById } from "~/api/getOne/extRecordById"
import { LinkData } from "~/types"

interface EditRecord {
  tableName: string
  id: string
}

export default function EditRecord() {
  const [sp] = useSearchParams() as unknown as [EditRecord]
  const recordId = () => parseInt(sp.id)
  const record = createAsync(async () => getOneExtRecordById(sp.tableName, recordId()))
  const titleText = () => '' + (record()?.[titleColumnName(sp.tableName)] ?? '')

  const exitLink = (): LinkData => {
    return {
      route: 'show-record',
      params: { tableName: sp.tableName, id: sp.id }
    }
  }

  return (
    <main class="pb-2">
      <Suspense fallback={`loading ${humanCase(sp.tableName)}...`}>
        <Title>{titleText()}</Title>
        <RecordPageTitle tableName={sp.tableName} text={titleText()} />
        <Form
          id={recordId()}
          tableName={sp.tableName}
          record={record()}
          exitSettings={{ linkData: exitLink() }}
        />
      </Suspense>
    </main>
  );
}
