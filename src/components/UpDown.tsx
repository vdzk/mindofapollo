import { createContext, ComponentProps, ParentComponent, Component, useContext, createSignal, createEffect, Accessor } from "solid-js"
import { Link } from "./Link"
import { createStore } from "solid-js/store"
import { graphPageRoutes } from "~/constant"
import { useLocation } from "@solidjs/router"
import { useSafeParams } from "~/client-only/util"

interface TraceLink {
  route: string,
  id: number
}

type TraceNode = [TraceLink | null, TraceLink | null]

type Trace = Record<string, Record<number, TraceNode>>

export const PathTracker = createContext<{
  trace: Trace
  onLinkClick: (linkProps: ComponentProps<typeof Link>) => void
  parentLink: Accessor<TraceLink | undefined>
  setParentLink: (traceLink?: TraceLink) => void 
}>()

export const PathTrackerProvider: ParentComponent = (props) => {
  // indexed double linked list of trace nodes
  const [trace, setTrace] = createStore<Trace>({
    statement: {},
    argument: {}
  })

  // update source and target trace nodes
  const onLinkClick = (linkProps: ComponentProps<typeof Link>) => {
    if (!graphPageRoutes.includes(linkProps.route)) return
    if (typeof linkProps.up !== 'boolean') return
    if (!linkProps.params?.id) return
    const curRoute = window.location.pathname.slice(1)
    if (!graphPageRoutes.includes(curRoute)) return
    const curParams = new URLSearchParams(window.location.search)
    const curId = Number(curParams.get('id'))
    
    const source = {
      route: curRoute,
      id: curId
    }
    const target = {
      route: linkProps.route,
      id: linkProps.params.id as number
    }
    const { up } = linkProps

    setTrace(source.route, source.id, node => {
      let newNode: TraceNode = node ? structuredClone(node) : [null, null]
      newNode[Number(up)] = {...target}
      return newNode
    })
    setTrace(target.route, target.id, node => {
      let newNode: TraceNode = node ? structuredClone(node) : [null, null]
      newNode[Number(!up)] = {...source}
      return newNode
    })
  }

  const [parentLink, setParentLink] = createSignal<TraceLink>()

  const pathTracker = { trace, onLinkClick, parentLink, setParentLink }
  return (
    <PathTracker.Provider value={pathTracker}>
      {props.children}
    </PathTracker.Provider>
  )
}

export const UpDown: Component = () => {
  const sp = useSafeParams<{ id: number }>(['id'])
  const location = useLocation()
  const pathTracker = useContext(PathTracker)
  const traceLink = () => {
    if (!pathTracker?.trace) return
    const route = location.pathname.slice(1)
    return pathTracker.trace[route]?.[sp().id] ?? [null, null]    
  }
  const upLink = () => traceLink()?.[1] ?? pathTracker?.parentLink() ?? null
  const downLink = () => traceLink()?.[0] ?? null

  return (
    <div class="flex gap-0.5">
      <Link
        label={<img class="w-4 h-6" src="/icons/arrow-up.svg" />}
        tooltip="move one step up the hierarchy"
        type="button"
        route={upLink()?.route ?? ''}
        params={{ id: upLink()?.id ?? 0}}
        disabled={!upLink()}
        up
      />
      <Link
        label={<img class="w-4 h-6" src="/icons/arrow-down.svg" />}
        tooltip="return back down one step"
        type="button"
        route={downLink()?.route ?? ''}
        params={{ id: downLink()?.id ?? 0}}
        disabled={!downLink()}
      />
    </div>
  )
}
