import { networkDefinitions } from '@/shared/constants/networkDefinitions';
import type { Hex } from 'viem';
import { useAccount, useReadContract, useReadContracts } from 'wagmi';
import { gaugeVoterAbi } from '../../utils/gaugeVoterContractUtils/abi/gaugeVoterAbi';
import type {
    IGaugeTotalVotes,
    IGaugeUserVote,
    IUseGaugeVoterUserDataParams,
    IUseGaugeVoterUserDataResult,
} from './useGaugeVoterUserData.api';

export const useGaugeVoterUserData = (params: IUseGaugeVoterUserDataParams): IUseGaugeVoterUserDataResult => {
    const { pluginAddress, network, gaugeAddresses, enabled = true } = params;

    const { address: userAddress } = useAccount();
    const { id: chainId } = networkDefinitions[network];

    const isEnabled = enabled && !!userAddress;

    // Read user's used voting power from the gauge voter
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

    // Read whether user is currently voting
    const { data: isVotingData } = useReadContract({
        abi: gaugeVoterAbi,
        functionName: 'isVoting',
        address: pluginAddress,
        args: [userAddress as Hex],
        chainId,
        query: { enabled: isEnabled },
    });

    // Read which gauges the user has voted for
    const { data: gaugesVotedForData } = useReadContract({
        abi: gaugeVoterAbi,
        functionName: 'gaugesVotedFor',
        address: pluginAddress,
        args: [userAddress as Hex],
        chainId,
        query: { enabled: isEnabled },
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

    // Read total votes for each gauge (all users)
    const gaugeTotalVotesContracts = gaugeAddresses.map((gaugeAddress) => ({
        abi: gaugeVoterAbi,
        functionName: 'gaugeVotes' as const,
        address: pluginAddress,
        args: [gaugeAddress],
        chainId,
    }));

    const {
        data: gaugeTotalVotesData,
        refetch: refetchGaugeTotalVotes,
        isLoading: isGaugeTotalVotesLoading,
    } = useReadContracts({
        contracts: gaugeTotalVotesContracts,
        query: { enabled: enabled && gaugeAddresses.length > 0 },
    });

    // Transform gauge votes data
    const gaugeVotes: IGaugeUserVote[] = gaugeAddresses.map((gaugeAddress, index) => ({
        gaugeAddress,
        userVotes: gaugeVotesData?.[index]?.result ?? BigInt(0),
    }));

    // Transform gauge total votes data
    const gaugeTotalVotes: IGaugeTotalVotes[] = gaugeAddresses.map((gaugeAddress, index) => ({
        gaugeAddress,
        totalVotes: gaugeTotalVotesData?.[index]?.result ?? BigInt(0),
    }));

    const refetch = () => {
        void refetchUsedVotingPower();
        void refetchGaugeVotes();
        void refetchGaugeTotalVotes();
    };

    const isLoading = isUsedVotingPowerLoading || isGaugeVotesLoading || isGaugeTotalVotesLoading;

    return {
        votingPower: usedVotingPowerData ?? BigInt(0),
        usedVotingPower: usedVotingPowerData ?? BigInt(0),
        gaugeVotes,
        gaugeTotalVotes,
        isVoting: isVotingData ?? false,
        gaugesVotedFor: gaugesVotedForData ?? [],
        isLoading,
        refetch,
    };
};
