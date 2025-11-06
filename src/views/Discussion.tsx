import { Component, createResource, createSignal, For, Show, useContext } from "solid-js"
import { insertRecord } from "~/api/insert/record"
import { listForeignRecords } from "~/api/list/foreignRecords"
import { Button } from "~/components/buttons"
import { TextInput } from "~/components/form/TextInput"
import { Link } from "~/components/Link"
import { SessionContext } from "~/SessionContext"
import { DiscussionParams } from "~/schema/type"

export const Discussion: Component<{ id: number, tabData: {discussion: DiscussionParams} }> = props => {
  const { tableName, fkName, textColName, userNameColName } = props.tabData.discussion
  const session = useContext(SessionContext)
  const [messages, { refetch }] = createResource(() => listForeignRecords(tableName, fkName, props.id))
  const [newMessage, setNewMessage] = createSignal("")
  const [sending, setSending] = createSignal(false)
  const [saveError, setSaveError] = createSignal('')

  const sendMessage = async () => {
    if (!newMessage().trim() || sending()) return
    setSaveError('')
    setSending(true)
    try {
      await insertRecord(tableName, {
        [textColName]: newMessage(),
        [fkName]: props.id
      })
      setNewMessage("")
      refetch()
    } catch (error) {
      setSaveError((error as Error).message)
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
          <div class="px-2">
            <Link
              route="show-record"
              params={{ tableName: 'person', id: message.owner_id }}
              class="font-bold pr-2"
              label={message[userNameColName] + ':'}
            />
            <span>{message.text}</span>
          </div>
        )}
      </For>
      <Show when={session?.userSession()?.authenticated}>
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
      </Show>
      <div class="text-right text-yellow-600">
        {saveError()}
      </div>
    </>
  )
}