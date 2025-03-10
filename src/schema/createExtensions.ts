import { sqlStr } from "~/util-no-circle"

export const createExtensions = () => [
  sqlStr`CREATE EXTENSION IF NOT EXISTS pgroonga`
]
