import { createResource, createSignal, Switch, Match } from "solid-js"
import { Detail } from "~/components/details"
import { PageTitle, Subtitle } from "~/components/PageTitle"
import { RecordDetails } from "~/components/RecordDetails"
import { Task } from "~/components/Task"
import { humanCase } from "~/utils/string"
import { Button } from "~/components/buttons"
import { getTaskVoteChangeProposal } from "~/api/getTask/voteChangeProposal"
import { submitTaskVoteChangeProposal } from "~/api/submitTask/voteChangeProposal"
import { MasterDetail } from "~/components/MasterDetail"

export default function VoteChangeProposal() {
  const [proposal, { refetch }] = createResource(getTaskVoteChangeProposal)
  const [selectedSection, setSelectedSection] = createSignal<'change' | 'details'>('details')

  const options = [
    { id: 'details' as const, label: 'Record' },
    { id: 'change' as const, label: 'Change' }
  ]

  const vote = async (inFavour: boolean) => {
    await submitTaskVoteChangeProposal(proposal()!.id, inFavour)
    refetch()
  }

  return (
    <Task resource={proposal}>
      <PageTitle>
        Vote on a change to a {humanCase(proposal()!.table_name)}
      </PageTitle>

      <MasterDetail
        options={options}
        selectedId={selectedSection()}
        onChange={setSelectedSection}
        class="pl-2"
      >
        <Switch>
          <Match when={selectedSection() === 'change'}>
            <Detail
              tableName="change_proposal"
              colName="column_name"
              record={proposal()!}
            />
            <Detail
              tableName={proposal()!.table_name}
              colName={proposal()!.column_name}
              record={{ [proposal()!.column_name]: proposal()!.old_value }}
              label="Old value"
            />
            <Detail
              tableName={proposal()!.table_name}
              colName={proposal()!.column_name}
              record={{ [proposal()!.column_name]: proposal()!.new_value }}
              label="New value"
            />
            <Detail
              tableName="change_proposal"
              colName="change_explanation"
              record={proposal()!}
            />
            <div class="px-2">
              <div class="font-bold">Your vote</div>
              <Button
                label="In Favour"
                onClick={() => vote(true)}
              />
              <span class="inline-block w-2" />
              <Button
                label="Against"
                onClick={() => vote(false)}
              />
            </div>
          </Match>
          <Match when={selectedSection() === 'details'}>
            <RecordDetails
              tableName={proposal()!.table_name}
              id={proposal()!.target_id}
            />
          </Match>
        </Switch>
      </MasterDetail>
    </Task>
  )
}
