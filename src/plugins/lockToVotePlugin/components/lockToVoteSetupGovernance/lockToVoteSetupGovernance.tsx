'use client';

import { DaoTokenVotingMode } from '@/plugins/tokenPlugin/types';
import { AdvancedDateInputDuration } from '@/shared/components/forms/advancedDateInput/advancedDateInputDuration';
import { useTranslations } from '@/shared/components/translationsProvider';
import { useFormField } from '@/shared/hooks/useFormField';
import { Card, InputContainer, Switch } from '@aragon/gov-ui-kit';

import { MinParticipationField } from '@/plugins/tokenPlugin/components/tokenSetupGovernance/fields/minParticipationField';
import { ProposalCreationEligibilityField } from '@/plugins/tokenPlugin/components/tokenSetupGovernance/fields/proposalCreationEligibilityField';
import { SupportThresholdField } from '@/plugins/tokenPlugin/components/tokenSetupGovernance/fields/supportThresholdField';
import type { ILockToVoteSetupGovernanceForm, ILockToVoteSetupGovernanceProps } from './lockToVoteSetupGovernance.api';

const voteDurationMin = { days: 0, hours: 1, minutes: 0 };
const voteDurationDefault = { days: 1, hours: 0, minutes: 0 };

export const LockToVoteSetupGovernance: React.FC<ILockToVoteSetupGovernanceProps> = (props) => {
    const { formPrefix, membershipSettings, isSubPlugin, showProposalCreationSettings } = props;

    const { t } = useTranslations();

    const votingModeField = useFormField<ILockToVoteSetupGovernanceForm, 'votingMode'>('votingMode', {
        fieldPrefix: formPrefix,
        defaultValue: DaoTokenVotingMode.STANDARD,
    });

    const handleEarlyExecutionToggle = (checked: boolean) =>
        votingModeField.onChange(checked ? DaoTokenVotingMode.EARLY_EXECUTION : DaoTokenVotingMode.STANDARD);

    const handleVoteChangeToggle = (checked: boolean) =>
        votingModeField.onChange(checked ? DaoTokenVotingMode.VOTE_REPLACEMENT : DaoTokenVotingMode.STANDARD);

    return (
        <div className="flex w-full flex-col gap-y-6">
            <SupportThresholdField formPrefix={formPrefix} />
            <MinParticipationField formPrefix={formPrefix} token={membershipSettings.token} />
            {!isSubPlugin && (
                <InputContainer
                    className="flex flex-col gap-6"
                    id="proposalDuration"
                    useCustomWrapper={true}
                    helpText={t('app.plugins.lockToVote.lockToVoteSetupGovernance.proposalDuration.helpText')}
                    label={t('app.plugins.lockToVote.lockToVoteSetupGovernance.proposalDuration.label')}
                >
                    <Card className="shadow-neutral-sm flex flex-col gap-6 border border-neutral-100 p-6">
                        <AdvancedDateInputDuration
                            field={`${formPrefix}.minDuration`}
                            label={t('app.plugins.lockToVote.lockToVoteSetupGovernance.proposalDuration.label')}
                            className="!p-0"
                            minDuration={voteDurationMin}
                            defaultValue={voteDurationDefault}
                            useSecondsFormat={true}
                            validateMinDuration={true}
                            infoText={t('app.plugins.lockToVote.lockToVoteSetupGovernance.proposalDuration.alertInfo')}
                        />
                    </Card>
                </InputContainer>
            )}
            {!isSubPlugin && (
                <Switch
                    label={t('app.plugins.lockToVote.lockToVoteSetupGovernance.earlyExecution.label')}
                    helpText={t('app.plugins.lockToVote.lockToVoteSetupGovernance.earlyExecution.helpText')}
                    inlineLabel={t('app.plugins.lockToVote.lockToVoteSetupGovernance.earlyExecution.switch.label')}
                    onCheckedChanged={handleEarlyExecutionToggle}
                    checked={votingModeField.value === DaoTokenVotingMode.EARLY_EXECUTION}
                    disabled={votingModeField.value === DaoTokenVotingMode.VOTE_REPLACEMENT}
                />
            )}
            <Switch
                helpText={t('app.plugins.lockToVote.lockToVoteSetupGovernance.voteChange.helpText')}
                inlineLabel={t('app.plugins.lockToVote.lockToVoteSetupGovernance.voteChange.switch.label')}
                label={t('app.plugins.lockToVote.lockToVoteSetupGovernance.voteChange.label')}
                onCheckedChanged={handleVoteChangeToggle}
                checked={votingModeField.value === DaoTokenVotingMode.VOTE_REPLACEMENT}
                disabled={votingModeField.value === DaoTokenVotingMode.EARLY_EXECUTION}
            />
            {showProposalCreationSettings && (
                <ProposalCreationEligibilityField formPrefix={formPrefix} token={membershipSettings.token} />
            )}
        </div>
    );
};
