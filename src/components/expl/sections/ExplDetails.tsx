import { Show, Component } from "solid-js"
import { ExplData, UserActor } from "../types"
import { Link } from "~/components/Link"
import { ExplLink } from "../ExplLink"
import { humanCase } from "~/utils/string"

export const ExplDetails: Component<ExplData> = (props) => {
  return (
    <div class="px-2">
      <Show when={props.trigger}>
        <div class="mb-2">
          <div class="font-bold">Trigger</div>
          <div>{props.trigger!.label}{' '}
            <ExplLink explId={props.trigger!.explId} />
          </div>
        </div>
      </Show>
      <div class="mb-2">
        <div class="font-bold">Agent</div>
        <div>
          {
            props.actor.type === 'user' ? (
              <Link
                label={(props.actor as UserActor).user.name}
                route="show-record"
                params={{ tableName: 'person', id: (props.actor as UserActor).user.id }}
              />
            ) : 'System'
          }
        </div>
      </div>
      <Show when={props.actor.type === 'user'}>
        <div class="mb-2">
          <div class="font-bold">User Role</div>
          <div>{humanCase((props.actor as UserActor).user.auth_role)}</div>
        </div>
      </Show>
      <div class="mb-2">
        <div class="font-bold">Action</div>
        <div>{props.action}</div>
      </div>
      <div class="mb-2">
        <div class="font-bold">Target</div>
        <div>
          <Link
            label={`${humanCase(props.target.tableName)} "${props.target.label}"`}
            route="show-record"
            params={{ tableName: props.target.tableName, id: props.target.id }}
          />
        </div>
      </div>
      <Show when={props.userExpl}>
        <div class="mb-2">
          <div class="font-bold">User Explanation</div>
          <div>{props.userExpl}</div>
        </div>
      </Show>
    </div>
  )
}
