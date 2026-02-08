import { addTopLevelClaimIdea } from "./addTopLevelClaimIdea";

export interface WorkflowStep {
  title: string;
  preface?: string;
  instructions: string;
  outputTable: string;
}

export const workflowSteps: Record<string, WorkflowStep> = {
  addTopLevelClaimIdea
}