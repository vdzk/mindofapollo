import { sqlStr } from "~/util-no-circle";

export const createPersonalDetails = () => [
  sqlStr`CREATE TABLE personal_details (
    user_id integer PRIMARY KEY REFERENCES person (id),
    email text NOT NULL,
    password_hash text NOT NULL
  )`,
  sqlStr`CREATE UNIQUE INDEX personal_details_email_idx ON personal_details (email)`
]