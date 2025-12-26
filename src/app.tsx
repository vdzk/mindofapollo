import { MetaProvider } from "@solidjs/meta"
import { Router } from "@solidjs/router"
import { FileRoutes } from "@solidjs/start/router"
import "./index.css"
import { TopNav } from "./components/TopNav"
import { SessionContextProvider } from "./SessionContext"
import { PathTrackerProvider } from "./components/UpDown"


export default function App() {
  return (
    <Router root={props => (
      <MetaProvider>
        <SessionContextProvider>
          <PathTrackerProvider>
            <TopNav />
            {props.children}
          </PathTrackerProvider>
        </SessionContextProvider>
      </MetaProvider>
    )}>
      <FileRoutes />
    </Router>
  )
}