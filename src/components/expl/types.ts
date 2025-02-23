import { Component, JSXElement } from "solid-js"
import { DataRecord, DataRecordWithId } from "~/schema/type"
import { AuthRole } from "~/types"

export type UserActor = { type: 'user',
  user: {
    id: number,
    name: string,
    auth_role: AuthRole
  }
}

type SystemActor = { type: 'system' }

export interface ExplData {
  actor: UserActor | SystemActor
  action: string
  target: { tableName: string, id: number, label: string }
  checks?: (string | JSXElement)[]
  notes?: (string | JSXElement)[]
  diff?: ExplDiff<DataRecord>
  deletedRecords?: Record<string, DataRecordWithId[]>
  relevantRecords?: Record<string, DataRecord[]>
  insertedCrossRecord?: {
    tableNames: { target: string, cross: string }
    data: DataRecord
  }
  deletedCrossRecord?: {
    tableNames: { target: string, cross: string }
    data: DataRecord
  }
}

export type ExplComponent<T> = Component<{
  user_id: number | null
  action: string
  version: number
  table_name: string | null
  record_id: number | null
  timestamp: Date
} & T>

export type AddExplId<T> = {
  [K in keyof T]: T[K]
} & {
  [K in keyof T as `${K & string}_expl_id`]: number
}

export type ExplDiff<T> = {
  before: AddExplId<T>
  after: T
}
