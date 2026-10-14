import { renderHook } from '@testing-library/react';
import * as governanceService from '@/modules/governance/api/governanceService';
import { generateProposalAction } from '@/modules/governance/testUtils';
import {
    generatePaginatedResponse,
    generateReactQueryInfiniteResultLoading,
    generateReactQueryInfiniteResultSuccess,
} from '@/shared/testUtils';
import { mockTranslations } from '@/test/utils';
import { MultisigProposalActionType } from '../../types';
import { multisigActionUtils } from '../../utils/multisigActionUtils';
import { useMultisigNormalizeActions } from './useMultisigNormalizeActions';

describe('useMultisigNormalizeActions hook', () => {
    const useMemberListSpy = jest.spyOn(governanceService, 'useMemberList');
    const normalizeChangeSettingsSpy = jest.spyOn(
        multisigActionUtils,
        'normalizeChangeSettingsAction',
    );
    const normalizeChangeMembersSpy = jest.spyOn(
        multisigActionUtils,
        'normalizeChangeMembersAction',
    );

    mockTranslations.setup();

    const pluginAddress = '0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa';

    const mockMembersCount = (totalRecords: number) =>
        useMemberListSpy.mockReturnValue(
            generateReactQueryInfiniteResultSuccess({
                data: {
                    pages: [
                        generatePaginatedResponse({
                            data: [],
                            metadata: {
                                totalRecords,
                                page: 0,
                                pageSize: 20,
                                totalPages: 1,
                            },
                        }),
                    ],
                    pageParams: [],
                },
            }),
        );

    beforeEach(() => {
        mockMembersCount(0);
    });

    afterEach(() => {
        useMemberListSpy.mockReset();
        normalizeChangeSettingsSpy.mockReset();
        normalizeChangeMembersSpy.mockReset();
    });

    it('normalizes a change-settings action with the members count of its target plugin', () => {
        const action = generateProposalAction({
            to: pluginAddress,
            type: MultisigProposalActionType.UPDATE_MULTISIG_SETTINGS,
        });
        const normalized = { normalized: true };
        mockMembersCount(7);
        normalizeChangeSettingsSpy.mockReturnValue(normalized as never);

        const { result } = renderHook(() =>
            useMultisigNormalizeActions({ actions: [action], daoId: 'dao-id' }),
        );

        expect(useMemberListSpy).toHaveBeenCalledWith(
            { queryParams: { daoId: 'dao-id', pluginAddress } },
            { enabled: true },
        );
        expect(normalizeChangeSettingsSpy).toHaveBeenCalledWith(
            expect.objectContaining({ action, membersCount: 7 }),
        );
        expect(result.current).toEqual([normalized]);
    });

    it('falls back to zero members while the member list is not loaded', () => {
        const action = generateProposalAction({
            to: pluginAddress,
            type: MultisigProposalActionType.UPDATE_MULTISIG_SETTINGS,
        });
        useMemberListSpy.mockReturnValue(
            generateReactQueryInfiniteResultLoading(),
        );

        renderHook(() =>
            useMultisigNormalizeActions({ actions: [action], daoId: 'dao-id' }),
        );

        expect(normalizeChangeSettingsSpy).toHaveBeenCalledWith(
            expect.objectContaining({ membersCount: 0 }),
        );
    });

    it('does not fetch the member list when there is no change-settings action', () => {
        const action = generateProposalAction({ type: 'custom-action' });

        const { result } = renderHook(() =>
            useMultisigNormalizeActions({ actions: [action], daoId: 'dao-id' }),
        );

        expect(useMemberListSpy).toHaveBeenCalledWith(expect.anything(), {
            enabled: false,
        });
        expect(normalizeChangeSettingsSpy).not.toHaveBeenCalled();
        expect(result.current).toEqual([action]);
    });

    it.each([
        MultisigProposalActionType.MULTISIG_ADD_MEMBERS,
        MultisigProposalActionType.MULTISIG_REMOVE_MEMBERS,
    ])('normalizes %s actions as change-members actions', (type) => {
        const action = generateProposalAction({ type });
        const normalized = { normalized: true };
        normalizeChangeMembersSpy.mockReturnValue(normalized as never);

        const { result } = renderHook(() =>
            useMultisigNormalizeActions({ actions: [action], daoId: 'dao-id' }),
        );

        expect(normalizeChangeMembersSpy).toHaveBeenCalledWith(action);
        expect(result.current).toEqual([normalized]);
    });
});
