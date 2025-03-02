import { Component, createMemo, createSignal, Switch, Match } from "solid-js"
import { ExplRecord } from "~/server-only/expl"
import { formatters } from "./formatter"
import { firstCap, humanCase } from "~/util"
import { ExplData } from "./types"
import { Title } from "@solidjs/meta"
import { PageTitle } from "../PageTitle"
import { MasterDetail } from "../MasterDetail"
import { Dynamic } from "solid-js/web"
import { sections } from "./sections/sections"

const getActionStr = (expl: ExplData) => `${expl.action} the ${humanCase(expl.target.tableName)} "${expl.target.label}"`

const getSummaryStr = (expl: ExplData) => {
  let actorStr = ''
  if (expl.actor.type === 'user') {
    actorStr = expl.actor.user.name
  } else if (expl.actor.type === 'system') {
    actorStr = 'System'
  }
  return `${actorStr} ${getActionStr(expl)}.`
}

const useExplData = (explRecord: ExplRecord<any>) => {
  const acton = () => explRecord.action
  const formatter = () => formatters['expl' + firstCap(acton())]
  const data = createMemo(() => formatter()(explRecord.data))
  return data
}

export const getExplActionStr = (explRecord: ExplRecord<any>) =>
  getActionStr(useExplData(explRecord.data)())

export const Expl: Component<{ explRecord: ExplRecord<any> }> = (props) => {
  const data = useExplData(props.explRecord)
  const title = () => getSummaryStr(data())
  const timeStr = () => props.explRecord.timestamp.toISOString().split('.')[0].replace('T', ' ')

  const options = createMemo(() => {
    const builtInOptions = Object.entries(sections)
      .filter(
        ([_, section]) => section.propNames.some(name => data()[name]))
      .map(([key, section]) => ({ 
        id: key, 
        label: section.label, 
        source: 'builtin' as const
      }))
    
    if (data().customSections) {
      const customOptions = Object.entries(data().customSections!)
        .map(([key, section]) => ({ 
          id: key, 
          label: section.label, 
          source: 'custom' as const
        }))
      return [
        builtInOptions[0],
        ...customOptions,
        ...builtInOptions.slice(1)
      ]
    } else {
      return builtInOptions
    }
  })
  
  const [selected, setSelected] = createSignal(options()[0])
  const setSelectedId = (id: string) => {
    const option = options().find(opt => opt.id === id)
    if (option) setSelected(option)
  }
  
  return (
    <main class="max-w-screen-md">
      <Title>{title()}</Title>
      <PageTitle>{title()}</PageTitle>
      <div>Time: {timeStr()}</div>
      <MasterDetail
        options={options()}
        selectedId={selected().id}
        onChange={setSelectedId}
      >
        <Switch>
          <Match when={selected().source === 'builtin'}>
            <Dynamic 
              component={sections[selected().id].component} 
              {...data()} 
            />
          </Match>
          <Match when={selected().source === 'custom'}>
            <Dynamic 
              component={data().customSections?.[selected().id].component} 
              {...props.explRecord} 
            />
          </Match>
        </Switch>
      </MasterDetail>
    </main>
  )
}