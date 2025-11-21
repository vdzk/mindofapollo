import { sql } from "~/server-only/db"
import { injectTranslations } from "~/server-only/injectTranslations"

export const listLeaderboardItems = async () => {
  "use server"
  const results = await sql`
    SELECT DISTINCT
      p.id,
      p.competition_credits
    FROM person p
    WHERE p.id IN (
      SELECT creator_id FROM bet
      UNION
      SELECT taker_id FROM bet
    )
    ORDER BY p.competition_credits DESC
  `
  await injectTranslations('person', results, ['name'])
  return results
}