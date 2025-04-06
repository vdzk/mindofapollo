import { DataRecordWithId } from "~/schema/type"
import { onError, sql } from "~/server-only/db"
import { getDirConcsWithValues } from "~/server-only/getDirConcsWithValues"

export const listConsequences = async (
  directiveId: number
) => {
  "use server"

  const recordsIds = await sql<DataRecordWithId[]>`
    SELECT directive_consequence.id
    FROM directive_consequence
    JOIN argument
      ON directive_consequence.argument_id = argument.id
    WHERE argument.statement_id = ${directiveId}
    ORDER BY directive_consequence.id
  `.catch(onError)
  const ids = recordsIds.map(x => x.id)

  const { records, values } = await getDirConcsWithValues(ids)
  return records.map(record => ({...record, value: values[record.id]})) as DataRecordWithId[]
}