import { createAsync, useLocation, useNavigate } from "@solidjs/router"
import { Component, Match, Show, Switch, useContext } from "solid-js"
import { ExternalLink, Link } from "./Link"
import { doLogout } from "~/api/execute/logout"
import { getOneRecordById } from "~/api/getOne/recordById"
import { SessionContext } from "~/SessionContext"
import { btnStyle, Button } from "./buttons"
import { graphPageRoutes, joinWebsiteUrl, openRegistration } from "~/constant"
import { createMediaQuery } from "@solid-primitives/media"
import { UpDown } from "./UpDown"
import { useSafeParams } from "~/client-only/util"

export const TopNav: Component = () => {
  const session = useContext(SessionContext)
  const authenticated = () => session?.userSession()?.authenticated ?? false
  const navigate = useNavigate()
  const user = createAsync(async () => session?.userSession()?.userId
    ? getOneRecordById('person', session!.userSession()!.userId)
    : undefined
  )
  const smallScreen = createMediaQuery('(max-width: 480px)')
  const showLogo = createMediaQuery('(min-width: 860px)')
  const location = useLocation()
  const atGraphPage = () => graphPageRoutes.includes(location.pathname.slice(1))
  const atDebatePage = () => location.pathname.slice(1) === 'debate'
  const sp = useSafeParams<{ id: number }>(['id'])

  const discordLink = <ExternalLink
    href="https://discord.gg/3hhhD4tK9h"
    label={smallScreen() ? '💬' : "Discord 💬"}
    class="pr-2"
  />

  const onLogout = async () => {
    await doLogout()
    session!.refetch()
    navigate('/')
  }
  return (
    <nav class="border-b flex justify-between items-center flex-wrap relative">
      <div class="px-2 py-0.5 flex items-center gap-0.5">
        <Link
          route="home-page"
          label={<img class="w-4 h-6" src="/icons/home.svg" />}
          tooltip="Home page"
          type="button"
        />
        <Link
          route="search"
          label={<img class="w-4 h-6" src="/icons/search.svg" />}
          tooltip="search"
          type="button"
        />
        <Show when={atGraphPage()}>
          <UpDown />
          <Link
            route="map"
            params={{
              tableName: location.pathname.slice(1),
              id: sp().id
            }}
            label={<img class="w-6 h-6" src="/icons/map.svg" />}
            type="button"
            tooltip="argument map"
          />
        </Show>
        <Show when={atDebatePage()}>
          <Link
            route="debates"
            label={<img class="w-5 h-6" src="/icons/swords.svg" />}
            type="button"
            tooltip="all debates"
          />
        </Show>
      </div>
      <Show when={showLogo()}>
        <Link
          route="home-page"
          label="MIND OF APOLLO"
          type="logo"
          class="absolute left-1/2 -translate-x-1/2"
        />
      </Show>
      <div class="px-2 py-0.5">
        <Switch>
          <Match when={authenticated()}>
            {discordLink}
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
              {discordLink}
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
