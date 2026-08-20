/**
 * @jest-environment node
 */

import type {
    IMpcPolicySimResult,
    IMpcTransactionPayload,
} from '@/modules/mpc/api/mpcService/domain';
import {
    generateMpcPolicy,
    generateMpcSignRequest,
    generateMpcWorkspacePolicyVerdict,
} from '@/modules/mpc/testUtils';
import {
    buildWorkspacePolicyContext,
    mergeWorkspacePolicyVerdicts,
    toWorkspacePolicyVerdict,
} from './mpcWorkspacePolicyEvaluation';

jest.mock('server-only', () => ({}));

const transaction: IMpcTransactionPayload = {
    chainId: 11_155_111,
    to: '0x1111111111111111111111111111111111111111',
    valueWei: '2500000000000000000',
    data: '0x',
};

const simResult = (
    template: string,
    params: Record<string, unknown> = {},
    actionNodeId: string | null = 'action_1',
): IMpcPolicySimResult => ({
    decision: { template, params },
    actionNodeId,
    path: ['trigger', 'c1', ...(actionNodeId != null ? [actionNodeId] : [])],
    nodeResults: {},
    derived: {
        amount_gwei: '2500000000',
        weekday: 2,
        hour: 10,
        proposal_kind: 'native_transfer',
        selector: null,
        is_delegatecall: false,
        is_token_approval: false,
        approval_is_unlimited: false,
        erc20_amount: null,
        erc20_recipient: null,
        chain_id: 11_155_111,
        daily_spent_gwei: '2500000000',
        has_calldata: false,
    },
});

describe('mpcWorkspacePolicyEvaluation', () => {
    describe('buildWorkspacePolicyContext', () => {
        it('maps the transaction to the engine context (amount, action, timestamp, stub scanner)', () => {
            const now = 1_786_960_800_000;
            const context = buildWorkspacePolicyContext(
                transaction,
                generateMpcPolicy({ recipientAllowlist: null }),
                [],
                now,
            );

            expect(context).toEqual({
                amount_wei: '2500000000000000000',
                dest_whitelisted: false,
                dest_seen_before: false,
                timestamp: 1_786_960_800,
                scanner: 'safe',
                action_to: transaction.to,
                action_value_wei: '2500000000000000000',
                action_data: '0x',
                action_operation: 'call',
                chain_id: 11_155_111,
                // Nothing else spent in the window: the 24 h spend is this transaction alone.
                daily_spent_wei: '2500000000000000000',
            });
        });

        it('marks the destination as whitelisted when it is on the system allowlist (case-insensitive)', () => {
            const context = buildWorkspacePolicyContext(
                transaction,
                generateMpcPolicy({
                    recipientAllowlist: [
                        '0x1111111111111111111111111111111111111111'.toUpperCase() as never,
                    ],
                }),
                [],
            );
            expect(context.dest_whitelisted).toBe(true);
        });

        it('marks the destination as seen before only when a signed / broadcast transaction targeted it', () => {
            const history = [
                generateMpcSignRequest({
                    type: 'transaction',
                    status: 'rejected',
                    summary: { label: 'x', to: transaction.to },
                }),
            ];
            expect(
                buildWorkspacePolicyContext(
                    transaction,
                    generateMpcPolicy(),
                    history,
                ).dest_seen_before,
            ).toBe(false);

            history.push(
                generateMpcSignRequest({
                    type: 'transaction',
                    status: 'broadcast',
                    summary: { label: 'y', to: transaction.to },
                }),
            );
            expect(
                buildWorkspacePolicyContext(
                    transaction,
                    generateMpcPolicy(),
                    history,
                ).dest_seen_before,
            ).toBe(true);
        });
    });

    it('adds the reserved 24 h spend of the system to the daily spend fact', () => {
        const now = Date.now();
        const history = [
            generateMpcSignRequest({
                type: 'transaction',
                status: 'approved',
                payload: {
                    type: 'transaction',
                    transaction: {
                        ...transaction,
                        valueWei: '1000000000000000000',
                    },
                },
                createdAt: new Date(now - 60_000).toISOString(),
            }),
        ];
        const context = buildWorkspacePolicyContext(
            transaction,
            generateMpcPolicy(),
            history,
            now,
        );
        expect(context.daily_spent_wei).toBe('3500000000000000000');
    });

    describe('toWorkspacePolicyVerdict', () => {
        const policy = { id: 'p1', name: 'Treasury' };

        it('describes an approval', () => {
            const verdict = toWorkspacePolicyVerdict(
                policy,
                simResult('approve'),
            );
            expect(verdict).toMatchObject({
                policyId: 'p1',
                policyName: 'Treasury',
                decision: 'approve',
                isDefaultDeny: false,
            });
            expect(verdict.reason).toContain('approves');
        });

        it('describes an escalation with approvals and delay', () => {
            const verdict = toWorkspacePolicyVerdict(
                policy,
                simResult('escalate', {
                    extra_approvals: 2,
                    delay_seconds: 3600,
                }),
            );
            expect(verdict.decision).toBe('escalate');
            expect(verdict.reason).toContain('2 additional approval(s)');
            expect(verdict.reason).toContain('1 h');
        });

        it('flags the default deny (no action reached)', () => {
            const verdict = toWorkspacePolicyVerdict(
                policy,
                simResult('deny', {}, null),
            );
            expect(verdict.isDefaultDeny).toBe(true);
            expect(verdict.reason).toContain('default deny');
        });
    });

    describe('mergeWorkspacePolicyVerdicts', () => {
        it('allows when every policy approves / notifies', () => {
            const merged = mergeWorkspacePolicyVerdicts([
                generateMpcWorkspacePolicyVerdict({ decision: 'approve' }),
                generateMpcWorkspacePolicyVerdict({
                    policyId: 'p2',
                    decision: 'notify',
                }),
            ]);
            expect(merged).toMatchObject({
                allowed: true,
                requiresApproval: false,
                extraApprovals: 0,
                denyReasons: [],
                approvalReasons: [],
            });
        });

        it('requires approvals when a policy escalates (largest extra_approvals wins)', () => {
            const merged = mergeWorkspacePolicyVerdicts([
                generateMpcWorkspacePolicyVerdict({
                    decision: 'escalate',
                    params: { extra_approvals: 1 },
                    reason: 'one',
                }),
                generateMpcWorkspacePolicyVerdict({
                    policyId: 'p2',
                    decision: 'escalate',
                    params: { extra_approvals: 3 },
                    reason: 'three',
                }),
            ]);
            expect(merged.allowed).toBe(true);
            expect(merged.requiresApproval).toBe(true);
            expect(merged.extraApprovals).toBe(3);
            expect(merged.approvalReasons).toEqual(['one', 'three']);
        });

        it('denies when any policy denies (fail-closed, unknown decisions deny too)', () => {
            const merged = mergeWorkspacePolicyVerdicts([
                generateMpcWorkspacePolicyVerdict({ decision: 'approve' }),
                generateMpcWorkspacePolicyVerdict({
                    policyId: 'p2',
                    decision: 'deny',
                    reason: 'nope',
                }),
                generateMpcWorkspacePolicyVerdict({
                    policyId: 'p3',
                    decision: 'something_new',
                    reason: 'unknown',
                }),
            ]);
            expect(merged.allowed).toBe(false);
            expect(merged.denyReasons).toEqual(['nope', 'unknown']);
        });
    });
});
