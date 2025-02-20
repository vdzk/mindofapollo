import {DataRecord} from "~/schema/type"
import { _insertRecordsOneByOne } from "~/server-only/mutate"
import { attemptJudgeStatement } from "~/server-only/attemptJudgeStatement"
import { startExpl } from "~/server-only/expl"

export const submitTaskJudgeCorrelations = async (statementId: number, records: DataRecord[]) => {
    "use server"
    const explId = await startExpl(null, 'JudgeCorrelations', 1, 'statement', statementId)
    await _insertRecordsOneByOne('argument_conditional', records, explId)
    await attemptJudgeStatement(statementId, explId, 'user submitted correlations')
}