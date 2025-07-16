import type { ISmartContractAbi } from '@/modules/governance/api/smartContractService';
import type {
    PrepareProposalActionFunction,
    PrepareProposalActionMap,
} from '@/modules/governance/dialogs/publishProposalDialog';
import { addressUtils } from '@aragon/gov-ui-kit';
import { useCallback, useState } from 'react';

export const useActionComposerContextValues = () => {
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

    return {
        prepareActions,
        addPrepareAction,
        smartContractAbis,
        addSmartContractAbi,
    };
};
