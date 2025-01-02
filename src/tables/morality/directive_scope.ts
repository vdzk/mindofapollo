import { TableSchema } from "~/schema/type";
import { sqlStr } from "~/util";

export const directive_scope: TableSchema = {
  plural: 'directive scopes',
  columns: {
    label: {
      type: 'virtual',
      queries: {
        person_category: sqlStr`
          SELECT ds.id, ds.include, pc.name
          FROM directive_scope ds
          JOIN person_category pc
            ON pc.id = ds.person_category_id
          WHERE ds.id = ANY($1::integer[])
        `
      },
      get: (ids, results) => Object.fromEntries(results.person_category.map(
        result => [result.id, `(${result.include ? '+' : '−'}) ${result.name}`]
      ))
    },
    directive_id: {
      type: 'fk',
      fk: {
        table: 'directive',
        labelColumn: 'label'
      }
    },
    person_category_id: {
      type: 'fk',
      fk: {
        table: 'person_category',
        labelColumn: 'name'
      }
    },
    include: {
      type: 'boolean'
    }
  }
}