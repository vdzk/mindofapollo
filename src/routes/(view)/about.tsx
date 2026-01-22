import { AboutSection } from "~/views/About/AboutSection"
import { QuestionGroups } from "~/views/About/QuestionGroups"


export default function About() {
  return (
    <main class="flex-1 min-h-0 flex overflow-hidden">
      <QuestionGroups
        visitedSections={[]}
      />
      <AboutSection
        visitedSections={[]}
      />
    </main>
  )
}