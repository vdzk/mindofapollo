import { Component } from "solid-js"

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
