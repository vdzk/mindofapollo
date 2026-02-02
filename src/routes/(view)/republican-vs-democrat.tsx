import { Title } from "@solidjs/meta"
import { createAsync } from "@solidjs/router"
import { listArgumentsCache } from "~/client-only/query"
import { Link } from "~/components/Link"
import { PageTitle } from "~/components/PageTitle"
import { republicanVsDemocratStatementId } from "~/constant"

const claimId = republicanVsDemocratStatementId

export default function RepublicanVsDemocrat() {
  const argsData = createAsync(async () => listArgumentsCache(claimId))
  return (
    <main>
      <Title>Republican VS Democrat</Title>
      <PageTitle>Republican VS Democrat</PageTitle>
      <div class="px-2">
        <Link
          route="statement"
          params={{id: claimId}}
          label="arguments"
        />
        <pre>
          {JSON.stringify(argsData(), null, 2)}
        </pre>
      </div>

    </main>
  )
}