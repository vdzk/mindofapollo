import { Title } from "@solidjs/meta"
import { useNavigate } from "@solidjs/router"
import { createSignal, useContext } from "solid-js"
import { SessionContext } from "~/SessionContext"
import { login } from "~/api/execute/login"
import { etv } from "~/client-only/util"
import { Button } from "~/components/buttons"
import { openRegistration } from "~/constant"

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
    <main class="flex items-center justify-center h-screen">
      <Title>Login</Title>
      <div>
        <div>
          <label>Email:</label>
          <br/>
          <input
            type="email"
            onChange={etv(setEmail)}
            value={email()}
            class="border rounded-sm pl-1 w-full"
          />
          <br/>
          <label>Password:</label>
          <br/>
          <input
            type="password"
            onChange={etv(setPassword)}
            value={password()}
            class="border rounded-sm pl-1 w-full"
          />
          <div class="mt-6 text-center">
            <Button
              label="Login"
              onClick={submit}
              disabled={email().trim() === '' || password() === ''}
            />
          </div>
        </div>
      </div>
    </main>
  )
}
