import type { ISetupBodyForm } from '../../dialogs/setupBodyDialog';

export const generateSetupBodyFormData = (data?: Partial<ISetupBodyForm>): ISetupBodyForm => ({
    internalId: '0',
    name: 'body-name',
    resources: [],
    plugin: 'plugin-name',
    governance: {},
    membership: { members: [] },
    canCreateProposal: false,
    ...data,
});
