import { TableSchema } from "~/schema/type";
import { genCode, getUrl } from "~/util";

export const invite: TableSchema = {
  plural: 'invites',
  personal: true,
  columns: {
    code: {
      type: 'varchar'
    },
    link: {
      type: 'virtual',
      getLocal: record => getUrl(`/join?code=${record.code}`)
    },
    person_id: {
      type: 'fk',
      fk: {
        table: 'person',
        labelColumn: 'name',
        optional: true
      }
    }
  },
  createRecord: () => ({ code: genCode(8)})
}