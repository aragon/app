import { createContext, useContext } from 'react';
import type {
    IProposalCreateAction,
    PrepareProposalActionFunction,
    PrepareProposalActionMap,
} from '@/modules/governance/dialogs/publishProposalDialog';

type AddPrepareActionFunction<TAction extends IProposalCreateAction = IProposalCreateAction> = (
    actionType: string,
    prepareAction: PrepareProposalActionFunction<TAction>
) => void;

export interface ICreateProposalFormContext<TAction extends IProposalCreateAction = IProposalCreateAction> {
    /**
     * Map of proposal-type and prepare action functions to be used for async action preparations.
     * (e.g. actions requiring IPFS pinning or requests to third party APIs)
     */
    prepareActions: PrepareProposalActionMap<TAction>;
    /**
     * Callback to update the prepare-action maps for the given proposal action type.
     */
    addPrepareAction: AddPrepareActionFunction<TAction>;
}

const createProposalFormContext = createContext<ICreateProposalFormContext | null>(null);

export const CreateProposalFormProvider = createProposalFormContext.Provider;

export const useCreateProposalFormContext = <
    TAction extends IProposalCreateAction = IProposalCreateAction,
>(): ICreateProposalFormContext<TAction> => {
    const values = useContext(createProposalFormContext);

    if (values == null) {
        throw new Error('useCreateProposalFormContext: hook must be used inside a CreateProposalFormProvider to work properly.');
    }

    return {
        prepareActions: values.prepareActions as PrepareProposalActionMap<TAction>,
        addPrepareAction: values.addPrepareAction as AddPrepareActionFunction<TAction>,
    };
};
