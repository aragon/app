export enum CreateProposalAddActionValue {
    YES = 'YES',
    NO = 'NO',
}

export interface ICreateProposalFormData {
    title: string;
    summary: string;
    body?: string;
    addActions: CreateProposalAddActionValue;
}
