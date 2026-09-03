import type {
    IProposalAnalysis,
    IProposalAnalysisAction,
} from '../../api/proposalAnalysisService';

export const generateProposalAnalysisAction = (
    action?: Partial<IProposalAnalysisAction>,
): IProposalAnalysisAction => ({
    index: 0,
    parentIndex: null,
    depth: 0,
    type: 'Transfer',
    to: '0x4444444444444444444444444444444444444444',
    targetName: 'USD Coin',
    functionName: 'transfer',
    decoded: true,
    transfer: {
        tokenAddress: '0x4444444444444444444444444444444444444444',
        symbol: 'USDC',
        amount: '2500.0',
        amountUsd: 2500,
        shareOfTreasury: 0.05,
        recipient: '0x5555555555555555555555555555555555555555',
    },
    ...action,
});

export const generateProposalAnalysis = (
    analysis?: Partial<IProposalAnalysis>,
): IProposalAnalysis => ({
    proposalId: 'proposal-123',
    daoId: 'ethereum-mainnet-0x1111111111111111111111111111111111111111',
    severity: 'review',
    rulesSeverity: 'review',
    report: {
        headline: 'Pays one grant from the treasury.',
        whatItDoes: [{ text: 'Transfers the grant.', actionRefs: [0] }],
        intentMismatch: {
            verdict: 'aligned',
            explanation: 'The text describes the transfer.',
            actionRefs: [0],
        },
        whyItMatters: 'A notable share of the treasury leaves in one payment.',
        openQuestions: ['Who controls the recipient address?'],
        severity: 'review',
    },
    findings: [
        { flag: 'largeTreasuryShare', severity: 'review', actionRefs: [0] },
    ],
    factPack: {
        actions: [generateProposalAnalysisAction()],
        treasury: { tvlUsd: 50_000, outflowUsd: 2500, outflowShare: 0.05 },
    },
    model: 'google/gemini-2.5-flash',
    promptVersion: 'v1',
    generatedAt: 1_700_000_000_000,
    ...analysis,
});
