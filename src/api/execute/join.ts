import { AuthRole } from "~/types"
import { onError, sql } from "../../server-only/db"
import { ExplData, UserActor } from "~/components/expl/types"
import { finishExpl, setExplRecordId, startExpl } from "~/server-only/expl"
import { _getRecordById } from "~/server-only/select"
import { _insertRecord, _updateRecord } from "~/server-only/mutate"
import { Language } from "~/translation"
import bcrypt from "bcryptjs"
import { getValidInviteByCode } from "~/server-only/getValidInviteByCode"
import { adminUserId, openRegistration } from "~/constant"
import { allowedTextContent } from "~/server-only/moderate"
import { hashPassword } from "~/server-only/crypt"

export const join = async (name: string, email: string, password: string, language: Language, code?: string) => {
  "use server"
  // Check if email already exists
  const existingEmail = await sql`
    SELECT user_id FROM personal_details WHERE email = ${email} LIMIT 1
  `.catch(onError)
  if (existingEmail?.[0]) return


  let invite
  if (!openRegistration) {
    if (!code) return
    invite = await getValidInviteByCode(code)
    if (!invite) return
  } else {
    invite = {
      owner_id: adminUserId
    }
  }

  const authRoleName: AuthRole = 'invited'
  const authRoles = await sql`
    SELECT id 
    FROM auth_role 
    WHERE name = ${authRoleName} 
    LIMIT 1
  `.catch(onError)
  if (!authRoles?.[0]) return
  const authRole = authRoles[0]

  // Check if the name is allowed
  if (! await allowedTextContent(name)) return

  const explId = await startExpl(invite.owner_id, 'join', 1, 'person', null)

  const person = await _insertRecord('person', {
    name,
    auth_role_id: authRole.id,
    language
  }, explId)
  if (!person) return
  await setExplRecordId(explId, person.id)

  // Create personal details record
  await sql`
    INSERT INTO personal_details (user_id, email, password_hash)
    VALUES (${person.id}, ${email}, ${hashPassword(password)})
  `.catch(onError)
  
  if (!openRegistration) {
    await _updateRecord('invite', invite.id, explId, {
      person_id: person.id
    })
  }

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
