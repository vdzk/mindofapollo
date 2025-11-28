import { Component, Show, useContext } from "solid-js"
import { Subtitle } from "~/components/PageTitle"
import { recentPeriodHours } from "~/constant"
import { DataRecordWithId } from "~/schema/type"
import { SessionContext } from "~/SessionContext"

export const UserPermissions: Component<{
  id: number
  tabData: { record?: DataRecordWithId }
}> = props => {
  const session = useContext(SessionContext)
  const isSelf = () => props.id === session?.userSession?.()?.userId
  return (
    <div class="max-w-lg">
      <div class="px-2 pb-2">
        <div class="font-bold capitalize">
          {isSelf() ? 'your ' : ''}permission level 
        </div>
        {props.tabData?.record?.permission_level}
        <Show when={isSelf()}>
          <div class="text-sm">If your permission level was updated recently, please log out and back in for it to take full effect.</div>
        </Show>
      </div>
      <Subtitle>Permissions System</Subtitle>
      <div class="px-2">Level: 100</div>
      <ul class="list-disc pl-6">
        <li>create new entries</li>
        <li>update or delete entries you've created within the past {recentPeriodHours} hr</li>
      </ul>
      <div class="px-2 pt-2">Level: 1000</div>
      <ul class="list-disc pl-6">
        <li>update all unrestricted entries</li>
      </ul>
    </div>
  )
}