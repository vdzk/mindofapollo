import { Title } from "@solidjs/meta"
import { createAsync, query, useAction } from "@solidjs/router"
import { getOneRecordById } from "~/api/getOne/recordById"
import { listRootStatementUpdates } from "~/api/list/rootStatementUpdates"
import { ActivityList } from "~/components/ActivityList"
import { Button } from "~/components/buttons"
import { PageTitle } from "~/components/PageTitle"
import { setSubscriptionAction, updateSubscriptionLastOpenedAction } from "~/client-only/action"
import { useSafeParams } from "~/client-only/util"
import { createEffect } from "solid-js"
import { Link } from "~/components/Link"

interface RootStatementUpdateParams {
  id: string;
}

const getRootStatementUpdatesQuery = query(
  ({ id }: { id: number }) => listRootStatementUpdates(id),
  'getRootStatementUpdates'
)

export default function RootStatementUpdates() {
  const sp = useSafeParams<RootStatementUpdateParams>(['id'])
  const statementId = () => parseInt(sp().id)
  
  const updates = createAsync(() => getRootStatementUpdatesQuery({ id: statementId() }))
  const statement = createAsync(async () => {
    const statement = await getOneRecordById('statement', statementId())
    if (!statement) return
    if (statement.statement_type_name ===  'prescriptive') {
      const directive = await getOneRecordById('directive', statementId())
      if (directive) {
        statement.label = directive.label
      }
    }
    return statement
  })
  const updateLastOpened = useAction(updateSubscriptionLastOpenedAction)
  const setSubscription = useAction(setSubscriptionAction)
  const unsubscribe = async () => setSubscription(statementId(), false, '/home-page')

  createEffect(() => {
    if (updates()) {
      updateLastOpened(statementId())
    } 
  })
  
  const title = () => `Updates for statement "${statement()?.label ?? '...'}"`
  
  return (
    <main>
      <Title>{title()}</Title>
      <PageTitle>{title()}</PageTitle>
      
      <div class="px-2 mb-4">
        <Link
          label="Visit"
          route="show-record"
          params={{ tableName: 'statement', id: statementId() }}
          type="button"
        />
        <Button
          label="Unsubscribe"
          onClick={unsubscribe}
          class="ml-2"
        />
      </div>
      
      <ActivityList activity={updates()} goToRecord />
    </main>
  )
}
