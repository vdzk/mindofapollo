import { createSignal, ParentComponent, Show } from "solid-js"

export const Collapse: ParentComponent<{
  label: string
}> = props => {
  const [open, setOpen] = createSignal(false)

  return (
    <section class="pb-2">
      <div>
        <span class="px-2 font-bold">{props.label}</span>
        <button
          onClick={() => setOpen(val => !val)}
          class="text-sky-800"
          title="open / close"
        >
          [ {open() ? 'Λ' : 'V'} ]
        </button>
      </div>
      <Show when={open()}>
        {props.children}
      </Show>
    </section>
  )
}