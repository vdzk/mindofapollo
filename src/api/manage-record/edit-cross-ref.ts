"use server"

import {action, cache, json} from "@solidjs/router";
import {listCrossRecords} from "~/api/shared/select";
import {safeWrap, writeHistory} from "~/api/shared/mutate";
import {sql} from "~/db";
import {xName} from "~/util";

export const listCrossRecordsCache = cache(listCrossRecords, 'listCrossRecords')

export interface CrossRecordMutateProps {
    a: string;
    b: string;
    first: boolean;
    a_id: number;
    b_id: number;
}

export const deleteCrossRecord = safeWrap(async (
    userId: number,
    params: CrossRecordMutateProps
) => {
    const tableName = xName(params.a, params.b, params.first)
    const result = await sql`
    DELETE FROM ${sql(tableName)}
    WHERE ${sql(params.a + '_id')} = ${params.a_id}
      AND ${sql(params.b + '_id')} = ${params.b_id}
    RETURNING *
  `
    writeHistory(userId, 'DELETE', tableName, result[0])
})
export const deleteCrossRecordAction = action(
    async (props: CrossRecordMutateProps) => {
        await deleteCrossRecord(props)
        return json(
            'ok',
            {
                revalidate: [
                    listCrossRecordsCache.keyFor(
                        props.b, props.a, props.a_id, props.first
                    )
                ]
            }
        )
    }
)
export const insertCrossRecord = safeWrap(async (
    userId: number,
    props: CrossRecordMutateProps
) => {
    const tableName = xName(props.a, props.b, props.first);
    const result = await sql`
    INSERT INTO ${sql(tableName)}
      (${sql(props.a + '_id')}, ${sql(props.b + '_id')})
    VALUES (${props.a_id}, ${props.b_id})
    RETURNING *
  `;
    writeHistory(userId, 'INSERT', tableName, result[0]);
})
export const insertCrossRecordAction = action(
    async (props: CrossRecordMutateProps) => {
        await insertCrossRecord(props)
        return json(
            'ok',
            {
                revalidate: [
                    listCrossRecordsCache.keyFor(
                        props.b, props.a, props.a_id, props.first
                    )
                ]
            }
        )
    }
)
