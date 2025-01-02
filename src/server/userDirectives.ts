"use server"

import { xName } from "./cross.db";
import { sql } from "./db";
import { getDirConcsWithValues } from "./directive";
import { safeWrap } from "./mutate.db";

export const getUserDirectives = safeWrap(async (userId) => {
  const directives = Object.fromEntries((await sql`
    SELECT directive.id, deed.text
    FROM ${sql(xName('person', 'person_category', true))} pxpc
    JOIN directive_scope
      ON directive_scope.person_category_id = pxpc.person_category_id
    JOIN directive
      ON directive.id = directive_scope.directive_id
    JOIN deed
      ON deed.id = directive.deed_id
    WHERE pxpc.person_id = ${userId}
  `).map(record => [record.id, record]))

  const dirConcs = await sql`
    SELECT dc.directive_id, dc.id, dc.moral_good_id, dc.value_id
    FROM directive_consequence dc
    WHERE dc.directive_id IN ${sql(Object.keys(directives))}
  `
  const dirConcsWithValues = getDirConcsWithValues(dirConcs.map(x => x.id))
  const moralGoods = await sql`
    SELECT moral_good.id, moral_good.name, moral_good.unit_id
    FROM moral_good
    WHERE moral_good.id IN ${sql(dirConcs.map(x => x.moral_good_id))}
  `
  const units = await sql`
    SELECT 
    FROM unit
    WHERE unit.id IN ${sql(moralGoods.map(x => x.unit_id))}
  `
  const moralWeights = await sql`
    SELECT moral_weight.id, moral_weight.weight
    FROM moral_weight
    WHERE moral_weight.person_id = ${userId}
  `

  return {directives, dirConcs, dirConcsWithValues, moralGoods, units, moralWeights}
})