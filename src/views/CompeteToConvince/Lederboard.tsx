import { createAsync } from "@solidjs/router";
import { For } from "solid-js";
import { listLeaderboardItems } from "~/api/list/leaderboardItems";
import { Link } from "~/components/Link";
import { Subtitle } from "~/components/PageTitle";
import { tableStyle } from "~/components/table";

export default function Leaderboard() {
  const leaderboardItems = createAsync(() => listLeaderboardItems())
  return (
    <div class="pt-2 mx-auto">
      <div class="py-3">
        <Subtitle>🏆 Leaderboard</Subtitle>
      </div>
      <table class="mb-4">
        <thead>
          <tr class={tableStyle.tHeadTr}>
            <th class={tableStyle.th + ' pl-2'}>#</th>
            <th
              class={tableStyle.th}
              title="CC = competition credits"
            >CC</th>
            <th class={tableStyle.th}>Name</th>
          </tr>
        </thead>
        <tbody>
          <For each={leaderboardItems()}>
            {(person, index) => (
              <tr>
                <td class={tableStyle.td + ' pl-2 font-bold'}>
                  {index() + 1}
                </td>
                <td class={tableStyle.td}>
                  {person.competition_credits}
                </td>
                <td class={tableStyle.td}>
                  <Link
                    route="show-record"
                    params={{
                      tableName: 'person',
                      id: person.id,
                      "person-section": 'activity'
                    }}
                    label={person.name}
                  />
                </td>
              </tr>
            )}
          </For>
        </tbody>
      </table>
    </div>
  )
}