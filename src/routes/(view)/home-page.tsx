import { Title } from "@solidjs/meta"
import UserSubscriptions from "~/views/HomePage/UserSubscriptions"
import Statements from "~/views/HomePage/Statements"
import ThingsToDoAndOther from "~/views/HomePage/ThingsToDoAndOther"
import { SessionContext } from "~/SessionContext"
import { Show, useContext } from "solid-js"
import { HeroText } from "~/components/PageTitle"

export default function HomePage() {
  const session = useContext(SessionContext)
  return (
    <main class="flex-1 flex flex-col">
      <Title>Home Page</Title>
      <HeroText>Growing a collective rational reasoner</HeroText>
      <div class="flex flex-1 flex-col lg:flex-row">
        <Statements />
        <Show when={session?.userSession?.()?.authenticated}>
          <UserSubscriptions />
        </Show>
        <ThingsToDoAndOther />
      </div>
    </main>
  )
}
