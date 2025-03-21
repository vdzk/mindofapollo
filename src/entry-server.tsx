// @refresh reload
import { createHandler, StartServer } from "@solidjs/start/server";

export default createHandler(() => (
  <StartServer
    document={({ assets, children, scripts }) => (
      <html lang="en" class="overflow-y-scroll">
        <head>
          <meta charset="utf-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <link rel="icon" href="/favicon.ico" />
          {assets}
        </head>
        <body class="min-h-screen bg-[#FAF7F0]">
          <div id="app" class="min-h-screen flex flex-col">{children}</div>
          {scripts}
        </body>
      </html>
    )}
  />
));
