import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { generateProposalAnalysis } from '@/modules/governance/testUtils';
import { AragonBackendServiceError } from '@/shared/api/aragonBackendService';
import * as featureFlagsProvider from '@/shared/components/featureFlagsProvider';
import { ReactQueryWrapper } from '@/shared/testUtils';
import { proposalAnalysisService } from '../../api/proposalAnalysisService';
import {
    type IProposalAnalysisCardProps,
    ProposalAnalysisCard,
} from './proposalAnalysisCard';

describe('<ProposalAnalysisCard /> component', () => {
    const useFeatureFlagsSpy = jest.spyOn(
        featureFlagsProvider,
        'useFeatureFlags',
    );
    const generateSpy = jest.spyOn(
        proposalAnalysisService,
        'generateProposalAnalysis',
    );

    const originalAssistantUrl = process.env.NEXT_PUBLIC_ASSISTANT_URL;

    const setFeatureEnabled = (enabled: boolean) => {
        useFeatureFlagsSpy.mockReturnValue({
            isEnabled: (key) => key === 'aiProposalAnalysis' && enabled,
        } as ReturnType<typeof featureFlagsProvider.useFeatureFlags>);
    };

    beforeEach(() => {
        setFeatureEnabled(true);
        process.env.NEXT_PUBLIC_ASSISTANT_URL = 'http://localhost:4000';
    });

    afterEach(() => {
        useFeatureFlagsSpy.mockReset();
        generateSpy.mockReset();
        process.env.NEXT_PUBLIC_ASSISTANT_URL = originalAssistantUrl;
    });

    const createTestComponent = (
        props?: Partial<IProposalAnalysisCardProps>,
    ) => {
        const completeProps: IProposalAnalysisCardProps = {
            proposalId: 'proposal-123',
            ...props,
        };

        return (
            <ReactQueryWrapper>
                <ProposalAnalysisCard {...completeProps} />
            </ReactQueryWrapper>
        );
    };

    const getReportButton = () =>
        screen.getByRole('button', { name: /proposalAnalysisCard.action/ });

    it('renders nothing when the feature flag is disabled', () => {
        setFeatureEnabled(false);
        const { container } = render(createTestComponent());
        expect(container).toBeEmptyDOMElement();
    });

    it('renders the empty state with the disclaimer and a button to request the report', () => {
        render(createTestComponent());

        expect(
            screen.getByText(/proposalAnalysisCard.title/),
        ).toBeInTheDocument();
        expect(
            screen.getByText(/proposalAnalysisCard.description/),
        ).toBeInTheDocument();
        expect(
            screen.getByText(/proposalAnalysisCard.disclaimer/),
        ).toBeInTheDocument();
        expect(getReportButton()).toBeInTheDocument();
        expect(generateSpy).not.toHaveBeenCalled();
    });

    it('requests the report for the proposal with the assistant url the app was built against', async () => {
        generateSpy.mockResolvedValue(generateProposalAnalysis());
        render(createTestComponent({ proposalId: 'proposal-abc' }));

        await userEvent.click(getReportButton());

        expect(generateSpy).toHaveBeenCalledWith({
            urlParams: { proposalId: 'proposal-abc' },
            body: { assistantUrl: 'http://localhost:4000' },
        });
    });

    it('renders the report with the severity tag, the sections and the referenced actions', async () => {
        const analysis = generateProposalAnalysis({
            report: {
                headline: 'Pays one grant from the treasury.',
                whatItDoes: [
                    { text: 'Transfers the grant.', actionRefs: [0] },
                    { text: 'Nothing else.', actionRefs: [] },
                ],
                intentMismatch: {
                    verdict: 'partial',
                    explanation: 'The text omits the recipient.',
                    actionRefs: [0],
                },
                whyItMatters: 'A notable share of the treasury leaves.',
                openQuestions: ['Who controls the recipient?'],
                severity: 'high',
            },
        });
        generateSpy.mockResolvedValue(analysis);
        render(createTestComponent());

        await userEvent.click(getReportButton());

        await waitFor(() =>
            expect(
                screen.getByText('Pays one grant from the treasury.'),
            ).toBeInTheDocument(),
        );
        expect(
            screen.getByText(/proposalAnalysisCard.severity.high/),
        ).toBeInTheDocument();
        expect(screen.getByText('Transfers the grant.')).toBeInTheDocument();
        expect(screen.getByText('Nothing else.')).toBeInTheDocument();
        expect(
            screen.getByText(/proposalAnalysisCard.intent.partial/),
        ).toBeInTheDocument();
        expect(
            screen.getByText('The text omits the recipient.'),
        ).toBeInTheDocument();
        expect(
            screen.getByText('A notable share of the treasury leaves.'),
        ).toBeInTheDocument();
        expect(
            screen.getByText('Who controls the recipient?'),
        ).toBeInTheDocument();
        // Values come from the fact pack, never from the model text: two references to action 0
        // (whatItDoes + intentMismatch), each with function, contract and amount.
        const refs = screen.getAllByText(
            /proposalAnalysisCard.actionRef.*transfer · USD Coin.*USDC/,
        );
        expect(refs).toHaveLength(2);
        expect(
            screen.getByRole('button', {
                name: /proposalAnalysisCard.regenerate/,
            }),
        ).toBeInTheDocument();
    });

    it('shows an error and keeps the button when the generation fails', async () => {
        generateSpy.mockRejectedValue(
            new AragonBackendServiceError(
                'analysisAssistantUnavailable',
                'x',
                502,
            ),
        );
        render(createTestComponent());

        await userEvent.click(getReportButton());

        await waitFor(() =>
            expect(
                screen.getByText(/proposalAnalysisCard.error/),
            ).toBeInTheDocument(),
        );
        expect(getReportButton()).toBeInTheDocument();
    });

    it('explains that the analysis is not enabled for the DAO on a 404', async () => {
        generateSpy.mockRejectedValue(
            new AragonBackendServiceError(
                AragonBackendServiceError.notFoundCode,
                'not found',
                404,
            ),
        );
        render(createTestComponent());

        await userEvent.click(getReportButton());

        await waitFor(() =>
            expect(
                screen.getByText(/proposalAnalysisCard.notAvailable/),
            ).toBeInTheDocument(),
        );
        expect(
            screen.queryByRole('button', {
                name: /proposalAnalysisCard.action/,
            }),
        ).not.toBeInTheDocument();
    });
});
