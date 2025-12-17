'use client';

import { Card, InputContainer, Switch } from '@aragon/gov-ui-kit';
import { MinParticipationField } from '@/plugins/tokenPlugin/components/tokenSetupGovernance/fields/minParticipationField';
import { ProposalCreationEligibilityField } from '@/plugins/tokenPlugin/components/tokenSetupGovernance/fields/proposalCreationEligibilityField';
import { SupportThresholdField } from '@/plugins/tokenPlugin/components/tokenSetupGovernance/fields/supportThresholdField';
import { AdvancedDateInputDuration } from '@/shared/components/forms/advancedDateInput/advancedDateInputDuration';
import { useTranslations } from '@/shared/components/translationsProvider';
import { useFormField } from '@/shared/hooks/useFormField';
import { DaoLockToVoteVotingMode } from '../../types';
import type { ILockToVoteSetupGovernanceForm, ILockToVoteSetupGovernanceProps } from './lockToVoteSetupGovernance.api';

const voteDurationMin = { days: 0, hours: 1, minutes: 0 };
const voteDurationDefault = { days: 1, hours: 0, minutes: 0 };

export const LockToVoteSetupGovernance: React.FC<ILockToVoteSetupGovernanceProps> = (props) => {
    const { formPrefix, membershipSettings, isSubPlugin, showProposalCreationSettings } = props;

    const { t } = useTranslations();

    const votingModeField = useFormField<ILockToVoteSetupGovernanceForm, 'votingMode'>('votingMode', {
        fieldPrefix: formPrefix,
        defaultValue: DaoLockToVoteVotingMode.STANDARD,
    });

    const handleVoteChangeToggle = (checked: boolean) =>
        votingModeField.onChange(checked ? DaoLockToVoteVotingMode.VOTE_REPLACEMENT : DaoLockToVoteVotingMode.STANDARD);

    return (
        <div className="flex w-full flex-col gap-y-6">
            <SupportThresholdField formPrefix={formPrefix} />
            <MinParticipationField formPrefix={formPrefix} token={membershipSettings.token} />
            {!isSubPlugin && (
                <InputContainer
                    className="flex flex-col gap-6"
                    helpText={t('app.plugins.lockToVote.lockToVoteSetupGovernance.proposalDuration.helpText')}
                    id="proposalDuration"
                    label={t('app.plugins.lockToVote.lockToVoteSetupGovernance.proposalDuration.label')}
                    useCustomWrapper={true}
                >
                    <Card className="flex flex-col gap-6 border border-neutral-100 p-6 shadow-neutral-sm">
                        <AdvancedDateInputDuration
                            className="!p-0"
                            defaultValue={voteDurationDefault}
                            field={`${formPrefix}.minDuration`}
                            infoText={t('app.plugins.lockToVote.lockToVoteSetupGovernance.proposalDuration.alertInfo')}
                            label={t('app.plugins.lockToVote.lockToVoteSetupGovernance.proposalDuration.label')}
                            minDuration={voteDurationMin}
                            useSecondsFormat={true}
                            validateMinDuration={true}
                        />
                    </Card>
                </InputContainer>
            )}
            <Switch
                checked={votingModeField.value === DaoLockToVoteVotingMode.VOTE_REPLACEMENT}
                helpText={t('app.plugins.lockToVote.lockToVoteSetupGovernance.voteChange.helpText')}
                inlineLabel={t('app.plugins.lockToVote.lockToVoteSetupGovernance.voteChange.switch.label')}
                label={t('app.plugins.lockToVote.lockToVoteSetupGovernance.voteChange.label')}
                onCheckedChanged={handleVoteChangeToggle}
            />
            {showProposalCreationSettings && <ProposalCreationEligibilityField formPrefix={formPrefix} token={membershipSettings.token} />}
        </div>
    );
};
