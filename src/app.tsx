import { MetaProvider } from "@solidjs/meta"
import { Router } from "@solidjs/router"
import { FileRoutes } from "@solidjs/start/router"
import "./index.css"
import { TopNav } from "./components/TopNav"
import { SessionContextProvider } from "./SessionContext"


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
}