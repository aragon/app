import {
    addressUtils,
    type IProposalActionInputDataParameter,
} from '@aragon/gov-ui-kit';
import { type Hex, hexToString, isHex, zeroAddress, zeroHash } from 'viem';

export interface ICreateCampaignActionInputData {
    metadataUri: string;
    strategyId: string;
    merkleRoot: string;
    payoutToken: string;
    actionEncoderId: string;
    startTime: number;
    endTime: number;
}

const readTupleField = (
    value: unknown,
    name: string,
    index: number,
): unknown => {
    if (value == null || typeof value !== 'object') {
        return undefined;
    }

    if (Array.isArray(value)) {
        return value[index];
    }

    return (value as Record<string, unknown>)[name];
};

const toAddress = (value: unknown): string =>
    typeof value === 'string' && addressUtils.isAddress(value)
        ? value
        : zeroAddress;

const toHexValue = (value: unknown): string =>
    typeof value === 'string' && isHex(value) ? value : zeroHash;

const toNumber = (value: unknown): number => {
    if (typeof value === 'number' && Number.isFinite(value)) {
        return value;
    }

    if (typeof value === 'bigint') {
        return Number(value);
    }

    if (typeof value === 'string' && value.length > 0) {
        const parsed = Number(value);

        return Number.isFinite(parsed) ? parsed : 0;
    }

    return 0;
};

const decodeMetadataUri = (value: unknown): string => {
    if (typeof value !== 'string' || value.length === 0) {
        return '';
    }

    if (isHex(value)) {
        try {
            return hexToString(value as Hex);
        } catch {
            return '';
        }
    }

    return value;
};

class CapitalDistributorActionParser {
    parseCreateCampaignInputData = (
        params: IProposalActionInputDataParameter[],
    ): ICreateCampaignActionInputData => {
        const [metadataParam, strategyParam, payoutParam, settingsParam] =
            params;

        const metadataUri = decodeMetadataUri(metadataParam?.value);

        const strategyValue = strategyParam?.value;
        const strategyId = toHexValue(
            readTupleField(strategyValue, 'strategyId', 0),
        );
        const merkleRoot = toHexValue(
            readTupleField(strategyValue, 'initData', 2),
        );

        const payoutValue = payoutParam?.value;
        const payoutToken = toAddress(readTupleField(payoutValue, 'token', 0));
        const actionEncoderId = toHexValue(
            readTupleField(payoutValue, 'actionEncoderId', 1),
        );

        const settingsValue = settingsParam?.value;
        const startTime = toNumber(
            readTupleField(settingsValue, 'startTime', 0),
        );
        const endTime = toNumber(readTupleField(settingsValue, 'endTime', 1));

        return {
            metadataUri,
            strategyId,
            merkleRoot,
            payoutToken,
            actionEncoderId,
            startTime,
            endTime,
        };
    };
}

export const capitalDistributorActionParser =
    new CapitalDistributorActionParser();
