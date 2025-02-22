import { TableSchema } from "~/schema/type";

export const person: TableSchema = {
  plural: 'persons',
  columns: {
    name: {
      type: 'varchar'
    },
    email: {
      type: 'varchar'
    },
    password: {
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
    }
  },
  sections: {
    details: {
      label: 'Details',
      fields: [
        'name', 'email', 'password', 'auth_role_id',
        'person_categories', 'moral_weights'
      ]
    },
    activity: {
      label: 'Activity',
      component: 'UserActivity'
    }
  }
}
