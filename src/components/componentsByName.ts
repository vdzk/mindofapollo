import { Component } from "solid-js";
import { UserActivity } from "./UserActivity";
import { RecordHistory } from "./RecordHistory";
import { PersonalDetails } from "./PersonalDetails";
import { Arguments } from "~/views/Statement/Arguments";
import { CreateArgument } from "~/views/Statement/CreateArgument";
import { DirectiveScope } from "~/views/Statement/DirectiveScope";
import { UserDirectives } from "~/views/UserDirectives";
import { UserPermissions } from "~/views/UserPermissions";

type ComponentsByName = {
  [K: string]: Component<any>;
};

export const componentsByName: ComponentsByName = {
  UserActivity,
  RecordHistory,
  PersonalDetails,
  DirectiveScope,
  Arguments,
  CreateArgument,
  UserDirectives,
  UserPermissions
}