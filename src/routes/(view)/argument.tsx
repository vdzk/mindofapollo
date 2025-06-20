
import { Argument } from "~/views/Statement/Argument"
import { useSafeParams } from "~/client-only/util"

export default function ArgumentPage() {
  const sp = useSafeParams<{ id: number }>(['id'])

  return (
    <Argument id={sp().id} />
  )
}