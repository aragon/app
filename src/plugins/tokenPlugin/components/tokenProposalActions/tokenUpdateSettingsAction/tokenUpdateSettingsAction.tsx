import { type IProposalAction } from '@/modules/governance/api/governanceService';
import type { IProposalActionData } from '@/modules/governance/components/createProposalForm';
import { DaoTokenVotingMode, type ITokenPluginSettings } from '@/plugins/tokenPlugin/types';
import { tokenSettingsUtils } from '@/plugins/tokenPlugin/utils/tokenSettingsUtils';
import type { IDaoPlugin } from '@/shared/api/daoService';
import { AdvancedDateInputDuration } from '@/shared/components/forms/advancedDateInput/advancedDateInputDuration';
import { useTranslations } from '@/shared/components/translationsProvider';
import { useFormField } from '@/shared/hooks/useFormField';
import { AlertCard, Card, InputContainer, Switch, type IProposalActionComponentProps } from '@aragon/gov-ui-kit';
import { Duration } from 'luxon';
import { useEffect } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';
import { encodeFunctionData, parseUnits } from 'viem';
import { MinParticipationField } from './fields/minParticipationField';
import { SupportThresholdField } from './fields/supportThresholdField';
import { ProposalCreationEligibilityField } from './fields/proposalCreationEligibilityField';

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

    const supportThresholdFieldName = `${actionFieldName}.proposedSettings.supportThreshold`;
    const supportThreshold = useWatch<Record<string, ITokenPluginSettings['supportThreshold'] | undefined>>({
        name: supportThresholdFieldName,
    });

    const minParticipationFieldName = `${actionFieldName}.proposedSettings.minParticipation`;
    const minParticipation = useWatch<Record<string, ITokenPluginSettings['minParticipation'] | undefined>>({
        name: minParticipationFieldName,
    });

    const minDurationField = useFormField<ITokenPluginSettings, 'minDuration'>('minDuration', {
        fieldPrefix: `${actionFieldName}.proposedSettings`,
        label: t('app.plugins.token.tokenUpdateSettingsAction.minDuration.label'),
    });

    const minDurationInSeconds =
        typeof minDurationField.value === 'object'
            ? Duration.fromObject(minDurationField.value).as('seconds')
            : (minDurationField.value ?? 3600);

    const minDurationAlert = {
        message: t('app.plugins.token.tokenUpdateSettingsAction.minDuration.alert.message'),
        description: t('app.plugins.token.tokenUpdateSettingsAction.minDuration.alert.description'),
        variant: 'info',
    } as const;

    const votingModeField = useFormField<ITokenPluginSettings, 'votingMode'>('votingMode', {
        fieldPrefix: `${actionFieldName}.proposedSettings`,
    });

    const {
        value: minVotingPowerValue,
        onChange: onMinVotingPowerChange,
        ...minVotingPowerField
    } = useFormField<ITokenPluginSettings, 'minProposerVotingPower'>('minProposerVotingPower', {
        fieldPrefix: `${actionFieldName}.proposedSettings`,
        label: t('app.plugins.token.tokenUpdateSettingsAction.minVotingPower.label'),
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
                {...minDurationField}
            >
                <Card className="flex flex-col gap-6 border border-neutral-100 p-6 shadow-neutral-sm">
                    <AdvancedDateInputDuration
                        field={`${actionFieldName}.proposedSettings.minDuration`}
                        label={t('app.plugins.token.tokenUpdateSettingsAction.minDuration.label')}
                        className="p-0"
                        minDuration={{ days: 0, hours: 1, minutes: 0 }}
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
            <ProposalCreationEligibilityField
                tokenSymbol={tokenSymbol}
                minVotingPowerField={{
                    value: minVotingPowerValue,
                    onChange: onMinVotingPowerChange,
                    ...minVotingPowerField,
                }}
            />
        </div>
    );
};
