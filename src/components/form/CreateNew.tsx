import { Component, createSignal, Show } from "solid-js"
import { Button } from "../buttons"
import { nestedBgColor } from "../NestPanel"
import { Subtitle } from "../PageTitle"
import { humanCase } from "~/utils/string"
import { Form } from "./Form"

export const CreateNew: Component<{
  tableName: string,
  onFormExit: (savedId?: number) => Promise<void>
  formDepth?: number
}> = (props) => {
  const [showForm, setShowForm] = createSignal(false)
  const onExit = async (savedId?: number) => {
    setShowForm(false)
    await props.onFormExit(savedId)
  }
  return (
    <>
      <Show when={!showForm()}>
        <div class="pb-1">
          <Button
            label="Create new"
            onClick={() => setShowForm(true)}
          />
        </div>
      </Show>
      <Show when={showForm()}>
        <div
          class="rounded-md my-2 p-2"
          classList={{ [nestedBgColor(props.formDepth)]: true }}
        >
          <Subtitle>New {humanCase(props.tableName)}</Subtitle>
          <Form
            tableName={props.tableName}
            exitSettings={{ onExit }}
            depth={(props.formDepth ?? 0) + 1}
          />
        </div>
      </Show>
    </>
  )
}