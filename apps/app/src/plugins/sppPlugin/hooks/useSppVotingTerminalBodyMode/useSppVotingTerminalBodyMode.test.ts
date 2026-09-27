import type { UseQueryResult } from '@tanstack/react-query';
import { renderHook } from '@testing-library/react';
import {
    externalPluginId,
    safeBodyPluginId,
} from '@/plugins/safeMultisigPlugin/constants';
import * as settledReportApi from '@/plugins/safeMultisigPlugin/hooks/useSafeSettledReport';
import {
    type IUseSafeSettledReportReturn,
    SafeSettledReportOutcome,
} from '@/plugins/safeMultisigPlugin/hooks/useSafeSettledReport';
import { generateSafeInfo } from '@/plugins/safeMultisigPlugin/testUtils';
import { Network, PluginInterfaceType } from '@/shared/api/daoService';
import type { ISafeInfoResponse } from '@/shared/api/safeService';
import * as safeServiceApi from '@/shared/api/safeService';
import {
    generateSppProposal,
    generateSppStage,
    generateSppStagePlugin,
} from '../../testUtils';
import {
    type ISppProposal,
    type ISppStagePlugin,
    SppProposalType,
    VotingBodyBrandIdentity,
} from '../../types';
import { useSppVotingTerminalBodyMode } from './useSppVotingTerminalBodyMode';

