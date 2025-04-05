import { onError, sql } from "~/server-only/db"
import { getUserId } from "~/server-only/session"
import { injectTranslations } from "~/server-only/injectTranslations";
import { injectVirtualValues } from "~/server-only/select";

export const listUserSubscriptions = async () =>  {
  'use server'
  const userId = await getUserId();
  if (!userId) return [];

  const subscriptions = await sql<{
    argument_aggregation_type_name: string; id: number; text: string; has_updates: boolean, label: string;
}[]>`
    SELECT 
      statement.id, 
      CASE 
        WHEN sub.last_opened IS NULL THEN true
        ELSE EXISTS (
          SELECT 1 
          FROM root_statement_update rsu
          JOIN expl ON rsu.expl_id = expl.id
          WHERE rsu.statement_id = statement.id
          AND expl.timestamp > sub.last_opened
          AND expl.user_id != ${userId}
        )
      END AS has_updates
    FROM subscription sub
    JOIN statement ON sub.statement_id = statement.id
    WHERE sub.person_id = ${userId}
    AND sub.subscribed = true
    ORDER BY statement.id DESC
  `.catch(onError)

  await injectTranslations('statement', subscriptions, ['text'])
  await injectVirtualValues('statement', subscriptions)
  await injectVirtualValues('directive', subscriptions.filter( statement => 
    statement.argument_aggregation_type_name === 'normative'
  ))
  return subscriptions
}