import { useSmartContractAbi } from '@/modules/governance/api/smartContractService';
import { addressUtils } from '@aragon/gov-ui-kit';
import { useMemo } from 'react';
import type { Network } from '../../api/daoService';
import type { QueryOptions } from '../../types';

const safeInterfaceIndicators = ['GnosisSafe', 'Safe', 'Gnosis Safe', 'SafeProxy'];

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

export const useIsSafeContract = (params: IUseIsSafeContractParams, options?: QueryOptions<boolean>) => {
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
        },
    );

    const data = useMemo(() => {
        if (!isAddressValid) {
            return false;
        }

        if (!smartContractAbi) {
            return undefined;
        }

        const contractName = smartContractAbi.name.toLowerCase();
        return safeInterfaceIndicators.some((indicator) => contractName.includes(indicator.toLowerCase()));
    }, [isAddressValid, smartContractAbi]);

    return {
        data,
        isLoading,
        isError,
        error,
    };
};
