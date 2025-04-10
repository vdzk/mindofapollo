import { TableSchema } from "~/schema/type";
import { defaultLanguage, languages } from "~/translation";

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
      },
      readOnly: true
    },
    language: {
      type: 'option',
      options: languages,
      defaultValue: defaultLanguage
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
      table: 'moral_weight_of_person',
      column: 'owner_id'
    }
  },
  sections: {
    details: {
      label: 'Details',
      fields: [
        'name', 'auth_role_id', 'language',
        'person_categories', 'moral_weights'
      ]
    },
    secrets: {
      label: 'Personal',
      private: true,
      component: 'PersonalDetails'
    },
    activity: {
      label: 'Activity',
      component: 'UserActivity'
    }
  }
}
