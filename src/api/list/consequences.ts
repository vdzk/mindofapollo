import { DataRecordWithId } from "~/schema/type"
import { onError, sql } from "~/server-only/db"
import { getDirConcsWithValues } from "~/server-only/getDirConcsWithValues"
import { indexBy } from "~/utils/shape"

export const listConsequences = async (
  directiveId: number
) => {
  "use server"

  const dirConcs = await sql<DataRecordWithId[]>`
    SELECT dc.id, dc.argument_id, argument.pro
    FROM directive_consequence as dc
    JOIN argument
      ON dc.argument_id = argument.id
    WHERE argument.statement_id = ${directiveId}
    ORDER BY dc.id
  `.catch(onError)
  const dirConcsById = indexBy(dirConcs, 'id')
  const ids = dirConcs.map(x => x.id)

  const { records, values } = await getDirConcsWithValues(ids)
  return records.map(record => ({
    ...record,
    value: values[record.id],
    ...dirConcsById[record.id],
  })) as DataRecordWithId[]
}