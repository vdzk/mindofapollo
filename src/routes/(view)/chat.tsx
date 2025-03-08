import { Title } from "@solidjs/meta"
import { PageTitle } from "~/components/PageTitle"
import { createSignal, For, Show, onMount, createResource, createEffect, on } from "solid-js"
import { Button } from "~/components/buttons"
import { TextInput } from "~/components/form/TextInput"
import { submitChatMessage } from "~/api/submit/chatMessage"
import { listChatMessages } from "~/api/list/chatMessages"
import { Link } from "~/components/Link"

export default function Chat() {
  const [messages, { refetch }] = createResource(listChatMessages)
  const [newMessage, setNewMessage] = createSignal("")
  const [sending, setSending] = createSignal(false)
  const [wasAtBottom, setWasAtBottom] = createSignal(true)
  let messageContainer: HTMLDivElement | undefined

  const isScrolledToBottom = () => {
    if (!messageContainer) return true
    const { scrollHeight, scrollTop, clientHeight } = messageContainer
    return Math.abs(scrollHeight - scrollTop - clientHeight) < 10
  }

  const scrollToBottom = () => {
    messageContainer?.scrollTo({
      top: messageContainer.scrollHeight,
      behavior: "smooth"
    })
  }

  // Track scroll position before messages update
  createEffect(on(() => messages.loading, (isLoading) => {
    if (isLoading) {
      setWasAtBottom(isScrolledToBottom())
    }
  }))

  // Auto-scroll when new messages arrive if we were at bottom
  createEffect(() => {
    messages()
    if (wasAtBottom()) {
      scrollToBottom()
    }
  })

  const sendMessage = async () => {
    if (!newMessage().trim() || sending()) return

    setSending(true)
    try {
      await submitChatMessage(newMessage())
      setNewMessage("")
      refetch()
      scrollToBottom()
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
    <main class="flex h-[calc(100vh-2rem)]">
      <Title>Chat</Title>
      <PageTitle>Chat</PageTitle>
      
      <div class="px-2 flex-1 flex flex-col max-w-2xl mx-auto w-full">
        <div class="bg-white flex flex-col flex-1 border-x h-full">
          <div class="flex-1 overflow-y-auto p-4 h-full" ref={messageContainer}>
            <Show when={messages()} fallback={<div class="text-center">Loading...</div>}>
              <Show when={messages()!.length > 0} fallback={
                <div class="text-gray-500 text-center mt-4">No messages yet</div>
              }>
                <For each={[...messages()!].reverse()}>
                  {(message) => (
                    <div class="mb-2" title={new Date(message.timestamp * 1000).toLocaleString()}>
                      <span class="font-bold mr-2">
                        <Link 
                          route="show-record" 
                          params={{ 
                            tableName: 'person', 
                            id: message.user_id 
                          }} 
                          label={message.sender_name}
                        />:
                      </span>
                      <span class="bg-gray-100 rounded-lg py-1 px-2 inline-block">
                        {message.text}
                      </span>
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
