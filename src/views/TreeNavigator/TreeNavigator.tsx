import { Component, ComponentProps, createMemo, createSignal, onCleanup, onMount } from "solid-js"
import { Tree } from "./Tree"
import { Panel } from "./Panel"
import { Link } from "~/components/Link"
import { createStore, produce } from "solid-js/store"
import { getByPath } from "~/utils/shape"

export interface ComponentWithProps {
  component: Component<any>,
  props?: Record<string, any>
}

const rootTableName = 'statement'
const rootStatementId = 62

export interface GraphNode {
  tableName: string
  id: number,
  positive?: boolean
  children: Record<string, GraphNode>
  path: string[]
}

const listNodesRec = (nodes: Record<string, GraphNode>) => {
  let list: GraphNode[] = []
  for (const key in nodes) {
    const node = nodes[key]
    list.push(node)
    const descendants = listNodesRec(node.children)
    list = [...list, ...descendants]
  }
  return list
}

const prefixes: Record<string, string> = {
  statement: 's',
  argument: 'a'
}

export const getKey = (tableName: string, id: number) => prefixes[tableName] + id
const graphStorageKey = 'graph'


export const TreeNavigator: Component<{ path: string }> = props => {
  const initLineKey = getKey(rootTableName, rootStatementId)
  const storedGraph = localStorage.getItem(graphStorageKey)
  const [graph, setGraph] = createStore<Record<string, GraphNode>>(storedGraph
    ? JSON.parse(storedGraph)
    : {
      [initLineKey]: {
        tableName: rootTableName,
        id: rootStatementId,
        children: {},
        path: [initLineKey]
      }
    }
  )
  const saveGraph = () => localStorage.setItem(graphStorageKey, JSON.stringify(graph))
  onMount(() => window.addEventListener('beforeunload', saveGraph))
  onCleanup(() => {
    window.removeEventListener('beforeunload', saveGraph)
    saveGraph()
  })
  const nodeList = createMemo(() => listNodesRec(graph))
  const [curNode, setCurNode] = createSignal<GraphNode>()


  const onEmbeddedLinkClick = (linkProps: ComponentProps<typeof Link>) => {
    const _curNode = curNode()
    if (
      ['statement', 'argument'].includes(linkProps.route) &&
      linkProps.params?.id &&
      linkProps.relation &&
      _curNode
    ) {
      const tableName = linkProps.route
      const id = linkProps.params.id
      const key = getKey(tableName, id)
      if (linkProps.relation) {
        if (!linkProps.relation.forward && _curNode.path.length === 1) {
          const curNodeKey = _curNode.path[0]
          const newNode = {
            tableName,
            id,
            children: {},
            path: [key]
          }
          setGraph(produce(prev => {
            prev[key] = newNode
            prev[curNodeKey].positive = linkProps.relation!.positive
            // CONTINUE HERE!!!
            // CONTINUE HERE!!!
            // CONTINUE HERE!!!
            // CONTINUE HERE!!!
            
            // TODO:
            // move cur node to newNode children
            // do reverse of submergeRec for all children of newNode
          }))
        } else {
        const objPath = _curNode.path.flatMap(x => [x, 'children'])


        let positive: boolean | undefined

        if (!linkProps.relation.forward) {
          if (objPath.length > 0) {
            objPath.pop() // children
            objPath.pop() // parent node key
          }
        }

        setGraph(produce(prev => {
          const siblings = getByPath<Record<string, GraphNode>>(prev, objPath)
          if (!siblings) return
          if (!siblings[key]) {
            siblings[key] = {
              tableName,
              id,
              positive,
              children: {},
              path: [..._curNode.path, key]
            }
          }
        }))
        const nextNode = getByPath<GraphNode>(graph, [...objPath, key])
        if (nextNode)
          setCurNode(nextNode)
        return true

        }
      } else {
        const newNode = {
          tableName,
          id,
          children: {},
          path: [key]
        }
        setGraph(key, newNode)
        setCurNode(newNode)
        return true
      }
    }
  }
  return (
    <main class="flex-1 flex">
      <Tree
        nodeList={nodeList()}
        curNode={curNode()}
        setCurNode={setCurNode}
        setGraph={setGraph}
      />
      <Panel
        curNode={curNode()}
        onEmbeddedLinkClick={onEmbeddedLinkClick}
      />
    </main>
  )
}