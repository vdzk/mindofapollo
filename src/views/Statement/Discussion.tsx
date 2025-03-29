import { Component, createResource, createSignal, For } from "solid-js"
import { insertRecord } from "~/api/insert/record"
import { listForeignRecords } from "~/api/list/foreignRecords"
import { Button } from "~/components/buttons"
import { TextInput } from "~/components/form/TextInput"
import { Link } from "~/components/Link"

export const Discussion: Component<{ statementId: number }> = props => {
  const [messages, { refetch }] = createResource(() => listForeignRecords('statement_discussion_message', 'statement_id', props.statementId))
  const [newMessage, setNewMessage] = createSignal("")
  const [sending, setSending] = createSignal(false)

  const sendMessage = async () => {
    if (!newMessage().trim() || sending()) return

    setSending(true)
    try {
      await insertRecord('statement_discussion_message', {
        text: newMessage(),
        statement_id: props.statementId
      })
      setNewMessage("")
      refetch()
    } finally {
      setSending(false)
    }
  }

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }
  return (
    <>
      <For each={messages()} fallback={
        <div class="p-2 text-gray-500">No messages yet.</div>
      }>
        {message => (
          <div class="flex gap-2 px-2">
            <Link
              route="show-record"
              params={{ tableName: 'person', id: message.owner_id }}
              class="font-bold"
              label={message.user_name + ':'}
            />
            <div class="flex-1">{message.text}</div>
          </div>
        )}
      </For>
      <div class="border-t p-2 flex gap-2">
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
    </>
  )
}