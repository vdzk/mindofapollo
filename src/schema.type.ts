import { IconTypes } from "solid-icons"

type PgDataType = 'integer' | 'varchar' | 'text'
type CustomDataType = 'proportion'

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
  readOnly?: boolean // Do not show this field on edit forms. Another field should cover this foreign key.
  type: 'fk'
  label?: string
  preview?: boolean //Use this column to represent the whole record
  fk: {
    table: string 
    labelColumn: string
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
}

export type AggregateSchema = OneToNSchema | NToNSchema

export interface TableSchema {
  plural: string,
  icon: IconTypes,
  defaultView?: 'list'
  columns: Record<string, ColumnSchema>
  aggregates?: Record<string, AggregateSchema>
}
export interface AppDataSchema {
  tables: Record<string, TableSchema>
}
