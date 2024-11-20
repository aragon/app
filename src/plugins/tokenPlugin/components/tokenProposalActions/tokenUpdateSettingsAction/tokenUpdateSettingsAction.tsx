import { type IProposalAction } from '@/modules/governance/api/governanceService';
import type { IProposalActionData } from '@/modules/governance/components/createProposalForm';
import { DaoTokenVotingMode, type ITokenPluginSettings } from '@/plugins/tokenPlugin/types';
import { tokenSettingsUtils } from '@/plugins/tokenPlugin/utils/tokenSettingsUtils';
import type { IDaoPlugin } from '@/shared/api/daoService';
import { AdvancedDateInputDuration } from '@/shared/components/forms/advancedDateInput/advancedDateInputDuration';
import { useTranslations } from '@/shared/components/translationsProvider';
import { useFormField } from '@/shared/hooks/useFormField';
import { dateUtils } from '@/shared/utils/dateUtils';
import { AlertCard, Card, InputContainer, Switch, type IProposalActionComponentProps } from '@aragon/gov-ui-kit';
import { Duration } from 'luxon';
import { useEffect } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';
import { encodeFunctionData, parseUnits } from 'viem';
import { MinParticipationField } from './fields/minParticipationField';
import { ProposalCreationEligibilityField } from './fields/proposalCreationEligibilityField';
import { SupportThresholdField } from './fields/supportThresholdField';

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

    const { symbol: tokenSymbol, decimals: tokenDecimals } = action.meta.settings.token;

    const { t } = useTranslations();

    const { setValue } = useFormContext();

    const actionFieldName = `actions.[${index}]`;
    useFormField<Record<string, IProposalActionData>, typeof actionFieldName>(actionFieldName);

    /* Set default values to supportThreshold, minParticipation and minVotingPower values
    as the values are reset when deleting an item from the useArrayField causing the useWatch/useFormField
    to return undefined before unmounting the component */
    const supportThresholdFieldName = `${actionFieldName}.proposedSettings.supportThreshold`;
    const supportThreshold = useWatch<Record<string, ITokenPluginSettings['supportThreshold']>>({
        name: supportThresholdFieldName,
        defaultValue: 0,
    });

    const minParticipationFieldName = `${actionFieldName}.proposedSettings.minParticipation`;
    const minParticipation = useWatch<Record<string, ITokenPluginSettings['minParticipation']>>({
        name: minParticipationFieldName,
        defaultValue: 0,
    });

    const minVotingPowerFieldName = `${actionFieldName}.proposedSettings.minProposerVotingPower`;
    const minVotingPowerValue = useWatch<Record<string, ITokenPluginSettings['minProposerVotingPower']>>({
        name: minVotingPowerFieldName,
        defaultValue: '0',
    });

    const minDurationFieldName = `${actionFieldName}.proposedSettings.minDuration`;
    const minDuration = useWatch<Record<string, ITokenPluginSettings['minDuration']>>({
        name: minDurationFieldName,
        defaultValue: 3600,
    });

    /* For the transaction we need the value in seconds, but for the UI it is nicer to use the days/hours/mins object
    When the user does not change the minDuration it will already be in seconds. However once this value is changed
    it will be an object. Therefore we need to check if the value is an object and convert it to seconds if needed */
    const minDurationInSeconds =
        typeof minDuration === 'object' ? Duration.fromObject(minDuration).as('seconds') : (minDuration ?? 3600);

    const minDurationAlert = {
        message: t('app.plugins.token.tokenUpdateSettingsAction.minDuration.alert.message'),
        description: t('app.plugins.token.tokenUpdateSettingsAction.minDuration.alert.description'),
        variant: 'info',
    } as const;

    const votingModeField = useFormField<ITokenPluginSettings, 'votingMode'>('votingMode', {
        fieldPrefix: `${actionFieldName}.proposedSettings`,
    });

    const handleModeChange = (checked: boolean) =>
        votingModeField.onChange(checked ? DaoTokenVotingMode.EARLY_EXECUTION : DaoTokenVotingMode.STANDARD);

    const handleVoteChange = (checked: boolean) => {
        if (votingModeField.value === DaoTokenVotingMode.EARLY_EXECUTION) {
            return;
        }

        votingModeField.onChange(checked ? DaoTokenVotingMode.VOTE_REPLACEMENT : DaoTokenVotingMode.STANDARD);
    };

    useEffect(() => {
        const updateSettingsParams = {
            votingMode: votingModeField.value,
            supportThreshold: tokenSettingsUtils.fromPercentageToRatio(supportThreshold ?? 0),
            minParticipation: tokenSettingsUtils.fromPercentageToRatio(minParticipation ?? 0),
            minDuration: minDurationInSeconds,
            minProposerVotingPower: parseUnits(minVotingPowerValue, tokenDecimals),
        };
        const newData = encodeFunctionData({ abi: [updateTokenSettingsAbi], args: [updateSettingsParams] });

        setValue(`${actionFieldName}.data`, newData);
        setValue(
            `${actionFieldName}.inputData.parameters[0].value`,
            `[${votingModeField.value}, ${supportThreshold}, ${minParticipation}, ${minDurationInSeconds}, ${minVotingPowerValue}]`,
        );
        setValue(
            `${actionFieldName}.proposedSettings.minDuration`,
            dateUtils.secondsToDaysHoursMinutes(minDurationInSeconds),
        );
    }, [
        actionFieldName,
        minDurationInSeconds,
        minParticipation,
        minVotingPowerValue,
        setValue,
        supportThreshold,
        votingModeField.value,
        tokenDecimals,
    ]);

    return (
        <div className="flex w-full flex-col gap-y-6">
            <SupportThresholdField
                supportThreshold={supportThreshold}
                supportThresholdFieldName={supportThresholdFieldName}
                currentSupportThreshold={tokenSettingsUtils.fromRatioToPercentage(
                    action.meta.settings.supportThreshold,
                )}
            />
            <MinParticipationField
                minParticipationFieldName={minParticipationFieldName}
                minParticipation={minParticipation}
                plugin={action.meta}
            />
            <InputContainer
                className="flex flex-col gap-6"
                id="minDuration"
                useCustomWrapper={true}
                helpText={t('app.plugins.token.tokenUpdateSettingsAction.minDuration.helpText')}
                label={t('app.plugins.token.tokenUpdateSettingsAction.minDuration.label')}
            >
                <Card className="flex flex-col gap-6 border border-neutral-100 p-6 shadow-neutral-sm">
                    <AdvancedDateInputDuration
                        field={`${actionFieldName}.proposedSettings.minDuration`}
                        label={t('app.plugins.token.tokenUpdateSettingsAction.minDuration.label')}
                        className="!p-0"
                        minDuration={dateUtils.secondsToDaysHoursMinutes(action.meta.settings.minDuration)}
                    />
                    <AlertCard {...minDurationAlert} />
                </Card>
            </InputContainer>
            <Switch
                label={t('app.plugins.token.tokenUpdateSettingsAction.earlyExecution.label')}
                helpText={t('app.plugins.token.tokenUpdateSettingsAction.earlyExecution.helpText')}
                inlineLabel={t('app.plugins.token.tokenUpdateSettingsAction.earlyExecution.switch.label')}
                onCheckedChanged={handleModeChange}
                checked={votingModeField.value === DaoTokenVotingMode.EARLY_EXECUTION}
                disabled={votingModeField.value === DaoTokenVotingMode.VOTE_REPLACEMENT}
            />
            <Switch
                helpText={t('app.plugins.token.tokenUpdateSettingsAction.voteChange.helpText')}
                inlineLabel={t('app.plugins.token.tokenUpdateSettingsAction.voteChange.switch.label')}
                label={t('app.plugins.token.tokenUpdateSettingsAction.voteChange.label')}
                onCheckedChanged={handleVoteChange}
                checked={votingModeField.value === DaoTokenVotingMode.VOTE_REPLACEMENT}
                disabled={votingModeField.value === DaoTokenVotingMode.EARLY_EXECUTION}
            />
            <ProposalCreationEligibilityField tokenSymbol={tokenSymbol} actionFieldName={actionFieldName} />
        </div>
    );
};
