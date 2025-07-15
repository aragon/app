'use client';

import type { ISmartContractAbi } from '@/modules/governance/api/smartContractService';
import type {
    IProposalCreateAction,
    PrepareProposalActionFunction,
    PrepareProposalActionMap,
} from '@/modules/governance/dialogs/publishProposalDialog';
import { addressUtils } from '@aragon/gov-ui-kit';
import { createContext, useCallback, useContext, useState } from 'react';

type AddPrepareActionFunction<TAction extends IProposalCreateAction = IProposalCreateAction> = (
    actionType: string,
    prepareAction: PrepareProposalActionFunction<TAction>,
) => void;

export interface IActionsContext<TAction extends IProposalCreateAction = IProposalCreateAction> {
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

const actionsContext = createContext<IActionsContext | null>(null);

export const ActionsProvider = ({ children }: { children: React.ReactNode }) => {
    const [prepareActions, setPrepareActions] = useState<PrepareProposalActionMap>({});
    const [smartContractAbis, setSmartContractAbis] = useState<ISmartContractAbi[]>([]);

    const addPrepareAction = useCallback(
        (type: string, prepareAction: PrepareProposalActionFunction) =>
            setPrepareActions((current) => ({ ...current, [type]: prepareAction })),
        [],
    );

    const addSmartContractAbi = useCallback(
        (abi: ISmartContractAbi) =>
            setSmartContractAbis((current) => {
                const alreadyExists = current.some((currentAbi) =>
                    addressUtils.isAddressEqual(currentAbi.address, abi.address),
                );

                return alreadyExists ? current : [abi, ...current];
            }),
        [],
    );

    return (
        <actionsContext.Provider
            value={{
                prepareActions,
                addPrepareAction,
                smartContractAbis,
                addSmartContractAbi,
            }}
        >
            {children}
        </actionsContext.Provider>
    );
};

export const useActionsContext = <
    TAction extends IProposalCreateAction = IProposalCreateAction,
>(): IActionsContext<TAction> => {
    const values = useContext(actionsContext);

    if (values == null) {
        throw new Error('useActionsContext: hook must be used inside a ActionsProvider to work properly.');
    }

    return {
        ...values,
        prepareActions: values.prepareActions as PrepareProposalActionMap<TAction>,
        addPrepareAction: values.addPrepareAction as AddPrepareActionFunction<TAction>,
    };
};
