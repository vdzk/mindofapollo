import { useContext } from "solid-js"
import { SessionContext } from "~/SessionContext"

export const useBelongsTo = (authRoles: string[]) => {
  const session = useContext(SessionContext)
  const userAuthRole = session?.userSession()?.authRole ?? 'anon'
  if (userAuthRole === 'admin') return true
  return authRoles.includes(userAuthRole)
}