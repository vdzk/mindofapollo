import { _getRecordById } from "~/server-only/select";
import { getSession } from "~/server-only/session";
import { AuthRole } from "~/types";

export const login = async (userId: number) => {
  "use server"
  const person = await _getRecordById('person', userId, ['auth_role_id']);
  if (!person) return;
  const authRole = await _getRecordById(
    'auth_role',
    person.auth_role_id as number,
    ['name']
  );
  if (!authRole) return;
  const session = await getSession();
  await session.update({
    authenticated: true,
    userId,
    authRole: authRole.name as AuthRole
  });
  return session.data;
};
