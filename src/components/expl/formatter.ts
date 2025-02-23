import { explAskToJudgeAdditiveStatement } from "~/api/askToJudge/additiveStatement";
import { ExplData } from "./types";
import { explAskToJudgeArgument } from "~/api/askToJudge/argument";
import { explAskToJudgeEvidentialStatement } from "~/api/askToJudge/evidentialStatement";
import { explDeleteById } from "~/api/delete/byId";
import { explDeleteCrossRecord } from "~/api/delete/crossRecord";
import { explDeleteExtById } from "~/api/delete/extById";
import { explJoin } from "~/api/execute/join";
import { explInsertCrossRecord } from "~/api/insert/crossRecord";

export const formatters: Record<string, (data: any) => ExplData> = {
  explAskToJudgeAdditiveStatement,
  explAskToJudgeArgument,
  explAskToJudgeEvidentialStatement,
  explDeleteById,
  explDeleteCrossRecord,
  explDeleteExtById,
  explJoin,
  explInsertCrossRecord
}