import { chatFragementHosts } from "~/constant"
import { messages } from "~/dialogue_messages"
import { onError, sql } from "~/server-only/db"
import { injectTranslations } from "~/server-only/injectTranslations"

export type ChatFragmentHost = (typeof chatFragementHosts)[number]

export const getOneDialoguePage = async () => {
  "use server"
  const records: Record<ChatFragmentHost, {id: number}[]> = {argument: [], statement: []}
  for (const message of messages) {
    for (const fragment of message.fragments) {
      records[fragment.table_name as ChatFragmentHost]
        .push({id: fragment.record_id as number})
    } 
  }
  for (const host of chatFragementHosts) {
    await injectTranslations(host, records[host], ['chat_text'])
  }

  // Get satement confidences
  const statementIds = records.statement.map(r => r.id)
  const statementConfidences = await sql`
    SELECT id, confidence
    FROM statement
    WHERE id IN ${sql(statementIds)}
  `.catch(onError)

  // Get argument confidences
  const argumentIds = records.argument.map(r => r.id)
  const argumentConfidences = await sql`
    SELECT aj.id, aj.isolated_confidence, ac.conditional_confidence
    FROM argument_judgement aj
    LEFT JOIN argument_conditional ac ON aj.id = ac.id
    WHERE aj.id IN ${sql(argumentIds)}
  `.catch(onError)

  return {
    records: records as Record<
      ChatFragmentHost,
      {id: number, chat_text: string}[]
    >,
    statementConfidences,
    argumentConfidences,
  }
  
}