import { Title } from "@solidjs/meta"
import { createAsync, useNavigate } from "@solidjs/router"
import { createSignal, For, useContext } from "solid-js"
import { SessionContext } from "~/SessionContext"
import { login } from "~/api/execute/login"
import { listRecords } from "~/api/list/records"
import { etv } from "~/client-only/util"
import { Button } from "~/components/buttons"

export default function Login() {
  const session = useContext(SessionContext)
  const [userId, setUserId] = createSignal<string>('')
  const [password, setPassword] = createSignal<string>('')
  const persons = createAsync(() => listRecords('person'))
  const navigate = useNavigate();

  const submit = async () => {
    const userSession = await login(parseInt(userId()), password())
    if (userSession) {
      session!.mutate(() => userSession)
      navigate("/home-page");
    }
  }

  return (
    <main class="flex items-center justify-center h-screen">
      <Title>Login</Title>
      <div>
        <div class="text-2xl text-center">Apollo</div>
        <div class="text-sm text-center mb-3 -mt-1">(closed beta)</div>
        <div>
          <label>User:</label>
          <br/>
          <select
            class="border rounded-sm w-full"
            onChange={(e) => setUserId(e.currentTarget.value)}
          >
            <option selected value="" class="text-gray-500"></option>
            <For each={persons()}>
              {(person) => <option value={person.id}>{person.name}</option>}
            </For>
          </select>
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
              tooltip={!userId() ? "Please select a user" : undefined}
              disabled={!userId()}
            />
          </div>
        </div>
      </div>
    </main>
  )
}
