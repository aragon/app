'use client';

import {
    AlertInline,
    type IProposalAction,
    type IProposalActionComponentProps,
} from '@aragon/gov-ui-kit';
import type { IProposalActionData } from '@/modules/governance/components/createProposalForm';
import { useTranslations } from '@/shared/components/translationsProvider';
import { usePermissionActionEncoder } from '../hooks/usePermissionActionEncoder';
import { PermissionAddressInput } from './permissionAddressInput';
import { PermissionIdInput } from './permissionIdInput';

export interface IPermissionActionCreateProps
    extends IProposalActionComponentProps<
        IProposalActionData<IProposalAction, unknown>
    > {}

/**
 * Composer view of a `grant`, `revoke` or `grantWithCondition` action. The fields write
 * the decoded parameter values, and the calldata follows them through
 * `usePermissionActionEncoder`.
 */
export const PermissionActionCreate: React.FC<IPermissionActionCreateProps> = (
    props,
) => {
    const { action, index, chainId } = props;

    const { t } = useTranslations();

    const fieldPrefix = `actions.${index.toString()}`;
    const parameters = action.inputData?.parameters ?? [];
    const isRevoke = action.inputData?.function === 'revoke';
    const hasCondition = parameters.length > 3;

    usePermissionActionEncoder({ action, fieldPrefix });

    const parameterField = (parameterIndex: number) =>
        `inputData.parameters.${parameterIndex.toString()}.value`;

    return (
        <div className="flex w-full flex-col gap-6">
            <AlertInline
                message={t(
                    'app.actions.core.permissionActionDetails.riskWarning',
                )}
                variant="warning"
            />
            <PermissionAddressInput
                chainId={chainId}
                fieldPrefix={fieldPrefix}
                helpText={t(
                    `app.actions.core.permissionActionCreate.${isRevoke ? 'whoRevokeHelpText' : 'whoGrantHelpText'}`,
                )}
                label={t('app.actions.core.permissionActionDetails.whoTerm')}
                name={parameterField(1)}
            />
            <PermissionAddressInput
                chainId={chainId}
                fieldPrefix={fieldPrefix}
                helpText={t(
                    'app.actions.core.permissionActionCreate.whereHelpText',
                )}
                label={t('app.actions.core.permissionActionDetails.whereTerm')}
                name={parameterField(0)}
            />
            <PermissionIdInput
                fieldPrefix={fieldPrefix}
                name={parameterField(2)}
            />
            {hasCondition && (
                <PermissionAddressInput
                    chainId={chainId}
                    fieldPrefix={fieldPrefix}
                    helpText={t(
                        'app.actions.core.permissionActionCreate.conditionHelpText',
                    )}
                    isCondition={true}
                    label={t(
                        'app.actions.core.permissionActionDetails.conditionTerm',
                    )}
                    name={parameterField(3)}
                />
            )}
        </div>
    );
};
