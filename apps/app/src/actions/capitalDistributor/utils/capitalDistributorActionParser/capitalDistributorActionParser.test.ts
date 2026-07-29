import type { IProposalActionInputDataParameter } from '@aragon/gov-ui-kit';
import { stringToHex, zeroAddress, zeroHash } from 'viem';
import { capitalDistributorActionParser } from './capitalDistributorActionParser';

const metadataIpfsUri = 'ipfs://bafybeigtest';
const merkleRoot =
    '0xabc1230000000000000000000000000000000000000000000000000000000000';
const merkleStrategyId =
    '0x6d65726b6c652d6469737472696275746f722d73747261746567790000000000';
const payoutToken = '0x1111111111111111111111111111111111111111';
const veLockEncoderId =
    '0x7665e36c000000000000000000000000000000000000000000000000000000ff';

const buildInputDataParameters = (
    overrides: {
        strategyValue?: unknown;
        payoutValue?: unknown;
        settingsValue?: unknown;
    } = {},
): IProposalActionInputDataParameter[] => [
    {
        name: '_metadataURI',
        type: 'bytes',
        value: stringToHex(metadataIpfsUri),
    },
    {
        name: '_strategy',
        type: 'tuple',
        value: overrides.strategyValue ?? {
            strategyId: merkleStrategyId,
            strategyParams: '0x',
            initData: merkleRoot,
        },
    },
    {
        name: '_payout',
        type: 'tuple',
        value: overrides.payoutValue ?? {
            token: payoutToken,
            actionEncoderId: zeroHash,
            actionEncoderInitData: '0x',
        },
    },
    {
        name: '_settings',
        type: 'tuple',
        value: overrides.settingsValue ?? {
            startTime: 0,
            endTime: 0,
        },
    },
];

describe('capitalDistributorActionParser', () => {
    describe('parseCreateCampaignInputData', () => {
        it('decodes a default-payout open-ended campaign with object-shaped tuple values', () => {
            const result =
                capitalDistributorActionParser.parseCreateCampaignInputData(
                    buildInputDataParameters(),
                );

            expect(result).toEqual({
                metadataUri: metadataIpfsUri,
                strategyId: merkleStrategyId,
                merkleRoot,
                payoutToken,
                actionEncoderId: zeroHash,
                startTime: 0,
                endTime: 0,
            });
        });

        it('decodes a ve-lock encoder scheduled campaign with array-shaped tuple values and bigint timestamps', () => {
            const startTime = 1_750_000_000;
            const endTime = 1_760_000_000;

            const result =
                capitalDistributorActionParser.parseCreateCampaignInputData(
                    buildInputDataParameters({
                        strategyValue: [merkleStrategyId, '0x', merkleRoot],
                        payoutValue: [
                            payoutToken,
                            veLockEncoderId,
                            '0xdeadbeef',
                        ],
                        settingsValue: [BigInt(startTime), BigInt(endTime)],
                    }),
                );

            expect(result).toEqual({
                metadataUri: metadataIpfsUri,
                strategyId: merkleStrategyId,
                merkleRoot,
                payoutToken,
                actionEncoderId: veLockEncoderId,
                startTime,
                endTime,
            });
        });

        it('returns safe zero defaults for malformed or missing tuple values', () => {
            const result =
                capitalDistributorActionParser.parseCreateCampaignInputData([
                    { name: '_metadataURI', type: 'bytes', value: '' },
                    { name: '_strategy', type: 'tuple', value: null },
                    { name: '_payout', type: 'tuple', value: null },
                    { name: '_settings', type: 'tuple', value: null },
                ]);

            expect(result).toEqual({
                metadataUri: '',
                strategyId: zeroHash,
                merkleRoot: zeroHash,
                payoutToken: zeroAddress,
                actionEncoderId: zeroHash,
                startTime: 0,
                endTime: 0,
            });
        });
    });
});
