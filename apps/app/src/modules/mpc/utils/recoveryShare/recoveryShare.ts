import type { Hex } from 'viem';
import type { IMpcServerSharePayload } from '@/modules/mpc/api/mpcService/domain';

/**
 * POC / mock: text serialization of the recovery share (share C) shown once to the user and offered as a .txt
 * download. Format: aragon-mpc-recovery:v1:<systemId>:<epoch>:<index>:<hex>
 */

export const RECOVERY_SHARE_PREFIX = 'aragon-mpc-recovery';
export const RECOVERY_SHARE_VERSION = 'v1';

export interface IMpcRecoveryShare extends IMpcServerSharePayload {
    /**
     * System the recovery share belongs to.
     */
    systemId: string;
}

export const serializeRecoveryShare = (share: IMpcRecoveryShare): string =>
    [
        RECOVERY_SHARE_PREFIX,
        RECOVERY_SHARE_VERSION,
        share.systemId,
        share.epoch.toString(),
        share.index.toString(),
        share.value,
    ].join(':');

/**
 * Parses a serialized recovery share. Also accepts a bare 0x hex value (systemId / epoch unknown, index 3).
 */
export const parseRecoveryShare = (
    text: string,
    fallback?: { systemId: string; epoch: number },
): IMpcRecoveryShare => {
    const trimmed = text.trim();

    if (/^0x[0-9a-fA-F]{64}$/.test(trimmed)) {
        if (fallback == null) {
            throw new Error(
                'recoveryShare: missing system context for raw hex share',
            );
        }

        return {
            systemId: fallback.systemId,
            epoch: fallback.epoch,
            index: 3,
            value: trimmed as Hex,
        };
    }

    const parts = trimmed.split(':');

    if (
        parts.length !== 6 ||
        parts[0] !== RECOVERY_SHARE_PREFIX ||
        parts[1] !== RECOVERY_SHARE_VERSION
    ) {
        throw new Error('recoveryShare: invalid recovery share format');
    }

    const [, , systemId, epochString, indexString, value] = parts;
    const epoch = Number(epochString);
    const index = Number(indexString);

    if (
        systemId.length === 0 ||
        !Number.isInteger(epoch) ||
        !Number.isInteger(index) ||
        !/^0x[0-9a-fA-F]{64}$/.test(value)
    ) {
        throw new Error('recoveryShare: invalid recovery share content');
    }

    return { systemId, epoch, index, value: value as Hex };
};

export const recoveryShareUtils = {
    serializeRecoveryShare,
    parseRecoveryShare,
};
