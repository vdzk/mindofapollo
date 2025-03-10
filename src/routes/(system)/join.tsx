import { Title } from "@solidjs/meta"
import { useNavigate, useSearchParams } from "@solidjs/router"
import { createStore } from "solid-js/store"
import { FormField } from "~/components/form/FormField"
import { PageTitle } from "~/components/PageTitle"
import { join } from "~/api/execute/join"
import { Button } from "~/components/buttons"
import { login } from "~/api/execute/login"
import { SessionContext } from "~/SessionContext"
import { useContext } from "solid-js"
import { Language } from "~/translation"

interface Join {
  code: string
}

export default function Join() {
  const session = useContext(SessionContext)
  const navigate = useNavigate()
  const [sp] = useSearchParams() as unknown as [Join]
  const [diff, setDiff] = createStore({ name: '', language: 'english' })
  const onSubmit = async () => {
    const userId = await join(diff.name, diff.language as Language, sp.code)
    if (!userId) {
      console.error('join failed')
      return
    }
    await login(userId)
    session?.refetch()
    navigate('/home-page')
  }

  return (
    <main>
      <Title>Join</Title>
      <PageTitle>
        Join
      </PageTitle>
      <div class="px-2 max-w-screen-md">
        <FormField
          tableName="person"
          colName="name"
          {...{diff, setDiff}}
        />
        <FormField
          tableName="person"
          colName="language"
          {...{diff, setDiff}}
        />
        <Button
          label="Submit"
          onClick={onSubmit}
        />
      </div>
    </main>
  )
}
