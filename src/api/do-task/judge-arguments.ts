"use server"

import {_updateRecord, insertRecord, safeWrap} from "~/api/shared/mutate";
import {sql} from "~/db";
import { DataRecord } from "~/schema/type";

export const getJudgeArgument = safeWrap(async (userId) => {
    // TODO: postpone new entries for a random priod of time to avoid sniping?
    const result = await sql`
    SELECT argument.id, argument.title
    FROM argument
    WHERE argument.judgement_requested
      AND NOT EXISTS (
        SELECT 1
        FROM argument_judgement
        WHERE argument_judgement.id = argument.id
      )
    ORDER BY random()
    LIMIT 1
  `
    return result[0]
})

export const judgeArgument = safeWrap(async (userId, id: number, record: DataRecord) => {
  // TODO: authorazation
  await insertRecord("argument_judgement", {id, ...record})
  await _updateRecord(userId, "argument", id, {judgement_requested: false})
})
