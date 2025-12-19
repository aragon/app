'use client';

import { Card, InputContainer, Switch } from '@aragon/gov-ui-kit';
import { AdvancedDateInputDuration } from '@/shared/components/forms/advancedDateInput/advancedDateInputDuration';
import { useTranslations } from '@/shared/components/translationsProvider';
import { useFormField } from '@/shared/hooks/useFormField';
import { DaoTokenVotingMode } from '../../types';
import { MinParticipationField } from './fields/minParticipationField';
import { ProposalCreationEligibilityField } from './fields/proposalCreationEligibilityField';
import { SupportThresholdField } from './fields/supportThresholdField';
import type {
    ITokenSetupGovernanceForm,
    ITokenSetupGovernanceProps,
} from './tokenSetupGovernance.api';

const voteDurationMin = { days: 0, hours: 1, minutes: 0 };
const voteDurationDefault = { days: 1, hours: 0, minutes: 0 };

export const TokenSetupGovernance: React.FC<ITokenSetupGovernanceProps> = (
    props,
) => {
    const {
        formPrefix,
        membershipSettings,
        isSubPlugin,
        showProposalCreationSettings,
    } = props;

    const { t } = useTranslations();

    const votingModeField = useFormField<
        ITokenSetupGovernanceForm,
        'votingMode'
    >('votingMode', {
        fieldPrefix: formPrefix,
        defaultValue: DaoTokenVotingMode.STANDARD,
    });

    const handleEarlyExecutionToggle = (checked: boolean) =>
        votingModeField.onChange(
            checked
                ? DaoTokenVotingMode.EARLY_EXECUTION
                : DaoTokenVotingMode.STANDARD,
        );

    const handleVoteChangeToggle = (checked: boolean) =>
        votingModeField.onChange(
            checked
                ? DaoTokenVotingMode.VOTE_REPLACEMENT
                : DaoTokenVotingMode.STANDARD,
        );

    return (
        <div className="flex w-full flex-col gap-y-6">
            <SupportThresholdField formPrefix={formPrefix} />
            <MinParticipationField
                formPrefix={formPrefix}
                token={membershipSettings.token}
            />
            {!isSubPlugin && (
                <InputContainer
                    className="flex flex-col gap-6"
                    helpText={t(
                        'app.plugins.token.tokenSetupGovernance.minDuration.helpText',
                    )}
                    id="minDuration"
                    label={t(
                        'app.plugins.token.tokenSetupGovernance.minDuration.label',
                    )}
                    useCustomWrapper={true}
                >
                    <Card className="flex flex-col gap-6 border border-neutral-100 p-6 shadow-neutral-sm">
                        <AdvancedDateInputDuration
                            className="!p-0"
                            defaultValue={voteDurationDefault}
                            field={`${formPrefix}.minDuration`}
                            infoText={t(
                                'app.plugins.token.tokenSetupGovernance.minDuration.alertInfo',
                            )}
                            label={t(
                                'app.plugins.token.tokenSetupGovernance.minDuration.label',
                            )}
                            minDuration={voteDurationMin}
                            useSecondsFormat={true}
                            validateMinDuration={true}
                        />
                    </Card>
                </InputContainer>
            )}
            {!isSubPlugin && (
                <Switch
                    checked={
                        votingModeField.value ===
                        DaoTokenVotingMode.EARLY_EXECUTION
                    }
                    disabled={
                        votingModeField.value ===
                        DaoTokenVotingMode.VOTE_REPLACEMENT
                    }
                    helpText={t(
                        'app.plugins.token.tokenSetupGovernance.earlyExecution.helpText',
                    )}
                    inlineLabel={t(
                        'app.plugins.token.tokenSetupGovernance.earlyExecution.switch.label',
                    )}
                    label={t(
                        'app.plugins.token.tokenSetupGovernance.earlyExecution.label',
                    )}
                    onCheckedChanged={handleEarlyExecutionToggle}
                />
            )}
            <Switch
                checked={
                    votingModeField.value ===
                    DaoTokenVotingMode.VOTE_REPLACEMENT
                }
                disabled={
                    votingModeField.value === DaoTokenVotingMode.EARLY_EXECUTION
                }
                helpText={t(
                    'app.plugins.token.tokenSetupGovernance.voteChange.helpText',
                )}
                inlineLabel={t(
                    'app.plugins.token.tokenSetupGovernance.voteChange.switch.label',
                )}
                label={t(
                    'app.plugins.token.tokenSetupGovernance.voteChange.label',
                )}
                onCheckedChanged={handleVoteChangeToggle}
            />
            {showProposalCreationSettings && (
                <ProposalCreationEligibilityField
                    formPrefix={formPrefix}
                    token={membershipSettings.token}
                />
            )}
        </div>
    );
};
