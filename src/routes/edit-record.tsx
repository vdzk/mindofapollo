import { Title } from "@solidjs/meta";
import { Form } from "../components/Form";
import { createAsyncFkTitle, RecordPageTitle } from "../components/PageTitle";
import { createAsync, useSearchParams } from "@solidjs/router";
import { getExtRecordById } from "~/server/extRecord.db";

interface EditRecord {
  tableName: string
  id: string
}

export default function EditRecord() {
  const [sp] = useSearchParams() as unknown as [EditRecord]
  const record = createAsync(async () => getExtRecordById(sp.tableName, sp.id))
  const titleText = createAsyncFkTitle(() => sp.tableName, record)

  return (
      <main>
        <Title>{titleText()}</Title>
        <RecordPageTitle tableName={sp.tableName} text={titleText()} />
        <Form id={sp.id} tableName={sp.tableName} record={record()} />
      </main>
  );
}