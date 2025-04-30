import {
    SetupBodyType,
    type ISetupBodyForm,
    type ISetupBodyFormBase,
    type ISetupBodyFormExternal,
    type ISetupBodyFormNew,
} from '../../dialogs/setupBodyDialog';

export const generateSetupBodyFormBase = (data?: Partial<ISetupBodyFormBase>): ISetupBodyFormBase => ({
    internalId: '0',
    plugin: 'plugin-name',
    type: SetupBodyType.NEW,
    ...data,
});

export const generateSetupBodyFormNew = (data?: Partial<ISetupBodyFormNew>): ISetupBodyFormNew => ({
    ...generateSetupBodyFormBase(data),
    type: SetupBodyType.NEW,
    name: 'name',
    resources: [],
    governance: {},
    membership: { members: [] },
    canCreateProposal: false,
    ...data,
});

export const generateSetupBodyFormExternal = (data?: Partial<ISetupBodyFormExternal>): ISetupBodyFormExternal => ({
    ...generateSetupBodyFormBase(data),
    type: SetupBodyType.EXTERNAL,
    address: '0x000',
    ...data,
});

export const generateSetupBodyFormData = (data?: Partial<ISetupBodyForm>): ISetupBodyForm =>
    data?.type === SetupBodyType.EXTERNAL
        ? generateSetupBodyFormExternal(data)
        : generateSetupBodyFormNew(data as ISetupBodyFormNew);
