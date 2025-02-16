import { Title } from "@solidjs/meta"
import { PageTitle } from "~/components/PageTitle"

export default function ListSandboxes() {
  return (
    <main>
      <Title>Sandboxes</Title>
      <PageTitle>Sandboxes</PageTitle>
      <div class="px-2">
        <a href="/confidence-calculator" class="text-sky-800">
          [ Confidence calculator ]
        </a>
      </div>
    </main>
  )
}