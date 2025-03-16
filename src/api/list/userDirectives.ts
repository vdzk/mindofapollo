import { onError, sql } from "../../server-only/db"
import { getDirConcsWithValues } from "../../server-only/getDirConcsWithValues"
import { xName } from "~/utils/schema";
import { getUserSession } from "~/server-only/session"
import { DataRecordWithId } from "~/schema/type";
import { injectTranslations } from "~/server-only/injectTranslations";

export const listUserDirectives = async () => {
  "use server"
  const userSession = await getUserSession()
  const directives = await sql<DataRecordWithId[]>`
    SELECT directive.id, directive.deed_id
    FROM ${sql(xName('person', 'person_category', true))} pxpc
    JOIN directive_scope
      ON directive_scope.person_category_id = pxpc.person_category_id
    JOIN directive
      ON directive.id = directive_scope.directive_id
    WHERE pxpc.person_id = ${userSession.userId}
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
    SELECT dc.directive_id, dc.id, dc.moral_good_id, dc.value_id
    FROM directive_consequence dc
    WHERE dc.directive_id IN ${sql(directives.map(x => x.id))}
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
  const moralWeights = await sql<DataRecordWithId[]>`
    SELECT moral_weight.moral_good_id, moral_weight.weight
    FROM moral_weight
    WHERE moral_weight.owner_id = ${userSession.userId}
  `.catch(onError)

  return {directives, dirConcs, dirConcsWithValues, moralGoods, units, moralWeights}
}