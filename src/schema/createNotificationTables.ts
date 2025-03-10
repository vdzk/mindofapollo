import { sqlStr } from "~/util-no-circle"

export const createNotificationTables = () => [
  sqlStr`CREATE TABLE subscription (
    person_id integer NOT NULL,
    statement_id integer NOT NULL,
    subscribed boolean NOT NULL,
    last_opened timestamptz,
    PRIMARY KEY (person_id, statement_id)
  )`,
  sqlStr`CREATE TABLE root_statement_update (
    statement_id integer NOT NULL,
    expl_id integer NOT NULL REFERENCES expl(id)
  )`,
  sqlStr`CREATE INDEX root_statement_update_statement_id_idx ON root_statement_update (statement_id)`
]
