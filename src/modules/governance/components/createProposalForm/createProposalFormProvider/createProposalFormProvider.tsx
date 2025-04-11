import type { ISmartContractAbi } from '@/modules/governance/api/smartContractService';
import type { IProposalCreateAction } from '@/modules/governance/dialogs/publishProposalDialog/publishProposalDialog.api';
import { createContext, useContext } from 'react';

export type PrepareProposalActionFunction = (action: IProposalCreateAction) => Promise<string>;
export type PrepareProposalActionMap = Partial<Record<string, PrepareProposalActionFunction>>;

export interface ICreateProposalFormContext {
    /**
     * Map of proposal-type and prepare action functions to be used for async action preparations.
     * (e.g. actions requiring IPFS pinning or requests to third party APIs)
     */
    prepareActions: PrepareProposalActionMap;
    /**
     * Callback to update the prepare-action maps for the given proposal action type.
     */
    addPrepareAction: (actionType: string, prepareAction: PrepareProposalActionFunction) => void;
    /**
     * ABIs of smart contract to be used for adding custom actions to proposals.
     */
    smartContractAbis: ISmartContractAbi[];
    /**
     * Callback called to add a smart contract ABI for proposal creation.
     */
    addSmartContractAbi: (abi: ISmartContractAbi) => void;
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
