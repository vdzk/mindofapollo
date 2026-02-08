import { Title } from "@solidjs/meta"
import { createAsync, useNavigate, useSearchParams } from "@solidjs/router"
import { createStore } from "solid-js/store"
import { FormField } from "~/components/form/FormField"
import { PageTitle, Subtitle } from "~/components/PageTitle"
import { join } from "~/api/execute/join"
import { Button } from "~/components/buttons"
import { login } from "~/api/execute/login"
import { SessionContext } from "~/SessionContext"
import { createSignal, Show, useContext } from "solid-js"
import { defaultLanguage, Language } from "~/translation"
import { etv } from "~/client-only/util"
import { isValidInvite } from "~/api/is/validInvite"
import { openRegistration } from "~/constant"
import { linkStyles } from "~/components/Link"

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
  const [registering, setRegistering] = createSignal(false)
  const _isValidInvite = openRegistration
    ? () => true
    : createAsync(() => isValidInvite(sp.code))

  const onSubmit = async () => {
    setRegistering(true)
    //If user doesn't want to provide their email, identify them buy their username
    const loginEmail = email().trim() || diff.name
    const userId = await join(diff.name, loginEmail, password(), diff.language as Language, sp.code)
    if (!userId) {
      console.error('join failed')
    } else {
      await login(loginEmail, password())
      session?.refetch()
      navigate('/home-page')
    }
    setRegistering(false)
  }

  return (
    <main class="flex-1 flex items-center justify-center">
      <Title>Register</Title>
      <div class="border-2 rounded border-gray-600">
        <div class="border-b-2 border-gray-600 px-1">
          <Subtitle>
            Register
          </Subtitle>
        </div>
        <div class="pt-3 px-3">
          <Show when={_isValidInvite()} fallback={<div>Invalid invite</div>}>
            <FormField
              tableName="person"
              colName="name"
              label="username"
              {...{ diff, setDiff }}
            />
            <div class="font-bold">Email (optional)</div>
            <div>
              <input
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
          </Show>
        </div>
        <div class="py-4 mt-4 text-center border-t-2 border-gray-600">
          <Button
            label={registering() ? 'Registering...' : "Register"}
            class={linkStyles.heroButton}
            onClick={onSubmit}
            disabled={!diff.name || !password() || registering()}
          />
        </div>
      </div>
    </main>
  )
}
