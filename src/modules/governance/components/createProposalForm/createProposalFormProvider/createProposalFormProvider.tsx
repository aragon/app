import { createContext, useContext } from 'react';
import type { IProposalAction, ProposalActionType } from '../../../api/governanceService';

export type PrepareProposalActionFunction = (action: IProposalAction) => Promise<string>;

export interface ICreateProposalFormContext {
    /**
     * Map of proposal-type and prepare action functions to be used for async action preparations
     * (e.g. actions requiring IPFS pinning or requests to third party APIs)
     */
    prepareActions: Record<ProposalActionType, PrepareProposalActionFunction>;
    /**
     * Callback to update the prepare-action maps for the given proposal action type.
     */
    addPrepareAction: (actionType: ProposalActionType, prepareAction: PrepareProposalActionFunction) => void;
}

const createProposalFormContext = createContext<ICreateProposalFormContext | null>(null);

export const CreateProposalFormProvider = createProposalFormContext.Provider;

export const useCreateProposalFormContext = () => {
    const values = useContext(createProposalFormContext);

    if (values == null) {
        throw new Error(
            'useCreateProposalFormContext: hook must be used inside a CreateProposalFormProvider to work properly.',
        );
    }

    return values;
};
