import { type Hex } from 'viem';
import { useReadContract } from 'wagmi';
import { dynamicExitQueueAbi } from '../../utils/tokenExitQueueTransactionUtils/dynamicExitQueueAbi';
import type { IUseTokenExitQueueFeeDataParams, IUseTokenExitQueueFeeDataReturn } from './useTokenExitQueueFeeData.api';

interface ITicketData {
    holder: `0x${string}`;
    queuedAt: number;
    minCooldown?: number;
    cooldown?: number;
    feePercent?: number;
    minFeePercent?: number;
    slope?: bigint;
}

export const useTokenExitQueueFeeData = (params: IUseTokenExitQueueFeeDataParams): IUseTokenExitQueueFeeDataReturn => {
    const { tokenId, lockManagerAddress, chainId, enabled = true, refetchInterval } = params;

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

    // Fallback to global params for v1 tickets (2-field struct); v2 tickets (7-field) include these fields
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

    const normalizeGlobalNumber = (value: unknown): number => {
        if (typeof value === 'bigint') {
            return Number(value);
        }

        if (typeof value === 'number') {
            return value;
        }

        return 0;
    };

    const parseTicketData = (data: unknown): ITicketData | undefined => {
        if (typeof data !== 'object' || data == null) {
            return undefined;
        }

        const candidate = data as Record<string, unknown>;

        const holder = candidate.holder;
        const queuedAt = candidate.queuedAt;

        if (typeof holder !== 'string' || !holder.startsWith('0x')) {
            return undefined;
        }

        if (typeof queuedAt !== 'number') {
            return undefined;
        }

        return {
            holder: holder as `0x${string}`,
            queuedAt,
            minCooldown: typeof candidate.minCooldown === 'number' ? candidate.minCooldown : undefined,
            cooldown: typeof candidate.cooldown === 'number' ? candidate.cooldown : undefined,
            feePercent: typeof candidate.feePercent === 'number' ? candidate.feePercent : undefined,
            minFeePercent: typeof candidate.minFeePercent === 'number' ? candidate.minFeePercent : undefined,
            slope: typeof candidate.slope === 'bigint' ? candidate.slope : undefined,
        };
    };

    const parsedTicketData = parseTicketData(ticketData);

    const ticket = parsedTicketData
        ? {
              holder: parsedTicketData.holder,
              queuedAt: parsedTicketData.queuedAt,
              minCooldown: parsedTicketData.minCooldown ?? normalizeGlobalNumber(globalMinCooldown),
              cooldown: parsedTicketData.cooldown ?? normalizeGlobalNumber(globalCooldown),
              feePercent: parsedTicketData.feePercent ?? normalizeGlobalNumber(globalFeePercent),
              minFeePercent: parsedTicketData.minFeePercent ?? normalizeGlobalNumber(globalMinFeePercent),
              slope: parsedTicketData.slope ?? BigInt(0),
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
