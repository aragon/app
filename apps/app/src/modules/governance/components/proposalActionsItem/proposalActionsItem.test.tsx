import { GukModulesProvider, ProposalActions } from '@aragon/gov-ui-kit';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { initChangeSettingsActionViews } from '@/actions/core/changeSettings';
import { initUpdateMetadataActionViews } from '@/actions/core/updateMetadata';
import { initMultisigActionViews } from '@/actions/multisig';
import { initTokenActionViews } from '@/actions/token';
import { generateToken } from '@/modules/finance/testUtils';
import { generateMultisigActionChangeMembers } from '@/plugins/multisigPlugin/testUtils';
import { MultisigProposalActionType } from '@/plugins/multisigPlugin/types';
import { generateTokenActionTokenMint } from '@/plugins/tokenPlugin/testUtils';
import {
    type IProposalActionChangeSettings,
    ProposalActionType,
} from '../../api/governanceService';
import {
    generateProposalAction,
    generateProposalActionUpdateMetadata,
    generateProposalActionUpdatePluginMetadata,
} from '../../testUtils';
import {
    type IProposalActionsItemProps,
    ProposalActionsItem,
} from './proposalActionsItem';

describe('<ProposalActionsItem /> component', () => {
    beforeAll(() => {
        initChangeSettingsActionViews();
        initUpdateMetadataActionViews();
        initMultisigActionViews();
        initTokenActionViews();
    });

    const createTestComponent = (
        props?: Partial<IProposalActionsItemProps>,
    ) => {
        const completeProps: IProposalActionsItemProps = {
            action: generateProposalActionUpdateMetadata(),
            daoId: 'dao-id',
            chainId: 11_155_111,
            ...props,
        };

        return (
            <GukModulesProvider>
                <ProposalActions.Root actionsCount={1}>
                    <ProposalActions.Container emptyStateDescription="">
                        <ProposalActionsItem {...completeProps} />
                    </ProposalActions.Container>
                </ProposalActions.Root>
            </GukModulesProvider>
        );
    };

    const copyKey = (key: string) =>
        `app.actions.core.updateMetadataActionDetails.${key}`;

    // Metadata actions are matched by type, so they carry no decoded input data and a valid target address.
    const target = { to: '0xa0Ab554dEa45be64F12E3B0085DDC59852eFF9fc' };

    it('renders the registered metadata view for DAO metadata update actions', async () => {
        const action = generateProposalActionUpdateMetadata({
            ...target,
            proposedMetadata: {
                name: 'Proposed DAO',
                description: 'Proposed description',
                links: [{ name: 'Website', url: 'https://dao.com' }],
            },
            existingMetadata: {
                name: 'Existing DAO',
                description: 'Existing description',
                links: [],
            },
        });

        render(createTestComponent({ action }));
        await userEvent.click(screen.getAllByRole('button')[0]);

        expect(screen.getByText(copyKey('logoTerm'))).toBeInTheDocument();
        expect(screen.getByText('Proposed DAO')).toBeInTheDocument();
        expect(screen.getByRole('link', { name: /Website/ })).toHaveAttribute(
            'href',
            'https://dao.com',
        );

        await userEvent.click(screen.getByText(copyKey('existingToggle')));

        expect(screen.getByText('Existing DAO')).toBeInTheDocument();
    });

    it('renders the registered metadata view for plugin metadata update actions', async () => {
        const action = generateProposalActionUpdatePluginMetadata({
            ...target,
            proposedMetadata: { name: 'Council', processKey: 'CNL' },
            existingMetadata: { name: 'Council', processKey: 'CNC' },
        });

        render(createTestComponent({ action }));
        await userEvent.click(screen.getAllByRole('button')[0]);

        expect(screen.queryByText(copyKey('logoTerm'))).not.toBeInTheDocument();
        expect(screen.getByText(copyKey('summaryTerm'))).toBeInTheDocument();
        expect(screen.getByText('CNL')).toBeInTheDocument();
    });

    it('renders the registered token mint view with the minted amount linked to the receiver', async () => {
        const receiver = '0x15b4bfc1c85ffbdb6d7d0eb9f30c49657dfb1f5b';
        const action = generateTokenActionTokenMint({
            to: '0xa0Ab554dEa45be64F12E3B0085DDC59852eFF9fc',
            token: generateToken({ symbol: 'PDC', decimals: 18 }),
            receivers: {
                address: receiver,
                currentBalance: '1000000000000000000',
                newBalance: '2500000000000000000',
            },
        });

        render(createTestComponent({ action }));
        await userEvent.click(screen.getAllByRole('button')[0]);

        const receiverLink = await screen.findByRole('link', { name: /1\.5/ });
        expect(receiverLink).toHaveAttribute(
            'href',
            `https://sepolia.etherscan.io/address/${receiver}`,
        );
        expect(screen.getByText(/PDC/)).toBeInTheDocument();
        expect(screen.queryByText(/voting power/i)).not.toBeInTheDocument();
    });

    it('renders the registered settings view for normalized change-settings actions', async () => {
        const action: IProposalActionChangeSettings = {
            ...generateProposalAction(target),
            type: ProposalActionType.CHANGE_SETTINGS,
            proposedSettings: [
                { term: 'Minimum approval', definition: '3 of 7 members' },
            ],
            existingSettings: [
                { term: 'Minimum approval', definition: '1 of 7 members' },
            ],
        };

        render(createTestComponent({ action }));
        await userEvent.click(screen.getAllByRole('button')[0]);

        expect(screen.getByText('Minimum approval')).toBeInTheDocument();
        expect(screen.getByText('3 of 7 members')).toBeInTheDocument();

        await userEvent.click(
            screen.getByText(
                'app.actions.core.changeSettingsActionDetails.existingToggle',
            ),
        );

        expect(screen.getByText('1 of 7 members')).toBeInTheDocument();
        expect(screen.queryByText('3 of 7 members')).not.toBeInTheDocument();
    });

    // Removals once rendered as additions (APP-1160): each type must resolve to the view with its own summary.
    it.each([
        {
            type: MultisigProposalActionType.MULTISIG_ADD_MEMBERS,
            term: 'added',
            otherTerm: 'removed',
        },
        {
            type: MultisigProposalActionType.MULTISIG_REMOVE_MEMBERS,
            term: 'removed',
            otherTerm: 'added',
        },
    ] as const)(
        'renders the registered members view for $type actions',
        async ({ type, term, otherTerm }) => {
            const membersCopyKey = (key: string) =>
                `app.actions.multisig.multisigChangeMembersActionDetails.${key}`;
            const action = generateMultisigActionChangeMembers({
                ...target,
                type,
                members: [
                    {
                        address: '0x92e9d0Cd7f5E87a2B2b19661aAa4C2e6D019472F',
                        ens: 'dzepina.eth',
                    },
                ],
                currentMembers: 7,
            });

            render(createTestComponent({ action }));
            await userEvent.click(screen.getAllByRole('button')[0]);

            expect(await screen.findByText('dzepina.eth')).toBeInTheDocument();
            expect(screen.getByText(membersCopyKey(term))).toBeInTheDocument();
            expect(
                screen.queryByText(membersCopyKey(otherTerm)),
            ).not.toBeInTheDocument();
        },
    );
});
