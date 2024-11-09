import { Title } from "@solidjs/meta";
import { createAsync, useNavigate } from "@solidjs/router";
import { createSignal, For, useContext } from "solid-js";
import { listRecords } from "~/server/select.db";
import { login } from "~/server/session";
import { SessionContext } from "~/SessionContext";

export default function Login() {
  const session = useContext(SessionContext)
  const [userId, setUserId] = createSignal<string>('')
  const persons = createAsync(() => listRecords('person'))
  const navigate = useNavigate();

  const submit = async () => {
    await login(parseInt(userId()))
    session!.refetch()
    navigate("/list-records?tableName=tag");
  }

  return (
    <main>
      <Title>Login</Title>
      <select onChange={(e) => setUserId(e.currentTarget.value)}>
        <option selected></option>
        <For each={persons()}>
          {(person) => <option value={person.id}>{person.name}</option>}
        </For>
      </select>
      <br />
      <button onClick={submit} disabled={!userId()}>Login</button>
    </main>
  )
}