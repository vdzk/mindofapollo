import { AppDataSchema } from "./type"
import { person } from "./tables/person"
import { tag } from "./tables/tag"
import { question } from "./tables/question"
import { argument_type } from "./tables/argument_type"
import { critical_question } from "./tables/critical_question"
import { argument } from "./tables/argument"
import { critical_statement } from "./tables/critical_statement"

export const schema: AppDataSchema = {
  tables: {
    person,
    tag,
    question,
    argument_type,
    critical_question,
    argument,
    critical_statement
  }
}