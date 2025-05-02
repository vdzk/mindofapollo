import { ParentComponent, Setter } from "solid-js";
import { Button } from "./buttons";
import { getToggleLabel } from "~/utils/string";

export const ToggleWrap: ParentComponent<{
  collapsed: boolean,
  setCollapsed: Setter<boolean>
}> = props => {
  return (
    <div class="flex items-center">
      {props.children}
      <div class="flex-1" />
      <Button
        label={getToggleLabel(!props.collapsed, '')}
        onClick={() => props.setCollapsed(x => !x)}
        class="mr-2"
      />
    </div>
  )
}