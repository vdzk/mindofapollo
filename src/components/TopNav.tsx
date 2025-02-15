import { createAsync, useNavigate } from "@solidjs/router";
import { Component, Match, Show, Switch, useContext } from "solid-js";
import { logout } from "~/api/shared/session";
import { SessionContext } from "~/SessionContext";
import { useIsPublicRoute } from "~/client-only/util";
import { getRecordById } from "~/api/shared/select";

export const TopNav: Component = () => {
  const session = useContext(SessionContext)
  const navigate = useNavigate()
  const isPublicRoute = useIsPublicRoute()
  const user = createAsync(async () => session?.userSession()
    ? getRecordById('person', session!.userSession()!.userId)
    : undefined
  )

  const onLogout = async () => {
    await logout()
    session!.refetch()
    navigate('/')
  }

  return (
    <Show when={!isPublicRoute()}>
      <nav class="border-b flex justify-between">
        <div class="px-2 py-0.5">
          <a href="/home-page"  class="text-sky-800">[ Home ]</a>
        </div>
        <div class="px-2 py-0.5">
          <Switch>
            <Match when={session!.loggedIn()}>
              {user()?.name}
              <button
                class="text-sky-800 pl-2"
                onClick={onLogout}
              >
                [ Logout ]
              </button>
            </Match>
            <Match when>
              <a class="text-sky-800" href="/login">[ Login ]</a>
            </Match>
          </Switch>
        </div>
      </nav>
    </Show>
  )
}
