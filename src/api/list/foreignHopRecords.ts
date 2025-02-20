"use server"

import { sql } from "~/server-only/db"
import { schema } from "~/schema/schema"
import { ForeignKey } from "~/schema/type"

export const listForeignHopRecords = (
    tableName: string,
    fkName: string,
    fkId: number,
    hopColName: string
) => {
    const extColumn = schema.tables[tableName].columns[hopColName] as ForeignKey;

    // tMain.id overrides tHop.id
    return sql`
    SELECT tHop.*, tMain.*
    FROM ${sql(tableName)} tMain
    JOIN ${sql(extColumn.fk.table)} tHop
      ON tMain.${sql(hopColName)} = tHop.id
    WHERE tMain.${sql(fkName)} = ${fkId}
    ORDER BY tMain.id
    `
};