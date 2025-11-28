import { Component, createSignal } from "solid-js"
import { updatePersonalDetails } from "~/api/update/personalDetails"
import { Button } from "./buttons"
import { etv } from "~/client-only/util"

export const PersonalDetails: Component = () => {
  const [email, setEmail] = createSignal('')
  const [password, setPassword] = createSignal('')
  const [updating, setUpdating] = createSignal(false)
  const valid = () => email().trim() !== '' && password() !== ''
  const onUpdate = async () => {
    setUpdating(true)
    await updatePersonalDetails(email().trim(), password())
    setEmail('')
    setPassword('')
    setUpdating(false)
  }

  return (
    <div class="px-2">
      <div class="mb-4 max-w-md">
        <label class="block mb-2">
          Email:
          <input
            type="email"
            value={email()}
            onInput={etv(setEmail)}
            class="border rounded pl-1 w-full"
            autocomplete="off"
          />
        </label>
        <label class="block mb-2">
          Password:
          <input
            type="password"
            value={password()}
            onInput={etv(setPassword)}
            class="border rounded pl-1 w-full"
            autocomplete="off"
          />
        </label>
        <div class="pt-1">
          <Button
            label={updating() ? 'Updating...' : 'Update'}
            disabled={!valid() || updating()}
            onClick={onUpdate}
          />
        </div>
      </div>
    </div>
  );
}