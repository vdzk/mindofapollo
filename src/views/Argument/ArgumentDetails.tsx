import { Title } from "@solidjs/meta"
import { Component, For, Show } from "solid-js"
import { Detail } from "~/components/details"
import { Link } from "~/components/Link"
import { Subtitle } from "~/components/PageTitle"
import { schema } from "~/schema/schema"
import { DataRecordWithId } from "~/schema/type"
import { argumentSideLabels } from "~/tables/argument/argument"
import { argumentTypes } from "~/tables/argument/type"
import { getExtTableName } from "~/utils/schema"

export const ArgumentDetails: Component<{
  id: number
  record?: DataRecordWithId
  statement?: DataRecordWithId
}> = props => {
  const extTableName = () => props.record
    ? getExtTableName('argument', props.record) : undefined
  const argTypeName = () => props.record
    ? argumentTypes[props.record.argument_type_id as number - 1]
    : ''

  return (
    <>
      <Title>{props.record?.title}</Title>
      <Subtitle>Argument ({argTypeName()})</Subtitle>
      <div class="border-t h-3" />
      <div class="font-bold px-2">Claim</div>
      <div class="px-2 pb-2">
        <Link
          route="statement"
          params={{ id: props.statement?.id }}
          label={props.statement?.text || props.statement?.label}
          type="block"
        />
      </div>
      <div class="font-bold px-2">
        {argumentSideLabels[Number(props.record?.pro)]} Argument
      </div>
      <div class="px-2 pb-2">
        {props.record?.title}
      </div>
      <Show when={props.record && extTableName()}>
        <For each={Object.keys(schema.tables[extTableName()!].columns)}>
          {colName => (
            <Detail
              tableName={extTableName()!}
              colName={colName}
              record={props.record!}
            />
          )}
        </For>
      </Show>
    </>
  )
}