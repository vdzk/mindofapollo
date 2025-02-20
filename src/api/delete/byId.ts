import { getUserSession } from "~/server-only/session";
import { getPermission } from "~/getPermission";
import { _deleteById } from "../../server-only/mutate";

export const deleteById = async (
  tableName: string,
  id: number
) => {
  "use server"
  const userSession = await getUserSession();
  if (!getPermission(userSession, 'delete', tableName, id).granted) return;
  return await _deleteById(tableName, id);
};