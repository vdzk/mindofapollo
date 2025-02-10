import { Component } from "solid-js";
import { Link } from "../Link";

export const ExplLink:Component<{explId: number}> = props => <Link
  type="button"
  label="EXPL"
  route="expl"
  params={{id: props.explId}}
/>