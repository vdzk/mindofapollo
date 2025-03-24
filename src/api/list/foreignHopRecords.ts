import { onError, sql } from "~/server-only/db"
import { schema } from "~/schema/schema"
import { DataRecordWithId, ForeignKey } from "~/schema/type"
import { injectTranslations } from "~/server-only/injectTranslations";

export const listForeignHopRecords = async (
    tableName: string,  // the target table
    fkName: string,
    fkId: number,
    hopColName: string  // final table
) => {
    "use server"
    const extColumn = schema.tables[tableName].columns[hopColName] as ForeignKey

    // tMain.id overrides tHop.id
    const results = await sql<DataRecordWithId[]>`
      SELECT tHop.*, tMain.*
      FROM ${sql(tableName)} tMain
      JOIN ${sql(extColumn.fk.table)} tHop
        ON tMain.${sql(hopColName)} = tHop.id
      WHERE tMain.${sql(fkName)} = ${fkId}
      ORDER BY tMain.id
    `.catch(onError)
    await injectTranslations(extColumn.fk.table, results, null, undefined, hopColName)
    return results
};