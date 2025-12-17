import type {
    ISetupBodyForm,
    ISetupBodyFormBase,
    ISetupBodyFormExisting,
    ISetupBodyFormExternal,
    ISetupBodyFormNew,
} from '../../dialogs/setupBodyDialog';
import { BodyType } from '../../types/enum';

export const generateSetupBodyFormBase = (data?: Partial<ISetupBodyFormBase>): ISetupBodyFormBase => ({
    internalId: '0',
    plugin: 'plugin-name',
    type: BodyType.NEW,
    canCreateProposal: false,
    ...data,
});

export const generateSetupBodyFormNew = (data?: Partial<ISetupBodyFormNew>): ISetupBodyFormNew => ({
    ...generateSetupBodyFormBase(data),
    type: BodyType.NEW,
    name: 'name',
    resources: [],
    governance: {},
    membership: { members: [] },
    ...data,
});

export const generateSetupBodyFormExternal = (data?: Partial<ISetupBodyFormExternal>): ISetupBodyFormExternal => ({
    ...generateSetupBodyFormBase(data),
    type: BodyType.EXTERNAL,
    address: '0x000',
    isSafe: false,
    ...data,
});

export const generateSetupBodyFormExisting = (data?: Partial<ISetupBodyFormExisting>): ISetupBodyFormExisting => ({
    ...generateSetupBodyFormBase(data),
    type: BodyType.EXISTING,
    address: '0xExistingBody',
    resources: [],
    governance: {},
    membership: { members: [] },
    proposalCreationConditionAddress: '0xConditionAddress',
    ...data,
});

export const generateSetupBodyFormData = (data?: Partial<ISetupBodyForm>): ISetupBodyForm => {
    if (data?.type === BodyType.EXTERNAL) {
        return generateSetupBodyFormExternal(data);
    }

    if (data?.type === BodyType.EXISTING) {
        return generateSetupBodyFormExisting(data);
    }

    return generateSetupBodyFormNew(data as ISetupBodyFormNew);
};
