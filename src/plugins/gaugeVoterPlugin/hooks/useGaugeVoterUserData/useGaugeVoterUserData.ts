import { networkDefinitions } from '@/shared/constants/networkDefinitions';
import type { Hex } from 'viem';
import { useAccount, useReadContract, useReadContracts } from 'wagmi';
import { gaugeVoterAbi } from '../../utils/gaugeVoterContractUtils/abi/gaugeVoterAbi';
import type {
    IGaugeUserVote,
    IUseGaugeVoterUserDataParams,
    IUseGaugeVoterUserDataResult,
} from './useGaugeVoterUserData.api';

export const useGaugeVoterUserData = (params: IUseGaugeVoterUserDataParams): IUseGaugeVoterUserDataResult => {
    const { pluginAddress, network, gaugeAddresses, enabled = true } = params;

    const { address: userAddress } = useAccount();
    const { id: chainId } = networkDefinitions[network];

    const isEnabled = enabled && !!userAddress;

    // Read user's total voting power
    const {
        data: votingPowerData,
        refetch: refetchVotingPower,
        isLoading: isVotingPowerLoading,
    } = useReadContract({
        abi: gaugeVoterAbi,
        functionName: 'votingPower',
        address: pluginAddress,
        args: [userAddress as Hex],
        chainId,
        query: { enabled: isEnabled },
    });

    // Read user's used voting power
    const {
        data: usedVotingPowerData,
        refetch: refetchUsedVotingPower,
        isLoading: isUsedVotingPowerLoading,
    } = useReadContract({
        abi: gaugeVoterAbi,
        functionName: 'usedVotingPower',
        address: pluginAddress,
        args: [userAddress as Hex],
        chainId,
        query: { enabled: isEnabled },
    });

    // Read user's votes for each gauge
    const gaugeVotesContracts = gaugeAddresses.map((gaugeAddress) => ({
        abi: gaugeVoterAbi,
        functionName: 'getUserVotes' as const,
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
        userVotes: (gaugeVotesData?.[index]?.result as bigint) ?? BigInt(0),
    }));

    const refetch = () => {
        void refetchVotingPower();
        void refetchUsedVotingPower();
        void refetchGaugeVotes();
    };

    const isLoading = isVotingPowerLoading || isUsedVotingPowerLoading || isGaugeVotesLoading;

    return {
        votingPower: votingPowerData ?? BigInt(0),
        usedVotingPower: usedVotingPowerData ?? BigInt(0),
        gaugeVotes,
        isLoading,
        refetch,
    };
};
