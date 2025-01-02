import { createAsync } from "@solidjs/router";
import { createSignal } from "solid-js";
import { getUserDirectives } from "~/server/userDirectives";

export default function ShowDirective() {
  const [directiveId, setDirectiveId] = createSignal<number>()
  const data = createAsync(getUserDirectives)

  return (
    <pre>
      {JSON.stringify(data(), null, 2)}
    </pre>
  )
}