import { useMemberList, type IProposalAction } from '@/modules/governance/api/governanceService';
import type { IProposalActionData } from '@/modules/governance/components/createProposalForm';
import { NumberProgressInput } from '@/shared/components/forms/numberProgressInput';
import { useTranslations } from '@/shared/components/translationsProvider';
import { useFormField } from '@/shared/hooks/useFormField';
import type { IProposalActionComponentProps } from '@aragon/gov-ui-kit';
import { useWatch } from 'react-hook-form';

export interface IMultisigUpdateSettingsActionProps
    extends IProposalActionComponentProps<IProposalActionData<IProposalAction>> {}

export const MultisigUpdateSettingsAction: React.FC<IMultisigUpdateSettingsActionProps> = (props) => {
    const { action, index } = props;

    const { t } = useTranslations();

    const actionFieldName = `actions.[${index}]`;
    useFormField<Record<string, IProposalActionData>, typeof actionFieldName>(actionFieldName);

    const minimumApprovalFieldName = `${actionFieldName}.proposedSettings.minApprovals`;
    const minimumApproval = useWatch<Record<string, string>>({ name: minimumApprovalFieldName });

    const memberParams = { pluginAddress: action.to, daoId: action.daoId };
    const { data: memberList } = useMemberList({ queryParams: memberParams });
    const membersCount = memberList?.pages[0].metadata.totalRecords;

    return (
        <NumberProgressInput
            fieldName={minimumApprovalFieldName}
            label={t('app.plugins.multisig.multisigUpdateSettingsAction.minimumApproval.label')}
            helpText={t('app.plugins.multisig.multisigUpdateSettingsAction.minimumApproval.helpText')}
            valueLabel={minimumApproval ?? 0}
            total={membersCount ?? 1}
            totalLabel={t('app.plugins.multisig.multisigUpdateSettingsAction.minimumApproval.total', {
                total: membersCount,
            })}
        />
    );
};
