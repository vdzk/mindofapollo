import { explAskToJudgeAdditiveStatement } from "~/api/askToJudge/additiveStatement"
import { ExplData } from "./types"
import { explAskToJudgeEvidentialStatement } from "~/api/askToJudge/evidentialStatement"
import { explDeleteById } from "~/api/delete/byId"
import { explDeleteCrossRecord } from "~/api/delete/crossRecord"
import { explDeleteExtById } from "~/api/delete/extById"
import { explJoin } from "~/api/execute/join"
import { explInsertCrossRecord } from "~/api/insert/crossRecord"
import { explInsertExtRecord } from "~/api/insert/extRecord"
import { explExecuteProposalChange, explSubmitTaskVoteChangeProposal } from "~/api/submitTask/voteChangeProposal"
import { explAttemptJudgeStatement } from "~/server-only/attemptJudgeStatement"
import { explInsertRecord } from "~/api/insert/record"
import { explSubmitChangeProposal } from "~/api/submit/changeProposal"
import { explSubmitTaskConfirmOrChallenge } from "~/api/submitTask/confirmOrChallenge"
import { explSubmitTaskJudgeCorrelations } from "~/api/submitTask/judgeCorrelations"
import { explAttemptAggregateArguments, explSubmitTaskWeighArgument } from "~/api/submitTask/weighArgument"
import { explUpdateExtRecord } from "~/api/update/extRecord"
import { explUpdateRecord } from "~/api/update/record"

export const formatters: Record<string, (data: any) => ExplData> = {
  explAskToJudgeAdditiveStatement,
  explAskToJudgeEvidentialStatement,
  explDeleteById,
  explDeleteCrossRecord,
  explDeleteExtById,
  explJoin,
  explInsertCrossRecord,
  explInsertExtRecord,
  explInsertRecord,
  explSubmitChangeProposal,
  explSubmitTaskConfirmOrChallenge,
  explSubmitTaskJudgeCorrelations,
  explSubmitTaskVoteChangeProposal,
  explExecuteProposalChange,
  explSubmitTaskWeighArgument,
  explUpdateExtRecord,
  explUpdateRecord,
  explAttemptAggregateArguments,
  explAttemptJudgeStatement
}