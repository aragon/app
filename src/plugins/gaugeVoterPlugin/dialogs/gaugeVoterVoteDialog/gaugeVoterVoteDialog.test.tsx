import { GukModulesProvider } from '@aragon/gov-ui-kit';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Network } from '@/shared/api/daoService';
import * as dialogProvider from '@/shared/components/dialogProvider';
import { generateDialogContext } from '@/shared/testUtils';
import { GaugeVoterPluginDialogId } from '../../constants/gaugeVoterPluginDialogId';
import { generateGauge } from '../../testUtils';
import {
    GaugeVoterVoteDialog,
    type IGaugeVoterVoteDialogProps,
} from './gaugeVoterVoteDialog';

jest.mock('@aragon/gov-ui-kit', () => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const actual = jest.requireActual('@aragon/gov-ui-kit');
    const Dialog = {
        Header: (props: { title: string; onClose?: () => void }) => (
            <div>
                <h2>{props.title}</h2>
                <button onClick={props.onClose} type="button">
                    close
                </button>
            </div>
        ),
        Content: (props: { children: React.ReactNode }) => (
            <div>{props.children}</div>
        ),
        Footer: (props: {
            primaryAction: {
                label: string;
                disabled?: boolean;
                onClick?: () => void;
            };
            secondaryAction?: { label: string; onClick?: () => void };
            children?: React.ReactNode;
        }) => (
            <div>
                {props.children}
                {props.secondaryAction != null && (
                    <button
                        onClick={props.secondaryAction.onClick}
                        type="button"
                    >
                        {props.secondaryAction.label}
                    </button>
                )}
                <button
                    disabled={props.primaryAction.disabled}
                    onClick={props.primaryAction.onClick}
                    type="button"
                >
                    {props.primaryAction.label}
                </button>
            </div>
        ),
    };
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return { ...actual, Dialog };
});

