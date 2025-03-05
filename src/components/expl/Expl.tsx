import { Component, createMemo, Switch, Match } from "solid-js"
import { ExplRecord } from "~/server-only/expl"
import { formatters } from "./formatter"
import { firstCap, humanCase } from "~/util"
import { ExplData } from "./types"
import { Title } from "@solidjs/meta"
import { AbovePageTitle, PageTitle } from "../PageTitle"
import { MasterDetail } from "../MasterDetail"
import { Dynamic } from "solid-js/web"
import { sections } from "./sections/sections"
import { useSearchParams } from "@solidjs/router"

const getActionStr = (expl: ExplData) => `${expl.action} the ${humanCase(expl.target.tableName)} "${expl.target.label}"`

const getSummaryStr = (expl: ExplData) => {
  let actorStr = ''
  if (expl.actor.type === 'user') {
    actorStr = expl.actor.user.name
  } else if (expl.actor.type === 'system') {
    actorStr = 'System'
  }
  return `${actorStr} ${getActionStr(expl)}`
}

const getExplData = (explRecord: ExplRecord<any>) => {
  const formatter = formatters['expl' + firstCap(explRecord.action)]
  return formatter(explRecord.data)
}

export const getExplActionStr = (explRecord: ExplRecord<any>) =>
  getActionStr(getExplData(explRecord))

export const getExplSummaryStr = (explRecord: ExplRecord<any>) =>
  getSummaryStr(getExplData(explRecord))

export const Expl: Component<{ explRecord: ExplRecord<any> }> = (props) => {
  const [searchParams, setSearchParams] = useSearchParams()
  const data = createMemo(() => getExplData(props.explRecord))
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

  const selected = createMemo(() => {
    const selectedId = searchParams.section as string | undefined
    if (selectedId) {
      return options().find(opt => opt.id === selectedId) ?? options()[0]
    }
    return options()[0]
  })
  
  return (
    <main>
      <Title>{title()}</Title>
      <AbovePageTitle label="Explanation:" />
      <PageTitle>{title()}</PageTitle>
      <div class="px-2 relative -top-4">Time: {timeStr()}</div>
      <MasterDetail
        options={options()}
        selectedId={selected().id}
        onChange={(sectionId) => setSearchParams({ section: sectionId })}
        class="pl-2"
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
              {...props.explRecord.data} 
            />
          </Match>
        </Switch>
      </MasterDetail>
    </main>
  )
}
