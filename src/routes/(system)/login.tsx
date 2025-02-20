import { Title } from "@solidjs/meta"
import { createAsync, useNavigate } from "@solidjs/router"
import { createSignal, For, useContext } from "solid-js"
import { SessionContext } from "~/SessionContext"
import { login } from "~/api/execute/login"
import { listRecords } from "~/api/list/records"
import { Button } from "~/components/buttons"

export default function Login() {
  const session = useContext(SessionContext)
  const [userId, setUserId] = createSignal<string>('')
  const persons = createAsync(() => listRecords('person'))
  const navigate = useNavigate();

  const submit = async () => {
    const userSession = await login(parseInt(userId()))
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
          <select onChange={(e) => setUserId(e.currentTarget.value)}>
            <option selected value="" class="text-gray-500"></option>
            <For each={persons()}>
              {(person) => <option value={person.id}>{person.name}</option>}
            </For>
          </select>
          <div class="mt-2 text-center">
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
