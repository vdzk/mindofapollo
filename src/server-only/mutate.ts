import { onError, sql } from "./db"
import { DataLiteral, DataRecord, DataRecordWithId } from "~/schema/type"
import { schema } from "~/schema/schema"
import { getValueTypeTableNameByColType } from "~/schema/dataTypes"
import { getTypeByOriginId, getTypeByRecordId } from "./valueType"
import { AddExplId } from "~/components/expl/types"
import { getChildFkRelations, splitTranslatable } from "~/utils/schema"
import { createTranslations } from "./createTranslations"
import { _getRecordById, _getRecordsByIds } from "./select"
import { attemptJudgeStatement } from "./attemptJudgeStatement"
import { humanCase } from "~/utils/string"
import { attemptAggregateArguments } from "./attemptAggregateArguments"

// TODO: implement efficient bulk version
export const insertValueType = async (
  tableName: string,
  value: DataLiteral,
) => {
  const result = await sql`
    INSERT INTO ${sql(tableName)} (value)
    VALUES (${value})
    RETURNING *
  `.catch(onError)
  return result
}

export const injectValueTypes = async (
  tableName: string,
  record: DataRecord,
  recordId?: number
) => {
  const { columns } = schema.tables[tableName]
  for (const colName in columns) {
    const column = columns[colName]
    if (column.type === 'value_type_id') {
      const value = record[colName]
      if (value !== undefined) {
        const originId = record[column.typeOriginColumn] as number | undefined
        const colType = recordId && !originId
          ? await getTypeByRecordId(tableName, colName, recordId)
          : await getTypeByOriginId(tableName, colName, originId as number)
        const vttn = getValueTypeTableNameByColType(colType)
        const [{ id }] = await insertValueType(vttn, value)
        record[colName] = id
      }
    }
  }
}

export const _insertRecord = async (
  tableName: string,
  record: DataRecord,
  explId: number | null
) => {
  await injectValueTypes(tableName, record)
  const allColNames = ['id', ...Object.entries(schema.tables[tableName].columns)
    .filter(([colName, column]) =>
      colName !== 'id' && column.type !== 'virtual')
    .map(([colName]) => colName)
  ]
  const explIds = explId ? Object.fromEntries(
    allColNames.map(colName => [`${colName}_expl_id`, explId])
  ) : {}

  const { translationRequired, originalText, nonTranslatable } = splitTranslatable(tableName, record)

  const results = await sql`
    INSERT INTO ${sql(tableName)} ${sql({ ...nonTranslatable, ...explIds })}
    RETURNING *
  `.catch(onError)
  const result = { ...record, ...explIds, id: results[0].id } as DataRecordWithId

  if (translationRequired) {
    await createTranslations(tableName, originalText, result.id)
  }
  await trigger('insert', tableName, result.id, explId)
  return result
};

// TODO: implement efficient bulk version
export const _insertRecordsOneByOne = async (tableName: string, records: DataRecord[], explId: number) => {
  const inserted = await Promise.all(records.map(record => _insertRecord(tableName, record, explId)))
  return inserted
}

export const _updateRecord = async <T extends DataRecord>(
  tableName: string,
  id: number,
  explId: number,
  newFragment: T
) => {
  await injectValueTypes(tableName, newFragment, id)
  const colNames = Object.keys(newFragment)
  if (colNames.length === 0) return {
    before: {} as AddExplId<T>,
    after: {} as T
  }

  const explIds = Object.fromEntries(
    colNames.map(colName => [`${colName}_expl_id`, explId])
  )

  const oldFragments = (await _getRecordById(tableName, id, colNames))!

  const { translationRequired, originalText, nonTranslatable } = splitTranslatable(tableName, newFragment)

  await sql`
    UPDATE ${sql(tableName)}
    SET ${sql({ ...nonTranslatable, ...explIds })}
    WHERE id = ${id}
  `.catch(onError)
  const diff = {
    before: oldFragments as unknown as AddExplId<T>,
    after: newFragment
  }

  if (translationRequired) {
    await createTranslations(tableName, originalText, id, true)
  }
  await trigger('update', tableName, id, explId)
  return diff
}

export const deleteByIdsCascade = async (
  tableName: string,
  idColName: string,
  ids: number[],
  explId: number
): Promise<Record<string, DataRecordWithId[]>> => {
  if (ids.length === 0) return {}

  const records = await _getRecordsByIds(tableName, idColName, ids)
  if (!records.length) return {}

  const recordIds = records.map(r => r.id)
  const result: Record<string, DataRecordWithId[]> = { [tableName]: records }

  const childRelations = getChildFkRelations()[tableName]
  console.log('childRelations', childRelations)
  for (const [childTable, colName] of childRelations) {
    const childResults = await deleteByIdsCascade(
      childTable, colName, recordIds, explId
    )
    
    // Merge results, concatenating arrays if table already exists
    for (const [table, deletedRecords] of Object.entries(childResults)) {
      result[table] = result[table] 
        ? [...result[table], ...deletedRecords]
        : deletedRecords
    }
  }

  await _deleteByIds(tableName, recordIds, explId)
  
  return result
}

export const _deleteByIds = async (
  tableName: string,
  ids: number[],
  explId: number
) => {
  console.log('Deleting', tableName, ids)
  if (ids.length === 0) return
  await sql`
    DELETE FROM ${sql(tableName)}
    WHERE id IN ${sql(ids)}
  `.catch(onError)
  await sql`
    DELETE FROM translation
    WHERE table_name = ${tableName}
      AND record_id IN ${sql(ids)}
  `.catch(onError)
  await Promise.all(ids.map(id => trigger('delete', tableName, id, explId)))
}

const trigger = async (
  op: 'insert' | 'update' | 'delete',
  tableName: string,
  id: number,
  explId: number | null
) => {
  if (['argument_judgement', 'argument_conditional', 'argument_weight'].includes(tableName)) {
    const argument = await _getRecordById('argument', id, ['statement_id'])
    if (argument && explId) {
      const attemptJudge = tableName === 'argument_weight'
        ? attemptAggregateArguments
        : attemptJudgeStatement
      await attemptJudge(
        argument.statement_id as number,
        explId,
        `${op} of ${humanCase(tableName)}`
      )
    }
  }
}