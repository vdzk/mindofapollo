import { useSafeParams } from "~/client-only/util"
import { TreeNavigator } from "~/views/TreeNavigator/TreeNavigator"

export default function ArgumentPage() {
  const sp = useSafeParams<{ path: string }>(['path'])

  return (
    <TreeNavigator path={sp().path} />
  )
}