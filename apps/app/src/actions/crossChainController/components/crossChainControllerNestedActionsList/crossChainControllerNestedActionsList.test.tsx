import { GukModulesProvider } from '@aragon/gov-ui-kit';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { encodeFunctionData } from 'viem';
import { initUpdateMetadataActionViews } from '@/actions/core/updateMetadata';
import { initGaugeVoterActionViews } from '@/actions/gaugeVoter';
import { activateGaugeAbi } from '@/actions/gaugeVoter/constants/addressGaugeVoterAbi';
import type { IProposalAction } from '@/modules/governance/api/governanceService';
import {
    generateProposalActionUpdateMetadata,
    generateProposalActionUpdatePluginMetadata,
} from '@/modules/governance/testUtils';
import { actionViewRegistry } from '@/shared/utils/actionViewRegistry';
import {
    CrossChainControllerNestedActionsList,
    type ICrossChainControllerNestedActionsListProps,
} from './crossChainControllerNestedActionsList';

describe('<CrossChainControllerNestedActionsList /> component', () => {
    const { getDaoIndependentView } = actionViewRegistry;
    const getDaoIndependentViewSpy = jest.spyOn(
        actionViewRegistry,
        'getDaoIndependentView',
    );

    afterEach(() => {
        getDaoIndependentViewSpy.mockReset();
    });

    const createTestComponent = (
        props?: Partial<ICrossChainControllerNestedActionsListProps>,
    ) => {
        const completeProps: ICrossChainControllerNestedActionsListProps = {
            rawTuple: [],
            rawActions: [],
            chainId: 42_161,
            ...props,
        };

        return (
            <GukModulesProvider>
                <CrossChainControllerNestedActionsList {...completeProps} />
            </GukModulesProvider>
        );
    };

    const generateAction = (
        overrides?: Partial<IProposalAction>,
    ): IProposalAction => ({
        type: 'Unknown',
        from: '0x0',
        to: '0xa0Ab554dEa45be64F12E3B0085DDC59852eFF9fc',
        data: '0xd09de08a',
        value: '0',
        inputData: null,
        ...overrides,
    });

    const copyKey = (key: string) =>
        `app.actions.core.updateMetadataActionDetails.${key}`;

    it('renders one item per decoded sub-action without resolving a custom action view', () => {
        const rawActions = [
            generateAction({ to: '0xa' }),
            generateAction({ to: '0xb' }),
        ];

        render(
            createTestComponent({
                rawTuple: [
                    { to: '0xa', value: '0', data: '0x' },
                    { to: '0xb', value: '0', data: '0x' },
                ],
                rawActions,
            }),
        );

        expect(screen.getByText('0xa')).toBeInTheDocument();
        expect(screen.getByText('0xb')).toBeInTheDocument();
    });

    it('falls back to raw-calldata stubs when the decoded length disagrees with the tuple', () => {
        render(
            createTestComponent({
                rawTuple: [
                    { to: '0xa', value: '0', data: '0x' },
                    { to: '0xb', value: '0', data: '0x' },
                ],
                rawActions: [generateAction()],
            }),
        );

        expect(screen.getByText('0xa')).toBeInTheDocument();
        expect(screen.getByText('0xb')).toBeInTheDocument();
    });

    it('renders the DAO-independent view resolved for an action', async () => {
        getDaoIndependentViewSpy.mockReturnValue({
            actionType: 'Transfer',
            componentDetails: () => 'action-view',
            isDaoIndependent: true,
        });
        const action = generateAction({
            type: 'Transfer',
            data: '0x',
            value: '1',
        });

        render(
            createTestComponent({
                rawTuple: [{ to: action.to, value: '1', data: '0x' }],
                rawActions: [action],
            }),
        );

        await userEvent.click(screen.getAllByRole('button')[0]);

        expect(getDaoIndependentViewSpy).toHaveBeenCalledWith(
            'Transfer',
            undefined,
        );
        expect(screen.getByText('action-view')).toBeInTheDocument();
    });

    describe('DAO-dependent view integration', () => {
        beforeAll(() => {
            initGaugeVoterActionViews();
        });

        beforeEach(() => {
            getDaoIndependentViewSpy.mockImplementation(getDaoIndependentView);
        });

        it('renders a forwarded gauge call with the decoded view instead of its DAO-dependent view', async () => {
            const gaugeAddress = '0xA941b1C1D9aDC88C9241aA3ACA59E8B8f0386419';
            const action = generateAction({
                data: encodeFunctionData({
                    abi: [activateGaugeAbi],
                    args: [gaugeAddress],
                }),
                inputData: {
                    function: 'activateGauge',
                    contract: 'GaugeVoter',
                    stateMutability: 'nonpayable',
                    parameters: [
                        {
                            name: '_gauge',
                            type: 'address',
                            value: gaugeAddress,
                        },
                    ],
                },
            });

            render(
                createTestComponent({
                    rawTuple: [
                        { to: action.to, value: '0', data: action.data },
                    ],
                    rawActions: [action],
                }),
            );

            await userEvent.click(screen.getAllByRole('button')[0]);

            expect(screen.getByText('activateGauge')).toBeInTheDocument();
        });
    });

    describe('metadata update integration', () => {
        beforeAll(() => {
            initUpdateMetadataActionViews();
        });

        beforeEach(() => {
            getDaoIndependentViewSpy.mockImplementation(getDaoIndependentView);
        });

        // Decoded actions must match the forwarded tuple (valid target, same calldata) to be rendered instead of raw stubs.
        const setMetadataCall = {
            to: '0xa0Ab554dEa45be64F12E3B0085DDC59852eFF9fc',
            data: '0xee57e36f',
        };

        const renderNestedAction = (action: IProposalAction) =>
            render(
                createTestComponent({
                    rawTuple: [
                        { to: action.to, value: '0', data: action.data },
                    ],
                    rawActions: [action],
                }),
            );

        it('renders the DAO metadata update view with the decoded action metadata', async () => {
            const action = generateProposalActionUpdateMetadata({
                ...setMetadataCall,
                proposedMetadata: {
                    name: 'Destination DAO',
                    description: 'Proposed description',
                    links: [{ name: 'Website', url: 'https://dao.com' }],
                },
                existingMetadata: {
                    name: 'Old DAO',
                    description: 'Existing description',
                    links: [],
                },
            });

            renderNestedAction(action);
            await userEvent.click(screen.getAllByRole('button')[0]);

            expect(screen.getByText('Destination DAO')).toBeInTheDocument();
            expect(screen.getByText(copyKey('logoTerm'))).toBeInTheDocument();
            expect(
                screen.getByRole('link', { name: /Website/ }),
            ).toHaveAttribute('href', 'https://dao.com');

            await userEvent.click(screen.getByText(copyKey('existingToggle')));

            expect(screen.getByText('Old DAO')).toBeInTheDocument();
        });

        it('renders the plugin metadata update view with the process key', async () => {
            const action = generateProposalActionUpdatePluginMetadata({
                ...setMetadataCall,
                proposedMetadata: { name: 'Council', processKey: 'CNL' },
                existingMetadata: { name: 'Council', processKey: 'CNC' },
            });

            renderNestedAction(action);
            await userEvent.click(screen.getAllByRole('button')[0]);

            expect(
                screen.getByText(copyKey('summaryTerm')),
            ).toBeInTheDocument();
            expect(screen.getByText('CNL')).toBeInTheDocument();
        });

        it('renders empty fields when the decoded action carries no metadata', async () => {
            const action = {
                ...generateProposalActionUpdateMetadata(setMetadataCall),
                proposedMetadata: undefined,
                existingMetadata: undefined,
            } as unknown as IProposalAction;

            renderNestedAction(action);
            await userEvent.click(screen.getAllByRole('button')[0]);

            expect(screen.getByText(copyKey('nameTerm'))).toBeInTheDocument();
            expect(screen.getByText(copyKey('linkTerm'))).toBeInTheDocument();
            expect(screen.queryAllByRole('listitem')).toHaveLength(0);
        });
    });

    it('renders nothing when both rawActions and rawTuple are empty', () => {
        const { container } = render(
            createTestComponent({ rawTuple: [], rawActions: undefined }),
        );

        expect(container).toBeEmptyDOMElement();
    });
});
