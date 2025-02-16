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
            route="confirm-or-challenge"
            label="Confirm or challenge statements"
            type="button"
          />
        </div>
        <div>
          <Link
            route="judge-argument"
            label="Judge arguments"
            type="button"
          />
        </div>
        <div>
          <Link
            route="judge-correlations"
            label="Judge correlations"
            type="button"
          />
        </div>
        <div>
          <Link
            route="weigh-argument"
            label="Weigh arguments"
            type="button"
          />
        </div>
        <div>
          <Link
            route="vote-change-proposal"
            label="Vote on change proposals"
            type="button"
          />
        </div>
      </div>
    </main>
  )
}