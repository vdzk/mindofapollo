import { TableSchema } from "~/schema/type";
import { genCode, getUrl } from "~/util";

export const invite: TableSchema = {
  plural: 'invites',
  columns: {
    code: {
      type: 'varchar',
      private: true
    },
    link: {
      type: 'virtual',
      getLocal: record => getUrl(`/join?code=${record.code}`),
      private: true
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