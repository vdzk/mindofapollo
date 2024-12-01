import { IconTypes } from "solid-icons"

type CustomDataType = 'proportion' | 'link_url' | 'link_title' 
export type DataLiteral = string | number | boolean | null
export type DataOp = 'INSERT' | 'UPDATE' | 'DELETE'

export interface DataRecord {[column: string]: DataLiteral }
export type DataRecordWithId = DataRecord & {id: number}
export type HistoryRecord = DataRecord & {
  data_op: DataOp
  op_user_id: number
  op_timestamp: Date
}

interface SharedColumnProps {
  label?: string
  preview?: boolean //Use this column to represent the whole record
  getVisibility?: (record: DataRecord) => boolean // determine if the field should be visible
  readOnly?: boolean
  defaultValue?: boolean
}

export interface SimpleColumn extends SharedColumnProps {
  type: 'integer' | 'varchar' | CustomDataType
}

export interface BooleanColumn extends SharedColumnProps {
  type: 'boolean'
  optionLabels?: [string, string]
}

export interface TextColumn extends SharedColumnProps {
  type: 'text'
  lines?: number
}

export interface ForeignKey {
  type: 'fk'
  label?: string
  preview?: boolean //Use this column to represent the whole record
  fk: {
    table: string 
    labelColumn: string
    extensionTables?: boolean // Choose extension table by appending labelColumn value to the table name
    getLabel?: (record: DataRecord) => string // Generate label from the foreign record
  }
  getVisibility?: (record: DataRecord) => boolean
}

export type ColumnSchema = SimpleColumn | BooleanColumn | TextColumn | ForeignKey

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
  plural?: string,
  icon?: IconTypes,
  extendsTable?: string, // This table extends another table with its columns
  deny?: DataOp[], // Prevent all users from performing these operations
  columns: Record<string, ColumnSchema>
  aggregates?: Record<string, AggregateSchema>
}

export interface AppDataSchema {
  tables: Record<string, TableSchema>
}
