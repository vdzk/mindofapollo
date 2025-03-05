import { getValueTypeTableNameByColType } from "~/schema/dataTypes";
import { onError, sql } from "./db";

export const getDirConcsWithValues = async (ids: number[]) => {
  const records = await sql`
        SELECT directive_consequence.id, directive_consequence.value_id,
          moral_good.name as moral_good,
          unit.name as unit, unit.column_type
        FROM directive_consequence
        JOIN moral_good
          ON moral_good.id = directive_consequence.moral_good_id
        JOIN unit
          ON unit.id = moral_good.unit_id
        WHERE directive_consequence.id IN ${sql(ids)}
      `.catch(onError)
  const colRecordIds: Record<string, number[]> = {}
  for (const record of records) {
    const colType = record.column_type
    if (!colRecordIds[colType]) {
      colRecordIds[colType] = []
    }
    colRecordIds[colType].push(record.id)
  }
  const values = Object.fromEntries((await Promise.all(
    Object.keys(colRecordIds).map(colType => {
      const vttn = getValueTypeTableNameByColType(colType)
      return sql`
            SELECT dc.id, v.value
            FROM directive_consequence dc
            JOIN ${sql(vttn)} v
              ON v.id = dc.value_id
            WHERE dc.id IN ${sql(colRecordIds[colType])}
          `.catch(onError)
    })
  )).flat().map(record => [record.id, record.value]))
  return { records, values }
}
