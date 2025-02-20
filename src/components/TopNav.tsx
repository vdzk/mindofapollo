import { createAsync, useLocation, useNavigate } from "@solidjs/router"
import { Component, Match, Show, Switch, useContext } from "solid-js"
import { logout } from "~/server-only/session"
import { SessionContext } from "~/SessionContext"
import { Link } from "./Link"
import { Button } from "./buttons"
import { useIsPublicRoute } from "~/client-only/util"
import { getOneRecordById } from "~/api/getOne/recordById"

export const TopNav: Component = () => {
  const location = useLocation()
  const session = useContext(SessionContext)
  const navigate = useNavigate()
  const isPublicRoute = useIsPublicRoute()
  const user = createAsync(async () => session?.userSession()
    ? getOneRecordById('person', session!.userSession()!.userId)
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
          <Link route="home-page" label="APOLLO" type="logo" />
        </div>
        <div class="px-2 py-0.5">
          <Switch>
            <Match when={session!.userSession()?.authenticated}>
              <Link
                route="show-record"
                params={{ tableName: 'person', id: session!.userSession()!.userId }}
                label={user()?.name}
              />
              <span class="inline-block w-2" />
              <Button
                label="Logout"
                onClick={onLogout}
              />
            </Match>
            <Match when>
              <Link route="login" label="Login" type="button" />
            </Match>
          </Switch>
        </div>
      </nav>
    </Show>
  )
}
