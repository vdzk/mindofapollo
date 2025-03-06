import { onError, sql } from "./db";
import { ExplRecord } from "./expl";
import { hierarchyTableNames, getRootStatements } from "./getRootStatements"

export const updateNotifications = async (explRecord: ExplRecord<any>) => {
  const { user_id, table_name, record_id } = explRecord
  if (record_id && hierarchyTableNames.includes(table_name as any)) {
    const rootStatements = await getRootStatements(table_name as any, record_id)
    const statementIds = rootStatements.map(rs => rs.id)
    if (user_id) {
      _setSubscription(user_id, statementIds, true, false)
    }
    
    // Insert updates for all affected root statements
    if (statementIds.length > 0) {
      const updates = statementIds.map(statement_id => ({
        statement_id,
        expl_id: explRecord.id
      }))
      
      await sql`
        INSERT INTO root_statement_update ${sql(updates)}
      `.catch(onError)
    }
  }
}

export const _setSubscription = async (
  userId: number,
  statementIds: number[],
  subscribe: boolean,
  override: boolean
) => {
  if (statementIds.length === 0) return
  
  const subscriptions = statementIds.map(statementId => ({
    person_id: userId,
    statement_id: statementId,
    subscribed: subscribe
  }))

  const conflictAction = override 
    ? sql`DO UPDATE SET subscribed = ${subscribe}` 
    : sql`DO NOTHING`
  
  await sql`
    INSERT INTO subscription ${sql(subscriptions)}
    ON CONFLICT (person_id, statement_id)
    ${conflictAction}
  `.catch(onError)
}