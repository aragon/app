export interface IProposalActionInputDataParameter {
  type: string;
  value: string;
}

export interface IProposalActionInputData {
  function: string;
  contract: string; 
  parameters: IProposalActionInputDataParameter[];
}

export interface IProposalAction {
  from: string;
  to: string;
  data: string;
  value: string;
  type: string; 
  inputData: IProposalActionInputData | null;
}