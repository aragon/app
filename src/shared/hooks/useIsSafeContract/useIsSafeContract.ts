import { addressUtils } from '@aragon/gov-ui-kit';
import { useMemo } from 'react';
import { useSmartContractAbi } from '@/modules/governance/api/smartContractService';
import type { Network } from '../../api/daoService';
import type { QueryOptions } from '../../types';

const safeInterfaceIndicators = [
    'GnosisSafe',
    'Safe',
    'Gnosis Safe',
    'SafeProxy',
];

export interface IUseIsSafeContractParams {
    /**
     * The contract address to check
     */
    address?: string;
    /**
     * The network where the contract is deployed
     */
    network: Network;
}

export const useIsSafeContract = (
    params: IUseIsSafeContractParams,
    options?: QueryOptions<boolean>,
) => {
    const { address, network } = params;
    const { enabled: enabledOption } = options ?? {};

    const isAddressValid = address != null && addressUtils.isAddress(address);
    const enabled = enabledOption !== false && isAddressValid;

    const {
        data: smartContractAbi,
        isLoading,
        isError,
        error,
    } = useSmartContractAbi(
        { urlParams: { network, address: address as string } },
        {
            enabled,
            retry: false,
        },
    );

    const data = useMemo(() => {
        const contractName = smartContractAbi?.name.toLowerCase();
        return safeInterfaceIndicators.some((indicator) =>
            contractName?.includes(indicator.toLowerCase()),
        );
    }, [smartContractAbi]);

    return {
        data,
        isLoading,
        isError,
        error,
    };
};
