import { useLocation } from "@solidjs/router";
import { publicRoutes } from "~/constant";


export const useIsPublicRoute = () => {
  const location = useLocation()
  return () => publicRoutes.includes(location.pathname)
}
