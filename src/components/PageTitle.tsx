import { Component, ParentComponent } from "solid-js";
import { Dynamic } from "solid-js/web";
import { schema } from "~/schema";

export const PageTitle:ParentComponent = (props) => {
  return (
    <h1 class="text-2xl px-2 py-4 first-letter:uppercase">{props.children}</h1>
  )
}

export const RecordPageTitle:Component<{
  tableName: string,
  text: string
}> = props => {
  return (
    <PageTitle>
    <Dynamic
      component={schema.tables[props.tableName].icon}
      size={22}
      class="inline mr-1 mb-1"
    />
    {props.text}
</PageTitle>
  )
}