import { Title } from "@solidjs/meta";
import { Form } from "../components/Form";
import { PageTitle } from "../components/PageTitle";
import { humanCase } from "~/util";
import { useSearchParams } from "@solidjs/router";
import { Dynamic } from "solid-js/web";
import { schema } from "~/schema";

interface CreateRecordProps {
  tableName: string
}

export default function CreateRecord() {
  const [sp] = useSearchParams() as unknown as [CreateRecordProps]
  return (
    <main>
      <Title>New {humanCase(sp.tableName)}</Title>
      <PageTitle>
        <Dynamic
          component={schema.tables[sp.tableName].icon}
          size={22}
          class="inline mr-1 mb-1"
        />
        New {humanCase(sp.tableName)}
      </PageTitle>
      <Form tableName={sp.tableName} />
    </main>
  )
}