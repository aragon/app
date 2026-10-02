import { safeBodyPluginId } from '@/plugins/safeMultisigPlugin/constants';
import type { ISppPluginSettings } from '@/plugins/sppPlugin/types';
import { VotingBodyBrandIdentity } from '@/plugins/sppPlugin/types';
import { Network, PluginInterfaceType } from '@/shared/api/daoService';
import { generateDao, generateDaoPlugin } from '@/shared/testUtils';
import { daoMemberSourceUtils } from './daoMemberSourceUtils';

describe('daoMemberSourceUtils.resolve', () => {
    const daoId = `${Network.ETHEREUM_MAINNET}-0x1111111111111111111111111111111111111111`;
    const safeAddress = '0xabcdefabcdefabcdefabcdefabcdefabcdefabcd';

    it('includes a standalone Safe process as a member source', () => {
        const safeProcess = generateDaoPlugin({
            address: safeAddress,
            interfaceType: PluginInterfaceType.SAFE,
            isBody: false,
            isProcess: true,
        });

        const sources = daoMemberSourceUtils.resolve({
            dao: generateDao({ plugins: [safeProcess] }),
            daoId,
            bodyPlugins: [],
            processPlugins: [safeProcess],
        });

        expect(sources).toEqual([
            expect.objectContaining({
                address: safeAddress,
                daoId,
                id: safeBodyPluginId,
                kind: 'safe',
                uniqueId: daoMemberSourceUtils.getSafeSourceId(
                    daoId,
                    safeAddress,
                ),
            }),
        ]);
    });

    it('dedupes a Safe represented by an SPP body and process', () => {
        const sppProcess = generateDaoPlugin<ISppPluginSettings>({
            interfaceType: PluginInterfaceType.SPP,
            isBody: false,
            isProcess: true,
            settings: {
                pluginAddress: '0xspp',
                stages: [
                    {
                        stageIndex: 0,
                        plugins: [
                            {
                                address: safeAddress,
                                interfaceType: undefined,
                                brandId: VotingBodyBrandIdentity.SAFE,
                                proposalType: 1,
                            },
                        ],
                        voteDuration: 1,
                        maxAdvance: 1,
                        minAdvance: 0,
                        approvalThreshold: 1,
                        vetoThreshold: 0,
                    },
                ],
            },
        });
        const safeProcess = generateDaoPlugin({
            address: safeAddress,
            interfaceType: PluginInterfaceType.SAFE,
            isBody: false,
            isProcess: true,
        });

        const sources = daoMemberSourceUtils.resolve({
            dao: generateDao({ plugins: [sppProcess, safeProcess] }),
            daoId,
            bodyPlugins: [],
            processPlugins: [sppProcess, safeProcess],
        });

        expect(sources.filter(({ kind }) => kind === 'safe')).toHaveLength(1);
    });

    it('keeps the same Safe distinct for linked DAOs', () => {
        const linkedDaoOne = '0x2222222222222222222222222222222222222222';
        const linkedDaoTwo = '0x3333333333333333333333333333333333333333';
        const safeProcessOne = generateDaoPlugin({
            address: safeAddress,
            daoAddress: linkedDaoOne,
            interfaceType: PluginInterfaceType.SAFE,
            isBody: false,
            isProcess: true,
        });
        const safeProcessTwo = generateDaoPlugin({
            address: safeAddress,
            daoAddress: linkedDaoTwo,
            interfaceType: PluginInterfaceType.SAFE,
            isBody: false,
            isProcess: true,
        });

        const sources = daoMemberSourceUtils.resolve({
            dao: generateDao({
                address: '0x1111111111111111111111111111111111111111',
                plugins: [safeProcessOne, safeProcessTwo],
            }),
            daoId,
            bodyPlugins: [],
            processPlugins: [safeProcessOne, safeProcessTwo],
        });

        expect(sources.map(({ daoId: sourceDaoId }) => sourceDaoId)).toEqual([
            `${Network.ETHEREUM_MAINNET}-${linkedDaoOne}`,
            `${Network.ETHEREUM_MAINNET}-${linkedDaoTwo}`,
        ]);
        expect(sources[0]?.uniqueId).not.toEqual(sources[1]?.uniqueId);
    });
});
