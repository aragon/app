import { smartContractService } from '@/modules/governance/api/smartContractService';
import type { Network } from '@/shared/api/daoService';
import { addressUtils } from '@aragon/gov-ui-kit';

class ContractUtils {
    private safeInterfaceIndicators = ['GnosisSafe', 'Safe', 'Gnosis Safe', 'SafeProxy'];

    /**
     * Checks if a given contract address is a Safe (Gnosis Safe) contract.
     * This function checks the contract name for known Safe-related keywords.
     *
     * @param address - The contract address to check
     * @param network - The network where the contract is deployed
     * @returns Promise<boolean> - True if the contract is likely a Safe, false otherwise
     */
    isSafeContract = async (address: string, network: Network): Promise<boolean> => {
        if (!addressUtils.isAddress(address)) {
            return false;
        }

        try {
            const contractAbi = await smartContractService.getAbi({
                urlParams: { network, address },
            });

            if (!contractAbi) {
                return false;
            }

            const contractName = contractAbi.name.toLowerCase();
            const hasNameIndicator = this.safeInterfaceIndicators.some((indicator) =>
                contractName.includes(indicator.toLowerCase()),
            );

            return hasNameIndicator;
        } catch {
            // Failed to fetch contract info, assume it's not a Safe
            return false;
        }
    };
}

export const contractUtils = new ContractUtils();
