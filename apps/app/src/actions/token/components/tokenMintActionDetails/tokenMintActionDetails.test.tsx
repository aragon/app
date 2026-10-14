import * as GovUiKit from '@aragon/gov-ui-kit';
import { ChainEntityType, GukModulesProvider } from '@aragon/gov-ui-kit';
import { render, screen } from '@testing-library/react';
import { generateToken } from '@/modules/finance/testUtils';
import type { IProposalActionData } from '@/modules/governance/components/createProposalForm';
import { generateTokenActionTokenMint } from '@/plugins/tokenPlugin/testUtils';
import type { ITokenActionTokenMint } from '@/plugins/tokenPlugin/types';
import * as useDaoChainHook from '@/shared/hooks/useDaoChain';
import {
    type ITokenMintActionDetailsProps,
    TokenMintActionDetails,
} from './tokenMintActionDetails';

describe('<TokenMintActionDetails /> component', () => {
    const memberDataListItemStructureSpy = jest.spyOn(
        GovUiKit,
        'MemberDataListItemStructure',
    );
    const useDaoChainSpy = jest.spyOn(useDaoChainHook, 'useDaoChain');
    const buildEntityUrl = jest.fn();

    beforeEach(() => {
        memberDataListItemStructureSpy.mockReturnValue(
            <div data-testid="member-item" />,
        );
        buildEntityUrl.mockReturnValue('https://explorer.com/address/0x1');
        useDaoChainSpy.mockReturnValue({
            buildEntityUrl,
        } as unknown as ReturnType<typeof useDaoChainHook.useDaoChain>);
    });

    afterEach(() => {
        memberDataListItemStructureSpy.mockReset();
        useDaoChainSpy.mockReset();
        buildEntityUrl.mockReset();
    });

    const buildAction = (
        action?: Partial<ITokenActionTokenMint>,
    ): IProposalActionData => ({
        ...generateTokenActionTokenMint(action),
        daoId: 'dao-id',
        meta: undefined,
    });

    const createTestComponent = (
        props?: Partial<ITokenMintActionDetailsProps>,
    ) => {
        const completeProps: ITokenMintActionDetailsProps = {
            action: buildAction(),
            index: 0,
            ...props,
        };

        return <TokenMintActionDetails {...completeProps} />;
    };

    const getMemberItemProps = () =>
        memberDataListItemStructureSpy.mock.lastCall?.[0];

    it('renders the receiver of the minted tokens', () => {
        const receivers = {
            address: '0x15b4bfc1c85ffbdb6d7d0eb9f30c49657dfb1f5b',
            currentBalance: '0',
            newBalance: '1',
        };
        const token = generateToken({ symbol: 'PDC', decimals: 0 });

        render(
            createTestComponent({ action: buildAction({ receivers, token }) }),
        );

        expect(screen.getByTestId('member-item')).toBeInTheDocument();
        expect(getMemberItemProps()).toEqual(
            expect.objectContaining({
                address: receivers.address,
                tokenSymbol: 'PDC',
                hideLabelTokenVoting: true,
                target: '_blank',
            }),
        );
    });

    // Expected amounts are exact decimal results. The cases marked "float" are the ones the previous implementation
    // (subtracting the formatted balances as JavaScript numbers) got wrong.
    it.each([
        {
            case: 'whole tokens minted to a new holder',
            decimals: 18,
            currentBalance: '0',
            newBalance: '5000000000000000000',
            expected: '5',
        },
        {
            case: 'whole tokens minted to an existing holder',
            decimals: 18,
            currentBalance: '50000000000000000000',
            newBalance: '200000000000000000000',
            expected: '150',
        },
        {
            case: 'fractional tokens',
            decimals: 18,
            currentBalance: '1000000000000000000',
            newBalance: '2500000000000000000',
            expected: '1.5',
        },
        {
            case: 'the smallest unit of a 6-decimals token (float: 9.999999999177334e-7)',
            decimals: 6,
            currentBalance: '1000000',
            newBalance: '1000001',
            expected: '0.000001',
        },
        {
            case: 'an amount beyond the safe integer range (float: 987654321864197500)',
            decimals: 18,
            currentBalance: '123456789123456789123456789',
            newBalance: '987654321987654321987654321987654321',
            expected: '987654321864197532.864197532864197532',
        },
        {
            case: 'one unit on top of a large balance (float: 0)',
            decimals: 18,
            currentBalance: '1000000000000000000000000000',
            newBalance: '1000000000000000000000000001',
            expected: '0.000000000000000001',
        },
        {
            case: 'a token without decimals',
            decimals: 0,
            currentBalance: '3',
            newBalance: '10',
            expected: '7',
        },
        {
            case: 'unchanged balances',
            decimals: 18,
            currentBalance: '42',
            newBalance: '42',
            expected: '0',
        },
    ])('renders the exact minted amount for $case', (testCase) => {
        const { decimals, currentBalance, newBalance, expected } = testCase;
        const action = buildAction({
            token: generateToken({ decimals }),
            receivers: { address: '0x1', currentBalance, newBalance },
        });

        render(createTestComponent({ action }));

        expect(getMemberItemProps()?.tokenAmount).toEqual(expected);
    });

    it('links the receiver to the block explorer of the given chain', () => {
        const receivers = {
            address: '0x15b4bfc1c85ffbdb6d7d0eb9f30c49657dfb1f5b',
            currentBalance: '0',
            newBalance: '1',
        };
        const explorerUrl = `https://polygonscan.com/address/${receivers.address}`;
        buildEntityUrl.mockReturnValue(explorerUrl);

        render(
            createTestComponent({
                action: buildAction({ receivers }),
                chainId: 137,
            }),
        );

        expect(useDaoChainSpy).toHaveBeenCalledWith({
            chainId: 137,
            daoId: 'dao-id',
        });
        expect(buildEntityUrl).toHaveBeenCalledWith({
            type: ChainEntityType.ADDRESS,
            id: receivers.address,
        });
        expect(getMemberItemProps()).toEqual(
            expect.objectContaining({ href: explorerUrl }),
        );
    });

    it('renders the minted amount and token symbol in the member item without the voting power label', () => {
        memberDataListItemStructureSpy.mockRestore();
        const action = buildAction({
            token: generateToken({ symbol: 'PDC', decimals: 18 }),
            receivers: {
                address: '0x15b4bfc1c85ffbdb6d7d0eb9f30c49657dfb1f5b',
                currentBalance: '1000000000000000000',
                newBalance: '2500000000000000000',
            },
        });

        render(
            <GukModulesProvider>
                {createTestComponent({ action })}
            </GukModulesProvider>,
        );

        expect(screen.getByText(/1\.5/)).toBeInTheDocument();
        expect(screen.getByText(/PDC/)).toBeInTheDocument();
        expect(screen.queryByText(/voting power/i)).not.toBeInTheDocument();
    });
});
