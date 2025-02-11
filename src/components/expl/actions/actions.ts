import { ExplComponent } from "../types"
import { JudgeStatement } from "./JudgeStatement"
import { JudgeArgument } from "./JudgeArgument"
import { ReqArgJudge } from "./ReqArgJudge"
import { ReqStatementJudge } from "./ReqStatementJudge"
import { ReqAdditiveJudge } from "./ReqAdditiveJudge"

export const actions: Record<string, ExplComponent<any>> = {
  JudgeStatement,
  JudgeArgument,
  ReqArgJudge,
  ReqStatementJudge,
  ReqAdditiveJudge
}