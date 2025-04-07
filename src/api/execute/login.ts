import { _getRecordById } from "~/server-only/select"
import { getSession } from "~/server-only/session"
import { Language } from "~/translation"
import { AuthRole } from "~/types"
import bcrypt from "bcryptjs"

export const login = async (userId: number, password: string) => {
  "use server"
  if (!bcrypt.compareSync(password, process.env.PASSWORD_HASH!)) return
  const person = await _getRecordById('person', userId, ['name', 'auth_role_id', 'language'], false);
  if (!person) return
  const authRole = await _getRecordById(
    'auth_role',
    person.auth_role_id as number,
    ['name']
  );
  if (!authRole) return
  const session = await getSession()
  await session.update({
    authenticated: true,
    userId,
    userName: person.name as string,
    authRole: authRole.name as AuthRole,
    language: person.language as Language
  })
  return session.data
};
