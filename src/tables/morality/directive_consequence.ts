import { TableSchema } from "~/schema/type";
import { sqlStr } from "~/util-no-circle";

export const directive_consequence: TableSchema = {
  plural: 'directive consequences',
  columns: {
    label: {
      type: 'virtual',
      serverFn: true
    },
    argument_id: {
      type: 'fk',
      fk: {
        table: 'argument',
        labelColumn: 'title'
      }
    },
    moral_good_id: {
      type: 'fk',
      fk: {
        table: 'moral_good',
        labelColumn: 'label'
      }
    },
    value_id: {
      label: 'value',
      type: 'value_type_id',
      typeOriginColumn: 'moral_good_id',
      getOriginTypesQuery: sqlStr`
        SELECT moral_good.id, unit.column_type as value_type
        FROM moral_good
        JOIN unit
          ON unit.id = moral_good.unit_id
      `,
      getTypeByOriginIdQuery: sqlStr`
        SELECT unit.column_type as value_type
        FROM moral_good
        JOIN unit
          ON unit.id = moral_good.unit_id
        WHERE moral_good.id = $1::integer
      `,
      getTypeByRecordIdQuery: sqlStr`
        SELECT unit.column_type as value_type
        FROM directive_consequence
        JOIN moral_good
          ON moral_good.id = directive_consequence.moral_good_id
        JOIN unit
          ON unit.id = moral_good.unit_id
        WHERE directive_consequence.id = $1::integer
      `
    }
  }
}
