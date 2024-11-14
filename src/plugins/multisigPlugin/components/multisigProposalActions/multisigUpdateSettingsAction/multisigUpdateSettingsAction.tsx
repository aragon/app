import { useMemberList, type IProposalAction } from '@/modules/governance/api/governanceService';
import type { IProposalActionData } from '@/modules/governance/components/createProposalForm';
import type { IMultisigPluginSettings } from '@/plugins/multisigPlugin/types';
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
    const minimumApproval = useWatch<Record<string, IMultisigPluginSettings['minApprovals']>>({
        name: minimumApprovalFieldName,
    });

    const {
        value: onlyListedFieldValue,
        onChange: onOnlyListedFieldChange,
        ...onlyListedField
    } = useFormField<IMultisigPluginSettings, 'onlyListed'>('onlyListed', {
        fieldPrefix: `${actionFieldName}.proposedSettings`,
        label: t('app.plugins.multisig.multisigUpdateSettingsAction.onlyListed.label'),
    });

    const memberParams = { pluginAddress: action.to, daoId: action.daoId };
    const { data: memberList } = useMemberList({ queryParams: memberParams });
    const membersCount = memberList?.pages[0].metadata.totalRecords ?? 1;

    const handleRadioChange = (value: string) => onOnlyListedFieldChange(value === 'members');

    const majorityThreshold = Math.floor(membersCount / 2);
    const isMinApprovalsMajority = minimumApproval > majorityThreshold;

    const minApprovalContext = isMinApprovalsMajority ? 'majority' : 'minority';
    const minApprovalAlert = {
        message: t(`app.plugins.multisig.multisigUpdateSettingsAction.minimumApproval.alert.${minApprovalContext}`),
        variant: isMinApprovalsMajority ? 'success' : 'warning',
    } as const;

    useEffect(() => {
        const updateSettingsParams = { onlyListed: onlyListedFieldValue, minApprovals: minimumApproval };
        const newData = encodeFunctionData({ abi: [updateMultisigSettingsAbi], args: [updateSettingsParams] });

        setValue(`${actionFieldName}.data`, newData);
        setValue(`${actionFieldName}.inputData.parameters[0].value`, `[${onlyListedFieldValue}, ${minimumApproval}]`);
    }, [setValue, actionFieldName, onlyListedFieldValue, minimumApproval]);

    return (
        <div className="flex w-full flex-col gap-y-6 md:gap-y-10">
            <NumberProgressInput
                fieldName={minimumApprovalFieldName}
                label={t('app.plugins.multisig.multisigUpdateSettingsAction.minimumApproval.label')}
                helpText={t('app.plugins.multisig.multisigUpdateSettingsAction.minimumApproval.helpText')}
                valueLabel={minimumApproval.toString()}
                total={membersCount}
                totalLabel={t('app.plugins.multisig.multisigUpdateSettingsAction.minimumApproval.total', {
                    total: membersCount,
                })}
                alert={minApprovalAlert}
            />
            <RadioGroup
                helpText={t('app.plugins.multisig.multisigUpdateSettingsAction.onlyListed.helpText')}
                className="w-full"
                onValueChange={handleRadioChange}
                value={onlyListedFieldValue === true ? 'members' : 'any'}
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
