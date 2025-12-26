import { useSafeParams } from "~/client-only/util"
import { Statement } from "~/views/Statement/Statement"

export default function StatementRoute() {
  const sp = useSafeParams<{ id: number }>(['id'])
  return <Statement id={sp().id} />
}