import { onError, sql } from "../../server-only/db"
import { getDirConcsWithValues } from "../../server-only/getDirConcsWithValues"
import { getXTable } from "~/utils/schema";
import { getUserId } from "~/server-only/session"
import { DataRecordWithId } from "~/schema/type";
import { injectTranslations } from "~/server-only/injectTranslations";

export const listUserDirectives = async () => {
  "use server"
  const userId = await getUserId()
  if (!userId) return
  const xTable = getXTable('person', 'person_category', true)
  const directives = await sql<(DataRecordWithId)[]>`
    SELECT directive.id, directive.deed_id
    FROM ${sql(xTable.name)} pxpc
    JOIN directive_scope
      ON directive_scope.person_category_id = pxpc.person_category_id
    JOIN directive
      ON directive.id = directive_scope.directive_id
    WHERE pxpc.person_id = ${userId}
  `.catch(onError)

  await injectTranslations('directive', directives, null, [
    {
      tableName: 'deed',
      recordIdColName: 'deed_id',
      columnName: 'text',
      resultColName: 'text'
    }
  ])

  const dirConcs = await sql<DataRecordWithId[]>`
    SELECT argument.statement_id as directive_id,
      dc.id, dc.moral_good_id, dc.value_id
    FROM directive_consequence dc
    JOIN argument
      ON argument.id = dc.argument_id
    WHERE argument.statement_id IN ${sql(directives.map(x => x.id))}
  `.catch(onError)
  const dirConcsWithValues = await getDirConcsWithValues(dirConcs.map(x => x.id))
  const moralGoods = await sql<DataRecordWithId[]>`
    SELECT moral_good.id, moral_good.unit_id
    FROM moral_good
    WHERE moral_good.id IN ${sql(dirConcs.map(x => x.moral_good_id))}
  `.catch(onError)
  await injectTranslations('moral_good', moralGoods, ['name'])
  const units = await sql<DataRecordWithId[]>`
    SELECT *
    FROM unit
    WHERE unit.id IN ${sql(moralGoods.map(x => x.unit_id))}
  `.catch(onError)
  await injectTranslations('unit', units)

  return {directives, dirConcs, dirConcsWithValues, moralGoods, units}
}