describe('useSppVotingTerminalBodyMode hook', () => {
    const safeAddress = '0x0000000000000000000000000000000000000001';
    const stageIndex = 1;

    const useSafeInfoSpy = jest.spyOn(safeServiceApi, 'useSafeInfo');
    const useSafeSettledReportSpy = jest.spyOn(
        settledReportApi,
        'useSafeSettledReport',
    );

    beforeEach(() => {
        useSafeInfoSpy.mockReturnValue({
            data: generateSafeInfo({ version: '1.4.1' }),
        } as unknown as UseQueryResult<ISafeInfoResponse>);
        useSafeSettledReportSpy.mockReturnValue({
            outcome: undefined,
            isLoading: false,
            isError: false,
        } satisfies IUseSafeSettledReportReturn);
    });

    afterEach(() => {
        useSafeInfoSpy.mockReset();
        useSafeSettledReportSpy.mockReset();
    });

    const renderMode = (overrides?: {
        plugin?: Partial<ISppStagePlugin>;
        proposal?: Partial<ISppProposal>;
    }) => {
        const plugin = generateSppStagePlugin({
            address: safeAddress,
            interfaceType: undefined,
            brandId: VotingBodyBrandIdentity.SAFE,
            ...overrides?.plugin,
        });
        const stage = generateSppStage({ stageIndex, plugins: [plugin] });
        const proposal = generateSppProposal({
            network: Network.ETHEREUM_MAINNET,
            pluginAddress: '0x00000000000000000000000000000000000000ff',
            proposalIndex: '1',
            stageIndex,
            results: [
                {
                    pluginAddress: safeAddress,
                    stage: stageIndex,
                    resultType: SppProposalType.APPROVAL,
                },
            ],
            ...overrides?.proposal,
        });

        return renderHook(() =>
            useSppVotingTerminalBodyMode({ plugin, proposal, stage }),
        );
    };

    it('keeps every slot on the Safe body when a settled report is recovered', () => {
        useSafeSettledReportSpy.mockReturnValue({
            outcome: SafeSettledReportOutcome.FOUND,
            isLoading: false,
            isError: false,
        });

        const { result } = renderMode();

        expect(result.current.pluginId).toBe(safeBodyPluginId);
        expect(result.current.isHistoryMissing).toBe(false);
    });

    it('routes to the external fallback and flags missing history when the scan proved the report never existed', () => {
        useSafeSettledReportSpy.mockReturnValue({
            outcome: SafeSettledReportOutcome.NOT_REPORTED,
            isLoading: false,
            isError: false,
        });

        const { result } = renderMode();

        expect(result.current.pluginId).toBe(externalPluginId);
        expect(result.current.isHistoryMissing).toBe(true);
    });

    it('treats an exhausted scan as missing history, since the report could not be confirmed', () => {
        useSafeSettledReportSpy.mockReturnValue({
            outcome: SafeSettledReportOutcome.SCAN_EXHAUSTED,
            isLoading: false,
            isError: false,
        });

        const { result } = renderMode();

        expect(result.current.pluginId).toBe(externalPluginId);
        expect(result.current.isHistoryMissing).toBe(true);
    });

    it('keeps the Safe body and never claims missing history while the scan is still running', () => {
        useSafeSettledReportSpy.mockReturnValue({
            outcome: SafeSettledReportOutcome.NOT_REPORTED,
            isLoading: true,
            isError: false,
        });

        const { result } = renderMode();

        expect(result.current.pluginId).toBe(safeBodyPluginId);
        expect(result.current.isHistoryMissing).toBe(false);
    });

    it('keeps the Safe body and never claims missing history when the scan failed', () => {
        useSafeSettledReportSpy.mockReturnValue({
            outcome: SafeSettledReportOutcome.NOT_REPORTED,
            isLoading: false,
            isError: true,
        });

        const { result } = renderMode();

        expect(result.current.pluginId).toBe(safeBodyPluginId);
        expect(result.current.isHistoryMissing).toBe(false);
    });

    it('leaves the settled scan off and stays on the Safe body when no verdict is recorded for the body', () => {
        useSafeSettledReportSpy.mockReturnValue({
            outcome: SafeSettledReportOutcome.NOT_REPORTED,
            isLoading: false,
            isError: false,
        });

        const { result } = renderMode({ proposal: { results: [] } });

        expect(result.current.pluginId).toBe(safeBodyPluginId);
        expect(result.current.isHistoryMissing).toBe(false);
        expect(useSafeSettledReportSpy).toHaveBeenCalledWith(
            expect.objectContaining({ enabled: false }),
        );
    });

    it('drops a Safe older than 1.4.1 to the external fallback without calling it missing history', () => {
        useSafeInfoSpy.mockReturnValue({
            data: generateSafeInfo({ version: '1.3.0' }),
        } as unknown as UseQueryResult<ISafeInfoResponse>);
        useSafeSettledReportSpy.mockReturnValue({
            outcome: SafeSettledReportOutcome.FOUND,
            isLoading: false,
            isError: false,
        });

        const { result } = renderMode();

        expect(result.current.pluginId).toBe(externalPluginId);
        expect(result.current.isHistoryMissing).toBe(false);
        expect(useSafeSettledReportSpy).toHaveBeenCalledWith(
            expect.objectContaining({ enabled: false }),
        );
    });

    it('retains the Safe body when the version is unknown, rather than assuming it is unsupported', () => {
        useSafeInfoSpy.mockReturnValue({
            data: generateSafeInfo({ version: null }),
        } as unknown as UseQueryResult<ISafeInfoResponse>);
        useSafeSettledReportSpy.mockReturnValue({
            outcome: SafeSettledReportOutcome.FOUND,
            isLoading: false,
            isError: false,
        });

        const { result } = renderMode();

        expect(result.current.pluginId).toBe(safeBodyPluginId);
        expect(result.current.isHistoryMissing).toBe(false);
    });

    it('retains the Safe body while Safe info is unavailable', () => {
        useSafeInfoSpy.mockReturnValue({
            data: undefined,
        } as unknown as UseQueryResult<ISafeInfoResponse>);
        useSafeSettledReportSpy.mockReturnValue({
            outcome: SafeSettledReportOutcome.FOUND,
            isLoading: false,
            isError: false,
        });

        const { result } = renderMode();

        expect(result.current.pluginId).toBe(safeBodyPluginId);
        expect(result.current.isHistoryMissing).toBe(false);
    });

    it('resolves a native body to its own interface type without reading Safe state', () => {
        const { result } = renderMode({
            plugin: { interfaceType: PluginInterfaceType.MULTISIG },
        });

        expect(result.current.pluginId).toBe(PluginInterfaceType.MULTISIG);
        expect(result.current.isHistoryMissing).toBe(false);
        expect(useSafeInfoSpy).toHaveBeenCalledWith(
            expect.anything(),
            expect.objectContaining({ enabled: false }),
        );
        expect(useSafeSettledReportSpy).toHaveBeenCalledWith(
            expect.objectContaining({ enabled: false }),
        );
    });

    it('falls back to external and reads no Safe state on a network the Safe service does not serve', () => {
        const { result } = renderMode({
            proposal: { network: Network.CITREA_MAINNET },
        });

        expect(result.current.pluginId).toBe(externalPluginId);
        expect(result.current.isHistoryMissing).toBe(false);
        expect(useSafeInfoSpy).toHaveBeenCalledWith(
            expect.anything(),
            expect.objectContaining({ enabled: false }),
        );
        expect(useSafeSettledReportSpy).toHaveBeenCalledWith(
            expect.objectContaining({ enabled: false }),
        );
    });
});
