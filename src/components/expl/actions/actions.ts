import { ExplComponent } from "../types"
import { JudgeStatement } from "./JudgeStatement"
import { ReqArgJudge } from "./ReqArgJudge"

export const actions: Record<string, ExplComponent<any>> = {
  JudgeStatement,
  ReqArgJudge
}