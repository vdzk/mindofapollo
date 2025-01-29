import { Title } from "@solidjs/meta";
import { Form } from "../../components/Form";
import { PageTitle } from "../../components/PageTitle";
import { humanCase } from "~/util";
import { useSafeParams } from "~/client-only/util";

export default function CreateRecord() {
  const sp = useSafeParams<{tableName: string}>(['tableName'])
  const title = () => `New ${humanCase(sp().tableName)}`

  return (
    <main>
      <Title>{title()}</Title>
      <PageTitle>{title()}</PageTitle>
      <Form tableName={sp().tableName} />
    </main>
  )
}
