"use server";
import { getUserSession } from "~/server-only/session"
import { getPermission } from "~/getPermission"
import { getVirtualColNames } from "~/util"
import { _getRecordById } from "~/server-only/select";


export const getOneRecordById = async (tableName: string, id: number) => {
  const userSession = await getUserSession();
  const permission = getPermission(userSession, 'read', tableName, id);
  if (!permission.granted) return;
  const colNames = permission.colNames ?? getVirtualColNames(tableName).non;
  return _getRecordById(tableName, id, colNames);
};
