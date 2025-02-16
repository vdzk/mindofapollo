import { Component } from "solid-js";
import { UserActivity } from "./UserActivity";

type ComponentsByName = {
  [K: string]: Component<any>;
};

export const componentsByName: ComponentsByName = {
  UserActivity
};