import { type IProposalAction } from '@/modules/governance/api/governanceService';
import type { IProposalActionData } from '@/modules/governance/components/createProposalForm';
import type { ITokenPluginSettings } from '@/plugins/tokenPlugin/types';
import type { IDaoPlugin } from '@/shared/api/daoService';
import { AdvancedDateInputDuration } from '@/shared/components/forms/advancedDateInput/advancedDateInputDuration';
import { useTranslations } from '@/shared/components/translationsProvider';
import { useFormField } from '@/shared/hooks/useFormField';
import { InputContainer, Switch, type IProposalActionComponentProps } from '@aragon/gov-ui-kit';
import { useWatch } from 'react-hook-form';
import { MinParticipation } from './components/minParticipation';
import { SupportThreshold } from './components/supportThreshold';

export interface ITokenUpdateSettingsActionProps
    extends IProposalActionComponentProps<IProposalActionData<IProposalAction, IDaoPlugin<ITokenPluginSettings>>> {}

const updateTokenSettingsAbi = {
    type: 'function',
    inputs: [
        {
            name: '_votingSettings',
            internalType: 'struct MajorityVotingBase.VotingSettings',
            type: 'tuple',
            components: [
                {
                    name: 'votingMode',
                    internalType: 'enum MajorityVotingBase.VotingMode',
                    type: 'uint8',
                },
                { name: 'supportThreshold', internalType: 'uint32', type: 'uint32' },
                { name: 'minParticipation', internalType: 'uint32', type: 'uint32' },
                { name: 'minDuration', internalType: 'uint64', type: 'uint64' },
                {
                    name: 'minProposerVotingPower',
                    internalType: 'uint256',
                    type: 'uint256',
                },
            ],
        },
    ],
    name: 'updateVotingSettings',
    outputs: [],
    stateMutability: 'nonpayable',
};

export const TokenUpdateSettingsAction: React.FC<ITokenUpdateSettingsActionProps> = (props) => {
    const { index, action } = props;

    const { t } = useTranslations();

    const actionFieldName = `actions.[${index}]`;
    useFormField<Record<string, IProposalActionData>, typeof actionFieldName>(actionFieldName);

    const supportThresholdFieldName = `${actionFieldName}.proposedSettings.supportThreshold`;
    const supportThreshold = useWatch<Record<string, ITokenPluginSettings['supportThreshold'] | undefined>>({
        name: supportThresholdFieldName,
    });

    const minParticipationFieldName = `${actionFieldName}.proposedSettings.minParticipation`;
    const minParticipation = useWatch<Record<string, ITokenPluginSettings['minParticipation'] | undefined>>({
        name: minParticipationFieldName,
    });

    const minDurationField = useFormField<Record<string, ITokenPluginSettings['minDuration']>>('minDuration', {
        fieldPrefix: `${actionFieldName}.proposedSettings`,
        label: t('app.plugins.token.tokenUpdateSettingsAction.minDuration.label'),
    });

    const votingModeField = useFormField<Record<string, ITokenPluginSettings['votingMode']>>('votingMode', {
        fieldPrefix: `${actionFieldName}.proposedSettings`,
    });

    return (
        <>
            <SupportThreshold
                supportThreshold={supportThreshold}
                supportThresholdFieldName="={supportThresholdFieldName"
            />
            <MinParticipation
                minParticipationFieldName={minParticipationFieldName}
                minParticipation={minParticipation}
                plugin={action.meta}
            />
            <InputContainer
                id="minDuration"
                helpText={t('app.plugins.token.tokenUpdateSettingsAction.minDuration.helpText')}
                {...minDurationField}
            >
                <AdvancedDateInputDuration
                    field={`${actionFieldName}.proposedSettings.minDuration`}
                    label={t('app.plugins.token.tokenUpdateSettingsAction.minDuration.label')}
                />
            </InputContainer>
            <Switch
                label={t('app.plugins.token.tokenUpdateSettingsAction.votingMode.label')}
                helpText={t('app.plugins.token.tokenUpdateSettingsAction.votingMode.helpText')}
                inlineLabel={t('app.plugins.token.tokenUpdateSettingsAction.votingMode.switch.label')}
                onCheckedChanged={(checked) => {
                    if (checked) {
                        votingModeField.onChange('1');
                    } else {
                        votingModeField.onChange('0');
                    }
                }}
                checked={votingModeField.value === '1'}
                disabled={votingModeField.value === '3'}
            />
            <Switch
                helpText={t('app.plugins.token.tokenUpdateSettingsAction.voteChange.helpText')}
                inlineLabel={t('app.plugins.token.tokenUpdateSettingsAction.voteChange.switch.label')}
                label={t('app.plugins.token.tokenUpdateSettingsAction.voteChange.label')}
                onCheckedChanged={(checked) => {
                    if (votingModeField.value === '1') {
                        return;
                    } else if (checked) {
                        votingModeField.onChange('3');
                    } else {
                        votingModeField.onChange('0');
                    }
                }}
                checked={votingModeField.value === '3'}
                disabled={votingModeField.value === '1'}
            />
        </>
    );
};
