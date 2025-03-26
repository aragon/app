import { AdvancedDateInputDuration } from '@/shared/components/forms/advancedDateInput/advancedDateInputDuration';
import { useTranslations } from '@/shared/components/translationsProvider';
import { useFormField } from '@/shared/hooks/useFormField';
import { AlertCard, Card, InputContainer, Switch } from '@aragon/gov-ui-kit';
import { DaoTokenVotingMode } from '../../types';
import { MinParticipationField } from './fields/minParticipationField';
import { ProposalCreationEligibilityField } from './fields/proposalCreationEligibilityField';
import { SupportThresholdField } from './fields/supportThresholdField';
import type { ITokenSetupGovernanceForm, ITokenSetupGovernanceProps } from './tokenSetupGovernance.api';

export const TokenSetupGovernance: React.FC<ITokenSetupGovernanceProps> = (props) => {
    const { formPrefix, token, initialValues, isSubPlugin, showProposalCreationSettings } = props;

    const { t } = useTranslations();

    const votingModeField = useFormField<ITokenSetupGovernanceForm, 'votingMode'>('votingMode', {
        fieldPrefix: formPrefix,
    });

    const handleModeChange = (checked: boolean) =>
        votingModeField.onChange(checked ? DaoTokenVotingMode.EARLY_EXECUTION : DaoTokenVotingMode.STANDARD);

    const handleVoteChange = (checked: boolean) => {
        if (votingModeField.value === DaoTokenVotingMode.EARLY_EXECUTION) {
            return;
        }

        votingModeField.onChange(checked ? DaoTokenVotingMode.VOTE_REPLACEMENT : DaoTokenVotingMode.STANDARD);
    };

    return (
        <div className="flex w-full flex-col gap-y-6">
            <SupportThresholdField formPrefix={formPrefix} initialValue={initialValues?.supportThreshold} />
            <MinParticipationField formPrefix={formPrefix} token={token} />
            {!isSubPlugin && (
                <InputContainer
                    className="flex flex-col gap-6"
                    id="minDuration"
                    useCustomWrapper={true}
                    helpText={t('app.plugins.token.tokenSetupGovernance.minDuration.helpText')}
                    label={t('app.plugins.token.tokenSetupGovernance.minDuration.label')}
                >
                    <Card className="flex flex-col gap-6 border border-neutral-100 p-6 shadow-neutral-sm">
                        <AdvancedDateInputDuration
                            field={`${formPrefix}.minDuration`}
                            label={t('app.plugins.token.tokenSetupGovernance.minDuration.label')}
                            className="!p-0"
                            minDuration={{ days: 0, hours: 1, minutes: 0 }}
                            validateMinDuration={true}
                        />
                        <AlertCard
                            message={t('app.plugins.token.tokenSetupGovernance.minDuration.alert.message')}
                            description={t('app.plugins.token.tokenSetupGovernance.minDuration.alert.description')}
                            variant="info"
                        />
                    </Card>
                </InputContainer>
            )}
            {!isSubPlugin && (
                <Switch
                    label={t('app.plugins.token.tokenSetupGovernance.earlyExecution.label')}
                    helpText={t('app.plugins.token.tokenSetupGovernance.earlyExecution.helpText')}
                    inlineLabel={t('app.plugins.token.tokenSetupGovernance.earlyExecution.switch.label')}
                    onCheckedChanged={handleModeChange}
                    checked={votingModeField.value === DaoTokenVotingMode.EARLY_EXECUTION}
                    disabled={votingModeField.value === DaoTokenVotingMode.VOTE_REPLACEMENT}
                />
            )}
            <Switch
                helpText={t('app.plugins.token.tokenSetupGovernance.voteChange.helpText')}
                inlineLabel={t('app.plugins.token.tokenSetupGovernance.voteChange.switch.label')}
                label={t('app.plugins.token.tokenSetupGovernance.voteChange.label')}
                onCheckedChanged={handleVoteChange}
                checked={votingModeField.value === DaoTokenVotingMode.VOTE_REPLACEMENT}
                disabled={votingModeField.value === DaoTokenVotingMode.EARLY_EXECUTION}
            />
            {showProposalCreationSettings && <ProposalCreationEligibilityField formPrefix={formPrefix} token={token} />}
        </div>
    );
};
