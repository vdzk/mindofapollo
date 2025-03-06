import { Title } from "@solidjs/meta"
import UserSubscriptions from "~/views/HomePage/UserSubscriptions"
import StatementsAndDirectives from "~/views/HomePage/StatementsAndDirectives"
import ThingsToDoAndOther from "~/views/HomePage/ThingsToDoAndOther"

export default function HomePage() {
  return (
    <main>
      <Title>Home Page</Title>
      <div class="h-3" />
      <UserSubscriptions />
      <StatementsAndDirectives />
      <ThingsToDoAndOther />
    </main>
  )
}
