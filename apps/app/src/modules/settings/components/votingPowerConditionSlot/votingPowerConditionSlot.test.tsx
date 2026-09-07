import { GukModulesProvider, IconType } from '@aragon/gov-ui-kit';
import { render, screen } from '@testing-library/react';
import type { IDaoPermissionCondition } from '@/shared/api/daoService';
import { VotingPowerConditionSlot } from './votingPowerConditionSlot';

describe('<VotingPowerConditionSlot /> component', () => {
    type VotingPowerConditionProps = IDaoPermissionCondition & {
        chainId?: number;
    };

    const createTestComponent = (
        props?: Partial<VotingPowerConditionProps>,
    ) => {
        const completeProps: VotingPowerConditionProps = {
            conditionType: 'voting-power',
            ...props,
        };

        return (
            <GukModulesProvider>
                <VotingPowerConditionSlot {...completeProps} />
            </GukModulesProvider>
        );
    };

    it('renders the truncated token address and the formatted minimum voting power', () => {
        render(
            createTestComponent({
                token: '0x0bA45A8b5d5575935B8158a88C631E9F9C95a2e5',
                minVotingPower: '1000000000000000000',
            }),
        );

        expect(
            screen.getByText(/votingPowerConditionSlot.token/),
        ).toBeInTheDocument();
        expect(screen.getByText('0x0bA4…a2e5')).toBeInTheDocument();
        expect(
            screen.getByText(/votingPowerConditionSlot.minVotingPower/),
        ).toBeInTheDocument();
        // 1e18 base units formatted with the default 18 decimals.
        expect(screen.getByText('1')).toBeInTheDocument();
    });

    it('links a valid token address to its explorer and exposes copy', () => {
        const token = '0x0bA45A8b5d5575935B8158a88C631E9F9C95a2e5';

        render(createTestComponent({ chainId: 1, token }));

        const tokenLink = screen.getByText('0x0bA4…a2e5').closest('a');
        expect(tokenLink?.getAttribute('href')).toContain(`/address/${token}`);
        expect(screen.getByTestId(IconType.COPY)).toBeInTheDocument();
    });

    it('does not link or copy malformed token payloads', () => {
        const { container } = render(
            createTestComponent({ chainId: 1, token: 'not-an-address' }),
        );

        expect(container.querySelector('a')).toBeNull();
        expect(screen.queryByTestId(IconType.COPY)).not.toBeInTheDocument();
    });

    it('falls back to a placeholder when payload fields are absent', () => {
        render(
            createTestComponent({
                token: undefined,
                minVotingPower: undefined,
            }),
        );

        expect(screen.getAllByText('—')).toHaveLength(2);
    });
});
