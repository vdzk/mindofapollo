import { action, redirect, revalidate } from "@solidjs/router"
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
import { buildUrl } from "~/utils/string"

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

export const saveAction = action(async (
  tableName: string,
  id: number | undefined,
  record: DataRecord,
  extTableName: string | undefined,
  extRecord: DataRecord,
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
    if (extension) {
      await updateExtRecord(
        tableName, id, record,
        extension.tableName, extension.record, userExpl
      )
    } else {
      await updateRecord(tableName, id, record, userExpl)
    }

    if (isSelf()) {
      const userSession = await updateUserSession()
      if (userSession) {
        session.mutate(() => userSession)
      }
    }

    if (hasExitHandler(exitSettings)) {
      revalidate([
        listRecordsCache.keyFor(tableName),
        'getRecords' + tableName + id,
        getOneExtRecordByIdCache.keyFor(tableName, id)
      ])
      exitSettings.onExit(id)
      return
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

    if (extension) {
      savedRecord = await insertExtRecord(
        tableName, record, extension.tableName, extension.record
      )
    } else {
      savedRecord = await insertRecord(tableName, record)
    }

    if (hasExitHandler(exitSettings)) {
      revalidate([listRecordsCache.keyFor(tableName)])
      exitSettings.onExit(savedRecord?.id)
      return
    } else {
      throw redirect(getExitUrl(exitSettings, savedRecord?.id))
    }
  }
})
