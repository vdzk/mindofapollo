import { PageTitle } from "~/components/PageTitle";

export default function Tasks() {
  return (
    <main>
      <PageTitle>Tasks</PageTitle>
      <div class="pl-2">
        <a class="text-sky-800" href="/confirm-or-challenge">
          [ Confirm or Challenge ]
        </a>
      </div>
      <div class="pl-2">
        <a class="text-sky-800" href="/judge-argument">
          [ Judge argument ]
        </a>
      </div>
      <div class="pl-2">
        <a class="text-sky-800" href="/judge-correlations">
          [ Judge correlations ]
        </a>
      </div>
      <div class="pl-2">
        <a class="text-sky-800" href="/weigh-argument">
          [ Weigh argument ]
        </a>
      </div>
      <div class="pl-2">
        <a class="text-sky-800" href="/vote-change-proposal">
          [ Vote on a change proposal ]
        </a>
      </div>
    </main>
  )
}