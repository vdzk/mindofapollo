import { sqlStr } from "~/util-no-circle"
import { schema } from "~/schema/schema"
import { ForeignKey } from "~/schema/type"
import { sql } from "~/server-only/db"
import { TranslatedColumn, injectTranslations } from "~/server-only/translation"
import { translatable } from "~/utils/schema"

export type VqColumn = [string] | [string, string | VqColumn[]]

export const queryVirtualColumn = async (
  startTable: string,
  columns: VqColumn[],
  ids: number[],
  whereColumn: string
) => {
  const joins: string[] = []
  const selects: string[] = []
  const translatedColumns: TranslatedColumn[] = []

  const processColumns = (
    parentTable: string,
    recordIdColName: string,
    columns: VqColumn[]
  ) => {
    for (const column of columns) {      
      const [columnName, secondPart] = column
      if (Array.isArray(secondPart)) {
        const children = secondPart
        const fkColumn = schema.tables[parentTable].columns[columnName] as ForeignKey
        const fkTable = fkColumn.fk.table
        joins.push(sqlStr`
          JOIN ${fkTable} ON ${fkTable}.id = ${parentTable}.${columnName}
        `)
        selects.push(`${parentTable}.${columnName}`)
        processColumns(fkTable, columnName, children)
      } else {
        const alias = secondPart
        if (translatable(parentTable, columnName)) {
          translatedColumns.push({
            tableName: parentTable,
            columnName,
            recordIdColName,
            resultColName: alias ?? columnName
          })
        } else {
          const asAlias = alias ? ` as ${alias}` : ''
          selects.push(`${parentTable}.${columnName}${asAlias}`)
        }
      }
    }
  }

  processColumns(startTable, whereColumn, columns);

  const query = sqlStr`
    SELECT ${selects.join(', ')}
    FROM ${startTable}
    ${joins.join('\n    ')}
    WHERE ${startTable}.${whereColumn} = ANY($1::integer[])
  `;

  const resuls = await sql.unsafe(query, [ids])
  await injectTranslations(null, resuls, null, translatedColumns)
  return resuls
}
