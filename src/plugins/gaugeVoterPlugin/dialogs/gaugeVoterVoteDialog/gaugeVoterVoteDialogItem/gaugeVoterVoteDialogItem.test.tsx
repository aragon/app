import { GukModulesProvider } from '@aragon/gov-ui-kit';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
    GaugeVoterVoteDialogItem,
    type IGaugeVoterVoteDialogItemProps,
} from './gaugeVoterVoteDialogItem';

describe('<GaugeVoterVoteDialogItem /> component', () => {
    const createTestComponent = (
        props?: Partial<IGaugeVoterVoteDialogItemProps>,
    ) => {
        const completeProps: IGaugeVoterVoteDialogItemProps = {
            gaugeAddress: '0x1234567890123456789012345678901234567890',
            gaugeName: 'Test Gauge',
            gaugeAvatar: null,
            weight: BigInt(100),
            totalWeight: BigInt(300),
            totalVotingPower: 1000,
            tokenSymbol: 'TKN',
            onUpdateWeight: jest.fn(),
            onRemove: jest.fn(),
            ...props,
        };

        return (
            <GukModulesProvider>
                <GaugeVoterVoteDialogItem {...completeProps} />
            </GukModulesProvider>
        );
    };

    it('renders the gauge name and truncated address', () => {
        render(createTestComponent({ gaugeName: 'My Gauge' }));
        expect(screen.getByText('My Gauge')).toBeInTheDocument();
    });

    it.each([
        { weight: BigInt(100), totalWeight: BigInt(300), expected: '33.33%' },
        { weight: BigInt(150), totalWeight: BigInt(300), expected: '50.00%' },
        { weight: BigInt(0), totalWeight: BigInt(300), expected: '0.00%' },
        { weight: BigInt(100), totalWeight: BigInt(100), expected: '100.00%' },
    ])('computes share $expected from weight $weight / totalWeight $totalWeight', ({
        weight,
        totalWeight,
        expected,
    }) => {
        render(createTestComponent({ weight, totalWeight }));
        expect(screen.getByText(expected)).toBeInTheDocument();
    });

    it('hides the share line when totalWeight is zero', () => {
        render(
            createTestComponent({
                weight: BigInt(0),
                totalWeight: BigInt(0),
            }),
        );
        expect(screen.queryByText(/%/)).not.toBeInTheDocument();
    });

    it('renders the weight as a string in the input via formatUnits at precision 2', () => {
        render(createTestComponent({ weight: BigInt(150) }));
        const input = screen.getByRole('textbox');
        expect(input).toHaveValue('1.5');
    });

    it('parses decimal input through parseUnits and forwards bigint to onUpdateWeight', async () => {
        const onUpdateWeight = jest.fn();
        render(
            createTestComponent({
                weight: BigInt(0),
                totalWeight: BigInt(0),
                onUpdateWeight,
            }),
        );
        const input = screen.getByRole('textbox');
        await userEvent.clear(input);
        await userEvent.type(input, '0.5');

        expect(onUpdateWeight).toHaveBeenLastCalledWith(
            '0x1234567890123456789012345678901234567890',
            BigInt(50),
        );
    });

    it('calls onRemove with the gauge address when the close button is clicked', async () => {
        const onRemove = jest.fn();
        render(createTestComponent({ onRemove }));
        const closeButtons = screen.getAllByRole('button');
        await userEvent.click(closeButtons[0]);
        expect(onRemove).toHaveBeenCalledWith(
            '0x1234567890123456789012345678901234567890',
        );
    });
});
