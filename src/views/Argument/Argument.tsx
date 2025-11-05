import { createAsync, revalidate, useSearchParams } from "@solidjs/router"
import { Component, createSignal, Match, Show, Switch } from "solid-js"
import { ArgumentDetails } from "./ArgumentDetails"
import { getOneExtRecordByIdCache, listForeignRecordsCache } from "~/client-only/query"
import { ArgumentJudgement } from "./ArgumentJudgement"
import { H2, Subtitle } from "~/components/PageTitle"
import { Aggregate } from "~/components/aggregate/Aggregate"
import { StatementType } from "~/tables/statement/statement_type"
import { CriticalQuestions } from "./CriticalQuestions"
import { JudgeExamples } from "./JudgementExamples"
import { Form } from "~/components/form/Form"
import { getOneRecordByChildId } from "~/api/getOne/recordByChildId"
import { Button } from "~/components/buttons"
import { getToggleLabel } from "~/utils/string"
import { ConfidenceCriteria } from "./ConfidenceCriteria"
import { MasterDetail } from "~/components/MasterDetail"
import { RecordHistory } from "~/components/RecordHistory"
import { DeleteRecord } from "~/components/form/DeleteRecord"

export const Argument: Component<{ id: number }> = props => {
  const record = createAsync(() => getOneExtRecordByIdCache('argument', props.id, true))
  const statement = createAsync(async () => getOneRecordByChildId('statement', 'argument', props.id))
  const statementType = () => statement()?.statement_type_name as StatementType | undefined

  const [searchParams, setSearchParams] = useSearchParams()
  const [showHowToJudge, setShowHowToJudge] = createSignal(false)
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
          />
          <MasterDetail
            horizontal
            options={tabOptions()}
            selectedId={searchParams.tab || 'analysis'}
            onChange={id => setSearchParams({ tab: id })}
            optionsClass="pt-2"
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
            <CriticalQuestions
              argumentTypeId={argumentTypeId()!}
              argumentId={props.id}
            />
            <div class="border-l flex-3 min-w-0">
              <div class="flex justify-between border-b">
                <Subtitle>Judgement</Subtitle>
                <Button
                  label={getToggleLabel(showHowToJudge(), 'instructions')}
                  onClick={() => setShowHowToJudge(x => !x)}
                  class="self-center mx-2"
                />
              </div>
              <Show when={
                showHowToJudge()
                && statementType() === 'descriptive'
              }>
                <H2>Confidence crieria</H2>
                <div class="p-2 pt-0 border-b">
                  0% = this argument doesn't change confidence in the claim
                  <br />
                  100% = this argument gives me absolute confidence in the claim
                </div>
                <ConfidenceCriteria argumentTypeId={argumentTypeId()!} />
                <JudgeExamples argumentTypeId={argumentTypeId()!} />
              </Show>
              <Show when={
                showHowToJudge()
                && statementType() !== 'descriptive'
              }>
                <div class="p-2">
                  There are no instructions for this type of argument yet.
                </div>
              </Show>
              <Show when={
                !showHowToJudge()
                && statementType() === 'prescriptive'
              }>
                <div class="h-2" />
                <Aggregate
                  tableName="argument"
                  id={props.id}
                  aggregateName="directive_consequences"
                />
              </Show>
              <Show when={
                !showHowToJudge() && statementType()
                && (statementType() !== 'prescriptive')
              }>
                <ArgumentJudgement
                  argumentId={props.id}
                  argumentTypeId={argumentTypeId()!}
                  statementType={
                    statementType() as Exclude<
                      StatementType, 'prescriptive'
                    >
                  }
                />
              </Show>
            </div>
          </Match>
        </Switch>
      </section >
    </>
  )
}