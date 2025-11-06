import { createAsync, useNavigate } from "@solidjs/router"
import { Component, Match, Show, Switch, useContext } from "solid-js"
import { Link } from "./Link"
import { doLogout } from "~/api/execute/logout"
import { getOneRecordById } from "~/api/getOne/recordById"
import { SessionContext } from "~/SessionContext"
import { btnStyle, Button } from "./buttons"
import { joinWebsiteUrl, openRegistration } from "~/constant"
import { createMediaQuery } from "@solid-primitives/media"

export const TopNav: Component = () => {
  const session = useContext(SessionContext)
  const authenticated = () => session?.userSession()?.authenticated ?? false
  const navigate = useNavigate()
  const user = createAsync(async () => session?.userSession()?.userId
    ? getOneRecordById('person', session!.userSession()!.userId)
    : undefined
  )
  const smallScreen = createMediaQuery('(max-width: 480px)')

  const onLogout = async () => {
    await doLogout()
    session!.refetch()
    navigate('/')
  }
  return (
    <nav class="border-b flex justify-between flex-wrap">
      <div class="px-2 py-0.5 flex items-center">
        <Link route="home-page" label="MIND OF APOLLO" type="logo" />
        <span class="inline-block w-2" />
        <Link
          route="search"
          label={smallScreen() ? '🔎' : "Search"}
          type="button"
        />
      </div>
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
              label={smallScreen() ? '🚪' : "Logout"}
              onClick={onLogout}
            />
          </Match>
          <Match when={!authenticated()}>
            <span class="flex gap-2">
              <Link
                route="donate"
                  label={smallScreen() ? '🎁' : "Donate"}
                type="button"
              />
              <Show when={openRegistration}>
                <Link
                  route="join"
                  label={smallScreen() ? '👤➕' : "Join"}
                  type="button"
                />
              </Show>
              <Show when={!openRegistration}>
                <a
                  href={joinWebsiteUrl + '/signup'}
                  class={btnStyle()}
                >
                  Sign Up
                </a>
              </Show>
              <Link
                route="login"
                label={smallScreen() ? '🔑' : "Login"}
                type="button"
              />
            </span>
          </Match>
        </Switch>
      </div>
    </nav>
  )
}
