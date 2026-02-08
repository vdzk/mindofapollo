import { WorkflowStep } from ".";

export const addTopLevelClaimIdea: WorkflowStep = {
  title: 'Add a discussion topic',
  preface: "Every discussion on this platform revolves around a specific claim. The goal of the platform is to investigate the likelihood of these claims and reach justified conclusions.",
  instructions: "Which new topic would it be interesting or important to discuss? Which specific claims within this topic should be investigated? Please write your answers below.",
  outputTable: 'top_level_claim_idea'
}