import { Component, createMemo, createSignal, For, Show } from "solid-js"
import { Statement } from "../Statement/Statement"
import { Argument } from "../Argument/Argument"
import { Subtitle } from "~/components/PageTitle"
import { Title } from "@solidjs/meta"
import { createAsync } from "@solidjs/router"
import { GraphTableName, listGraphWalkSteps } from "~/api/list/graphWalkSteps"
import { buildGraph, listNodesRec } from "./buildGraph"
import { Link, linkStyles } from "~/components/Link"
import { notOpEl } from "../Argument/Premises"
import { getMarker, Line, stubMarker } from "./Line"

const componentToTableName = new Map<Component<any>, string>
componentToTableName.set(Statement, 'statement')
componentToTableName.set(Argument, 'argument')

export const Graph: Component<{
  tableName: GraphTableName
  id: number
}> = props => {
  const graphData = createAsync(async () => {
    const { rows, rootStatementIds } = await listGraphWalkSteps(props.tableName, props.id)
    return buildGraph(rows, rootStatementIds)
  })

  const nodes = createMemo(() => listNodesRec(graphData()?.graph))

  const originalStatementIndexes = createMemo(() => {
    const indexes: Record<number, number> = {}
    const _nodes = nodes()
    const duplicateStatements = graphData()?.duplicateStatements
    if (!_nodes || !duplicateStatements) return indexes
    for (let i = 0; i < _nodes.length; i++) {
      const node = _nodes[i]
      if (
        'tableName' in node &&
        node.tableName === 'statement' &&
        duplicateStatements.has(node.id) &&
        !node.duplicate
      ) {
        indexes[node.id] = i
      }
    }
    return indexes
  })

  const [pingIndex, setPingIndex] = createSignal<number | null>(null)

  let linesRef!: HTMLDivElement

  const jumpToOriginal = (id: number) => {
    const index = originalStatementIndexes()[id]
    const el = linesRef.children[index]
    el.scrollIntoView({
      behavior: "smooth",
      block: "center"
    })
    setPingIndex(index)
    setTimeout(() => setPingIndex(null), 2000)
  }

  return (
    <main>
      <Title>Argument map</Title>
      <div class="border-b flex justify-between">
        <Subtitle>Argument map</Subtitle>
      </div>
      <div
        class="pt-2 pb-5"
        ref={linesRef}
      >
        <For each={nodes()}>
          {(node, index) => {
            if ('tableName' in node) {
              return (
                <Link
                  type="unstyled"
                  route={node.tableName}
                  params={{ id: node.id }}
                  label={(
                    <Line
                      selected={node.tableName === props.tableName && node.id === props.id}
                      marker={getMarker(node)}
                      path={node.path}
                      ping={index() === pingIndex()}
                    >
                      <div>
                        <Show when={node.invert}>
                          {notOpEl}
                        </Show>
                        {node.label}
                      </div>
                    </Line>
                  )}
                />
              )
            } else {
              return (
                <button
                  class="block w-full cursor-pointer bg-transparent"
                  onClick={() => jumpToOriginal(node.id)}
                >
                  <Line
                    marker={stubMarker}
                    path={node.path}
                  >
                    Show arguments
                  </Line>
                </button>
              )
            }
          }}
        </For>
      </div>
    </main>
  )
}