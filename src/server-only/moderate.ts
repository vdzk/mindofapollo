import { DataRecord } from "~/schema/type"
import { splitTranslatable } from "~/utils/schema"
import OpenAI from "openai"
import { getSession } from "./session"

const llmMock = { responses: { create: () => ({ output_text: 'No'})} }
// TODO: warn if OPENAI_API_KEY is not set
const llm = process.env.OPENAI_API_KEY ? new OpenAI() : llmMock

export const allowedTextContent = async (text: string) => {
  const session = await getSession()
  const { authRole, permissionLevel } = session.data
  if (authRole === 'admin' || permissionLevel >= 1000) {
    return true
  }
  const response = await llm.responses.create({
    model: "gpt-4o-mini",
    input: "You are a content moderator. Is the following content illicit, offensive, vulgar or spam. Please answer with one word: \"Yes\" or \"No\"; Content: " + text
  })
  return response.output_text === 'No'
}

export const allowedTableContent = async (
  tableName: string,
  record: DataRecord
) => {
  const { translationRequired, originalText } = splitTranslatable(tableName, record)
  if (!translationRequired) return true
  return allowedTextContent(JSON.stringify(originalText))
}