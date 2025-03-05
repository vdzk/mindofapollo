import { Component } from "solid-js";
import { UserActivity } from "./UserActivity";
import { RecordHistory } from "./RecordHistory";

type ComponentsByName = {
  [K: string]: Component<any>;
};

export const componentsByName: ComponentsByName = {
  UserActivity,
  RecordHistory
};