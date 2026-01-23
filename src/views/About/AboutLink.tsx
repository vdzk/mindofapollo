import { Component } from "solid-js"
import { Link } from "~/components/Link"

export const AboutLink: Component<{
  label: string
  question?: string
  selected: boolean
  large?: boolean
}> = props => {
  return (
    <Link
      label={(
        <div
          class="block px-2 py-0.5"
          classList={{
            'bg-green-300': props.selected,
            'hover:bg-orange-200': !props.selected,
            'text-lg py-1': props.large
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