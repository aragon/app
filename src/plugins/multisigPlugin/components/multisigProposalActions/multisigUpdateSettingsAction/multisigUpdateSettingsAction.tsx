import { useMemberList, type IProposalAction } from '@/modules/governance/api/governanceService';
import type { IProposalActionData } from '@/modules/governance/components/createProposalForm';
import type { IMultisigPluginSettings } from '@/plugins/multisigPlugin/types';
import type { IDaoPlugin } from '@/shared/api/daoService';
import { NumberProgressInput } from '@/shared/components/forms/numberProgressInput';
import { useTranslations } from '@/shared/components/translationsProvider';
import type { IProposalActionComponentProps } from '@aragon/gov-ui-kit';
import { useWatch } from 'react-hook-form';

export interface IMultisigUpdateSettingsActionProps
    extends IProposalActionComponentProps<IProposalActionData<IProposalAction, IDaoPlugin<IMultisigPluginSettings>>> {}

export const MultisigUpdateSettingsAction: React.FC<IMultisigUpdateSettingsActionProps> = (props) => {
    const { action } = props;

    const { t } = useTranslations();
    const value = useWatch<Record<string, string>>({ name: 'test' });

    const memberParams = { pluginAddress: action.to, daoId: action.daoId };
    const { data: memberList } = useMemberList({ queryParams: memberParams });
    const membersCount = memberList?.pages[0].metadata.totalRecords;

    return (
        <NumberProgressInput
            fieldName="test"
            label={t('app.plugins.multisig.multisigUpdateSettingsAction.minimumApproval.label')}
            helpText={t('app.plugins.multisig.multisigUpdateSettingsAction.minimumApproval.helpText')}
            valueLabel={value ?? 0}
            total={membersCount ?? 1}
            totalLabel={t('app.plugins.multisig.multisigUpdateSettingsAction.minimumApproval.total', {
                total: membersCount,
            })}
        />
    );
};
