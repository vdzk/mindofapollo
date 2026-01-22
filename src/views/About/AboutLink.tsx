import { Component } from "solid-js"
import { Link } from "~/components/Link"

export const AboutLink: Component<{
  label: string
  question?: string
  selected: boolean
}> = props => {
  return (
    <Link
      label={(
        <div
          class="block px-2 py-0.5 hover:bg-orange-200 text-lg"
          classList={{
            'bg-yellow-600 text-white hover:bg-yellow-600': props.selected
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