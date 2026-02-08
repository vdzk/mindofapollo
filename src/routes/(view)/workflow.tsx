import { Title } from "@solidjs/meta";
import { For } from "solid-js";
import { Link } from "~/components/Link";
import { PageTitle, Subtitle } from "~/components/PageTitle";
import { workflowSteps } from "~/workflow";

export default function Workflow() {
  return (
    <main>
      <Title>Workflow</Title>
      <PageTitle>Workflow</PageTitle>
      <div class="px-2 max-w-xl pb-2">
        Mind of Apollo is designed for a very thorough investigation and justification of claims. Building a strong line of argumentation requires multiple skills such as researching the topic, planning the argument and searching for evidence. It can be a daunting task for newcomers.
        <div class="h-2"/>
        The workflow of building out argumentation can be broken down into a series of manageable steps listed below. You can participate in this workflow and practice your skills by selecting a step and following instructions.
      </div>
      <Subtitle>
        Select a step
      </Subtitle>
      <For each={Object.entries(workflowSteps)}>
        {([stepName, step]) => (
          <Link
            type="unstyled"
            class="px-2 hover:bg-orange-200 block w-full py-1"
            route="workflow-step"
            params={{ stepName }}
          >
            {step.title}
          </Link>
        )}
      </For>
    </main>
  )
}