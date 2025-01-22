import { MetaProvider } from "@solidjs/meta"
import { Route, Router } from "@solidjs/router"
import { FileRoutes } from "@solidjs/start/router"
import "./index.css"
import { TopNav } from "./components/TopNav"
import { SessionContextProvider } from "./SessionContext"
import HomePage from "./routes/(view)/home-page"



export default function App() {
  return (
    <Router root={props => (
      <MetaProvider>
        <SessionContextProvider>
          <TopNav />
          {props.children}
        </SessionContextProvider>
      </MetaProvider>
    )}>
      <FileRoutes />
    </Router>
  )
  return (
    <Router
      root={props => (
        <MetaProvider>
          <SessionContextProvider>
            <TopNav />
            {props.children}
          </SessionContextProvider>
        </MetaProvider>
      )}
    >
      <FileRoutes />
    </Router>
  );
}
