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
        isLoading: boolean;
        isSuccess: boolean;
    }) =>
        useSimulateProposalCreationSpy.mockReturnValue({
            isError: false,
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
        mockSimulation({ isLoading: false, isSuccess: true });

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
        mockSimulation({ isLoading: false, isSuccess: true });

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
        mockSimulation({ isLoading: false, isSuccess: true });

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
        mockSimulation({ isLoading: false, isSuccess: false });

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
        mockSimulation({ isLoading: true, isSuccess: false });

        const { result } = renderHook(() =>
            useSppPermissionCheckProposalCreation(
                params as Parameters<
                    typeof useSppPermissionCheckProposalCreation
                >[0],
            ),
        );

        expect(result.current.isLoading).toBeTruthy();
    });
});
