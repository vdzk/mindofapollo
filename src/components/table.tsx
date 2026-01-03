import { ParentComponent } from "solid-js"

export const tableStyle = {
  tHeadTr: 'text-left',
  th: 'pr-3 pb-2 border-b',
  tdMiddle: 'pr-3 py-2 border-b',
  td: ''
}

tableStyle.td = tableStyle.tdMiddle + '  align-top'

export const TH: ParentComponent<{ first?: boolean }> = props => (
  <th class={tableStyle.th} classList={{'pl-2': props.first}}>
    {props.children}
  </th>
)

export const TD: ParentComponent<{ first?: boolean }> = props => (
  <td class={tableStyle.td} classList={{'pl-2': props.first}}>
    {props.children}
  </td>
)