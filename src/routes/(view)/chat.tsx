import { Title } from "@solidjs/meta"
import { PageTitle } from "~/components/PageTitle"
import { createSignal, For, Show, onMount, createResource } from "solid-js"
import { Button } from "~/components/buttons"
import { TextInput } from "~/components/TextInput"
import { getChatMessages, sendChatMessage } from "~/api/view/chat"

export default function Chat() {
  const [messages, { refetch }] = createResource(getChatMessages)
  const [newMessage, setNewMessage] = createSignal("")
  const [sending, setSending] = createSignal(false)

  const sendMessage = async () => {
    if (!newMessage().trim() || sending()) return

    setSending(true)
    try {
      await sendChatMessage(newMessage())
      setNewMessage("")
      refetch()
    } finally {
      setSending(false)
    }
  }

  // Poll for new messages every 5 seconds
  onMount(() => {
    const interval = setInterval(() => {
      refetch()
    }, 5000)
    return () => clearInterval(interval)
  })

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  return (
    <main>
      <Title>Chat</Title>
      <PageTitle>Chat</PageTitle>
      
      <div class="px-2 max-w-2xl mx-auto">
        <div class="bg-white rounded-lg shadow h-[60vh] flex flex-col">
          <div class="flex-1 overflow-y-auto p-4">
            <Show when={messages()} fallback={<div class="text-center">Loading...</div>}>
              <Show when={messages()!.length > 0} fallback={
                <div class="text-gray-500 text-center mt-4">No messages yet</div>
              }>
                <For each={[...messages()!].reverse()}>
                  {(message) => (
                    <div class="mb-4">
                      <div class="font-bold">{message.sender_name}</div>
                      <div class="bg-gray-100 rounded-lg p-2 inline-block">
                        {message.text}
                      </div>
                      <div class="text-xs text-gray-500">
                        {new Date(message.timestamp * 1000).toLocaleTimeString()}
                      </div>
                    </div>
                  )}
                </For>
              </Show>
            </Show>
          </div>
          
          <div class="border-t p-4 flex gap-2">
            <div class="flex-1">
              <TextInput
                value={newMessage()}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type a message..."
                disabled={sending()}
                tableName="chat_message"
                colName="text"
              />
            </div>
            <Button
              label={sending() ? "Sending..." : "Send"}
              onClick={sendMessage}
              disabled={sending()}
            />
          </div>
        </div>
      </div>
    </main>
  )
}