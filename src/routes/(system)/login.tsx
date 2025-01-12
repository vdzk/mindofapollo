import { Title } from "@solidjs/meta"
import { createAsync, useNavigate } from "@solidjs/router"
import { createSignal, For, useContext } from "solid-js"
import { listRecords } from "~/server/select.db"
import { login } from "~/server/session"
import { SessionContext } from "~/SessionContext"

export default function Login() {
  const session = useContext(SessionContext)
  const [userId, setUserId] = createSignal<string>('')
  const persons = createAsync(() => listRecords('person'))
  const navigate = useNavigate();

  const submit = async () => {
    await login(parseInt(userId()))
    session!.refetch()
    navigate("/home-page");
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
            <button
              class="text-sky-900 disabled:text-gray-500"
              onClick={submit}
              disabled={!userId()}
            >
              [ Login ]
            </button>
          </div>
        </div>
      </div>
    </main>
  )
}