import { Component, createMemo } from "solid-js"
import { marked } from "marked"
import DOMPurify from "isomorphic-dompurify"

marked.setOptions({
  gfm: true,
  breaks: true
})

export const Markdown: Component<{
  mdText: string
  class?: string
}> = props => {
  const html = createMemo(() => {
    const raw = marked.parse(props.mdText) as string
    return DOMPurify.sanitize(raw)
  })

  return (
    <div
      class={`
        prose text-black max-w-none
        [&_img]:rounded [&_img]:my-0
        ${props.class ?? ""}
      `}
      innerHTML={html()}
    />
  )
}
