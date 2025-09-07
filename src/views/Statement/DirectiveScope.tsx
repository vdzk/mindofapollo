import { Component } from "solid-js"
import { Aggregate } from "~/components/aggregate/Aggregate"

export const DirectiveScope: Component<{id: number}> = props => {
  return (
    <div class="max-w-sm">
      <Aggregate
        tableName="directive"
        id={props.id}
        aggregateName="people_categories"
      />
    </div>
  )
}