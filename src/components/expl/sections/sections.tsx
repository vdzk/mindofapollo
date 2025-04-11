import { Component } from "solid-js"
import { ExplData } from "../types"
import { ExplDetails } from "./ExplDetails"
import { Checks } from "./Checks"
import { Notes } from "./Notes"
import { RelavantRecords } from "./RelavantRecords"
import { Created } from "./Created"
import { Updated } from "./Updated"
import { Deleted } from "./Deleted"
import { InsertedFkEntries } from "./InsertedFkEntries"

interface Section {
  label: string
  propNames: (keyof ExplData)[]
  component: Component<ExplData>
}

export const sections: Record<string, Section> = {
  details: {
    label: 'Details',
    propNames: ['trigger', 'actor', 'action', 'target', 'userExpl' ],
    component: ExplDetails
  },
  checks: {
    label: 'Checks',
    propNames: ['checks'],
    component: Checks
  },
  notes: {
    label: 'Notes',
    propNames: ['notes'],
    component: Notes
  },
  relavantRecords: {
    label: 'Relavant Records',
    propNames: ['relevantRecords'],
    component: RelavantRecords
  },
  created: {
    label: 'Created',
    propNames: ['insertedRecords', 'insertedCrossRecord'],
    component: Created
  },
  added: {
    label: 'Added',
    propNames: ['insertedFkEntries'],
    component: InsertedFkEntries
  },
  updated: {
    label: 'Updated',
    propNames: ['diff', 'updatedRecords'],
    component: Updated
  },
  deleted: {
    label: 'Deleted',
    propNames: ['deletedRecords', 'deletedCrossRecord'],
    component: Deleted
  },
}