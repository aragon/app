import type { ICreateProcessFormBody } from '@/modules/createDao/components/createProcessForm';

export const generateProcessFormBody = (values?: Partial<ICreateProcessFormBody>): ICreateProcessFormBody => ({
    name: 'body',
    id: '0',
    resources: [],
    governanceType: 'multisig',
    members: [],
    tokenType: 'new',
    supportThreshold: 0,
    minimumParticipation: 0,
    voteChange: false,
    multisigThreshold: 0,
    ...values,
});
