import { generateDaoMultisigSettings } from '@/plugins/multisigPlugin/testUtils';
import * as daoService from '@/shared/api/daoService';
import { generateReactQueryResultError, generateReactQueryResultSuccess, ReactQueryWrapper } from '@/shared/testUtils';
import { renderHook } from '@testing-library/react';
import { useMultisigGovernanceSettings } from './useMultisigGovernanceSettings';

describe('useMultisigGovernanceSettings', () => {
    const useDaoSettingsSpy = jest.spyOn(daoService, 'useDaoSettings');

    beforeEach(() => {
        useDaoSettingsSpy.mockReturnValue(generateReactQueryResultSuccess({ data: generateDaoMultisigSettings() }));
    });

    afterEach(() => {
        useDaoSettingsSpy.mockReset();
    });

    it('returns empty array when daoSettings is null', () => {
        useDaoSettingsSpy.mockReturnValue(generateReactQueryResultError({ error: new Error() }));
        const { result } = renderHook(() => useMultisigGovernanceSettings({ daoId: 'multisig-test-id' }), {
            wrapper: ReactQueryWrapper,
        });
        expect(result.current).toEqual([]);
    });

    it('fetches the specified DAO terms and definitions for multisig Dao', async () => {
        const mockSettings = generateDaoMultisigSettings();
        useDaoSettingsSpy.mockReturnValue(generateReactQueryResultSuccess({ data: mockSettings }));
        const { result } = renderHook(() => useMultisigGovernanceSettings({ daoId: 'multisig-test-id' }), {
            wrapper: ReactQueryWrapper,
        });
        const [minimumApproval, proposalCreation] = result.current;
        expect(minimumApproval.term).toBe('app.plugins.multisig.multisigGovernanceSettings.minimumApproval');
        expect(minimumApproval.definition).toContain('app.plugins.multisig.multisigGovernanceSettings.approvals');
        expect(proposalCreation.term).toBe('app.plugins.multisig.multisigGovernanceSettings.proposalCreation');
        expect(proposalCreation.definition).toContain('app.plugins.multisig.multisigGovernanceSettings.anyWallet');
    });

    it('handles settings being passed passed directly to the hook', async () => {
        const mockSettings = generateDaoMultisigSettings();
        const { result } = renderHook(
            () => useMultisigGovernanceSettings({ daoId: 'multisig-test-id', settings: mockSettings }),
            { wrapper: ReactQueryWrapper },
        );
        const [minimumApproval, proposalCreation] = result.current;
        expect(minimumApproval.term).toBe('app.plugins.multisig.multisigGovernanceSettings.minimumApproval');
        expect(minimumApproval.definition).toContain('app.plugins.multisig.multisigGovernanceSettings.approvals');
        expect(proposalCreation.term).toBe('app.plugins.multisig.multisigGovernanceSettings.proposalCreation');
        expect(proposalCreation.definition).toContain('app.plugins.multisig.multisigGovernanceSettings.anyWallet');
    });

    it('correctly correctly handles only members', () => {
        const baseSettings = generateDaoMultisigSettings();
        const mockSettings = {
            ...baseSettings,
            settings: {
                ...baseSettings.settings,
                onlyListed: true,
            },
        };

        useDaoSettingsSpy.mockReturnValue(generateReactQueryResultSuccess({ data: mockSettings }));
        const { result } = renderHook(() => useMultisigGovernanceSettings({ daoId: 'multisig-test-id' }), {
            wrapper: ReactQueryWrapper,
        });

        const [, proposalCreation] = result.current;

        expect(proposalCreation.definition).toContain('app.plugins.multisig.multisigGovernanceSettings.members');
    });
});
