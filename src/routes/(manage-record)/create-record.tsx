import { Title } from "@solidjs/meta"
import { Form } from "../../components/Form"
import { PageTitle } from "../../components/PageTitle"
import { humanCase } from "~/util"
import { useSafeParams } from "~/client-only/util"
import { useSearchParams } from "@solidjs/router"
import { LinkData } from "~/types"

export default function CreateRecord() {
  const sp = useSafeParams<{tableName: string}>(['tableName'])
  const [searchParams] = useSearchParams()
  const title = () => `New ${humanCase(sp().tableName)}`

  const exitLink = (): LinkData => {
    if (searchParams.sourceTable && searchParams.sourceId) {
      return {
        route: 'show-record',
        params: {
          tableName: searchParams.sourceTable as string,
          id: searchParams.sourceId as string
        }
      }
    } else {
      return {
        route: 'list-records',
        params: { tableName: sp().tableName as string }
      }
    }
  }

  return (
    <main>
      <Title>{title()}</Title>
      <PageTitle>{title()}</PageTitle>
      <Form
        tableName={sp().tableName}
        exitSettings={{ linkData: exitLink() }}
      />
    </main>
  )
}
