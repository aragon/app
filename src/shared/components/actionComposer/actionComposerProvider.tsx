import type { ISmartContractAbi } from '@/modules/governance/api/smartContractService';
import { addressUtils } from '@aragon/gov-ui-kit';
import { createContext, useCallback, useContext, useState } from 'react';

export interface IActionComposerContext {
    /**
     * ABIs of smart contract to be used for adding custom actions to proposals.
     */
    smartContractAbis: ISmartContractAbi[];
    /**
     * Callback called to add a smart contract ABI for proposal creation.
     */
    addSmartContractAbi: (abi: ISmartContractAbi) => void;
}

const actionComposerContext = createContext<IActionComposerContext | null>(null);

export interface IActionComposerProviderProps {
    children: React.ReactNode;
}

export const ActionComposerProvider: React.FC<IActionComposerProviderProps> = (props) => {
    const { children } = props;

    const [smartContractAbis, setSmartContractAbis] = useState<ISmartContractAbi[]>([]);

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

    const contextValues = {
        smartContractAbis,
        addSmartContractAbi,
    };

    return <actionComposerContext.Provider value={contextValues}>{children}</actionComposerContext.Provider>;
};

export const useActionComposerContext = (): IActionComposerContext => {
    const values = useContext(actionComposerContext);

    if (values == null) {
        throw new Error('useActionComposerContext: hook must be used inside a ActionComposerProvider to work properly.');
    }

    return values;
};
