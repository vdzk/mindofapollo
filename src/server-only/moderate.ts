import { DataRecord } from "~/schema/type"
import { splitTranslatable } from "~/utils/schema"
import OpenAI from "openai"
const llm = new OpenAI()

export const allowedTextContent = async (text: string) => {
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