import {
    proposalAnalysisContractVersion,
    proposalAnalysisReportSchema,
    proposalAnalysisRequestSchema,
    proposalAnalysisResponseSchema,
} from './index';

// Pinned wire contract between the Aragon backend (which mirrors these shapes by hand in another
// repository) and the assistant service. Written out literally on purpose: a failure here means a
// DEPLOYED backend/assistant pair breaks. Change together with the backend and bump the version.
describe('proposal analysis wire contract', () => {
    const factPack = {
        contractVersion: 1,
        proposal: {
            id: '0xabc-0xplugin-1',
            network: 'ethereum-mainnet',
            daoAddress: '0x1111111111111111111111111111111111111111',
            daoName: 'Test DAO',
            pluginAddress: '0x2222222222222222222222222222222222222222',
            pluginSubdomain: 'token-voting',
            creatorAddress: '0x3333333333333333333333333333333333333333',
            startDate: 1_700_000_000,
            endDate: 1_700_100_000,
            isSubProposal: false,
            executed: false,
            hasTitle: true,
            hasSummary: false,
            hasDescription: true,
        },
        governance: {
            votingMode: 1,
            supportThreshold: 500_000,
            minParticipation: 150_000,
            minDuration: 3600,
            minApprovals: null,
            onlyListed: null,
            stages: [],
        },
        treasury: { tvlUsd: 50_000, outflowUsd: 2500, outflowShare: 0.05 },
        actions: [
            {
                index: 0,
                parentIndex: null,
                depth: 0,
                type: 'Transfer',
                to: '0x4444444444444444444444444444444444444444',
                targetKind: 'contract',
                targetName: 'USD Coin',
                value: '0',
                selector: '0xa9059cbb',
                signature: 'transfer(address,uint256)',
                functionName: 'transfer',
                notice: 'Moves tokens.',
                parameters: [
                    {
                        name: 'to',
                        type: 'address',
                        value: '0x5555555555555555555555555555555555555555',
                    },
                    { name: 'amount', type: 'uint256', value: '2500000000' },
                ],
                decoded: true,
                transfer: {
                    tokenAddress: '0x4444444444444444444444444444444444444444',
                    symbol: 'USDC',
                    decimals: 6,
                    recipient: '0x5555555555555555555555555555555555555555',
                    amountRaw: '2500000000',
                    amount: '2500.0',
                    amountUsd: 2500,
                    shareOfTreasury: 0.05,
                    shareOfAssetBalance: 0.25,
                },
                destinationChainId: null,
            },
        ],
        simulation: { status: 'success', runAt: 1_700_000_000_000 },
        integrity: {
            decoding: false,
            rawActionsCount: 1,
            topLevelActionsCount: 1,
            undecodedActionsCount: 0,
            actionsCountMismatch: false,
        },
    };

    const request = {
        contractVersion: 1,
        factPack,
        findings: [
            {
                flag: 'largeTreasuryShare',
                severity: 'review',
                actionRefs: [0],
                detail: { 0: 0.05 },
            },
        ],
        text: {
            title: 'Pay the grant',
            summary: null,
            description: 'Pays the Q3 grant.',
        },
    };

    const report = {
        headline: 'Pays one grant from the treasury.',
        whatItDoes: [{ text: 'Transfers the grant.', actionRefs: [0] }],
        intentMismatch: {
            verdict: 'aligned',
            explanation: 'The text describes the transfer.',
            actionRefs: [0],
        },
        whyItMatters: 'A notable share of the treasury leaves in one payment.',
        openQuestions: [],
        severity: 'review',
    };

    it('pins the contract version', () => {
        expect(proposalAnalysisContractVersion).toEqual(1);
    });

    it('accepts the pinned request', () => {
        expect(proposalAnalysisRequestSchema.parse(request)).toEqual(request);
    });

    it('rejects another contract version', () => {
        expect(
            proposalAnalysisRequestSchema.safeParse({
                ...request,
                contractVersion: 2,
            }).success,
        ).toBe(false);
    });

    it('accepts the pinned report and response', () => {
        expect(proposalAnalysisReportSchema.parse(report)).toEqual(report);
        expect(
            proposalAnalysisResponseSchema.parse({
                contractVersion: 1,
                report,
                rulesSeverity: 'review',
                model: 'google/gemini-2.5-flash',
                promptVersion: 'v1',
            }).report,
        ).toEqual(report);
    });

    // The report carries no field for a free amount or address: every claim points at fact-pack
    // actions. A model answer that smuggles such a field in is stripped, an unknown severity is
    // rejected.
    it('strips unknown report fields and rejects unknown severities and verdicts', () => {
        expect(
            proposalAnalysisReportSchema.parse({ ...report, amountUsd: 2500 }),
        ).toEqual(report);
        expect(
            proposalAnalysisReportSchema.safeParse({
                ...report,
                severity: 'critical',
            }).success,
        ).toBe(false);
        expect(
            proposalAnalysisReportSchema.safeParse({
                ...report,
                intentMismatch: { ...report.intentMismatch, verdict: 'unsure' },
            }).success,
        ).toBe(false);
    });

    it('requires at least one whatItDoes item and non-negative integer refs', () => {
        expect(
            proposalAnalysisReportSchema.safeParse({
                ...report,
                whatItDoes: [],
            }).success,
        ).toBe(false);
        expect(
            proposalAnalysisReportSchema.safeParse({
                ...report,
                whatItDoes: [{ text: 'x', actionRefs: [-1] }],
            }).success,
        ).toBe(false);
    });
});
