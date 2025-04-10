import { Component } from "solid-js";
import { UserActivity } from "./UserActivity";
import { RecordHistory } from "./RecordHistory";
import { PersonalDetails } from "./PersonalDetails";

type ComponentsByName = {
  [K: string]: Component<any>;
};

export const componentsByName: ComponentsByName = {
  UserActivity,
  RecordHistory,
  PersonalDetails
};