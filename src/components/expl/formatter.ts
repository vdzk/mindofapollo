import { ExplData } from "./types"
import { explDeleteCrossRecord } from "~/api/delete/crossRecord"
import { explJoin } from "~/api/execute/join"
import { explInsertCrossRecord } from "~/api/insert/crossRecord"
import { explInsertExtRecord } from "~/api/insert/extRecord"
import { explAttemptJudgeStatement } from "~/server-only/attemptJudgeStatement"
import { explInsertRecord } from "~/api/insert/record"
import { explUpdateExtRecord } from "~/api/update/extRecord"
import { explUpdateRecord } from "~/api/update/record"
import { explAttemptAggregateArguments } from "~/server-only/attemptAggregateArguments"
import { ExplRecord } from "~/server-only/expl"
import { humanCase } from "~/utils/string"
import { explDeleteById } from "~/api/delete/byId"
import { explDeleteByIds } from "~/api/delete/byIds"

export const formatters: Record<string, (data: any) => ExplData> = {
  explDeleteById,
  explDeleteByIds,
  explDeleteCrossRecord,
  explJoin,
  explInsertCrossRecord,
  explInsertExtRecord,
  explInsertRecord,
  explUpdateExtRecord,
  explUpdateRecord,
  explAttemptAggregateArguments,
  explAttemptJudgeStatement
}

export const fallbackFormatter = (explRecord: ExplRecord<any>): ExplData => {
  return {
    actor: explRecord.user_id ? {
      type: 'user',
      user: {
        id: explRecord.user_id,
        name: `user #${explRecord.user_id}`,
        auth_role: 'unknown'
      }
    } : { type: 'system' },
    action: explRecord.action,
    target: {
      tableName: explRecord.table_name ?? 'unknown',
      id: explRecord.record_id ?? 0,
      label: `${humanCase(explRecord.table_name ?? 'unknown')} #${explRecord.record_id}`
    }
  }
}