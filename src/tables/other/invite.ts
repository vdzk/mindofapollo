import { TableSchema } from "~/schema/type";
import { genCode, getUrl } from "~/utils/string";

export const invite: TableSchema = {
  plural: 'invites',
  private: true,
  columns: {
    code: {
      type: 'varchar',
      readOnly: true
    },
    link: {
      type: 'virtual',
      getLocal: record => getUrl(`/join?code=${record.code}`)
    },
    owner_id: {
      type: 'fk',
      label: 'inviter',
      fk: {
        table: 'person',
        labelColumn: 'name'
      }
    },
    person_id: {
      type: 'fk',
      label: 'invitee',
      readOnly: true,
      fk: {
        table: 'person',
        labelColumn: 'name',
        optional: true
      }
    }
  },
  createRecord: () => ({ code: genCode(8)})
}