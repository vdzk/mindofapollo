import { AppDataSchema } from "./type"
import { person } from "~/tables/person"
import { tag } from "~/tables/tag"
import { question } from "~/tables/question"
import { argument_type } from "~/tables/argument_type"
import { critical_question } from "~/tables/critical_question"
import { argument } from "~/tables/argument"
import { critical_statement } from "~/tables/critical_statement"
import { research_note } from "~/tables/research_note"
import { argument_analogy } from "~/tables/argument_analogy"
import { argument_authority } from "~/tables/argument_authority"
import { argument_other } from "~/tables/argument_other"
import { confirmation } from "~/tables/confirmation"

export const schema: AppDataSchema = {
  tables: {
    person,
    tag,
    question,
    argument_type,
    critical_question,
    argument,
    argument_analogy,
    argument_authority,
    argument_other,
    critical_statement,
    research_note,
    confirmation
  }
}
