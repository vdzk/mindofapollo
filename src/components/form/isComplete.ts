import { schema } from "~/schema/schema";
import { DataRecord } from "~/schema/type";

export const isComplete = (
  tableName: string,
  diff: DataRecord,
  diffExt: DataRecord,
  colNames: string[],
  extTableName: string | undefined,
  extColNames: string[],
  record?: DataRecord
): boolean => {
  // Create an array of checks to perform
  const checks = [
    { table: tableName, columns: colNames, diffRecord: diff }
  ];
  
  // Add extension table check if it exists
  if (extTableName) {
    checks.push({ 
      table: extTableName, 
      columns: extColNames, 
      diffRecord: diffExt 
    });
  }
  
  // Check all tables and columns
  for (const check of checks) {
    for (const colName of check.columns) {
      const columnDef = schema.tables[check.table].columns[colName];
      const diffValue = check.diffRecord[colName];
      
      // Skip this column if any of these conditions are true (column is complete):
      // 1. Column has defaultValue
      if ('defaultValue' in columnDef) continue
      
      // 2. Column is an optional foreign key
      if (columnDef.type === 'fk' && columnDef.fk.optional) continue
      
      // 3. Diff has a non-null, non-undefined value
      if (diffValue !== undefined && diffValue !== null) continue
      
      // 4. No diff but record has a value
      if (diffValue === undefined && record && 
          record[colName] !== null && record[colName] !== undefined) continue
      
      // If we get here, the column is incomplete
      return false
    }
  }
  
  // All checks passed, the form is complete
  return true
};