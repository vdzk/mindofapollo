import { createAsync } from "@solidjs/router"
import { Component, For, Match, Switch } from "solid-js"
import { listRecordHistory, listUserHistory } from "~/api/components/histories"
import { DataRecord } from "~/schema/type"
import { Id } from "~/types"
import { humanCase, timeAgo } from "~/util"

const excludeFields = ['op_timestamp', 'op_user_name', 'data_op', 'id', 'op_user_id']

const stringifyOpRecord = (opRecord: DataRecord) => Object.entries(opRecord)
  .filter(([key]) => !excludeFields.includes(key))
  .map(([key, value]) => `[${key}: ${value}]`)
  .join(' ')

export const RecordHistory: Component<{
  tableName: string,
  recordId: Id,
}> = props => {
  const recordHistory = createAsync(() => listRecordHistory(props.tableName, props.recordId))

  const timeline = () => {
    const opRecords = recordHistory()
    if (!opRecords) return
    const timeline: string[] = []
    let prevRecord: DataRecord | undefined
    let prevAge = ''
    opRecords.forEach(opRecord => {
      const age = timeAgo.format(opRecord.op_timestamp)
      if (prevAge !== age) {
        timeline.push(age)
        prevAge = age
      }
      const userName = opRecord.op_user_name
      let action = ''
      if (opRecord.data_op === 'INSERT') {
        action = 'created record ' + stringifyOpRecord(opRecord)
        prevRecord = opRecord
      } else if (opRecord.data_op === 'UPDATE') {
        if (prevRecord) {
          for (const key in opRecord) {
            if (opRecord[key] === prevRecord[key]) continue
            if (excludeFields.includes(key)) continue
            action += `[${key}: ${prevRecord[key]} → ${opRecord[key]}] `
          }
        } else {
          action = 'updated record ' + stringifyOpRecord(opRecord)
        }
      } else if (opRecord.data_op === 'DELETE') {
        action = 'deleted record ' + stringifyOpRecord(opRecord)
        prevRecord = undefined
      }
      timeline.push(`${userName} ${action}`)
      prevRecord = opRecord
    })
    return timeline
  }

  return (
    <div class="px-2">
      <For each={timeline()}>
        {timelineItem => (
          <div>{timelineItem as string}</div>
        )}
      </For>
    </div>
  )
}

export const UserHistory: Component<{
  userId: Id
}> = props => {
  const userHistory = createAsync(() => listUserHistory(props.userId))
  return (
    <For each={userHistory()}>
      {opRecord => (
        <div class="px-2">
          {timeAgo.format(opRecord.op_timestamp)}
          {' '}
          {humanCase(opRecord.tableName)}
          {' '}
          {opRecord.data_op}
          {' '}
          {Object.entries(opRecord)
            .filter(([key]) => !['op_timestamp', 'data_op', 'op_user_id'].includes(key))
            .map(([key, value]) => `[${key}: ${value}]`)
            .join(' ')}
        </div>
      )}
    </For>
  )
}
