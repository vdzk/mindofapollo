import { Title } from "@solidjs/meta"
import { Form } from "../../components/form/Form"
import { PageTitle } from "../../components/PageTitle"
import { humanCase } from "~/utils/string"
import { useSafeParams } from "~/client-only/util"
import { useSearchParams } from "@solidjs/router"
import { LinkData } from "~/types"

export default function CreateRecord() {
  const sp = useSafeParams<{tableName: string}>(['tableName'])
  const [searchParams] = useSearchParams()
  const title = () => `New ${humanCase(sp().tableName)}`

  const getLinkData = (savedId?: number): LinkData => {
    if (savedId) {
      return {
        route: 'show-record',
        params: { tableName: sp().tableName, id: savedId }
      }
    } else {
      if (searchParams.sourceTable && searchParams.sourceId) {
        return {
          route: 'show-record',
          params: {
            tableName: searchParams.sourceTable as string,
            id: searchParams.sourceId as string
          }
        }
      } else {
        return { route: 'home-page' }
      }
    }
  }

  return (
    <main class="pb-2">
      <Title>{title()}</Title>
      <PageTitle>{title()}</PageTitle>
      <Form
        tableName={sp().tableName}
        exitSettings={{ getLinkData }}
      />
    </main>
  )
}
