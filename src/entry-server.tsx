// @refresh reload
import { createHandler, StartServer } from "@solidjs/start/server"
import dotenv from "dotenv"

dotenv.config()

export default createHandler(() => (
  <StartServer
    document={({ assets, children, scripts }) => (
      <html lang="en">
        <head>
          <meta charset="utf-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <link rel="apple-touch-icon" sizes="180x180" href="/favicons/apple-touch-icon.png" />
          <link rel="icon" type="image/png" sizes="192x192" href="/favicons/android-chrome-192x192.png" />
          <link rel="icon" type="image/png" sizes="512x512" href="/favicons/android-chrome-512x512.png" />
          <link rel="icon" type="image/png" href="/favicons/favicon-16x16.png" />
          <link rel="manifest" href="/site.webmanifest" />
          {assets}
        </head>
        <body class="h-screen bg-[#FAF7F0]">
          <div id="app" class="h-screen flex flex-col">{children}</div>
          {scripts}
        </body>
      </html>
    )}
  />
));
