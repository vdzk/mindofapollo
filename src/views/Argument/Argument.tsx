import { createAsync, revalidate, useSearchParams } from "@solidjs/router"
import { Component, createEffect, Match, Show, Switch, useContext } from "solid-js"
import { ArgumentDetails } from "./ArgumentDetails"
import { getOneExtRecordByIdCache, listForeignRecordsCache } from "~/client-only/query"
import { StatementType } from "~/tables/statement/statement_type"
import { Form } from "~/components/form/Form"
import { getOneRecordByChildId } from "~/api/getOne/recordByChildId"
import { MasterDetail } from "~/components/MasterDetail"
import { RecordHistory } from "~/components/RecordHistory"
import { DeleteRecord } from "~/components/form/DeleteRecord"
import { ArgumentTypeSelector } from "../Statement/ArgumentTypeSelector"
import { Premises } from "./Premises"
import { HowTo } from "./HowTo"
import { Aggregate } from "~/components/aggregate/Aggregate"
import { PathTracker } from "~/components/UpDown"

export const Argument: Component<{ id: number }> = props => {
  const record = createAsync(() => getOneExtRecordByIdCache('argument', props.id, true))
  const statement = createAsync(async () => getOneRecordByChildId('statement', 'argument', props.id))
  const statementType = () => statement()?.statement_type_name as StatementType | undefined

  const pathTracker = useContext(PathTracker)
  createEffect(() => {
    let parentLink
    const _record = record()
    if (_record) {
      parentLink = {
        route: 'statement',
        id: _record.statement_id as number
      }
    }
    pathTracker?.setParentLink(parentLink)
  })

  const [searchParams, setSearchParams] = useSearchParams()
  const argumentTypeId = () => record()?.argument_type_id as number | undefined
  const onFormExit = () => {
    setSearchParams({ tab: null })
    revalidate([
      listForeignRecordsCache.keyFor('argument', 'statement_id', record()!.statement_id as number)
    ])
  }
  const tabOptions = () => {
    const options = [
      { id: 'analysis', label: 'Analysis' },
      { id: 'history', label: 'History' }
    ]
    if (record()?.canUpdate) {
      options.push({ id: 'edit', label: 'Edit' })
      options.push({ id: 'argumentTypeSelector', label: 'Type' })
    }
    if (record()?.canDelete) {
      options.push({ id: 'delete', label: 'Delete' })
    }
    return options
  }
  return (
    <>
      <section class="flex flex-1 flex-col lg:flex-row">
        <div class="flex-3 min-w-0">
          <ArgumentDetails
            id={props.id}
            record={record()}
            statement={statement()}
            statementType={statementType()}
          />
          <MasterDetail
            horizontal
            options={tabOptions()}
            selectedId={searchParams.tab || 'analysis'}
            onChange={id => setSearchParams({ tab: id })}
            optionsClass="pt-2"
            class="px-2"
          />
        </div>
        <Switch>
          <Match when={searchParams.tab === 'edit' && record()}>
            <div class="flex-5 border-l pt-2">
              <Form
                tableName="argument"
                exitSettings={{ onExit: onFormExit }}
                id={props.id}
                record={record()!}
              />
            </div>
          </Match>
          <Match when={searchParams.tab === 'argumentTypeSelector' && record()}>
            <div class="flex-5 border-l">
              <ArgumentTypeSelector
                record={record()!}
                onFormExit={onFormExit}
              />
            </div>
          </Match>
          <Match when={searchParams.tab === 'history'}>
            <div class="flex-5 border-l pt-2">
              <RecordHistory tableName="argument" id={props.id} />
            </div>
          </Match>
          <Match when={searchParams.tab === 'delete'}>
            <div class="flex-5 border-l pt-2">
              <DeleteRecord tableName="argument" id={props.id} />
            </div>
          </Match>
          <Match when={
            (!searchParams.tab || searchParams.tab === 'analysis')
            && argumentTypeId()
          }>
            <div class="flex-3 border-l">
              <Show when={statementType() === 'prescriptive'}>
                <div class="h-full flex flex-col">
                  <Premises id={props.id} />
                  <div class="flex-1 border-t pt-2">
                    <Aggregate
                      tableName="argument"
                      id={props.id}
                      aggregateName="directive_consequences"
                    />
                  </div>
                </div>
              </Show>
              <Show when={statementType() !== 'prescriptive'}>
                <Premises id={props.id} />
              </Show>
            </div>
            <HowTo
              id={props.id}
              statementType={statementType()}
              record={record()}
            />
          </Match>
        </Switch>
      </section >
    </>
  )
}