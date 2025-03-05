import { Component } from "solid-js"
import { ExplData } from "../types"
import { RecordByTable } from "../RecordByTable"

export const RelavantRecords: Component<ExplData> = (props) => <RecordByTable records={props.relevantRecords || {}} showExplLink />
