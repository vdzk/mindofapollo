import { Title } from "@solidjs/meta"
import { PageTitle } from "~/components/PageTitle"
import { Link } from "~/components/Link"

export default function ListSandboxes() {
  return (
    <main>
      <Title>Sandboxes</Title>
      <PageTitle>Sandboxes</PageTitle>
      <div class="px-2">
        <Link 
          route="confidence-calculator" 
          label="Confidence calculator" 
          type="button" 
        />
      </div>
    </main>
  )
}