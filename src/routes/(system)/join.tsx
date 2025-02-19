import { Title } from "@solidjs/meta"
import { useNavigate, useSearchParams } from "@solidjs/router"
import { createStore } from "solid-js/store"
import { FormField } from "~/components/FormField"
import { PageTitle } from "~/components/PageTitle"
import { join } from "~/api/system/join"
import { Button } from "~/components/buttons"
import { login } from "~/api/system/login"

interface Join {
  code: string
}

export default function Join() {
  const navigate = useNavigate()
  const [sp] = useSearchParams() as unknown as [Join]
  const [diff, setDiff] = createStore({ name: '' })
  const onSubmit = async () => {
    const userId = await join(diff.name, sp.code)
    await login(userId)
    // TODO: avoid redirect to home screen
    navigate("/home-page");
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
        <Button
          label="Submit"
          onClick={onSubmit}
        />
      </div>
    </main>
  )
}
