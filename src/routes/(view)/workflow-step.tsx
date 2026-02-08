import { Title } from "@solidjs/meta"
import { useNavigate } from "@solidjs/router"
import { createSignal, Show, useContext } from "solid-js"
import { useSafeParams } from "~/client-only/util"
import { Button } from "~/components/buttons"
import { Form } from "~/components/form/Form"
import { Link } from "~/components/Link"
import { H2, PageTitle } from "~/components/PageTitle"
import { SessionContext } from "~/SessionContext"
import { workflowSteps } from "~/workflow"

export default function WorkflowStep() {
  const sp = useSafeParams<{stepName: string}>(['stepName'])
  const session = useContext(SessionContext)
  const step = () => workflowSteps[sp().stepName]
  const navigate = useNavigate()
  const [saved, setSaved] = createSignal(false)
  const onFormExit = (savedId?: number) => {
    if (savedId) {
      setSaved(true)
    } else {
      navigate('/workflow')
    }
  }
  return (
    <main class="max-w-lg mx-auto mt-3">
      <Title>{step().title}</Title>
      <PageTitle>{step().title}</PageTitle>
      <Show when={step().preface}>
        <H2>Preface</H2>
        <div class="px-2">
          {step().preface}
        </div>
      </Show>
      <H2>Instructions</H2>
      <div class="px-2">
        {step().instructions}
      </div>
      <Show when={saved()}>
        <H2>Saved</H2>
        <div class='px-2 flex gap-2'>
          <Button
            label="Do one more"
            onClick={() => setSaved(false)}
          />
          <Link
            route="workflow"
            type="button"
          >
            Finish
          </Link>
        </div>
      </Show>
      <Show when={!saved()}>
        <div class="h-2"/>
        <Form
          tableName={step().outputTable}
          exitSettings={{onExit: onFormExit }}
        />
      </Show>
    </main>
  )
}