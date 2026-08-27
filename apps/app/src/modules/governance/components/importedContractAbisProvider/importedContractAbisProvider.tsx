'use client';

import { addressUtils } from '@aragon/gov-ui-kit';
import {
    createContext,
    type ReactNode,
    useCallback,
    useContext,
    useMemo,
    useState,
} from 'react';
import type { Network } from '@/shared/api/daoService';
import type { ISmartContractAbi } from '../../api/smartContractService';

export interface IImportedContractAbisContext {
    /**
     * ABIs of the smart contracts imported by the user, across every network.
     */
    abis: ISmartContractAbi[];
    /**
     * Adds the ABI to the imported list, ignoring contracts already imported for the same network.
     */
    addAbi: (abi: ISmartContractAbi) => void;
}

export interface IImportedContractAbisProviderProps {
    /**
     * Children of the provider.
     */
    children?: ReactNode;
}

const importedContractAbisContext =
    createContext<IImportedContractAbisContext | null>(null);

/**
 * Holds the smart contracts imported through the action composer. The store is mounted above the
 * dialog root on purpose: a composer rendered inside a dialog (e.g. the nested actions dialog)
 * unmounts on close, so keeping the imports in the composer state would drop them on every close.
 */
export const ImportedContractAbisProvider: React.FC<
    IImportedContractAbisProviderProps
> = (props) => {
    const { children } = props;

    const [abis, setAbis] = useState<ISmartContractAbi[]>([]);

    const addAbi = useCallback(
        (abi: ISmartContractAbi) =>
            setAbis((current) => {
                const alreadyExists = current.some(
                    (currentAbi) =>
                        currentAbi.network === abi.network &&
                        addressUtils.isAddressEqual(
                            currentAbi.address,
                            abi.address,
                        ),
                );

                return alreadyExists ? current : [abi, ...current];
            }),
        [],
    );

    const contextValues = useMemo(() => ({ abis, addAbi }), [abis, addAbi]);

    return (
        <importedContractAbisContext.Provider value={contextValues}>
            {children}
        </importedContractAbisContext.Provider>
    );
};

/**
 * Returns the imported smart contracts of the given network alongside the callback to import a new
 * one. The list is empty when the network is not resolved yet, as an ABI is only usable on the
 * network it has been fetched for.
 */
export const useImportedContractAbis = (
    network?: Network,
): IImportedContractAbisContext => {
    const values = useContext(importedContractAbisContext);

    if (values == null) {
        throw new Error(
            'useImportedContractAbis: hook must be used inside a ImportedContractAbisProvider to work properly.',
        );
    }

    const { abis, addAbi } = values;

    const networkAbis = useMemo(
        () => abis.filter((abi) => abi.network === network),
        [abis, network],
    );

    return { abis: networkAbis, addAbi };
};
