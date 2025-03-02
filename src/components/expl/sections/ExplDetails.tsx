import { Show, Component } from "solid-js"
import { ExplData, UserActor } from "../types"
import { Link } from "~/components/Link"
import { ExplLink } from "../ExplLink"
import { humanCase } from "~/util"

export const ExplDetails: Component<ExplData> = (props) => {
  return (
    <div class="px-2">
      <Show when={props.trigger}>
        <div>
          Trigger: {props.trigger!.label}
          <ExplLink explId={props.trigger!.explId} />
        </div>
      </Show>
      <div>
        Agent: {
          props.actor.type === 'user' ?
            <Link
              label={(props.actor as UserActor).user.name}
              route="show-record"
              params={{ tableName: 'person', id: (props.actor as UserActor).user.id }}
            /> :
            'System'
        }
      </div>
      <Show when={props.actor.type === 'user'}>
        <div>
          User Role: {humanCase((props.actor as UserActor).user.auth_role)}
        </div>
      </Show>
      <div>
        Action: {props.action}
      </div>
      <div>
        Target: {humanCase(props.target.tableName)} "{props.target.label}"
        <Link
          label="View"
          route="show-record"
          params={{ tableName: props.target.tableName, id: props.target.id }}
        />
      </div>
      <Show when={props.userExpl}>
        <div>
          User Explanation: {props.userExpl}
        </div>
      </Show>
    </div>
  )
}
