import { useContext } from "solid-js"
import { SessionContext } from "~/SessionContext"
import { AuthRole } from "~/types"

export const useBelongsTo = (authRoles: string[]) => {
  const session = useContext(SessionContext)
  const userAuthRole: AuthRole = session?.userSession()?.authRole ?? 'anonymous'
  if (userAuthRole === 'admin') return true
  return authRoles.includes(userAuthRole)
}