import { IconTypes } from "solid-icons"

type PgDataType = 'integer' | 'varchar' | 'text'
type CustomDataType = 'proportion' | 'link_url' | 'link_title' 
export type DataLiteral = string | number | boolean
type DbOperation = 'insert' | 'delete' | 'update'

export interface SimpleColumn {
  type: PgDataType | CustomDataType
  label?: string
  preview?: boolean //Use this column to represent the whole record
}

export interface BooleanColumn {
  type: 'boolean'
  label?: string
  optionLabels?: [string, string]
}

export interface ForeignKey {
  name?: string // The real name of the column in DB. Useful for displaying multiple fields of the same foreign record.
  type: 'fk'
  label?: string
  preview?: boolean //Use this column to represent the whole record
  fk: {
    table: string 
    labelColumn: string
    extensionTables?: boolean // Choose extension table by appending labelColumn value to the table name
  }
}

export type ColumnSchema = SimpleColumn | BooleanColumn | ForeignKey

export interface OneToNSchema {
  type: '1-n'
  table: string
  column: string
  splitByColumn?: string
  filterSplitBy?: string // both parent and split tables should have this column and only overlapping entries will be shown
}

export interface NToNSchema {
  type: 'n-n'
  table: string
  first?: boolean // should the parent table appear first in the name of the cross table. Exactly one of the table pair should have this param set to true!
  initialData?: [number, number][]  // initialise the cross reference table with these values
}

export type AggregateSchema = OneToNSchema | NToNSchema

export interface TableSchema {
  plural?: string,
  icon?: IconTypes,
  extendsTable?: string, // This table extends another table with its columns
  deny?: DbOperation[], // Prevent all users from performing these operations
  columns: Record<string, ColumnSchema>
  aggregates?: Record<string, AggregateSchema>,
  initialData?: DataLiteral[][] // The DB table will be initialised with this. Must contain ids.
}

export interface AppDataSchema {
  tables: Record<string, TableSchema>
}
