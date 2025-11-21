import { Title } from "@solidjs/meta"
import { HeroText } from "~/components/PageTitle"
import { Bets } from "~/views/CompeteToConvince/Bets"
import Leaderboard from "~/views/CompeteToConvince/Lederboard"

export default function CompeteToConvince() {
  return (
    <main>
      <Title>Compete to convince Apollo</Title>
      <HeroText>Compete to convince Apollo</HeroText>
      <div class="flex gap-4">
        <Bets/>
        <Leaderboard />
      </div>
    </main>
  )
}