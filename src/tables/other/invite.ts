import { TableSchema } from "~/schema/type";
import { genCode } from "~/utils/string";

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
      sourceColNames: ['code'],
      getLocal: record => `/join?code=${record.code}`,
      isPathLink: true
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