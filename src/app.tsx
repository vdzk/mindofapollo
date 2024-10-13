import { MetaProvider } from "@solidjs/meta";
import { Router } from "@solidjs/router";
import { FileRoutes } from "@solidjs/start/router";
import { Suspense } from "solid-js";
import "./index.css"
import { TopNav } from "./components/TopNav";
import { SessionContextProvider } from "./SessionContext";



export default function App() {
  return (
    <Router
      root={props => (
        <MetaProvider>
          <SessionContextProvider>
            <Suspense>
                <TopNav />
              {props.children}
            </Suspense>
          </SessionContextProvider>
        </MetaProvider>
      )}
    >
      <FileRoutes />
    </Router>
  );
}
