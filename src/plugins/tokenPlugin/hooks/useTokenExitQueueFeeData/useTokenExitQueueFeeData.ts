import { type Hex } from 'viem';
import { useReadContract } from 'wagmi';
import { dynamicExitQueueAbi } from '../../utils/tokenExitQueueTransactionUtils/dynamicExitQueueAbi';
import type { IUseTokenExitQueueFeeDataParams, IUseTokenExitQueueFeeDataReturn } from './useTokenExitQueueFeeData.api';

interface ITicketDataV1 {
    holder: `0x${string}`;
    queuedAt: number;
}

interface ITicketDataV2 extends ITicketDataV1 {
    minCooldown: number;
    cooldown: number;
    feePercent: number;
    minFeePercent: number;
    slope: bigint;
}

type ParsedTicketData = ITicketDataV1 | ITicketDataV2;

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
    const normalizeGlobalNumber = (value: unknown): number => {
        if (typeof value === 'bigint') {
            return Number(value);
        }

        if (typeof value === 'number') {
            return value;
        }

        return 0;
    };

    const parseTicketData = (data: unknown): ParsedTicketData | undefined => {
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

        const base: ITicketDataV1 = {
            holder: holder as `0x${string}`,
            queuedAt,
        };

        if (
            typeof candidate.minCooldown === 'number' &&
            typeof candidate.cooldown === 'number' &&
            typeof candidate.feePercent === 'number' &&
            typeof candidate.minFeePercent === 'number' &&
            typeof candidate.slope === 'bigint'
        ) {
            return {
                ...base,
                minCooldown: candidate.minCooldown,
                cooldown: candidate.cooldown,
                feePercent: candidate.feePercent,
                minFeePercent: candidate.minFeePercent,
                slope: candidate.slope,
            };
        }

        return base;
    };

    /**
     * Type guard to check if ticket data is v2 format (has all 7 fields).
     */
    const isTicketV2 = (data: ParsedTicketData): data is ITicketDataV2 => 'minCooldown' in data;

    const parsedTicketData = parseTicketData(ticketData);

    const fallbackMinCooldown = normalizeGlobalNumber(globalMinCooldown);
    const fallbackCooldown = normalizeGlobalNumber(globalCooldown);
    const fallbackFeePercent = normalizeGlobalNumber(globalFeePercent);
    const fallbackMinFeePercent = normalizeGlobalNumber(globalMinFeePercent);

    const ticket = parsedTicketData
        ? isTicketV2(parsedTicketData)
            ? {
                  holder: parsedTicketData.holder,
                  queuedAt: parsedTicketData.queuedAt,
                  minCooldown: parsedTicketData.minCooldown,
                  cooldown: parsedTicketData.cooldown,
                  feePercent: parsedTicketData.feePercent,
                  minFeePercent: parsedTicketData.minFeePercent,
                  slope: parsedTicketData.slope,
              }
            : {
                  holder: parsedTicketData.holder,
                  queuedAt: parsedTicketData.queuedAt,
                  minCooldown: fallbackMinCooldown,
                  cooldown: fallbackCooldown,
                  feePercent: fallbackFeePercent,
                  minFeePercent: fallbackMinFeePercent,
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
