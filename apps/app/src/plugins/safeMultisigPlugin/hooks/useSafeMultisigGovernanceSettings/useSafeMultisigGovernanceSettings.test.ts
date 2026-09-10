import { renderHook } from '@testing-library/react';
import * as ensApi from '@/modules/ens';
import {
    generateSppProposal,
    generateSppStage,
} from '@/plugins/sppPlugin/testUtils';
import { Network } from '@/shared/api/daoService';
import * as safeServiceApi from '@/shared/api/safeService';
import { generateSafeInfo } from '../../testUtils';
import * as settledReportApi from '../useSafeSettledReport';
import { useSafeMultisigGovernanceSettings } from './useSafeMultisigGovernanceSettings';

describe('useSafeMultisigGovernanceSettings hook', () => {
    const body = '0x0000000000000000000000000000000000000001';
    const daoId = `${Network.ETHEREUM_SEPOLIA}-0x0000000000000000000000000000000000000002`;

    const useSafeInfoSpy = jest.spyOn(safeServiceApi, 'useSafeInfo');
    const useSafeSettledReportSpy = jest.spyOn(
        settledReportApi,
        'useSafeSettledReport',
    );
    const useEnsNameSpy = jest.spyOn(ensApi, 'useEnsName');

    beforeEach(() => {
        useSafeInfoSpy.mockReturnValue({
            data: generateSafeInfo({ threshold: 2, nonce: '7' }),
        } as unknown as ReturnType<typeof safeServiceApi.useSafeInfo>);
        useSafeSettledReportSpy.mockReturnValue({
            settledReport: undefined,
            isLoading: false,
            isError: false,
        });
        useEnsNameSpy.mockReturnValue({
            data: undefined,
        } as unknown as ReturnType<typeof ensApi.useEnsName>);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    const key = 'app.plugins.safeMultisig.safeMultisigGovernanceSettings';

    const termsFor = (stageIndex: number, currentStage: number) => {
        const { result } = renderHook(() =>
            useSafeMultisigGovernanceSettings({
                daoId,
                pluginAddress: body,
                settings: {},
                proposal: generateSppProposal({ stageIndex: currentStage }),
                stage: generateSppStage({ stageIndex }),
            }),
        );

        return result.current.map((setting) => setting.term);
    };

    it('states live Safe state for the stage the proposal is on', () => {
        // Nothing has been decided yet, so the Safe as it stands is what would apply.
        expect(termsFor(1, 1)).toEqual(
            expect.arrayContaining([
                `${key}.threshold`,
                `${key}.currentNonce`,
                `${key}.version`,
            ]),
        );
    });

    it('states live Safe state for a stage the proposal has not reached', () => {
        // A pending later stage has had no say yet: its body has done nothing to record.
        expect(termsFor(2, 1)).toEqual(
            expect.arrayContaining([
                `${key}.threshold`,
                `${key}.currentNonce`,
                `${key}.version`,
            ]),
        );
    });

    it('states no configuration once the body sits on an elapsed stage', () => {
        // The veto that never fired: no report to recover, and today's Safe is not what applied.
        const terms = termsFor(1, 2);

        expect(terms).not.toContain(`${key}.threshold`);
        expect(terms).not.toContain(`${key}.currentNonce`);
        expect(terms).not.toContain(`${key}.version`);
        expect(terms).toContain(`${key}.safe`);
    });
});
