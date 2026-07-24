import { addressUtils } from '@aragon/gov-ui-kit';
import { renderHook } from '@testing-library/react';
import * as useSimulateProposalModule from '@/modules/governance/hooks/useSimulateProposal';
import type { IPermissionCheckGuardResult } from '@/modules/governance/types';
import * as daoService from '@/shared/api/daoService';
import * as useDaoPluginsModule from '@/shared/hooks/useDaoPlugins';
import {
    generateDao,
    generateDaoPlugin,
    generateFilterComponentPlugin,
    generateReactQueryResultSuccess,
} from '@/shared/testUtils';
import { pluginRegistryUtils } from '@/shared/utils/pluginRegistryUtils';
import {
    generateSppPluginSettings,
    generateSppStage,
    generateSppStagePlugin,
} from '../../testUtils';
import { VotingBodyBrandIdentity } from '../../types';
import { useSppPermissionCheckProposalCreation } from './useSppPermissionCheckProposalCreation';

describe('useSppPermissionCheckProposalCreation', () => {
    const useDaoPluginsSpy = jest.spyOn(useDaoPluginsModule, 'useDaoPlugins');
    const useDaoSpy = jest.spyOn(daoService, 'useDao');
    const useSimulateProposalCreationSpy = jest.spyOn(
        useSimulateProposalModule,
        'useSimulateProposalCreation',
    );
    const getSlotFunctionSpy = jest.spyOn(
        pluginRegistryUtils,
        'getSlotFunction',
    );

    afterEach(() => {
        useDaoPluginsSpy.mockReset();
        useDaoSpy.mockReset();
        useSimulateProposalCreationSpy.mockReset();
        getSlotFunctionSpy.mockReset();
    });

    const createTestParams = (guardResults: IPermissionCheckGuardResult[]) => {
        const subPluginMetas = guardResults.map((_result, index) =>
            generateDaoPlugin({
                address: `0x${String(index + 1).padStart(40, '0')}`,
            }),
        );

        const sppPlugin = generateDaoPlugin({
            address: `0x${'a'.repeat(40)}`,
            settings: generateSppPluginSettings({
                stages: [
                    generateSppStage({
                        plugins: subPluginMetas.map((meta) =>
                            generateSppStagePlugin({ address: meta.address }),
                        ),
                    }),
                ],
            }),
        });

        useDaoPluginsSpy.mockReturnValue(
            subPluginMetas.map((meta) =>
                generateFilterComponentPlugin({ meta }),
            ),
        );
        useDaoSpy.mockReturnValue(
            generateReactQueryResultSuccess({ data: generateDao() }),
        );

        const slotFunctions = new Map(
            subPluginMetas.map((meta, index) => [
                meta.address,
                () => guardResults[index],
            ]),
        );
        getSlotFunctionSpy.mockImplementation(
            () =>
                ((params: { plugin: { address: string } }) =>
                    slotFunctions.get(params.plugin.address)?.()) as never,
        );

        return { daoId: 'dao-test', plugin: sppPlugin };
    };

    const generateGuardResult = (
        result?: Partial<IPermissionCheckGuardResult>,
    ): IPermissionCheckGuardResult => ({
        hasPermission: false,
        settings: [],
        isLoading: false,
        isRestricted: false,
        ...result,
    });

    const mockSimulation = (result: {
        isError: boolean;
        isLoading: boolean;
        result?: 'success' | 'failure';
    }) =>
        useSimulateProposalCreationSpy.mockReturnValue({
            ...result,
        } as ReturnType<
            typeof useSimulateProposalModule.useSimulateProposalCreation
        >);

    it('returns isRestricted true for a restricted process even when the connected wallet can create a proposal', () => {
        const settings = [[{ term: 'Members', definition: 'Listed only' }]];
        const guardResult = generateGuardResult({
            isRestricted: true,
            settings,
            hasPermission: true,
        });
        const params = createTestParams([guardResult]);
        mockSimulation({ isError: false, isLoading: false, result: 'success' });

        const { result } = renderHook(() =>
            useSppPermissionCheckProposalCreation(
                params as Parameters<
                    typeof useSppPermissionCheckProposalCreation
                >[0],
            ),
        );

        expect(result.current.isRestricted).toBeTruthy();
        expect(result.current.settings).toEqual(settings);
    });

    it('returns isRestricted false when no sub-plugin restricts proposal creation', () => {
        const params = createTestParams([
            generateGuardResult({ isRestricted: false }),
            generateGuardResult({ isRestricted: false }),
        ]);
        mockSimulation({ isError: false, isLoading: false, result: 'success' });

        const { result } = renderHook(() =>
            useSppPermissionCheckProposalCreation(
                params as Parameters<
                    typeof useSppPermissionCheckProposalCreation
                >[0],
            ),
        );

        expect(result.current.isRestricted).toBeFalsy();
    });

    it('returns isRestricted true when any sub-plugin restricts proposal creation', () => {
        const restrictedSettings = [
            [{ term: 'Voting power', definition: '≥10' }],
        ];
        const params = createTestParams([
            generateGuardResult({ isRestricted: false }),
            generateGuardResult({
                isRestricted: true,
                settings: restrictedSettings,
            }),
        ]);
        mockSimulation({ isError: false, isLoading: false, result: 'success' });

        const { result } = renderHook(() =>
            useSppPermissionCheckProposalCreation(
                params as Parameters<
                    typeof useSppPermissionCheckProposalCreation
                >[0],
            ),
        );

        expect(result.current.isRestricted).toBeTruthy();
        expect(result.current.settings).toEqual(restrictedSettings);
    });

    it('derives hasPermission from the proposal creation simulation', () => {
        const params = createTestParams([
            generateGuardResult({ isRestricted: true }),
        ]);
        mockSimulation({ isError: false, isLoading: false, result: 'failure' });

        const { result } = renderHook(() =>
            useSppPermissionCheckProposalCreation(
                params as Parameters<
                    typeof useSppPermissionCheckProposalCreation
                >[0],
            ),
        );

        expect(result.current.hasPermission).toBeFalsy();
        expect(result.current.isRestricted).toBeTruthy();
    });

    it('returns isLoading true while the simulation is loading', () => {
        const params = createTestParams([generateGuardResult()]);
        mockSimulation({ isError: false, isLoading: true });

        const { result } = renderHook(() =>
            useSppPermissionCheckProposalCreation(
                params as Parameters<
                    typeof useSppPermissionCheckProposalCreation
                >[0],
            ),
        );

        expect(result.current.isLoading).toBeTruthy();
    });

    const createSafeTestParams = (
        safeBody?: Partial<
            Parameters<typeof generateSppStagePlugin>[0] & {
                brandId: VotingBodyBrandIdentity;
                proposalCreationConditionAddress?: string;
            }
        >,
    ) => {
        const sppPlugin = generateDaoPlugin({
            address: `0x${'a'.repeat(40)}`,
            settings: generateSppPluginSettings({
                stages: [
                    generateSppStage({
                        plugins: [
                            generateSppStagePlugin({
                                address: `0x${'b'.repeat(40)}`,
                                interfaceType: undefined,
                                brandId: VotingBodyBrandIdentity.SAFE,
                                ...safeBody,
                            }),
                        ],
                    }),
                ],
            }),
        });

        // External bodies are not DAO plugins, so no meta matches by address.
        useDaoPluginsSpy.mockReturnValue([]);
        useDaoSpy.mockReturnValue(
            generateReactQueryResultSuccess({ data: generateDao() }),
        );

        return { daoId: 'dao-test', plugin: sppPlugin };
    };

    it('surfaces a Safe body settings group when it can create proposals', () => {
        const safeAddress = `0x${'b'.repeat(40)}`;
        const params = createSafeTestParams({
            proposalCreationConditionAddress: `0x${'c'.repeat(40)}`,
        });
        mockSimulation({ isError: false, isLoading: false, result: 'success' });

        const { result } = renderHook(() =>
            useSppPermissionCheckProposalCreation(
                params as Parameters<
                    typeof useSppPermissionCheckProposalCreation
                >[0],
            ),
        );

        expect(result.current.isRestricted).toBeTruthy();
        expect(result.current.settings).toEqual([
            [
                {
                    term: 'app.plugins.spp.sppPermissionCheckProposalCreation.pluginLabelName',
                    definition: addressUtils.truncateAddress(safeAddress),
                },
                {
                    term: 'app.plugins.spp.sppPermissionCheckProposalCreation.function',
                    definition:
                        'app.plugins.spp.sppPermissionCheckProposalCreation.requirement',
                },
            ],
        ]);
    });

    it('ignores a Safe body without proposal-creation rights', () => {
        const params = createSafeTestParams({
            proposalCreationConditionAddress: undefined,
        });
        mockSimulation({ isError: false, isLoading: false, result: 'success' });

        const { result } = renderHook(() =>
            useSppPermissionCheckProposalCreation(
                params as Parameters<
                    typeof useSppPermissionCheckProposalCreation
                >[0],
            ),
        );

        expect(result.current.isRestricted).toBeFalsy();
        expect(result.current.settings).toEqual([]);
    });

    it('ignores non-Safe external bodies', () => {
        const params = createSafeTestParams({
            brandId: VotingBodyBrandIdentity.EOA,
            proposalCreationConditionAddress: `0x${'c'.repeat(40)}`,
        });
        mockSimulation({ isError: false, isLoading: false, result: 'success' });

        const { result } = renderHook(() =>
            useSppPermissionCheckProposalCreation(
                params as Parameters<
                    typeof useSppPermissionCheckProposalCreation
                >[0],
            ),
        );

        expect(result.current.isRestricted).toBeFalsy();
        expect(result.current.settings).toEqual([]);
    });

    it('combines an installed internal body with an external Safe body in the same process', () => {
        const internalAddress = `0x${'1'.repeat(40)}`;
        const safeAddress = `0x${'2'.repeat(40)}`;

        const internalMeta = generateDaoPlugin({ address: internalAddress });
        const internalSettings = [
            [{ term: 'Members', definition: 'Listed only' }],
        ];
        const internalGuardResult = generateGuardResult({
            isRestricted: true,
            settings: internalSettings,
        });

        const sppPlugin = generateDaoPlugin({
            address: `0x${'a'.repeat(40)}`,
            settings: generateSppPluginSettings({
                stages: [
                    generateSppStage({
                        plugins: [
                            generateSppStagePlugin({
                                address: internalAddress,
                            }),
                            generateSppStagePlugin({
                                address: safeAddress,
                                interfaceType: undefined,
                                brandId: VotingBodyBrandIdentity.SAFE,
                                proposalCreationConditionAddress: `0x${'c'.repeat(40)}`,
                            }),
                        ],
                    }),
                ],
            }),
        });

        useDaoPluginsSpy.mockReturnValue([
            generateFilterComponentPlugin({ meta: internalMeta }),
        ]);
        useDaoSpy.mockReturnValue(
            generateReactQueryResultSuccess({ data: generateDao() }),
        );

        // Only the internal body resolves to a slot function; the external Safe body
        // (pluginId 'external') falls through to the fallback hook.
        getSlotFunctionSpy.mockImplementation(((slotParams: {
            pluginId: string;
        }) =>
            slotParams.pluginId === internalMeta.interfaceType
                ? () => internalGuardResult
                : undefined) as never);
        mockSimulation({ isError: false, isLoading: false, result: 'success' });

        const params = { daoId: 'dao-test', plugin: sppPlugin };
        const { result } = renderHook(() =>
            useSppPermissionCheckProposalCreation(
                params as Parameters<
                    typeof useSppPermissionCheckProposalCreation
                >[0],
            ),
        );

        expect(result.current.isRestricted).toBeTruthy();
        expect(result.current.settings).toEqual([
            ...internalSettings,
            [
                {
                    term: 'app.plugins.spp.sppPermissionCheckProposalCreation.pluginLabelName',
                    definition: addressUtils.truncateAddress(safeAddress),
                },
                {
                    term: 'app.plugins.spp.sppPermissionCheckProposalCreation.function',
                    definition:
                        'app.plugins.spp.sppPermissionCheckProposalCreation.requirement',
                },
            ],
        ]);
    });
});
