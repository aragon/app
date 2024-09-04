import { type ICreateProposalFormData } from '../../components/createProposalForm';

export const generateCreateProposalFormData = (values?: Partial<ICreateProposalFormData>): ICreateProposalFormData => ({
    title: 'title',
    summary: 'summary',
    addActions: false,
    resources: [],
    actions: [],
    startTimeMode: 'now',
    endTimeMode: 'duration',
    endTimeDuration: { hours: 0, minutes: 0, days: 2 },
    ...values,
});
