import type { ISmartContractAbi } from '@/modules/governance/api/smartContractService';
import type {
    IProposalCreateAction,
    PrepareProposalActionFunction,
    PrepareProposalActionMap,
} from '@/modules/governance/dialogs/publishProposalDialog';
import { createContext, useContext } from 'react';

type AddPrepareActionFunction<TAction extends IProposalCreateAction = IProposalCreateAction> = (
    actionType: string,
    prepareAction: PrepareProposalActionFunction<TAction>,
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

export const useCreateProposalFormContext = <
    TAction extends IProposalCreateAction = IProposalCreateAction,
>(): ICreateProposalFormContext<TAction> => {
    const values = useContext(createProposalFormContext);

    if (values == null) {
        throw new Error(
            'useCreateProposalFormContext: hook must be used inside a CreateProposalFormProvider to work properly.',
        );
    }

    return {
        ...values,
        prepareActions: values.prepareActions as PrepareProposalActionMap<TAction>,
        addPrepareAction: values.addPrepareAction as AddPrepareActionFunction<TAction>,
    };
};
