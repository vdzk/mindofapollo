import { AppDataSchema } from "./type"
import { argumentTables } from "~/tables/argument"
import { argumentTypeTables } from "~/tables/argument_type"
import { moralityTables } from "~/tables/morality"
import { otherTables } from "~/tables/other"
import { statementTables } from "~/tables/statement"

// NOTE: table name 'person' and column names 'id', 'name', 'owner_id' have special meanings

export const schema: AppDataSchema = {
  tables: {
    ...statementTables,
    ...argumentTables,
    ...argumentTypeTables,
    ...moralityTables,
    ...otherTables
  }
}
