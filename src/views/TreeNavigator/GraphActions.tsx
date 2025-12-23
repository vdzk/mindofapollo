import { Component, Setter } from "solid-js"
import { GraphNode } from "./TreeNavigator"
import { produce, SetStoreFunction, unwrap } from "solid-js/store"
import { Button } from "~/components/buttons"
import { getByPath } from "~/utils/shape"


export const GraphActions: Component<{
  curNode?: GraphNode,
  setCurNode: Setter<GraphNode | undefined>
  setGraph: SetStoreFunction<Record<string, GraphNode>>
}> = props => {
  const getContext = (graph: Record<string, GraphNode>) => {
    if (!props.curNode) return
    const parentPath = props.curNode.path.slice(0, -1)
    const key = props.curNode.path.at(-1)
    if (!key) return
    const objPath = parentPath.flatMap(x => [x, 'children'])
    const siblings = getByPath<Record<string, GraphNode>>(graph, objPath)
    console.log('siblings', {...unwrap(siblings)})
    console.log('graph', {...unwrap(graph)})
    console.log('objPath', objPath)
    if (!siblings) return
    return {key, siblings}
  }

  const submergeRec = (graph: Record<string, GraphNode>, depth: number) => {
    for (const key in graph) {
      graph[key].path = graph[key].path.slice(depth)
      submergeRec(graph[key].children, depth)
    }
  }

  const removeSubTree = () => {
    props.setGraph(produce(prev => {
      const ctx = getContext(prev)
      console.log(ctx)
      if (!ctx) return
      delete ctx.siblings[ctx.key]
    }))
    props.setCurNode()
  }

  const splitTree = () => {
    props.setGraph(produce(prev => {
      const ctx = getContext(prev)
      if (!ctx) return
      if (!props.curNode) return 
      const newNode = {...props.curNode, path: [ctx.key]}
      const depth = props.curNode.path.length - 1
      submergeRec(ctx.siblings[ctx.key].children, depth)
      ctx.siblings[ctx.key].children = {}
      prev[ctx.key] = newNode
    }))
  }

  return (
    <div class="flex gap-2 items-center px-2">
      <Button
        tooltip="split the tree at the selected node"
        label="Split"
        onClick={splitTree}
      />
      <Button
        tooltip="close the selected node and its descendants"
        label="Close"
        onClick={removeSubTree}
      />
    </div>
  )
}