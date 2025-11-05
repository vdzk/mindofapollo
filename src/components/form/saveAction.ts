import { action, json, redirect } from "@solidjs/router"
import { DataRecord, DataRecordWithId } from "~/schema/type"
import { updateExtRecord } from "~/api/update/extRecord"
import { updateRecord } from "~/api/update/record"
import { insertExtRecord } from "~/api/insert/extRecord"
import { insertRecord } from "~/api/insert/record"
import { listRecordsCache, getOneExtRecordByIdCache } from "~/client-only/query"
import { LinkData } from "~/types"
import { FormExitHandler } from "~/components/form/Form"
import { SessionContextType } from "~/SessionContext"
import { isEmpty } from "~/utils/shape"
import { updateUserSession } from "~/api/update/userSession"
import { buildUrl } from "~/utils/schema"

type ExitSettings = { getLinkData: (savedId?: number) => LinkData } | { onExit: FormExitHandler }

const hasExitHandler = (exit: ExitSettings): exit is { onExit: FormExitHandler } => {
  return 'onExit' in exit
}

const getExitUrl = (exitSettings: ExitSettings, savedId?: number) => {
  if (hasExitHandler(exitSettings)) {
    return ''
  }
  const linkData = exitSettings.getLinkData(savedId)
  return buildUrl(linkData)
}

export const getErrorResponse = (error: unknown) => {
  if (error instanceof Error) {
    return json({ error: error.message }, { revalidate: 'nothing' })
  } else {
    return json({ error: 'Unknown error: ' + String(error) })
  }
}

export const saveAction = action(async (
  tableName: string,
  id: number | undefined,
  record: DataRecord,
  extTableName: string | undefined,
  extRecord: DataRecord,
  linkedCrossRefs: Record<string, number[]>,
  userExpl: string,
  exitSettings: ExitSettings,
  session: SessionContextType
) => {
  const extension = extTableName && !isEmpty(extRecord) ? {
    tableName: extTableName,
    record: extRecord
  } : undefined
  const isSelf = () => tableName === 'person' && id === session.userSession()!.userId

  if (id) {
    try {
      if (extension) {
        await updateExtRecord(
          tableName, id, record,
          extension.tableName, extension.record, userExpl
        )
      } else {
        await updateRecord(tableName, id, record, userExpl)
      }
    } catch (error) {
      return getErrorResponse(error)
    }

    if (isSelf()) {
      const userSession = await updateUserSession()
      if (userSession) {
        session.mutate(() => userSession)
      }
    }

    if (hasExitHandler(exitSettings)) {
      exitSettings.onExit(id)
      return json(
        { ok: true },
        {
          revalidate: [
            listRecordsCache.keyFor(tableName),
            'getRecords' + tableName + id,
            getOneExtRecordByIdCache.keyFor(tableName, id)
          ]
        }
      )
    } else {
      throw redirect(
        getExitUrl(exitSettings, id),
        {
          revalidate: [
            listRecordsCache.keyFor(tableName),
            'getRecords' + tableName + id,
            getOneExtRecordByIdCache.keyFor(tableName, id)
          ]
        }
      )
    }
  } else {
    let savedRecord: DataRecordWithId | undefined
    try {
      if (extension) {
        savedRecord = await insertExtRecord(
          tableName, record,
          extension.tableName, extension.record,
          linkedCrossRefs
        )
      } else {
        savedRecord = await insertRecord(tableName, record, linkedCrossRefs)
      }
    } catch (error) {
      return getErrorResponse(error)
    }

    if (hasExitHandler(exitSettings)) {
      exitSettings.onExit(savedRecord?.id)
      return json({ ok: true }, {
        revalidate: [listRecordsCache.keyFor(tableName)]
      })
    } else {
      throw redirect(getExitUrl(exitSettings, savedRecord?.id))
    }
  }
})
