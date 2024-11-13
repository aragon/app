import { useMemberList, type IProposalAction } from '@/modules/governance/api/governanceService';
import type { IProposalActionData } from '@/modules/governance/components/createProposalForm';
import { NumberProgressInput } from '@/shared/components/forms/numberProgressInput';
import { useTranslations } from '@/shared/components/translationsProvider';
import { useFormField } from '@/shared/hooks/useFormField';
import type { IProposalActionComponentProps } from '@aragon/gov-ui-kit';
import { RadioCard, RadioGroup } from '@aragon/gov-ui-kit';
import { useEffect } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';
import { encodeFunctionData } from 'viem';

export interface IMultisigUpdateSettingsActionProps
    extends IProposalActionComponentProps<IProposalActionData<IProposalAction>> {}

export interface IMultisigUpdateSettingsFormData {
    /**
     * Who can create proposals. Members or any wallet.
     */
    onlyListed: string;
}

const updateMultisigSettingsAbi = {
    type: 'function',
    inputs: [
        {
            name: '_multisigSettings',
            internalType: 'struct Multisig.MultisigSettings',
            type: 'tuple',
            components: [
                { name: 'onlyListed', internalType: 'bool', type: 'bool' },
                { name: 'minApprovals', internalType: 'uint16', type: 'uint16' },
            ],
        },
    ],
    name: 'updateMultisigSettings',
    outputs: [],
    stateMutability: 'nonpayable',
};

export const MultisigUpdateSettingsAction: React.FC<IMultisigUpdateSettingsActionProps> = (props) => {
    const { index, action } = props;

    const { t } = useTranslations();

    const { setValue } = useFormContext();

    const actionFieldName = `actions.[${index}]`;
    useFormField<Record<string, IProposalActionData>, typeof actionFieldName>(actionFieldName);

    const minimumApprovalFieldName = `${actionFieldName}.proposedSettings.minApprovals`;
    const minimumApproval = useWatch<Record<string, string>>({ name: minimumApprovalFieldName });
    const minimumApprovalNumber = minimumApproval.length > 0 ? Number(minimumApproval) : undefined;

    const memberParams = { pluginAddress: action.to, daoId: action.daoId };
    const { data: memberList } = useMemberList({ queryParams: memberParams });
    const membersCount = memberList?.pages[0].metadata.totalRecords ?? 1;

    const majorityThreshold = Math.floor(membersCount / 2);

    const majorityAlert = { message: 'Proposal will be approved by majority', variant: 'success' as const };
    const minorityAlert = {
        message: 'Proposals could be approved by a minority rather than a majority.',
        variant: 'warning' as const,
    };

    const alert =
        minimumApprovalNumber == null
            ? undefined
            : minimumApprovalNumber > majorityThreshold
              ? majorityAlert
              : minorityAlert;

    const onlyListedField = useFormField<Record<string, IMultisigUpdateSettingsFormData['onlyListed']>, 'onlyListed'>(
        'onlyListed',
        {
            fieldPrefix: `${actionFieldName}.proposedSettings`,
            label: t('app.plugins.multisig.multisigUpdateSettingsAction.onlyListed.label'),
        },
    );

    useEffect(() => {
        const updateSettingsParams = { onlyListed: onlyListedField.value, minApprovals: minimumApproval };
        const newData = encodeFunctionData({ abi: [updateMultisigSettingsAbi], args: [updateSettingsParams] });

        setValue(`${actionFieldName}.data`, newData);
    }, [setValue, actionFieldName, onlyListedField.value, minimumApproval]);

    return (
        <div className="flex w-full flex-col gap-y-6">
            <NumberProgressInput
                fieldName={minimumApprovalFieldName}
                label={t('app.plugins.multisig.multisigUpdateSettingsAction.minimumApproval.label')}
                helpText={t('app.plugins.multisig.multisigUpdateSettingsAction.minimumApproval.helpText')}
                valueLabel={minimumApproval}
                total={membersCount}
                totalLabel={t('app.plugins.multisig.multisigUpdateSettingsAction.minimumApproval.total', {
                    total: membersCount,
                })}
                // TODO: update ODS to support success variant on input component
                alert={alert}
            />
            <RadioGroup
                className="flex w-full flex-col gap-4"
                helpText={t('app.plugins.multisig.multisigUpdateSettingsAction.onlyListed.helpText')}
                onValueChange={(value) => {
                    if (value === 'members') {
                        onlyListedField.onChange(true);
                    } else {
                        onlyListedField.onChange(false);
                    }
                }}
                {...onlyListedField}
            >
                <RadioCard
                    label={t('app.plugins.multisig.multisigUpdateSettingsAction.onlyListed.members.label')}
                    description={t('app.plugins.multisig.multisigUpdateSettingsAction.onlyListed.members.description')}
                    value="members"
                />
                <RadioCard
                    label={t('app.plugins.multisig.multisigUpdateSettingsAction.onlyListed.anyWallet.label')}
                    description={t(
                        'app.plugins.multisig.multisigUpdateSettingsAction.onlyListed.anyWallet.description',
                    )}
                    value="any"
                />
            </RadioGroup>
        </div>
    );
};
