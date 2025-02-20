import { _getRecordById } from "~/server-only/select";
import { getSession } from "~/server-only/session";
import { UserSession } from "~/types";

export const login = async (userId: number) => {
  "use server"
  const person = await _getRecordById('person', userId, ['authorization_category_id']);
  if (!person) return;
  const authorizationCategory = await _getRecordById(
    'authorization_category',
    person.authorization_category_id as number,
    ['name']
  );
  if (!authorizationCategory) return;
  const session = await getSession();
  await session.update({
    authenticated: true,
    userId,
    authorizationCategory: authorizationCategory.name as UserSession['authorizationCategory']
  });
  return session.data;
};
