import { AppDataSchema } from "./type"
import { person } from "~/tables/other/person"
import { tag } from "~/tables/other/tag"
import { statement } from "~/tables/statement"
import { argument_type } from "~/tables/argument/type"
import { critical_question } from "~/tables/other/critical_question"
import { argument } from "~/tables/argument/argument"
import { critical_statement } from "~/tables/other/critical_statement"
import { research_note } from "~/tables/other/research_note"
import { argument_analogy } from "~/tables/argument/analogy"
import { argument_authority } from "~/tables/argument/authority"
import { argument_other } from "~/tables/argument/other"
import { role } from "~/tables/other/role"
import { rule } from "~/tables/other/rule"
import { argument_judgement } from "~/tables/argument/judgement"
import { rule_change_request } from "~/tables/other/rule_change_request"
import { argument_conditional } from "~/tables/argument/conditional"
import { statement_type } from "~/tables/other/statement_type"
import { argument_weight } from "~/tables/argument/weight"
import { deed } from "~/tables/morality/deed"
import { directive_consequence } from "~/tables/morality/directive_consequence"
import { directive } from "~/tables/morality/directive"
import { directive_scope } from "~/tables/morality/directive_scope"
import { moral_good } from "~/tables/morality/moral_good"
import { moral_persuasion } from "~/tables/morality/moral_persuasion"
import { person_category } from "~/tables/morality/person_category"
import { presuasion_critique } from "~/tables/morality/persuasion_critique"
import { unit } from "~/tables/morality/unit"
import { invite } from "~/tables/other/invite"
import { auth_role } from "~/tables/other/auth_role"
import { argument_explanation } from "~/tables/argument/explanation"
import { chat_message } from "~/tables/other/chat_message"
import { argument_epistemic } from "~/tables/argument/epistemic"
import { argument_comparison } from "~/tables/argument/comparison"
import { argument_deduction } from "~/tables/argument/deduction";
import { argument_example } from "~/tables/argument/example";
import { statement_discussion_message } from "~/tables/other/statement_discussion_message"
import { argument_obvious } from "~/tables/argument/obvious"
import { argument_normative } from "~/tables/argument/normative"
import { moral_weight_profile } from "~/tables/morality/moral_weight_profile"
import { moral_weight_of_person, moral_weight_of_profile } from "~/tables/morality/moral_weight"

// NOTE: table name 'person' and column names 'id', 'name', 'owner_id' have special meanings

export const schema: AppDataSchema = {
  tables: {
    auth_role,
    person,
    tag,
    statement_type,
    statement,
    argument_type,
    critical_question,
    argument,
    argument_analogy,
    argument_authority,
    argument_explanation,
    argument_epistemic,
    argument_comparison,
    argument_other,
    argument_obvious,
    critical_statement,
    research_note,
    role,
    rule,
    argument_judgement,
    rule_change_request,
    argument_conditional,
    argument_weight,
    deed,
    directive,
    unit,
    moral_good,
    person_category,
    directive_consequence,
    directive_scope,
    moral_persuasion,
    presuasion_critique,
    invite,
    chat_message,
    argument_deduction,
    argument_example,
    statement_discussion_message,
    argument_normative,
    moral_weight_profile,
    moral_weight_of_profile,
    moral_weight_of_person
  }
}
