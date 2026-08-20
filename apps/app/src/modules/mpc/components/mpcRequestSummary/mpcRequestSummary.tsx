'use client';

import { DefinitionList, Tag } from '@aragon/gov-ui-kit';
import { formatEther } from 'viem';
import type { IMpcSignRequest } from '@/modules/mpc/api/mpcService/domain';
import { useTranslations } from '@/shared/components/translationsProvider';
import { mpcRequestStatusVariant } from '../mpcRequestItem';
import { MpcWorkspacePolicyVerdicts } from '../mpcWorkspacePolicyVerdicts';

export interface IMpcRequestSummaryProps {
    /**
     * Request to summarize.
     */
    request: IMpcSignRequest;
}

const formatTypedData = (typedDataJson: string) => {
    try {
        return JSON.stringify(JSON.parse(typedDataJson), null, 2);
    } catch {
        return typedDataJson;
    }
};

/**
 * Human readable summary of a sign request (anti blind-signing: full payload is displayed before signing).
 */
export const MpcRequestSummary: React.FC<IMpcRequestSummaryProps> = (props) => {
    const { request } = props;
    const { t } = useTranslations();
    const { payload, summary, policyDecision } = request;

    return (
        <DefinitionList.Container>
            <DefinitionList.Item term={t('app.mpc.mpcRequestSummary.type')}>
                {t(`app.mpc.mpcRequestItem.type.${request.type}`)}
            </DefinitionList.Item>
            <DefinitionList.Item term={t('app.mpc.mpcRequestSummary.status')}>
                <Tag
                    label={t(`app.mpc.mpcRequestItem.status.${request.status}`)}
                    variant={mpcRequestStatusVariant[request.status]}
                />
            </DefinitionList.Item>
            <DefinitionList.Item
                term={t('app.mpc.mpcRequestSummary.requester')}
            >
                {request.createdBy}
            </DefinitionList.Item>
            {payload.type === 'transaction' && (
                <>
                    <DefinitionList.Item
                        term={t('app.mpc.mpcRequestSummary.chainId')}
                    >
                        {payload.transaction.chainId}
                    </DefinitionList.Item>
                    <DefinitionList.Item
                        copyValue={payload.transaction.to}
                        term={t('app.mpc.mpcRequestSummary.to')}
                    >
                        <span className="break-all font-mono">
                            {payload.transaction.to}
                        </span>
                    </DefinitionList.Item>
                    <DefinitionList.Item
                        term={t('app.mpc.mpcRequestSummary.value')}
                    >
                        {t('app.mpc.mpcRequestSummary.eth', {
                            value: formatEther(
                                BigInt(payload.transaction.valueWei),
                            ),
                        })}
                    </DefinitionList.Item>
                    <DefinitionList.Item
                        term={t('app.mpc.mpcRequestSummary.data')}
                    >
                        {payload.transaction.data != null &&
                        payload.transaction.data !== '0x' ? (
                            <span className="break-all font-mono text-sm">
                                {payload.transaction.data}
                                {summary.selector != null &&
                                    ` (${t('app.mpc.mpcRequestSummary.selector', { selector: summary.selector })})`}
                            </span>
                        ) : (
                            t('app.mpc.mpcRequestSummary.noData')
                        )}
                    </DefinitionList.Item>
                </>
            )}
            {payload.type === 'message' && (
                <DefinitionList.Item
                    term={t('app.mpc.mpcRequestSummary.message')}
                >
                    <pre className="whitespace-pre-wrap break-words rounded-lg bg-neutral-50 p-3 font-mono text-sm">
                        {payload.message.message}
                    </pre>
                </DefinitionList.Item>
            )}
            {payload.type === 'typedData' && (
                <DefinitionList.Item
                    term={t('app.mpc.mpcRequestSummary.typedData')}
                >
                    <pre className="max-h-64 overflow-auto whitespace-pre-wrap break-words rounded-lg bg-neutral-50 p-3 font-mono text-xs">
                        {formatTypedData(payload.typedData.typedDataJson)}
                    </pre>
                </DefinitionList.Item>
            )}
            <DefinitionList.Item term={t('app.mpc.mpcRequestSummary.policy')}>
                <div className="flex flex-col gap-1">
                    <span>
                        {policyDecision.allowed
                            ? policyDecision.requiresApproval
                                ? t(
                                      'app.mpc.mpcRequestSummary.policyRequiresApproval',
                                      { count: request.approvalsRequired },
                                  )
                                : t('app.mpc.mpcRequestSummary.policyAllowed')
                            : t('app.mpc.mpcRequestSummary.policyDenied')}
                    </span>
                    {policyDecision.reasons.length > 0 && (
                        <ul className="list-disc pl-5 text-neutral-500 text-sm">
                            {policyDecision.reasons.map((reason) => (
                                <li key={reason}>{reason}</li>
                            ))}
                        </ul>
                    )}
                </div>
            </DefinitionList.Item>
            {policyDecision.workspacePolicies != null &&
                policyDecision.workspacePolicies.length > 0 && (
                    <DefinitionList.Item
                        term={t('app.mpc.mpcRequestSummary.workspacePolicies')}
                    >
                        <MpcWorkspacePolicyVerdicts
                            verdicts={policyDecision.workspacePolicies}
                        />
                    </DefinitionList.Item>
                )}
            {request.approvalsRequired > 0 && (
                <DefinitionList.Item
                    term={t('app.mpc.mpcRequestSummary.approvals')}
                >
                    {request.approvals.length === 0
                        ? t('app.mpc.mpcRequestSummary.noApprovals')
                        : request.approvals
                              .map((approval) => approval.username)
                              .join(', ')}
                    {` (${request.approvals.length.toString()}/${request.approvalsRequired.toString()})`}
                </DefinitionList.Item>
            )}
        </DefinitionList.Container>
    );
};
