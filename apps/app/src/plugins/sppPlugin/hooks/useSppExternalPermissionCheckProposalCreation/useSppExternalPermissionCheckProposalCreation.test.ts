import * as GovUiKit from '@aragon/gov-ui-kit';
import { addressUtils } from '@aragon/gov-ui-kit';
import { renderHook } from '@testing-library/react';
import type { IPermissionCheckGuardParams } from '@/modules/governance/types';
import type { IDaoPlugin } from '@/shared/api/daoService';
import * as daoService from '@/shared/api/daoService';
import {
    generateDao,
    generateReactQueryResultSuccess,
} from '@/shared/testUtils';
import { generateSppStagePlugin } from '../../testUtils';
import { VotingBodyBrandIdentity } from '../../types';
import { useSppExternalPermissionCheckProposalCreation } from './useSppExternalPermissionCheckProposalCreation';

describe('useSppExternalPermissionCheckProposalCreation', () => {
    const useDaoSpy = jest.spyOn(daoService, 'useDao');
    const useBlockExplorerSpy = jest.spyOn(GovUiKit, 'useBlockExplorer');

    const mockChainEntityUrl = jest.fn(
        ({ type, id }: { type: string; id?: string }) =>
            `https://etherscan.io/${type}/${id ?? ''}`,
    );

    beforeEach(() => {
        useDaoSpy.mockReturnValue(
            generateReactQueryResultSuccess({ data: generateDao() }),
        );
        useBlockExplorerSpy.mockReturnValue({
            buildEntityUrl: mockChainEntityUrl,
            getBlockExplorer: jest.fn(),
        } as ReturnType<typeof GovUiKit.useBlockExplorer>);
    });

    afterEach(() => {
        useDaoSpy.mockReset();
        useBlockExplorerSpy.mockReset();
        mockChainEntityUrl.mockClear();
    });

    const createParams = (
        plugin: Partial<Parameters<typeof generateSppStagePlugin>[0]>,
    ): IPermissionCheckGuardParams => ({
        plugin: generateSppStagePlugin({
            interfaceType: undefined,
            ...plugin,
        }) as unknown as IDaoPlugin,
        daoId: 'dao-test',
    });

    it('returns a Safe settings group when the body can create proposals', () => {
        const safeAddress = `0x${'b'.repeat(40)}`;
        const params = createParams({
            address: safeAddress,
            brandId: VotingBodyBrandIdentity.SAFE,
            proposalCreationConditionAddress: `0x${'c'.repeat(40)}`,
        });

        const { result } = renderHook(() =>
            useSppExternalPermissionCheckProposalCreation(params),
        );

        expect(result.current).toEqual({
            hasPermission: true,
            isLoading: false,
            isRestricted: true,
            settings: [
                [
                    {
                        term: 'app.plugins.spp.sppExternalPermissionCheckProposalCreation.pluginLabelName',
                        definition: addressUtils.truncateAddress(safeAddress),
                        link: {
                            href: `https://etherscan.io/address/${safeAddress}`,
                            isExternal: true,
                        },
                    },
                    {
                        term: 'app.plugins.spp.sppExternalPermissionCheckProposalCreation.function',
                        definition:
                            'app.plugins.spp.sppExternalPermissionCheckProposalCreation.requirement',
                    },
                ],
            ],
        });
    });

    it('returns undefined for a Safe body without proposal-creation rights', () => {
        const params = createParams({
            brandId: VotingBodyBrandIdentity.SAFE,
            proposalCreationConditionAddress: undefined,
        });

        const { result } = renderHook(() =>
            useSppExternalPermissionCheckProposalCreation(params),
        );

        expect(result.current).toBeUndefined();
    });

    it('returns undefined for non-Safe external bodies', () => {
        const params = createParams({
            brandId: VotingBodyBrandIdentity.EOA,
            proposalCreationConditionAddress: `0x${'c'.repeat(40)}`,
        });

        const { result } = renderHook(() =>
            useSppExternalPermissionCheckProposalCreation(params),
        );

        expect(result.current).toBeUndefined();
    });
});
