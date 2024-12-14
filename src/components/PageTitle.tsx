import { IconTypes } from "solid-icons";
import { IoSquare } from 'solid-icons/io';
import { Component, ParentComponent } from "solid-js";
import { Dynamic } from "solid-js/web";
import { schema } from "~/schema/schema";
import { firstCap, humanCase } from "~/util";

export const PageTitle: ParentComponent = (props) => {
  return (
    <h1 class="text-3xl font-bold px-2 py-4 first-letter:uppercase">{props.children}</h1>
  )
}

export const PageTitleIcon: Component<{
  tableName?: string;
  component?: IconTypes
}> = props => (
  <Dynamic
    component={props.tableName
      ? (schema.tables[props.tableName].icon ?? IoSquare)
      : props.component
    }
    size={28}
    class="inline mr-2 mb-1"
  />
)

export const RecordPageTitle: Component<{
  tableName: string,
  text: string
}> = props => (
  <div>
    <div class="relative top-5 pl-2.5">{firstCap(humanCase(props.tableName))}:</div>
    <PageTitle>

      <PageTitleIcon tableName={props.tableName} />
      {props.text}
    </PageTitle>
  </div>
)
