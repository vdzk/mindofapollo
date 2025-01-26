"use server"

import {schema} from "~/schema/schema"
import {onError, sql} from "~/db"
import {ForeignKey} from "~/schema/type"
import {injectVirtualValues} from "~/api/shared/select"
import { Id } from "~/types"

export const listOverlapRecords = (
    tableName: string,
    sharedColumn: string,
    filterTable: string,
    filterId: Id
) => sql`
  SELECT ${sql(tableName)}.*
  FROM ${sql(tableName)}
  JOIN ${sql(filterTable)}
    ON ${sql(tableName)}.${sql(sharedColumn)} = ${sql(filterTable)}.${sql(sharedColumn)}
  WHERE ${sql(filterTable)}.id = ${filterId}
  ORDER BY ${sql(tableName)}.id
`.catch(onError);

export const listForeignRecords = async (
    tableName: string,
    fkName: string,
    fkId: Id
) => {
    const {extendedByTable} = schema.tables[tableName]
    let records
    if (extendedByTable) {
        records = await sql`
      SELECT *, t.id
      FROM ${sql(tableName)} t
      LEFT JOIN ${sql(extendedByTable)} e ON e.id = t.id
      WHERE t.${sql(fkName)} = ${fkId}
      ORDER BY t.id
    `.catch(onError)
    } else {
        records = await sql`
      SELECT *
      FROM ${sql(tableName)}
      WHERE ${sql(fkName)} = ${fkId}
      ORDER BY id
    `.catch(onError)
    }
    await injectVirtualValues(tableName, records)
    return records
};

export const listForeignHopRecords = (
    tableName: string,
    fkName: string,
    fkId: Id,
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
  `.catch(onError);
};

