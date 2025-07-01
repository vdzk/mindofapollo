import { createAsync, useNavigate } from "@solidjs/router"
import { Component, Match, Show, Switch, useContext } from "solid-js"
import { Link } from "./Link"
import { doLogout } from "~/api/execute/logout"
import { getOneRecordById } from "~/api/getOne/recordById"
import { SessionContext } from "~/SessionContext"
import { btnStyle, Button } from "./buttons"
import { joinWebsiteUrl } from "~/constant"

export const TopNav: Component = () => {
  const session = useContext(SessionContext)
  const authenticated = () => session?.userSession()?.authenticated ?? false
  const navigate = useNavigate()
  const user = createAsync(async () => session?.userSession()?.userId
    ? getOneRecordById('person', session!.userSession()!.userId)
    : undefined
  )

  const onLogout = async () => {
    await doLogout()
    session!.refetch()
    navigate('/')
  }
  return (
    <nav class="border-b flex justify-between flex-wrap">
      <div class="px-2 py-0.5 flex items-center">
        <Link route="home-page" label="APOLLO" type="logo" />
        <span class="inline-block w-2" />
        <Link route="search" label="Search" type="button" />
      </div>
      <Show when={!authenticated()}>
        <div class="px-2 py-0.5 max-sm:order-last max-sm:w-full max-sm:flex max-sm:justify-center">
          <a href={joinWebsiteUrl} class={btnStyle()}>
            Learn about the Mind of Apollo
          </a>
        </div>
      </Show>
      <div class="px-2 py-0.5">
        <Switch>
          <Match when={authenticated()}>
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
            <span class="flex gap-2">
              <a
                href={joinWebsiteUrl + '/signup'}
                class={btnStyle()}
              >
                Sign Up
              </a>
              <Link route="login" label="Login" type="button" />
            </span>
          </Match>
        </Switch>
      </div>
    </nav>
  )
}
