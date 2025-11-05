import { type Hex } from 'viem';
import { useReadContract } from 'wagmi';
import { dynamicExitQueueAbi } from '../../utils/tokenExitQueueTransactionUtils/dynamicExitQueueAbi';
import type { IUseTokenExitQueueFeeDataParams, IUseTokenExitQueueFeeDataReturn } from './useTokenExitQueueFeeData.api';

export const useTokenExitQueueFeeData = (params: IUseTokenExitQueueFeeDataParams): IUseTokenExitQueueFeeDataReturn => {
    const { tokenId, lockManagerAddress, chainId, enabled = true, refetchInterval } = params;

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
        query: { enabled, refetchInterval },
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
        query: { enabled, refetchInterval },
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
        query: { enabled, refetchInterval },
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
        query: { enabled, refetchInterval },
    });

    // Read global fee parameters as fallback for v1 tickets (2-field struct)
    // v2 tickets (7-field struct) will have these in ticketData and won't need fallback
    const { data: globalFeePercent } = useReadContract({
        abi: dynamicExitQueueAbi,
        functionName: 'feePercent',
        address: lockManagerAddress as Hex,
        chainId,
        query: { enabled: enabled && ticketData != null },
    });

    const { data: globalMinFeePercent } = useReadContract({
        abi: dynamicExitQueueAbi,
        functionName: 'minFeePercent',
        address: lockManagerAddress as Hex,
        chainId,
        query: { enabled: enabled && ticketData != null },
    });

    const { data: globalCooldown } = useReadContract({
        abi: dynamicExitQueueAbi,
        functionName: 'cooldown',
        address: lockManagerAddress as Hex,
        chainId,
        query: { enabled: enabled && ticketData != null },
    });

    const { data: globalMinCooldown } = useReadContract({
        abi: dynamicExitQueueAbi,
        functionName: 'minCooldown',
        address: lockManagerAddress as Hex,
        chainId,
        query: { enabled: enabled && ticketData != null },
    });

    // Transform ticket data - handles both v1 (2-field) and v2 (7-field) tickets
    // v1 tickets: Only have holder/queuedAt, fallback to global params
    // v2 tickets: Have all 7 fields, use ticket's stored params

    /**
     * Type guard to check if ticket data is v2 format (has all 7 fields).
     */
    const isTicketV2 = (
        data: { holder: `0x${string}`; queuedAt: number } & Partial<{
            minCooldown: number;
            cooldown: number;
            feePercent: number;
            minFeePercent: number;
            slope: bigint;
        }>,
    ): data is {
        holder: `0x${string}`;
        queuedAt: number;
        minCooldown: number;
        cooldown: number;
        feePercent: number;
        minFeePercent: number;
        slope: bigint;
    } => {
        return (
            'minCooldown' in data &&
            'cooldown' in data &&
            'feePercent' in data &&
            'minFeePercent' in data &&
            'slope' in data &&
            data.minCooldown !== undefined &&
            data.cooldown !== undefined &&
            data.feePercent !== undefined &&
            data.minFeePercent !== undefined &&
            data.slope !== undefined
        );
    };

    const ticket = ticketData
        ? isTicketV2(ticketData)
            ? {
                  holder: ticketData.holder,
                  queuedAt: ticketData.queuedAt,
                  minCooldown: ticketData.minCooldown,
                  cooldown: ticketData.cooldown,
                  feePercent: ticketData.feePercent,
                  minFeePercent: ticketData.minFeePercent,
                  slope: ticketData.slope,
              }
            : {
                  holder: ticketData.holder,
                  queuedAt: ticketData.queuedAt,
                  minCooldown: globalMinCooldown ?? 0,
                  cooldown: globalCooldown ?? 0,
                  feePercent: Number(globalFeePercent ?? 0),
                  minFeePercent: Number(globalMinFeePercent ?? 0),
                  slope: BigInt(0),
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
