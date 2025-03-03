import { logout } from "~/server-only/session"

export const doLogout = async () => {
  "use server"
  logout()
}