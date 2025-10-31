import { type Hex } from 'viem';
import { useReadContract } from 'wagmi';
import { dynamicExitQueueAbi } from '../../utils/tokenExitQueueTransactionUtils/dynamicExitQueueAbi';
import type { IUseTokenExitQueueFeeDataParams, IUseTokenExitQueueFeeDataReturn } from './useTokenExitQueueFeeData.api';

export const useTokenExitQueueFeeData = (params: IUseTokenExitQueueFeeDataParams): IUseTokenExitQueueFeeDataReturn => {
    const { tokenId, lockManagerAddress, chainId, enabled = true } = params;

    // Read ticket information
    const {
        data: ticketData,
        isLoading: isTicketLoading,
        refetch: refetchTicket,
    } = useReadContract({
        abi: dynamicExitQueueAbi,
        functionName: 'queue',
        address: lockManagerAddress as Hex,
        args: [tokenId],
        chainId,
        query: { enabled },
    });

    // Read calculated fee amount
    const {
        data: feeAmountData,
        isLoading: isFeeLoading,
        refetch: refetchFee,
    } = useReadContract({
        abi: dynamicExitQueueAbi,
        functionName: 'calculateFee',
        address: lockManagerAddress as Hex,
        args: [tokenId],
        chainId,
        query: { enabled },
    });

    // Read canExit status
    const {
        data: canExitData,
        isLoading: isCanExitLoading,
        refetch: refetchCanExit,
    } = useReadContract({
        abi: dynamicExitQueueAbi,
        functionName: 'canExit',
        address: lockManagerAddress as Hex,
        args: [tokenId],
        chainId,
        query: { enabled },
    });

    // Read isCool status
    const {
        data: isCoolData,
        isLoading: isIsCoolLoading,
        refetch: refetchIsCool,
    } = useReadContract({
        abi: dynamicExitQueueAbi,
        functionName: 'isCool',
        address: lockManagerAddress as Hex,
        args: [tokenId],
        chainId,
        query: { enabled },
    });

    // Transform ticket data from contract format to ITokenExitQueueTicket
    const ticket = ticketData
        ? {
              holder: ticketData.holder,
              queuedAt: ticketData.queuedAt,
              minCooldown: ticketData.minCooldown,
              cooldown: ticketData.cooldown,
              feePercent: ticketData.feePercent,
              minFeePercent: ticketData.minFeePercent,
              slope: ticketData.slope,
          }
        : undefined;

    const refetch = () =>
        Promise.allSettled([refetchTicket(), refetchFee(), refetchCanExit(), refetchIsCool()]).then(() => undefined);

    return {
        ticket,
        feeAmount: feeAmountData ?? BigInt(0),
        canExit: canExitData ?? false,
        isCool: isCoolData ?? false,
        isLoading: isTicketLoading || isFeeLoading || isCanExitLoading || isIsCoolLoading,
        refetch,
    };
};
