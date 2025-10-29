import { Title } from "@solidjs/meta"
import { createAsync, useNavigate, useSearchParams } from "@solidjs/router"
import { createStore } from "solid-js/store"
import { FormField } from "~/components/form/FormField"
import { PageTitle } from "~/components/PageTitle"
import { join } from "~/api/execute/join"
import { Button } from "~/components/buttons"
import { login } from "~/api/execute/login"
import { SessionContext } from "~/SessionContext"
import { createSignal, Show, useContext } from "solid-js"
import { defaultLanguage, Language } from "~/translation"
import { etv } from "~/client-only/util"
import { isValidInvite } from "~/api/is/validInvite"
import { openRegistration } from "~/constant"

interface Join {
  code: string
}

export default function Join() {
  const session = useContext(SessionContext)
  const navigate = useNavigate()
  const [sp] = useSearchParams() as unknown as [Join]
  const [diff, setDiff] = createStore({ name: '', language: defaultLanguage })
  const [email, setEmail] = createSignal('')
  const [password, setPassword] = createSignal('')
  const _isValidInvite = openRegistration
    ? () => true
    : createAsync(() => isValidInvite(sp.code))

  const onSubmit = async () => {
    const userId = await join(diff.name, email().trim(), password(), diff.language as Language, sp.code)
    if (!userId) {
      console.error('join failed')
      return
    }
    await login(email().trim(), password())
    session?.refetch()
    navigate('/home-page')
  }

  return (
    <main>
      <Title>Join</Title>
      <PageTitle>Join</PageTitle>
      <div class="px-2 max-w-(--breakpoint-md)">
        <Show when={_isValidInvite()} fallback={<div>Invalid invite</div>}>
          <FormField
            tableName="person"
            colName="name"
            {...{ diff, setDiff }}
          />
          <FormField
            tableName="person"
            colName="language"
            {...{ diff, setDiff }}
          />
          <div class="font-bold">Email</div>
          <div>
            <input
              type="email"
              value={email()}
              onInput={etv(setEmail)}
              onChange={etv(setEmail)}
              class="border rounded-md pl-1 w-full mb-2"
            />
          </div>
          <div class="font-bold">Password</div>
          <div>
            <input
              type="password"
              value={password()}
              onInput={etv(setPassword)}
              onChange={etv(setPassword)}
              class="border rounded-md pl-1 w-full mb-2"
            />
          </div>
          <Button
            label="Submit"
            onClick={onSubmit}
            disabled={!diff.name || !email().trim() || !password()}
          />
        </Show>
      </div>
    </main>
  )
}
