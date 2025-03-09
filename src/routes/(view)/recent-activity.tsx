import { Title } from "@solidjs/meta"
import { createAsync, query } from "@solidjs/router"
import { listRecentActivity } from "~/api/list/recentActivity"
import { ActivityList } from "~/components/ActivityList"
import { PageTitle } from "~/components/PageTitle"

const getRecentActivityQuery = query(listRecentActivity, 'getRecentActivity')

export default function RecentActivity() {
  const activity = createAsync(() => getRecentActivityQuery())
  
  return (
    <main>
      <Title>Recent Activity</Title>
      <PageTitle>Recent Activity</PageTitle>
      <ActivityList activity={activity()} goToRecord />
    </main>
  )
}