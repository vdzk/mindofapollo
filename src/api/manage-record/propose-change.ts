"use server"

import {insertRecord, insertValueType, safeWrap} from "~/api/shared/mutate";
import {DataLiteral} from "~/schema/type";
import {getValueTypeTableName} from "~/schema/dataTypes";

export const saveChangeProposal = safeWrap(async (
    userId,
    tableName: string,
    id: number,
    colName: string,
    oldValue: DataLiteral,
    newValue: DataLiteral,
    explanation: string
) => {
    const vttn = getValueTypeTableName(tableName, colName)
    const [{id: old_value_id}] = await insertValueType(userId, vttn, oldValue)
    const [{id: new_value_id}] = await insertValueType(userId, vttn, newValue)

    await insertRecord('change_proposal', {
        table_name: tableName,
        target_id: id,
        column_name: colName,
        old_value_id,
        new_value_id,
        change_explanation: explanation
    })
})
