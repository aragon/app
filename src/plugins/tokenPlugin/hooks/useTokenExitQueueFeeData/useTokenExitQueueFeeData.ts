import type { Hex } from 'viem';
import { useReadContracts } from 'wagmi';
import { dynamicExitQueueAbi } from '../../utils/tokenExitQueueTransactionUtils/dynamicExitQueueAbi';
import type {
    ITicketData,
    IUseTokenExitQueueFeeDataParams,
    IUseTokenExitQueueFeeDataReturn,
} from './useTokenExitQueueFeeData.api';

export const useTokenExitQueueFeeData = (
    params: IUseTokenExitQueueFeeDataParams,
): IUseTokenExitQueueFeeDataReturn => {
    const {
        tokenId,
        lockManagerAddress,
        chainId,
        enabled = true,
        refetchInterval,
    } = params;

    const { data, isLoading, refetch } = useReadContracts({
        contracts: [
            // 0: queue (ticket data)
            {
                abi: dynamicExitQueueAbi,
                functionName: 'queue',
                address: lockManagerAddress as Hex,
                args: [tokenId],
                chainId,
            },
            // 1: calculateFee
            {
                abi: dynamicExitQueueAbi,
                functionName: 'calculateFee',
                address: lockManagerAddress as Hex,
                args: [tokenId],
                chainId,
            },
            // 2: canExit
            {
                abi: dynamicExitQueueAbi,
                functionName: 'canExit',
                address: lockManagerAddress as Hex,
                args: [tokenId],
                chainId,
            },
            // 3: isCool
            {
                abi: dynamicExitQueueAbi,
                functionName: 'isCool',
                address: lockManagerAddress as Hex,
                args: [tokenId],
                chainId,
            },
            // 4: globalFeePercent (fallback for v1 tickets)
            {
                abi: dynamicExitQueueAbi,
                functionName: 'feePercent',
                address: lockManagerAddress as Hex,
                chainId,
            },
            // 5: globalMinFeePercent (fallback for v1 tickets)
            {
                abi: dynamicExitQueueAbi,
                functionName: 'minFeePercent',
                address: lockManagerAddress as Hex,
                chainId,
            },
            // 6: globalCooldown (fallback for v1 tickets)
            {
                abi: dynamicExitQueueAbi,
                functionName: 'cooldown',
                address: lockManagerAddress as Hex,
                chainId,
            },
            // 7: globalMinCooldown (fallback for v1 tickets)
            {
                abi: dynamicExitQueueAbi,
                functionName: 'minCooldown',
                address: lockManagerAddress as Hex,
                chainId,
            },
        ],
        query: { enabled, refetchInterval },
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

    const parseTicketData = (result: unknown): ITicketData | undefined => {
        if (typeof result !== 'object' || result == null) {
            return;
        }

        const candidate = result as Record<string, unknown>;

        const holder = candidate.holder;
        const queuedAt = candidate.queuedAt;

        if (typeof holder !== 'string' || !holder.startsWith('0x')) {
            return;
        }

        if (typeof queuedAt !== 'number') {
            return;
        }

        return {
            holder: holder as `0x${string}`,
            queuedAt,
            minCooldown:
                typeof candidate.minCooldown === 'number'
                    ? candidate.minCooldown
                    : undefined,
            cooldown:
                typeof candidate.cooldown === 'number'
                    ? candidate.cooldown
                    : undefined,
            feePercent:
                typeof candidate.feePercent === 'number'
                    ? candidate.feePercent
                    : undefined,
            minFeePercent:
                typeof candidate.minFeePercent === 'number'
                    ? candidate.minFeePercent
                    : undefined,
            slope:
                typeof candidate.slope === 'bigint'
                    ? candidate.slope
                    : undefined,
        };
    };

    const ticketData = data?.[0]?.result;
    const feeAmountData = data?.[1]?.result;
    const canExitData = data?.[2]?.result;
    const isCoolData = data?.[3]?.result;
    const globalFeePercent = data?.[4]?.result;
    const globalMinFeePercent = data?.[5]?.result;
    const globalCooldown = data?.[6]?.result;
    const globalMinCooldown = data?.[7]?.result;

    const parsedTicketData = parseTicketData(ticketData);

    const ticket = parsedTicketData
        ? {
              holder: parsedTicketData.holder,
              queuedAt: parsedTicketData.queuedAt,
              minCooldown:
                  parsedTicketData.minCooldown ??
                  normalizeGlobalNumber(globalMinCooldown),
              cooldown:
                  parsedTicketData.cooldown ??
                  normalizeGlobalNumber(globalCooldown),
              feePercent:
                  parsedTicketData.feePercent ??
                  normalizeGlobalNumber(globalFeePercent),
              minFeePercent:
                  parsedTicketData.minFeePercent ??
                  normalizeGlobalNumber(globalMinFeePercent),
              slope: parsedTicketData.slope ?? BigInt(0),
          }
        : undefined;

    return {
        ticket,
        feeAmount: feeAmountData ?? BigInt(0),
        canExit: canExitData ?? false,
        isCool: isCoolData ?? false,
        isLoading,
        refetch: async () => {
            await refetch();
        },
    };
};
