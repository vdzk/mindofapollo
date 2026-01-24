import { createMediaQuery } from "@solid-primitives/media"
import { useSearchParams } from "@solidjs/router"
import { Match, Switch } from "solid-js"
import { createStore } from "solid-js/store"
import { Link } from "~/components/Link"
import { AboutSection } from "~/views/About/AboutSection"
import { QuestionGroups } from "~/views/About/QuestionGroups"


export default function About() {
  const [questions, setQuestions] = createStore<Partial<Record<'group' | 'section' | 'related', string[]>>>({})

  const onGroupDataLoad = (groupQuestions: string[]) => {
    setQuestions({ group: groupQuestions })
    validateData()
  }

  const onSectionDataLoad = (
    sectionQuestions: string[],
    relatedQuestions: string[]
  ) => {
    setQuestions({
      section: sectionQuestions,
      related: relatedQuestions
    })
    validateData()
  }

  const validateData = () => {
    if (questions.group && questions.section && questions.related) {
      const flawedQuestions = {
        unrelated: new Set(questions.section),
        ungrouped: new Set(questions.section),
        voidRelation: new Set(questions.related),
        voidGrouping: new Set(questions.group)
      }
      for (const groupQuestion of questions.group) {
        if (questions.section.includes(groupQuestion)) {
          flawedQuestions.ungrouped.delete(groupQuestion)
          flawedQuestions.voidGrouping.delete(groupQuestion)
        }
      }
      for (const relatedQuestion of questions.related) {
        if (questions.section.includes(relatedQuestion)) {
          flawedQuestions.unrelated.delete(relatedQuestion)
          flawedQuestions.voidRelation.delete(relatedQuestion)
        }
      }
      for (const [flaw, questions] of Object.entries(flawedQuestions)) {
        if (questions.size > 0) {
          console.log(flaw, questions)
        }
      }
    }
  }

  const stackView = createMediaQuery('(max-width: 859px)')
  const [searchParams] = useSearchParams()

  return (
    <Switch>
      <Match when={stackView() && searchParams.all}>
        <main class="flex-1 min-h-0 flex overflow-hidden flex-col overflow-y-auto">
          <QuestionGroups onGroupDataLoad={onGroupDataLoad} stackView />
        </main>
      </Match>
      <Match when={stackView() && !searchParams.all}>
        <AboutSection onSectionDataLoad={onSectionDataLoad} stackView />
        <div class="px-2 py-2 border-t">
          <Link
            label="All questions"
            route="about"
            params={{
              all: true,
              q: searchParams.q
            }}
            type="heroButton"
          />
        </div>
      </Match>
      <Match when>
        <main class="flex-1 min-h-0 flex">
          <QuestionGroups onGroupDataLoad={onGroupDataLoad} />
          <AboutSection onSectionDataLoad={onSectionDataLoad} />
        </main>
      </Match>
    </Switch>
  )
}