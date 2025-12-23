import { createAsync } from "@solidjs/router"
import { Component, createMemo, For, Setter } from "solid-js"
import { listRecordsByIdsCache } from "~/client-only/query"
import { titleColumnName } from "~/utils/schema"
import { Statement } from "../Statement/Statement"
import { Argument } from "../Argument/Argument"
import { ListRecordsByIdsQuery } from "~/api/list/recordsByIds"
import { GraphNode } from "./TreeNavigator"
import { Subtitle } from "~/components/PageTitle"
import { SetStoreFunction } from "solid-js/store"
import { GraphActions } from "./GraphActions"

const componentToTableName = new Map<Component<any>, string>
componentToTableName.set(Statement, 'statement')
componentToTableName.set(Argument, 'argument')

const getMarker = (node: GraphNode) => {
  let short = 'XX'
  let tooltip = 'unknown type'
  let classStr = ''
  if (node.tableName === 'statement') {
    if (node.path.length === 1) {
      short = 'T'
      tooltip = 'Top claim'
      classStr = 'text-purple-700'
    } else {
      short = 'R'
      tooltip = 'pRemise / Reason'
      classStr = 'text-gray-700'
    }
  } else if (node.tableName === 'argument') {
    if (node.positive) {
      short = 'P'
      tooltip = 'Pro argument'
      classStr = 'text-green-700'
    } else {
      short = 'C'
      tooltip = 'Con argument'
      classStr = 'text-red-700'
    }
  }
  return {short, tooltip, classStr}
}

export const Tree: Component<{
  nodeList: GraphNode[],
  curNode?: GraphNode,
  setCurNode: Setter<GraphNode|undefined>
  setGraph: SetStoreFunction<Record<string, GraphNode>>
}> = props => {
  // TODO: query only new lines
  // OR: Path the label from the link to avoid additional network requests?
  const queries = createMemo<ListRecordsByIdsQuery[]>(() => {
    const queriesByTableName: Record<string, ListRecordsByIdsQuery> = {}
    for (const lineSpec of props.nodeList) {
      const { tableName, id } = lineSpec
      if (!queriesByTableName[tableName]) {
        queriesByTableName[tableName] = {
          tableName: tableName,
          ids: [],
          colNames: [titleColumnName(tableName)]
        }
      }
      queriesByTableName[tableName].ids.push(id)
    }
    return Object.values(queriesByTableName)
  })

  const lines = createAsync(async () => {
    const _queries = queries()
    const groupedRecords = await listRecordsByIdsCache(_queries)
    if (!groupedRecords) return
    const labels: Record<string, Record<number, string>> = {}
    for (let i = 0; i < groupedRecords.length; i++) {
      const query = _queries[i]
      if (!labels[query.tableName]) {
        labels[query.tableName] = {}
      }
      for (const record of groupedRecords[i]) {
        labels[query.tableName][record.id] = record[query.colNames[0]] as string
      }
    }
    return props.nodeList.map(node => {
      const { tableName, id } = node
      const label = labels[tableName][id]
      return { node, label}
    })
  })
  return (
    <div class="flex-1">
      <div class="border-b mb-2 flex justify-between">
        <Subtitle>Argument tree(s)</Subtitle>
        <GraphActions
          curNode={props.curNode}
          setCurNode={props.setCurNode}
          setGraph={props.setGraph}
        />
      </div>
      <For each={lines()}>
        {line => {
          const marker = getMarker(line.node)
          let label = line.label
          if (line.node.tableName === 'statement') {
            label = label.slice(label.indexOf(')') + 2)
          }
          return (
            <div
              class="px-2 flex cursor-pointer hover:bg-orange-200"
              classList={{
                'bg-orange-100': line.node === props.curNode
              }}
              onClick={() => props.setCurNode(line.node === props.curNode
                ? undefined
                : line.node
              )}
            >
              <For each={line.node.path.slice(0, -1)} >
                {() => <div class="w-4 border-gray-500 border-l shrink-0" />}
              </For>
              <div
                class="font-bold pr-1"
                classList={{
                  [marker.classStr]: !!marker.classStr
                }}
                title={marker.tooltip}
              >
                {marker.short}
              </div>
              <div>
                {label}
              </div>
            </div>
          )
        }}
      </For>
    </div>
  )
}