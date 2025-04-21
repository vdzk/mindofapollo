import { Component, ComponentProps, createSignal, For, JSXElement, Show, useContext } from "solid-js"
import { schema } from "~/schema/schema"
import { AggregateSchema, DataRecordWithId } from "~/schema/type"
import { titleColumnName } from "~/utils/schema"
import { SessionContext } from "~/SessionContext"
import { Button } from "~/components/buttons"
import { Form } from "../form/Form"
import { getAggregateRecordsCache } from "./Aggregate"
import { revalidate } from "@solidjs/router"
import { RemovableListItem } from "./RemovableListItem"
import { Link } from "../Link"

export interface AggregateSectionSettings {
  title: string
  records?: DataRecordWithId[]
  controls?: JSXElement
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
      const { column, splitByColumn } = props.aggregate
      preset = { [column]: props.id }
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

  const getLinkProps = (
    record: DataRecordWithId
  ): ComponentProps<typeof Link> => {
    const _titleColumn = titleColumn()
    if (_titleColumn.type === 'fk') {
      const sameTable = _titleColumn.fk.table === props.tableName
      return {
        route: "show-record",
        params: {
          tableName: sameTable ? props.aggregate.table : _titleColumn.fk.table,
          id: sameTable ? props.id : record[titleColName()]
        }
      }
    } else if (props.aggregate.viewLink) {
      return {
        route: props.aggregate.viewLink.route,
        params: {
          [props.aggregate.viewLink.idParamName]:
            record[props.aggregate.viewLink.idParamSource]
        }
      }
    } else {
      return {
        route: "show-record",
        params: {
          tableName: props.aggregate.table,
          id: record.id
        }
      }
    }
  }

  const getItemText = (record: DataRecordWithId) => {
    const _titleColumn = titleColumn()
    if (_titleColumn.type === 'fk') {
      return record[_titleColumn.fk.labelColumn] as string
    } else {
      return record[titleColName()] as string
    }
  }

  return (
    <section class="pb-2">
      <div class="px-2">
        <span class="font-bold pr-2">{props.section.title}</span>
        <Show when={session?.userSession()?.authenticated}>
          <Show when={props.section.controls}>
            {props.section.controls}
          </Show>
          <Show when={!props.section.controls}>
            <Button
              label={showForm() ? "−" : "+"}
              onClick={() => setShowForm(x => !x)}
              tooltip={showForm() ? "cancel" : "add"}
            />
          </Show>
        </Show>
      </div>
      <Show when={showForm() && props.aggregate.type === '1-n'}>
        <div class="bg-orange-100 rounded-md p-2 mx-2">
          <Form {...getFormProps()} />
        </div>
      </Show>
      <For each={props.section.records}>
        {(record) => (
          <div class="px-2">
            <RemovableListItem
              tableName={props.tableName}
              recordId={props.id}
              aggregateName={props.aggregateName}
              itemTable={props.aggregate.table}
              item={record}
              text={getItemText(record)}
              linkProps={getLinkProps(record)}
              hideControls={!!props.section.controls}
            />
          </div>
        )}
      </For>
    </section>
  )
}

