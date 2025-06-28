import { Component } from "solid-js";
import { UserActivity } from "./UserActivity";
import { RecordHistory } from "./RecordHistory";
import { PersonalDetails } from "./PersonalDetails";
import { Arguments } from "~/views/Statement/Arguments";
import { CreateArgument } from "~/views/Statement/CreateArgument";
import { Discussion } from "~/views/Statement/Discussion";

type ComponentsByName = {
  [K: string]: Component<any>;
};

export const componentsByName: ComponentsByName = {
  UserActivity,
  RecordHistory,
  PersonalDetails,
  Arguments,
  CreateArgument,
  Discussion
};