import { _updateRecord, _insertRecord } from "~/server-only/mutate"
import { startExpl, finishExpl } from "~/server-only/expl"
import { getUserSession, getUserActorUser } from "~/server-only/session"
import { _getRecordById } from "~/server-only/select"
import { ExplData, ExplDiff, UserActor } from "~/components/expl/types"
import { DataRecord, DataRecordWithId } from "~/schema/type"

export const submitTaskConfirmOrChallenge = async (
  statementId: number
) => {
  "use server"
  const userSession = await getUserSession()
  // TODO: check permissions
  
  const explId = await startExpl(userSession.userId, 'submitTaskConfirmOrChallenge', 1, 'statement', statementId)
  const statement = await _getRecordById('statement', statementId)
  if (!statement) return
  const existingConfirmation = await _getRecordById('confirmation', statementId)
  let confirmation
  let confirmationDiff
  let statementDiff
  
  if (!existingConfirmation) {
    confirmation = await _insertRecord('confirmation', {
      id: statementId,
      count: 1
    }, explId)
  } else {
    confirmationDiff = await _updateRecord('confirmation', statementId, explId, {
      count: existingConfirmation.count as number + 1
    })
    confirmation = (await _getRecordById('confirmation', statementId))!
  }

  const count = confirmation.count as number
  // TODO: make this number dynamic, depending on the number of users
  if (count >= 2) {
    statementDiff = await _updateRecord('statement', statementId, explId, {       
      decided: true,       
      confidence: 1     
    })
  }

  const user = await getUserActorUser()
  const data: ConfirmOrChallengeData = {
    statement,
    confirmation,
    user,
    confirmationDiff,
    statementDiff
  }
  await finishExpl(explId, data)
  return confirmation
}

interface ConfirmOrChallengeData {
  statement: DataRecordWithId
  confirmation: DataRecordWithId
  user: UserActor['user']
  confirmationDiff?: ExplDiff<DataRecord>
  statementDiff?: ExplDiff<DataRecord>
}

export const explSubmitTaskConfirmOrChallenge = (data: ConfirmOrChallengeData): ExplData => ({
  actor: { type: 'user', user: data.user },
  action: 'confirmed correctness of',
  target: {
    tableName: 'statement',
    id: data.statement.id,
    label: data.statement.text as string
  },
  diff: data.statementDiff,
  insertedRecords: data.confirmationDiff ? undefined : {
    confirmation: [data.confirmation]
  },
  updatedRecords: data.confirmationDiff ? {
    confirmation: [{...data.confirmationDiff, id: data.confirmation.id}]
  } : undefined,
  relevantRecords: {
    statement: [data.statement]
  }
})