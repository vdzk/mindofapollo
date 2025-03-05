import { onError, sql } from "~/server-only/db"
import { schema } from "~/schema/schema"
import { DataRecordWithId, ForeignKey } from "~/schema/type"

export const listForeignHopRecords = async (
    tableName: string,
    fkName: string,
    fkId: number,
    hopColName: string
) => {
    "use server"
    const extColumn = schema.tables[tableName].columns[hopColName] as ForeignKey;

    // tMain.id overrides tHop.id
    const results = await sql`
      SELECT tHop.*, tMain.*
      FROM ${sql(tableName)} tMain
      JOIN ${sql(extColumn.fk.table)} tHop
        ON tMain.${sql(hopColName)} = tHop.id
      WHERE tMain.${sql(fkName)} = ${fkId}
      ORDER BY tMain.id
    `.catch(onError)
    return results as unknown as DataRecordWithId[]
};