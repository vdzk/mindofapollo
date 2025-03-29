import { Title } from "@solidjs/meta"
import { Link } from "~/components/Link"
import { PageTitle } from "~/components/PageTitle"

export default function ListTasks() {
  return (
    <main>
      <Title>Tasks</Title>
      <PageTitle>Tasks</PageTitle>
      <div class="px-2">
        <div>
          <Link
            route="vote-change-proposal"
            label="Vote on change proposals"
          />
        </div>
      </div>
    </main>
  )
}