import { networkDefinitions } from '@/shared/constants/networkDefinitions';
import type { Hex } from 'viem';
import { useAccount, useReadContract, useReadContracts } from 'wagmi';
import { gaugeVoterAbi } from '../../utils/gaugeVoterContractUtils/abi/gaugeVoterAbi';
import type {
    IGaugeUserVote,
    IUseGaugeVoterUserDataParams,
    IUseGaugeVoterUserDataResult,
} from './useGaugeVoterUserData.api';

const erc20VotesAbi = [
    {
        type: 'function',
        name: 'getVotes',
        inputs: [{ name: 'account', type: 'address' }],
        outputs: [{ name: '', type: 'uint256' }],
        stateMutability: 'view',
    },
] as const;

export const useGaugeVoterUserData = (params: IUseGaugeVoterUserDataParams): IUseGaugeVoterUserDataResult => {
    const {
        pluginAddress,
        network,
        gaugeAddresses,
        enabled = true,
        backendVotingPower,
        backendUsedVotingPower,
    } = params;

    const { address: userAddress } = useAccount();
    const { id: chainId } = networkDefinitions[network];

    const isEnabled = enabled && !!userAddress;

    // Backend-first: Use backend data if available, otherwise fetch from RPC
    const hasBackendVotingPower = backendVotingPower != null;
    const hasBackendUsedVotingPower = backendUsedVotingPower != null;

    // Read ivotesAdapter address from the gauge voter contract (only if backend data not available)
    const { data: ivotesAdapterAddress } = useReadContract({
        abi: gaugeVoterAbi,
        functionName: 'ivotesAdapter',
        address: pluginAddress,
        chainId,
        query: { enabled: isEnabled && !hasBackendVotingPower },
    });

    // Read user's total voting power from the ivotesAdapter (only if backend data not available)
    const {
        data: rpcTotalVotingPowerData,
        refetch: refetchTotalVotingPower,
        isLoading: isTotalVotingPowerLoading,
    } = useReadContract({
        abi: erc20VotesAbi,
        functionName: 'getVotes',
        address: ivotesAdapterAddress as Hex,
        args: [userAddress as Hex],
        chainId,
        query: { enabled: isEnabled && !!ivotesAdapterAddress && !hasBackendVotingPower },
    });

    // Read user's used voting power from the gauge voter (only if backend data not available)
    const {
        data: rpcUsedVotingPowerData,
        refetch: refetchUsedVotingPower,
        isLoading: isUsedVotingPowerLoading,
    } = useReadContract({
        abi: gaugeVoterAbi,
        functionName: 'usedVotingPower',
        address: pluginAddress,
        args: [userAddress as Hex],
        chainId,
        query: { enabled: isEnabled && !hasBackendUsedVotingPower },
    });

    // Read user's votes for each gauge
    const gaugeVotesContracts = gaugeAddresses.map((gaugeAddress) => ({
        abi: gaugeVoterAbi,
        functionName: 'votes' as const,
        address: pluginAddress,
        args: [userAddress as Hex, gaugeAddress],
        chainId,
    }));

    const {
        data: gaugeVotesData,
        refetch: refetchGaugeVotes,
        isLoading: isGaugeVotesLoading,
    } = useReadContracts({
        contracts: gaugeVotesContracts,
        query: { enabled: isEnabled && gaugeAddresses.length > 0 },
    });

    // Transform gauge votes data
    const gaugeVotes: IGaugeUserVote[] = gaugeAddresses.map((gaugeAddress, index) => ({
        gaugeAddress,
        userVotes: gaugeVotesData?.[index]?.result ?? BigInt(0),
    }));

    const refetch = () => {
        void refetchTotalVotingPower();
        void refetchUsedVotingPower();
        void refetchGaugeVotes();
    };

    // Use backend data if available, otherwise use RPC data
    const totalVotingPower = hasBackendVotingPower
        ? BigInt(backendVotingPower)
        : (rpcTotalVotingPowerData ?? BigInt(0));
    const usedVotingPower = hasBackendUsedVotingPower
        ? BigInt(backendUsedVotingPower)
        : (rpcUsedVotingPowerData ?? BigInt(0));

    // Only show loading if we're waiting for RPC data (backend is instant)
    const isLoading =
        (!hasBackendVotingPower && isTotalVotingPowerLoading) ||
        (!hasBackendUsedVotingPower && isUsedVotingPowerLoading) ||
        isGaugeVotesLoading;

    return {
        votingPower: totalVotingPower,
        usedVotingPower: usedVotingPower,
        gaugeVotes,
        isLoading,
        refetch,
    };
};
