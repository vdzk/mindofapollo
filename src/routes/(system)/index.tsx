import { useNavigate } from "@solidjs/router";
import { createEffect, useContext } from "solid-js";
import { SessionContext } from "~/SessionContext";

export default function Home() {
  const session = useContext(SessionContext)
  const navigate = useNavigate()
  createEffect(() => {
    if (session) {
      if (session.user.state === 'ready') {
        navigate(
          session.loggedIn() ? '/home-page' : '/login',
          { replace: true }
        )
      }
    }
  })
}
