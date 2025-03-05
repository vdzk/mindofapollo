import { AuthRole } from "~/types"
import { onError, sql } from "../../server-only/db"
import { ExplData, UserActor } from "~/components/expl/types"
import { finishExpl, setExplRecordId, startExpl } from "~/server-only/expl"
import { _getRecordById } from "~/server-only/select"
import { _insertRecord, _updateRecord } from "~/server-only/mutate"

export const join = async (name: string, code: string) => {
  "use server"
  const invites = await sql`
    SELECT id, owner_id
    FROM invite
    WHERE code = ${code}
      AND person_id IS NULL
    LIMIT 1
  `.catch(onError)
  if (!invites?.[0]) return
  const invite = invites[0]

  const authRoleName: AuthRole = 'invited'
  const authRoles = await sql`
    SELECT id 
    FROM auth_role 
    WHERE name = ${authRoleName} 
    LIMIT 1
  `.catch(onError)
  if (!authRoles?.[0]) return
  const authRole = authRoles[0]

  const explId = await startExpl(invite.owner_id, 'join', 1, 'person', null)

  const person = await _insertRecord('person', {
    name,
    auth_role_id: authRole.id
  }, explId)
  if (!person) return
  await setExplRecordId(explId, person.id)
  
  await _updateRecord('invite', invite.id, explId, {
    person_id: person.id
  })

  const inviterRecord = await _getRecordById('person', invite.owner_id, ['id', 'name', 'auth_role_id'], false)

  if (!inviterRecord) return

  const inviterAuthRole = await _getRecordById('auth_role', inviterRecord.auth_role_id as number, ['name'], false)

  if (!inviterAuthRole) return
  
  const data: JoinExplData = {
    person: {
      id: person.id,
      name: person.name as string
    },
    inviter: {
      id: inviterRecord.id as number,
      name: inviterRecord.name as string,
      auth_role: inviterAuthRole.name as AuthRole
    }
  }
  await finishExpl(explId, data)

  return person.id
}

interface JoinExplData {
  person: {
    id: number
    name: string
  }
  inviter: UserActor['user']
}

export const explJoin = (data: JoinExplData): ExplData => ({
  actor: { type: 'user', user: data.inviter },
  action: 'invited',
  target: {
    tableName: 'person',
    id: data.person.id,
    label: data.person.name
  }
})
