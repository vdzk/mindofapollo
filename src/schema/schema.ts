import { AppDataSchema } from "./type"
import { person } from "~/tables/other/person"
import { tag } from "~/tables/other/tag"
import { question } from "~/tables/question"
import { argument_type } from "~/tables/argument/type"
import { critical_question } from "~/tables/other/critical_question"
import { argument } from "~/tables/argument/argument"
import { critical_statement } from "~/tables/other/critical_statement"
import { research_note } from "~/tables/other/research_note"
import { argument_analogy } from "~/tables/argument/analogy"
import { argument_authority } from "~/tables/argument/authority"
import { argument_other } from "~/tables/argument/other"
import { confirmation } from "~/tables/other/confirmation"
import { role } from "~/tables/other/role"
import { rule } from "~/tables/other/rule"
import { argument_judgement } from "~/tables/argument/judgement"
import { rule_change_request } from "~/tables/other/rule_change_request"
import { argument_conditional } from "~/tables/argument/conditional"
import { change_proposal } from "~/tables/other/change_proposal"
import { argument_aggregation_type } from "~/tables/argument/aggregation_type"
import { argument_weight } from "~/tables/argument/weight"
import { deed } from "~/tables/morality/deed"
import { directive_consequence } from "~/tables/morality/directive_consequence"
import { directive } from "~/tables/morality/directive"
import { directive_scope } from "~/tables/morality/directive_scope"
import { moral_good } from "~/tables/morality/moral_good"
import { moral_persuasion } from "~/tables/morality/moral_persuasion"
import { moral_weight } from "~/tables/morality/moral_weight"
import { person_category } from "~/tables/morality/person_category"
import { presuasion_critique } from "~/tables/morality/persuasion_critique"
import { unit } from "~/tables/morality/unit"
import { invite } from "~/tables/other/invite"

export const schema: AppDataSchema = {
  tables: {
    person,
    tag,
    argument_aggregation_type,
    question,
    argument_type,
    critical_question,
    argument,
    argument_analogy,
    argument_authority,
    argument_other,
    critical_statement,
    research_note,
    confirmation,
    role,
    rule,
    argument_judgement,
    rule_change_request,
    argument_conditional,
    change_proposal,
    argument_weight,
    deed,
    directive,
    unit,
    moral_good,
    person_category,
    directive_consequence,
    directive_scope,
    moral_persuasion,
    moral_weight,
    presuasion_critique,
    invite
  }
}
