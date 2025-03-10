import { sqlStr } from "~/util-no-circle";

export const createExplTable = () => [
  sqlStr`CREATE TABLE expl (
    id serial PRIMARY KEY,
    user_id integer,
    action text NOT NULL,
    version integer NOT NULL,
    table_name text,
    record_id integer,
    data jsonb,
    timestamp timestamptz NOT NULL
  )`,
  sqlStr`CREATE INDEX expl_timestamp_idx ON expl (timestamp)`,
  sqlStr`CREATE INDEX expl_id_idx ON expl (id)`
]
