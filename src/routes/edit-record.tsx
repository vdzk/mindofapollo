import { Title } from "@solidjs/meta";
import { Form } from "../components/Form";
import { humanCase, titleColumnName } from "~/util";
import { PageTitle } from "../components/PageTitle";
import { createAsync, useSearchParams } from "@solidjs/router";
import { getRecordById } from "~/server/db";

interface EditRecord {
  tableName: string
  id: string
}

export default function EditRecord() {
  const [sp] = useSearchParams() as unknown as [EditRecord]
  const record = createAsync(() => getRecordById(sp.tableName, sp.id))
  return (
    <main>
      <Title>{record()?.[titleColumnName(sp.tableName)]}</Title>
      <PageTitle>
        Edit {humanCase(sp.tableName)}
      </PageTitle>
      <Form id={sp.id} tableName={sp.tableName} record={record()} />
    </main>
  );
}