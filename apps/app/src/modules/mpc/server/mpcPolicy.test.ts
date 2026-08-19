/**
 * @jest-environment node
 */

import type { Address } from 'viem';
import type {
    IMpcPolicy,
    IMpcSignRequest,
    MpcSignRequestPayload,
} from '@/modules/mpc/api/mpcService/domain';
import { computeDailySpentWei, evaluatePolicy } from './mpcPolicy';

describe('evaluatePolicy', () => {
    const recipient: Address = '0x1111111111111111111111111111111111111111';
    const other: Address = '0x2222222222222222222222222222222222222222';

    const basePolicy: IMpcPolicy = {
        allowedChainIds: [11_155_111],
        recipientAllowlist: null,
        maxValuePerTxWei: null,
        dailyLimitWei: null,
        requireApprovalAboveWei: null,
        approvalsRequired: 1,
        allowContractCalls: true,
        allowMessageSigning: true,
    };

    const txPayload = (
        overrides?: Partial<
            Extract<
                MpcSignRequestPayload,
                { type: 'transaction' }
            >['transaction']
        >,
    ): MpcSignRequestPayload => ({
        type: 'transaction',
        transaction: {
            chainId: 11_155_111,
            to: recipient,
            valueWei: '1000',
            ...overrides,
        },
    });

    const historyRequest = (
        valueWei: string,
        status: IMpcSignRequest['status'],
        createdAt = new Date().toISOString(),
    ): IMpcSignRequest => ({
        id: 'req',
        systemId: 'sys',
        type: 'transaction',
        payload: txPayload({ valueWei }),
        summary: { label: 'tx' },
        status,
        policyDecision: { allowed: true, requiresApproval: false, reasons: [] },
        approvals: [],
        rejections: [],
        approvalsRequired: 0,
        createdBy: 'alice',
        createdAt,
        updatedAt: createdAt,
    });

    it('allows a simple transaction without approvals', () => {
        expect(evaluatePolicy(basePolicy, txPayload())).toEqual({
            allowed: true,
            requiresApproval: false,
            reasons: [],
        });
    });

    it('denies transactions on chains not allowed', () => {
        const result = evaluatePolicy(basePolicy, txPayload({ chainId: 1 }));

        expect(result.allowed).toBeFalsy();
        expect(result.reasons[0]).toMatch(/Chain 1 is not allowed/);
    });

    it('enforces the recipient allowlist', () => {
        const policy = { ...basePolicy, recipientAllowlist: [recipient] };

        expect(evaluatePolicy(policy, txPayload()).allowed).toBeTruthy();

        const denied = evaluatePolicy(policy, txPayload({ to: other }));
        expect(denied.allowed).toBeFalsy();
        expect(denied.reasons[0]).toMatch(/allowlist/);
    });

    it('enforces the per-transaction limit', () => {
        const policy = { ...basePolicy, maxValuePerTxWei: '999' };
        const denied = evaluatePolicy(policy, txPayload());

        expect(denied.allowed).toBeFalsy();
        expect(denied.reasons[0]).toMatch(/per-transaction limit/);
    });

    it('enforces the rolling daily limit using released / signed / broadcast history', () => {
        const policy = { ...basePolicy, dailyLimitWei: '2500' };
        const history = [
            historyRequest('1000', 'broadcast'),
            historyRequest('1000', 'rejected'),
            historyRequest('1000', 'failed'),
        ];

        expect(
            evaluatePolicy(policy, txPayload(), history).allowed,
        ).toBeTruthy();

        history.push(historyRequest('1000', 'signed'));
        const denied = evaluatePolicy(policy, txPayload(), history);
        expect(denied.allowed).toBeFalsy();
        expect(denied.reasons[0]).toMatch(/daily limit/);
    });

    it('reserves the value of pending / approved requests against the daily limit', () => {
        const policy = { ...basePolicy, dailyLimitWei: '2500' };
        const history = [
            historyRequest('1000', 'pending_approval'),
            historyRequest('1000', 'approved'),
        ];

        expect(
            evaluatePolicy(policy, txPayload(), history).allowed,
        ).toBeFalsy();
        expect(computeDailySpentWei(history)).toEqual(BigInt(2000));
    });

    it('ignores history older than 24h for the daily limit', () => {
        const policy = { ...basePolicy, dailyLimitWei: '1500' };
        const twoDaysAgo = new Date(
            Date.now() - 2 * 24 * 60 * 60 * 1000,
        ).toISOString();
        const history = [historyRequest('1000', 'broadcast', twoDaysAgo)];

        expect(
            evaluatePolicy(policy, txPayload(), history).allowed,
        ).toBeTruthy();
    });

    it('requires approval above the threshold', () => {
        const policy = {
            ...basePolicy,
            requireApprovalAboveWei: '500',
            approvalsRequired: 2,
        };
        const result = evaluatePolicy(policy, txPayload());

        expect(result.allowed).toBeTruthy();
        expect(result.requiresApproval).toBeTruthy();
        expect(result.reasons[0]).toMatch(/2 approval/);

        const below = evaluatePolicy(policy, txPayload({ valueWei: '500' }));
        expect(below.requiresApproval).toBeFalsy();
    });

    it('denies contract calls when not allowed', () => {
        const policy = { ...basePolicy, allowContractCalls: false };
        const denied = evaluatePolicy(
            policy,
            txPayload({ data: '0xa9059cbb' }),
        );

        expect(denied.allowed).toBeFalsy();
        expect(denied.reasons[0]).toMatch(/Contract calls/);
        expect(
            evaluatePolicy(policy, txPayload({ data: '0x' })).allowed,
        ).toBeTruthy();
    });

    it('denies message signing when not allowed', () => {
        const policy = { ...basePolicy, allowMessageSigning: false };
        const message: MpcSignRequestPayload = {
            type: 'message',
            message: { message: 'hi' },
        };
        const typedData: MpcSignRequestPayload = {
            type: 'typedData',
            typedData: { typedDataJson: '{}' },
        };

        expect(evaluatePolicy(policy, message).allowed).toBeFalsy();
        expect(evaluatePolicy(policy, typedData).allowed).toBeFalsy();
        expect(evaluatePolicy(basePolicy, message).allowed).toBeTruthy();
    });

    it('requires approvals for messages only when the policy asks for it', () => {
        const message: MpcSignRequestPayload = {
            type: 'message',
            message: { message: 'hi' },
        };
        expect(
            evaluatePolicy(basePolicy, message).requiresApproval,
        ).toBeFalsy();

        const strict = { ...basePolicy, requireApprovalForMessages: true };
        const result = evaluatePolicy(strict, message);
        expect(result.allowed).toBeTruthy();
        expect(result.requiresApproval).toBeTruthy();
        expect(result.reasons[0]).toMatch(/1 approval/);

        const noApprovers = { ...strict, approvalsRequired: 0 };
        expect(
            evaluatePolicy(noApprovers, message).requiresApproval,
        ).toBeFalsy();
    });

    it('collects multiple deny reasons', () => {
        const policy = {
            ...basePolicy,
            allowContractCalls: false,
            maxValuePerTxWei: '1',
        };
        const denied = evaluatePolicy(
            policy,
            txPayload({ data: '0xa9059cbb', chainId: 5 }),
        );

        expect(denied.reasons).toHaveLength(3);
    });
});
