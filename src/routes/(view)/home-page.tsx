import { Title } from "@solidjs/meta"
import UserSubscriptions from "~/views/HomePage/UserSubscriptions"
import Statements from "~/views/HomePage/Statements"
import ThingsToDoAndOther from "~/views/HomePage/ThingsToDoAndOther"

export default function HomePage() {
  return (
    <main class="flex-1 flex flex-col">
      <Title>Home Page</Title>
      <div class="border-b text-center text-2xl font-bold py-6 text-gray-800 uppercase [word-spacing:6px]">
        Growing wise and transparent collaborative intelligence
      </div>
      <div class="flex flex-1">
        <Statements />
        <UserSubscriptions />
        <ThingsToDoAndOther />
      </div>
    </main>
  )
}
