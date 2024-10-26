import { Title } from "@solidjs/meta";
import { Form } from "../components/Form";
import { titleColumnName } from "~/util";
import { RecordPageTitle } from "../components/PageTitle";
import { createAsync, useSearchParams } from "@solidjs/router";
import { getRecordById } from "~/server/db";

interface EditRecord {
  tableName: string
  id: string
}

export default function EditRecord() {
  const [sp] = useSearchParams() as unknown as [EditRecord]
  const record = createAsync(() => getRecordById(sp.tableName, sp.id))
  const titleText = () => record()?.[titleColumnName(sp.tableName)]

  return (
      <main>
        <Title>{titleText()}</Title>
        <RecordPageTitle tableName={sp.tableName} text={titleText()} />
        <Form id={sp.id} tableName={sp.tableName} record={record()} />
      </main>
  );
}