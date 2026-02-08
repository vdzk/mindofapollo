import { Title } from "@solidjs/meta"
import { useNavigate } from "@solidjs/router"
import { createSignal, useContext } from "solid-js"
import { SessionContext } from "~/SessionContext"
import { login } from "~/api/execute/login"
import { etv } from "~/client-only/util"
import { Link, linkStyles } from "~/components/Link"
import { H2, Subtitle } from "~/components/PageTitle"
import { Button } from "~/components/buttons"

export default function Login() {
  const session = useContext(SessionContext)
  const [email, setEmail] = createSignal<string>('')
  const [password, setPassword] = createSignal<string>('')
  const navigate = useNavigate();

  const submit = async () => {
    const userSession = await login(email().trim(), password())
    if (userSession) {
      session!.mutate(() => userSession)
      navigate("/home-page");
    }
  }

  return (
    <main class="flex-1 flex items-center justify-center">
      <Title>Login</Title>
      <div class="border-2 rounded border-gray-600">
        <div class="border-b-2 border-gray-600 px-1">
          <Subtitle>
            Login
          </Subtitle>
        </div>
        <div class="pt-3 px-3">
          <label class="font-bold">Email (or username)</label>
          <br />
          <input
            onChange={etv(setEmail)}
            value={email()}
            class="border rounded-sm pl-1 w-full mb-2"
          />
          <br />
          <label class="font-bold">Password</label>
          <br />
          <input
            type="password"
            onChange={etv(setPassword)}
            value={password()}
            class="border rounded-sm pl-1 w-full"
          />
        </div>
        <div class="py-4 mt-4 text-center border-t-2 border-gray-600">
          <Button
            label="Login"
            class={linkStyles.heroButton}
            onClick={submit}
            disabled={email().trim() === '' || password() === ''}
          />
        </div>
      </div>
    </main>
  )
}
