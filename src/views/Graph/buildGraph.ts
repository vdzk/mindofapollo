import { WalkRow } from "~/api/list/graphWalkSteps"

export interface GraphNode {
  tableName: 'statement' | 'argument'
  id: number
  path: number[]
  pro?: boolean
  invert?: boolean
  label: string
  children: Record<number, GraphNode>
  duplicate?: true
}

export const buildGraph = (rows: WalkRow[], rootStatementIds: number[]) => {
  // --- Index the graph ---
  const statementLabel = new Map<number, string>()
  const argumentLabel = new Map<number, string>()

  const statementToArguments = new Map<number, { id: number; pro: boolean }[]>()
  const argumentToPremises = new Map<number, { statementId: number; invert: boolean }[]>()

  const rootSet = new Set(rootStatementIds)

  for (const r of rows) {
    if (r.node_type === 'statement') statementLabel.set(r.id, r.label)
    else argumentLabel.set(r.id, r.label)

    if (r.node_type === 'argument' && r.parent_type === 'statement' && r.parent_id != null) {
      const list = statementToArguments.get(r.parent_id) ?? []
      list.push({ id: r.id, pro: !!r.pro })
      statementToArguments.set(r.parent_id, list)
    }

    if (r.node_type === 'statement' && r.parent_type === 'argument' && r.parent_id != null) {
      const list = argumentToPremises.get(r.parent_id) ?? []
      list.push({ statementId: r.id, invert: !!r.invert })
      argumentToPremises.set(r.parent_id, list)
    }
  }

  // ordering rules:
  // - pro args before con args, then by id asc
  // - premises by statementId asc
  const sortArgs = (xs: { id: number; pro: boolean }[]) =>
    xs.sort((a, b) => (a.pro === b.pro ? a.id - b.id : a.pro ? -1 : 1))

  const sortPremises = (xs: { statementId: number; invert: boolean }[]) =>
    xs.sort((a, b) => a.statementId - b.statementId)

  // --- Build tree with DAG duplicate stubs + cycle guard ---
  const expandedStatements = new Set<number>() // ONLY statements dedupe
  const duplicateStatements = new Set<number>()

  const makeStatement = (
    id: number,
    path: number[],
    stackStatements: Set<number>,
    stackArguments: Set<number>,
    invert?: boolean
  ): GraphNode | null => {
    // console.log('S', id, '<-A', path[path.length - 1], path.slice(0, path.length - 1))
    const label = statementLabel.get(id)
    if (!label) return null

    // cycle guard
    if (stackStatements.has(id)) {
      const node: GraphNode = {
        tableName: 'statement',
        id,
        invert,
        path,
        label,
        children: {},
        duplicate: true
      }
      duplicateStatements.add(id)
      return node
    }

    const base: GraphNode = { tableName: 'statement', id, invert, path, label, children: {} }

    // DAG reuse rule: subsequent statement copies are stubs (no children)
    if (expandedStatements.has(id)) {
      duplicateStatements.add(id)
      return { ...base, children: {}, duplicate: true }
    }

    expandedStatements.add(id)
    stackStatements.add(id)

    const args = sortArgs([...(statementToArguments.get(id) ?? [])])
    for (const a of args) {
      const childPath = [...path, id]
      const argNode = makeArgument(a.id, childPath, a.pro, stackStatements, stackArguments)
      if (argNode) base.children[a.id] = argNode
    }

    stackStatements.delete(id)
    return base
  }

  const makeArgument = (
    id: number,
    path: number[],
    pro: boolean,
    stackStatements: Set<number>,
    stackArguments: Set<number>
  ): GraphNode | null => {
    // console.log('A', id, '<-S', path[path.length - 1], path.slice(0, path.length - 1))
    const label = argumentLabel.get(id)
    if (!label) return null

    // cycle guard ONLY (no DAG dedupe for arguments)
    if (stackArguments.has(id)) {
      return {
        tableName: 'argument',
        id,
        path,
        pro,
        label,
        children: {},
        duplicate: true
      }
    }

    const base: GraphNode = { tableName: 'argument', id, path, pro, label, children: {} }

    stackArguments.add(id)

    const premises = sortPremises([...(argumentToPremises.get(id) ?? [])])
    for (const p of premises) {
      const childPath = [...path, id]
      const stmtNode = makeStatement(
        p.statementId,
        childPath,
        stackStatements,
        stackArguments,
        p.invert
      )
      if (stmtNode) base.children[p.statementId] = stmtNode
    }

    stackArguments.delete(id)
    return base
  }

  // --- roots ---
  const graph: Record<number, GraphNode> = {}
  for (const rootId of rootStatementIds) {
    if (!rootSet.has(rootId)) continue
    if (!statementLabel.has(rootId)) continue // omit missing roots

    const node = makeStatement(rootId, [], new Set<number>(), new Set<number>(), undefined)
    if (node) graph[rootId] = node
  }

  return { graph, duplicateStatements }
}

export interface Stub {
  id: number
  path: number[]
}

export const listNodesRec = (nodes?: Record<string, GraphNode>) => {
  let list: (GraphNode | Stub)[] = []
  if (!nodes) return list
  for (const key in nodes) {
    const node = nodes[key]
    list.push(node)
    if (node.duplicate) {
      const stub = {
        id: node.id,
        path: [...node.path, node.id]
      }
      list.push(stub)
    }
    const descendants = listNodesRec(node.children)
    list = [...list, ...descendants]
  }
  return list
}