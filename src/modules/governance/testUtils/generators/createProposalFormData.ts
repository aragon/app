import { type ICreateProposalFormData } from '../../components/createProposalForm';
import type { ICreateProposalEndDateForm, ICreateProposalStartDateForm } from '../../utils/createProposalUtils';

export const generateCreateProposalFormData = (values?: Partial<ICreateProposalFormData>): ICreateProposalFormData => ({
    title: 'title',
    summary: 'summary',
    addActions: false,
    resources: [],
    actions: [],
    ...values,
});

export const generateCreateProposalStartDateFormData = (
    values?: Partial<ICreateProposalStartDateForm>,
): ICreateProposalStartDateForm => ({
    startTimeMode: 'now',
    ...values,
});

export const generateCreateProposalEndDateFormData = (
    values?: Partial<ICreateProposalEndDateForm>,
): ICreateProposalEndDateForm => ({
    ...generateCreateProposalStartDateFormData(values),
    endTimeMode: 'duration',
    endTimeDuration: { days: 2, hours: 0, minutes: 0 },
    ...values,
});
