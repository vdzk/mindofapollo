import { TableSchema } from "~/schema/type";

export const person: TableSchema = {
  plural: 'persons',
  columns: {
    name: {
      type: 'varchar'
    },
    auth_role_id: {
      type: 'fk',
      fk: {
        table: 'auth_role',
        labelColumn: 'name'
      }
    } 
  },
  aggregates: {
    person_categories: {
      type: 'n-n',
      table: 'person_category',
      first: true
    },
    moral_weights: {
      type: '1-n',
      table: 'moral_weight',
      column: 'owner_id'
    },
    person_secrets: {
      type: '1-n',
      table: 'person_secret',
      column: 'id'
    },
  },
  sections: {
    details: {
      label: 'Details',
      fields: [
        'name', 'auth_role_id',
        'person_categories', 'moral_weights'
      ]
    },
    secrets: {
      label: 'Secrets',
      private: true,
      fields: ['person_secrets']
    },
    activity: {
      label: 'Activity',
      component: 'UserActivity'
    }
  }
}
