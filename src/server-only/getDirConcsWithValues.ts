import { getValueTypeTableNameByColType } from "~/schema/dataTypes"
import { onError, sql } from "./db"
import { injectTranslations } from "./injectTranslations"
import { ColumnType, DataRecordWithId } from "~/schema/type"

export const getDirConcsWithValues = async (ids: number[]) => {
  const records = await sql<DataRecordWithId[]>`
    SELECT dc.id, dc.value_id, unit.column_type,
      dc.moral_good_id, moral_good.unit_id
    FROM directive_consequence AS dc
    JOIN unit
      ON unit.id = moral_good.unit_id
    WHERE dc.id IN ${sql(ids)}
  `.catch(onError)
  
  await injectTranslations('directive_consequence', records, null, [
    {
      tableName: 'moral_good',
      recordIdColName: 'moral_good_id',
      columnName: 'name',
      resultColName: 'moral_good'
    },
    {
      tableName: 'unit',
      recordIdColName: 'unit_id',
      columnName: 'name',
      resultColName: 'unit'
    }
  ])

  const colRecordIds: Record<string, number[]> = {}
  for (const record of records) {
    const colType = record.column_type as ColumnType
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
