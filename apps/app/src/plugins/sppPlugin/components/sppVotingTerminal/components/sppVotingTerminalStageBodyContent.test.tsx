import type * as GovUiKit from '@aragon/gov-ui-kit';
import { render, screen } from '@testing-library/react';
import type * as React from 'react';
import type { IUseEnsNameReturn } from '@/modules/ens';
import * as ensApi from '@/modules/ens';
import {
    externalPluginId,
    safeBodyPluginId,
} from '@/plugins/safeMultisigPlugin/constants';
import * as bodyModeApi from '@/plugins/sppPlugin/hooks/useSppVotingTerminalBodyMode';
import { Network } from '@/shared/api/daoService';
import {
    generateSppProposal,
    generateSppStage,
    generateSppStagePlugin,
} from '../../../testUtils';
import {
    type ISppProposal,
    type ISppStage,
    type ISppStagePlugin,
    VotingBodyBrandIdentity,
} from '../../../types';
import { SppVotingTerminalStageBodyContent } from './sppVotingTerminalStageBodyContent';

jest.mock('@aragon/gov-ui-kit', () => {
    const actual = jest.requireActual<typeof GovUiKit>('@aragon/gov-ui-kit');
    const BodyContent = ({ children }: { children?: React.ReactNode }) => (
        <div data-testid="body-content">{children}</div>
    );

    return {
        ...actual,
        ProposalVoting: {
            ...actual.ProposalVoting,
            BodyContent,
        },
    };
});

jest.mock('./sppVotingTerminalBodyContent', () => {
    const { createElement, useState } =
        jest.requireActual<typeof React>('react');
    const { safeBodyPluginId } = jest.requireActual(
        '@/plugins/safeMultisigPlugin/constants',
    );
    const useSafeSettings = () => useState('Safe settings')[0];
    const getExternalSettings = () => 'External settings';

    return {
        SppVotingTerminalBodyContent: ({
            bodyPluginId,
        }: {
            bodyPluginId: string;
        }) => {
            useState(null);
            const getSettings =
                bodyPluginId === safeBodyPluginId
                    ? useSafeSettings
                    : getExternalSettings;
            return createElement('div', null, getSettings());
        },
    };
});

describe('<SppVotingTerminalStageBodyContent />', () => {
    const address = '0x0000000000000000000000000000000000000001';
    const proposalAddress = '0x00000000000000000000000000000000000000ff';
    const useBodyModeSpy = jest.spyOn(
        bodyModeApi,
        'useSppVotingTerminalBodyMode',
    );
    const useEnsNameSpy = jest.spyOn(ensApi, 'useEnsName');

    const plugin: ISppStagePlugin = generateSppStagePlugin({
        address,
        interfaceType: undefined,
        brandId: VotingBodyBrandIdentity.SAFE,
    });
    const stage: ISppStage = generateSppStage({
        stageIndex: 0,
        plugins: [plugin],
    });
    const proposal: ISppProposal = generateSppProposal({
        network: Network.ETHEREUM_MAINNET,
        pluginAddress: proposalAddress,
        proposalIndex: '1',
        stageIndex: stage.stageIndex,
        results: [],
    });

    beforeEach(() => {
        useEnsNameSpy.mockReturnValue({
            data: undefined,
        } as unknown as IUseEnsNameReturn);
        useBodyModeSpy.mockReturnValue({
            pluginId: safeBodyPluginId,
            isHistoryMissing: false,
        });
    });

    afterEach(() => {
        useEnsNameSpy.mockReset();
        useBodyModeSpy.mockReset();
    });

    const createTestComponent = () => (
        <SppVotingTerminalStageBodyContent
            daoId="ethereum-mainnet:0x00000000000000000000000000000000000000aa"
            displayStatus={false}
            plugin={plugin}
            proposal={proposal}
            stage={stage}
        />
    );

    it('switches settings with different hook counts without breaking the body', () => {
        const { rerender } = render(createTestComponent());
        expect(screen.getByText('Safe settings')).toBeInTheDocument();

        rerender(createTestComponent());
        expect(screen.getByText('Safe settings')).toBeInTheDocument();

        useBodyModeSpy.mockReturnValue({
            pluginId: externalPluginId,
            isHistoryMissing: true,
        });
        rerender(createTestComponent());
        expect(screen.getByText('External settings')).toBeInTheDocument();

        useBodyModeSpy.mockReturnValue({
            pluginId: safeBodyPluginId,
            isHistoryMissing: false,
        });
        rerender(createTestComponent());
        expect(screen.getByText('Safe settings')).toBeInTheDocument();
    });
});
