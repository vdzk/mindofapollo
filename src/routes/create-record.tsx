import { Title } from "@solidjs/meta";
import { Form } from "../components/Form";
import { PageTitle, PageTitleIcon } from "../components/PageTitle";
import { humanCase } from "~/util";
import { useSearchParams } from "@solidjs/router";

interface CreateRecordProps {
  tableName: string
}

export default function CreateRecord() {
  const [sp] = useSearchParams() as unknown as [CreateRecordProps]
  return (
    <main>
      <Title>New {humanCase(sp.tableName)}</Title>
      <PageTitle>
        <PageTitleIcon tableName={sp.tableName} />
        New {humanCase(sp.tableName)}
      </PageTitle>
      <Form tableName={sp.tableName} />
    </main>
  )
}
