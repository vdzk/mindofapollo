import { useLocation, useSearchParams } from "@solidjs/router";
import { createEffect, createSignal } from "solid-js";
import { publicRoutes } from "~/constant";

export const useIsPublicRoute = () => {
  const location = useLocation()
  return () => publicRoutes.includes(location.pathname)
}

// Fixes the problem of parmas unloading too early
export const useSafeParams = <T,>(paramNames: string[]) => {
  const [searchParams] = useSearchParams()
  const [safeSearchParams, setSafeSearchParams] = createSignal({...searchParams})
  createEffect(() => {
    if (paramNames.every(paramName => !!searchParams[paramName] )) {
      setSafeSearchParams({...searchParams})
    }
  })
  return safeSearchParams() as T
}