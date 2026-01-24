import { Component, createEffect } from "solid-js"
import { Link } from "~/components/Link"

export const AboutLink: Component<{
  label: string
  question?: string
  selected: boolean
  large?: boolean
}> = props => {
  let el!: HTMLDivElement

  createEffect(() => {
    if (props.selected) {
      el.scrollIntoView({
        block: "nearest",
        behavior: "smooth"
      })
    }
  })

  return (
    <Link
      label={(
        <div
          ref={el}
          class="block px-2 py-0.5"
          classList={{
            "bg-green-300": props.selected,
            "hover:bg-orange-200": !props.selected,
            "text-lg py-1": props.large
          }}
        >
          {props.label}
        </div>
      )}
      route="about"
      params={{ q: props.question }}
      type="unstyled"
    />
  )
}
