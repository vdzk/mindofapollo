import { createResource } from "solid-js";
import { Detail } from "~/components/details";
import { PageTitle, Subtitle } from "~/components/PageTitle";
import { RecordDetails } from "~/components/RecordDetails";
import { Task } from "~/components/Task";
import { getChangeProposal, voteChangeProposal } from "~/api/do-task/vote-change-proposal";
import { humanCase } from "~/util"
import { Button } from "~/components/buttons"

export default function VoteChangeProposal() {
  const [proposal, { refetch }] = createResource(getChangeProposal)

  const vote = async (inFavour: boolean) => {
    await voteChangeProposal(proposal()!.id, inFavour)
    refetch()
  }

  return (
    <Task resource={proposal}>
      <PageTitle>
        Vote on a change to a {humanCase(proposal()!.table_name)}
      </PageTitle>
      <Subtitle>Details</Subtitle>
      <RecordDetails
        tableName="argument"
        id={proposal()!.target_id}
      />
      <Subtitle>Change Proposal</Subtitle>
      <Detail
        tableName="change_proposal"
        colName="column_name"
        record={proposal()!}
      />
      <Detail
        tableName={proposal()!.table_name}
        colName={proposal()!.column_name}
        record={{[proposal()!.column_name]: proposal()!.old_value}}
        label="Old value"
      />
      <Detail
        tableName={proposal()!.table_name}
        colName={proposal()!.column_name}
        record={{[proposal()!.column_name]: proposal()!.new_value}}
        label="New value"
      />
      <Detail
        tableName="change_proposal"
        colName="change_explanation"
        record={proposal()!}
      />
      <main class="px-2 max-w-md">
        <div>
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
      </main>
    </Task>
  )
}
