export interface SimpleColumn {
  type: 'integer' | 'varchar' | 'text' //subset of pg data types
  label?: string
  preview?: boolean //Use this column to represent the whole record
}

export interface BooleanColumn {
  type: 'boolean'
  label?: string
  optionLabels?: [string, string]
}

export interface ForeignKey {
  type: 'fk'
  label?: string
  fk: {
    table: string
    labelColumn: string
    parent?: boolean
  }
}

export type ColumnSchema = SimpleColumn | BooleanColumn | ForeignKey

export interface OneToNSchema {
  type: '1-n'
  table: string
  column: string
}

export interface NToNSchema {
  type: 'n-n'
  table: string
  first?: boolean // should the parent table appear first in the name of the cross table. Exactly one of the table pair should have this param set to true!
}

export type AggregateSchema = OneToNSchema | NToNSchema

export interface TableSchema {
  plural: string
  defaultView?: 'list'
  columns: Record<string, ColumnSchema>
  aggregates?: Record<string, AggregateSchema>
}
export interface AppDataSchema {
  tables: Record<string, TableSchema>
}
