import {
    addressUtils,
    ChainEntityType,
    GukModulesProvider,
} from '@aragon/gov-ui-kit';
import { render, screen } from '@testing-library/react';
import type { IProposalActionData } from '@/modules/governance/components/createProposalForm';
import { generateMultisigActionChangeMembers } from '@/plugins/multisigPlugin/testUtils';
import {
    type IMultisigActionChangeMembers,
    MultisigProposalActionType,
} from '@/plugins/multisigPlugin/types';
import * as useDaoChainHook from '@/shared/hooks/useDaoChain';
import {
    type IMultisigChangeMembersActionDetailsProps,
    MultisigChangeMembersActionDetails,
} from './multisigChangeMembersActionDetails';

describe('<MultisigChangeMembersActionDetails /> component', () => {
    const useDaoChainSpy = jest.spyOn(useDaoChainHook, 'useDaoChain');
    const buildEntityUrl = jest.fn(
        ({ id }: { id?: string }) => `https://explorer.com/address/${id ?? ''}`,
    );

    beforeEach(() => {
        useDaoChainSpy.mockReturnValue({
            buildEntityUrl,
        } as unknown as ReturnType<typeof useDaoChainHook.useDaoChain>);
    });

    afterEach(() => {
        useDaoChainSpy.mockReset();
        buildEntityUrl.mockClear();
    });

    const buildAction = (
        action?: Partial<IMultisigActionChangeMembers>,
    ): IProposalActionData => ({
        ...generateMultisigActionChangeMembers(action),
        daoId: 'dao-id',
        meta: undefined,
    });

    const createTestComponent = (
        props?: Partial<IMultisigChangeMembersActionDetailsProps>,
    ) => {
        const completeProps: IMultisigChangeMembersActionDetailsProps = {
            action: buildAction(),
            index: 0,
            ...props,
        };

        return (
            <GukModulesProvider>
                <MultisigChangeMembersActionDetails {...completeProps} />
            </GukModulesProvider>
        );
    };

    const copyKey = (key: string) =>
        `app.actions.multisig.multisigChangeMembersActionDetails.${key}`;

    it('renders the summary heading and the block note', () => {
        render(createTestComponent());
        expect(
            screen.getByRole('heading', { name: copyKey('summary') }),
        ).toBeInTheDocument();
        expect(screen.getByText(copyKey('blockNote'))).toBeInTheDocument();
    });

    it('renders the number of existing members', () => {
        render(
            createTestComponent({
                action: buildAction({ currentMembers: 5 }),
            }),
        );

        expect(
            screen.getByText(copyKey('existingMembers')),
        ).toBeInTheDocument();
        expect(
            screen.getByText(`${copyKey('existingCount')} (count=5)`),
        ).toBeInTheDocument();
    });

    it('renders every added member, using the ENS name when the member has one', () => {
        const members = [
            {
                address: '0xceB69F6342eCE283b2F5c9088Ff249B5d0Ae66ea',
                name: 'Coinbase Prime',
            },
            { address: '0x97fb9274ac39bB275AC76f56390e6713A2C417D9' },
        ];
        const action = buildAction({
            type: MultisigProposalActionType.MULTISIG_ADD_MEMBERS,
            members,
        });

        render(createTestComponent({ action }));

        expect(screen.getByText('Coinbase Prime')).toBeInTheDocument();
        expect(
            screen.getByText(addressUtils.truncateAddress(members[1].address)),
        ).toBeInTheDocument();
        expect(screen.getAllByRole('link')).toHaveLength(2);
        expect(screen.getByText(copyKey('added'))).toBeInTheDocument();
        expect(
            screen.getByText(`${copyKey('addedCount')} (count=2)`),
        ).toBeInTheDocument();
        expect(screen.queryByText(copyKey('removed'))).not.toBeInTheDocument();
    });

    it('renders every removed member and the removed count for remove-members actions', () => {
        const members = [
            {
                address: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e',
                name: 'ensname.eth',
            },
            { address: '0x8C8D7C46219D9205f056f28fee5950aD564d7465' },
        ];
        const action = buildAction({
            type: MultisigProposalActionType.MULTISIG_REMOVE_MEMBERS,
            members,
            currentMembers: 7,
        });

        render(createTestComponent({ action }));

        expect(screen.getByText('ensname.eth')).toBeInTheDocument();
        expect(
            screen.getByText(addressUtils.truncateAddress(members[1].address)),
        ).toBeInTheDocument();
        expect(screen.getByText(copyKey('removed'))).toBeInTheDocument();
        expect(
            screen.getByText(`${copyKey('removedCount')} (count=2)`),
        ).toBeInTheDocument();
        expect(screen.queryByText(copyKey('added'))).not.toBeInTheDocument();
    });

    it('links each member to the block explorer of the given chain', () => {
        const members = [
            { address: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e' },
            { address: '0x8C8D7C46219D9205f056f28fee5950aD564d7465' },
        ];

        render(
            createTestComponent({
                action: buildAction({ members }),
                chainId: 137,
            }),
        );

        expect(useDaoChainSpy).toHaveBeenCalledWith({
            chainId: 137,
            daoId: 'dao-id',
        });
        for (const { address } of members) {
            expect(buildEntityUrl).toHaveBeenCalledWith({
                type: ChainEntityType.ADDRESS,
                id: address,
            });
        }
        const links = screen.getAllByRole('link');
        expect(links.map((link) => link.getAttribute('href'))).toEqual(
            members.map(
                ({ address }) => `https://explorer.com/address/${address}`,
            ),
        );
        for (const link of links) {
            expect(link).toHaveAttribute('target', '_blank');
        }
    });

    it('renders no member items when the action has no members', () => {
        render(createTestComponent());
        expect(screen.queryByRole('link')).not.toBeInTheDocument();
        expect(
            screen.getByText(`${copyKey('addedCount')} (count=0)`),
        ).toBeInTheDocument();
    });
});
