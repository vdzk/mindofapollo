import { Component, createSignal, For, Match, Show, Switch, useContext } from "solid-js"
import { schema } from "~/schema/schema"
import { AggregateSchema, DataRecordWithId, ForeignKey, OneToNSchema } from "~/schema/type"
import { titleColumnName } from "~/utils/schema"
import { SessionContext } from "~/SessionContext"
import { Link } from "~/components/Link"
import { Button } from "~/components/buttons"
import { FkRecordListItem } from "./FkRecordListItem"
import { Form } from "../form/Form"
import { getAggregateRecordsCache } from "./Aggregate"
import { revalidate } from "@solidjs/router"
import { RemovableListItem } from "./RemovableListItem"

export interface AggregateSectionSettings {
  title: string;
  records: () => DataRecordWithId[] | undefined;
  link: { route: string, params: Record<string, any>, title: string },
  splitById?: number
}

export const AggregateSection: Component<{
  tableName: string,
  id: number,
  aggregateName: string,
  aggregate: AggregateSchema,
  section: AggregateSectionSettings
}> = (props) => {
  const session = useContext(SessionContext)
  const titleColName = () => titleColumnName(props.aggregate.table)
  const titleColumn = () => schema.tables[props.aggregate.table].columns[titleColName()]
  const aggregateTable = () => schema.tables[props.aggregate.table]
  const [showForm, setShowForm] = createSignal(false)

  const onFormExit = async (savedId?: number) => {
    setShowForm(false)
    if (savedId) {
      await revalidate(getAggregateRecordsCache.keyFor(
        props.tableName, props.id, props.aggregateName
      ))
    }
  }

  const getFormProps = () => {
    let preset
    let hideColumns
    if (props.aggregate.type === '1-n') {
      const {column, splitByColumn} = props.aggregate
      preset = {[column]: props.id}
      hideColumns = [column]
      if (splitByColumn && props.section.splitById) {
        preset[splitByColumn] = props.section.splitById
        hideColumns.push(splitByColumn)
      }
    }
    return {
      tableName: props.aggregate.table,
      exitSettings: { onExit: onFormExit },
      depth: 1,
      preset,
      hideColumns
    }
  }

  return (
    <section class="pb-2">
      <div class="px-2">
        <span class="font-bold pr-2">{props.section.title}</span>
        <Show when={session?.userSession()?.authenticated && !showForm()}>
          <Switch>
            <Match when={props.aggregate.showForm}>
              <Button
                label={props.section.link.title}
                onClick={() => setShowForm(true)}
                tooltip="add / remove"
              />
            </Match>
            <Match when>
              <Link
                route={props.section.link.route}
                params={props.section.link.params}
                type="button"
                label={props.section.link.title}
                tooltip="add / remove"
              />
            </Match>
          </Switch>
        </Show>
      </div>
      <Show when={showForm() && props.aggregate.type === '1-n'}>
        <div class="bg-orange-100 rounded-md p-2 mx-2">
          <Form {...getFormProps()}/>
        </div>
      </Show>
      <For each={props.section.records()}>{(record) => (
        <div class="px-2">
          <Switch>
            <Match when={titleColumn().type === 'fk'}>
              <FkRecordListItem
                tableName={props.tableName}
                aggregateName={props.aggregateName}
                aggregate={props.aggregate as OneToNSchema}
                titleColumnName={titleColName()}
                titleColumn={titleColumn() as ForeignKey}
                item={record}
                recordId={props.id}
              />
            </Match>
            <Match when={props.aggregate.viewLink}>
              <RemovableListItem
                tableName={props.tableName}
                recordId={props.id}
                aggregateName={props.aggregateName}
                itemTable={props.aggregate.table}
                item={record}
                text={record[titleColName()] as string}
                linkRoute={props.aggregate.viewLink!.route}
                linkParams={{
                  [props.aggregate.viewLink!.idParamName]:
                    record[props.aggregate.viewLink!.idParamSource]
                }}
              />
            </Match>
            <Match when>
              <Link
                route="show-record"
                params={{
                  tableName: props.aggregate.table,
                  id: record.id
                }}
                label={aggregateTable().preview?.(record) ?? record[titleColName()]}
              />
            </Match>
          </Switch>
        </div>
      )}</For>
    </section>
  )
}

