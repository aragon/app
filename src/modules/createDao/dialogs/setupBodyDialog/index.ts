import dynamic from 'next/dynamic';

export const SetupBodyDialog = dynamic(() =>
    import('./setupBodyDialog').then((mod) => mod.SetupBodyDialog),
);

export type {
    ISetupBodyDialogParams,
    ISetupBodyDialogProps,
} from './setupBodyDialog';
export type {
    ISetupBodyForm,
    ISetupBodyFormBase,
    ISetupBodyFormExisting,
    ISetupBodyFormExternal,
    ISetupBodyFormMembership,
    ISetupBodyFormNew,
} from './setupBodyDialogDefinitions';
