import { GraphTableName } from "~/api/list/graphWalkSteps"
import { useSafeParams } from "~/client-only/util"
import { Graph } from "~/views/Graph/Graph"

export default function Map() {
  const sp = useSafeParams<{
    tableName: GraphTableName
    id: string
  }>(['tableName', 'id'])
  const id = () => parseInt(sp().id)

  return (
    <Graph
      tableName={sp().tableName}
      id={id()}
    />
  )
}