import { useNavigate } from "@solidjs/router";
import { createEffect, useContext } from "solid-js";
import { SessionContext } from "~/SessionContext";

export default function Home() {
  const session = useContext(SessionContext)
  const navigate = useNavigate()
  createEffect(() => {
    if (session) {
      if (session.userSession.state === 'ready') {
        navigate(
          session.userSession()?.authenticated ? '/home-page' : '/login',
          { replace: true }
        )
      }
    }
  })
}
