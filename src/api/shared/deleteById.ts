"use server";
import { getUserSession } from "~/server-only/session";
import { getPermission } from "~/getPermission";
import { _deleteById } from "../../server-only/mutate";


export const deleteById = async (
  tableName: string,
  id: number
) => {
  const userSession = await getUserSession();
  if (!getPermission(userSession, 'delete', tableName, id).granted) return;
  // Use _deleteById after passing permission check
  return await _deleteById(tableName, id);
};