describe('<GaugeVoterVoteDialog /> component', () => {
    const useDialogContextSpy = jest.spyOn(dialogProvider, 'useDialogContext');

    beforeEach(() => {
        useDialogContextSpy.mockReturnValue(generateDialogContext());
    });

    afterEach(() => {
        useDialogContextSpy.mockReset();
    });

    const gaugeA = generateGauge({
        address: '0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
        name: 'Gauge A',
    });
    const gaugeB = generateGauge({
        address: '0xbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb',
        name: 'Gauge B',
    });
    const gaugeC = generateGauge({
        address: '0xcccccccccccccccccccccccccccccccccccccccc',
        name: 'Gauge C',
    });

    const createTestComponent = (
        props?: Partial<IGaugeVoterVoteDialogProps>,
    ) => {
        const completeProps: IGaugeVoterVoteDialogProps = {
            location: {
                id: 'test',
                params: {
                    gauges: [gaugeA, gaugeB, gaugeC],
                    pluginAddress: '0x0000000000000000000000000000000000000001',
                    network: Network.ETHEREUM_MAINNET,
                    totalVotingPower: 1000,
                    tokenSymbol: 'TKN',
                    gaugeVotes: [],
                },
            },
            ...props,
        };
        return (
            <GukModulesProvider>
                <GaugeVoterVoteDialog {...completeProps} />
            </GukModulesProvider>
        );
    };

    it('initializes each gauge with the equal-default weight of "1" when there are no existing votes', () => {
        render(createTestComponent());
        const inputs = screen.getAllByRole('textbox');
        expect(inputs).toHaveLength(3);
        for (const input of inputs) {
            expect(input).toHaveValue('1');
        }
    });

    it('shows 33.33% share for each gauge under default-equal weights with three gauges', () => {
        render(createTestComponent());
        const shareLines = screen.getAllByText('33.33%');
        expect(shareLines).toHaveLength(3);
    });

    it('pre-populates inputs from existing votes as integer percentage equivalents', () => {
        render(
            createTestComponent({
                location: {
                    id: 'test',
                    params: {
                        gauges: [gaugeA, gaugeB, gaugeC],
                        pluginAddress:
                            '0x0000000000000000000000000000000000000001',
                        network: Network.ETHEREUM_MAINNET,
                        totalVotingPower: 1000,
                        tokenSymbol: 'TKN',
                        gaugeVotes: [
                            {
                                gaugeAddress: gaugeA.address,
                                votes: BigInt(500),
                                formattedVotes: '500',
                            },
                            {
                                gaugeAddress: gaugeB.address,
                                votes: BigInt(300),
                                formattedVotes: '300',
                            },
                            {
                                gaugeAddress: gaugeC.address,
                                votes: BigInt(200),
                                formattedVotes: '200',
                            },
                        ],
                    },
                },
            }),
        );
        const inputs = screen.getAllByRole('textbox');
        expect(inputs[0]).toHaveValue('50');
        expect(inputs[1]).toHaveValue('30');
        expect(inputs[2]).toHaveValue('20');
    });

    it('resets all weights to 0 when the Reset button is clicked', async () => {
        render(createTestComponent());
        await userEvent.click(screen.getByRole('button', { name: /reset/i }));
        const inputs = screen.getAllByRole('textbox');
        for (const input of inputs) {
            expect(input).toHaveValue('0');
        }
    });

    it('sets all weights back to 1 (equal) when Equalize is clicked after reset', async () => {
        render(createTestComponent());
        await userEvent.click(screen.getByRole('button', { name: /reset/i }));
        await userEvent.click(
            screen.getByRole('button', { name: /equalize/i }),
        );
        const inputs = screen.getAllByRole('textbox');
        for (const input of inputs) {
            expect(input).toHaveValue('1');
        }
    });

    it('disables the submit button when totalWeight is zero', async () => {
        render(createTestComponent());
        await userEvent.click(screen.getByRole('button', { name: /reset/i }));
        const submitButton = screen.getByRole('button', {
            name: /action\.submit$/,
        });
        expect(submitButton).toBeDisabled();
    });

    it('enables the submit button when at least one gauge has a positive weight', () => {
        render(createTestComponent());
        const submitButton = screen.getByRole('button', {
            name: /action\.submit$/,
        });
        expect(submitButton).toBeEnabled();
    });

    it('opens the transaction dialog with a bigint-weight payload filtered to non-zero gauges', async () => {
        const open = jest.fn();
        useDialogContextSpy.mockReturnValue(generateDialogContext({ open }));
        render(createTestComponent());
        await userEvent.click(
            screen.getByRole('button', { name: /action\.submit$/ }),
        );
        expect(open).toHaveBeenCalledWith(
            GaugeVoterPluginDialogId.VOTE_GAUGES_TRANSACTION,
            expect.objectContaining({
                params: expect.objectContaining({
                    votes: [
                        { weight: BigInt(100), gauge: gaugeA.address },
                        { weight: BigInt(100), gauge: gaugeB.address },
                        { weight: BigInt(100), gauge: gaugeC.address },
                    ],
                    pluginAddress: '0x0000000000000000000000000000000000000001',
                    network: Network.ETHEREUM_MAINNET,
                }),
            }),
        );
    });

    it('does not send zero-weight gauges in the submitted vote payload', async () => {
        const open = jest.fn();
        useDialogContextSpy.mockReturnValue(generateDialogContext({ open }));
        render(createTestComponent());
        const inputs = screen.getAllByRole('textbox');
        await userEvent.clear(inputs[2]);
        await userEvent.click(
            screen.getByRole('button', { name: /action\.submit$/ }),
        );
        expect(open).toHaveBeenCalledWith(
            GaugeVoterPluginDialogId.VOTE_GAUGES_TRANSACTION,
            expect.objectContaining({
                params: expect.objectContaining({
                    votes: [
                        { weight: BigInt(100), gauge: gaugeA.address },
                        { weight: BigInt(100), gauge: gaugeB.address },
                    ],
                }),
            }),
        );
    });
});
