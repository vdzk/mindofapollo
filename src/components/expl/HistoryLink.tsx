import { Component } from "solid-js";
import { Link } from "../Link";

export const HistoryLink: Component<{ explId: number }> = props => <Link
  label={<img class="w-5 h-5 inline align-sub opacity-50 hover:opacity-100" src="/icons/rewind.svg" />}
  route="expl"
  params={{ id: props.explId }}
  tooltip="History"
/>