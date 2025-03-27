import { type IProposalAction } from '@/modules/governance/api/governanceService';
import type { IProposalActionData } from '@/modules/governance/components/createProposalForm';
import type { ITokenPluginSettings } from '@/plugins/tokenPlugin/types';
import { tokenSettingsUtils } from '@/plugins/tokenPlugin/utils/tokenSettingsUtils';
import type { IDaoPlugin } from '@/shared/api/daoService';
import { useFormField } from '@/shared/hooks/useFormField';
import { dateUtils } from '@/shared/utils/dateUtils';
import { type IProposalActionComponentProps } from '@aragon/gov-ui-kit';
import { useEffect } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';
import { encodeFunctionData, parseUnits } from 'viem';
import { type ITokenSetupGovernanceForm, TokenSetupGovernance } from '../../tokenSetupGovernance';

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
    const { decimals } = action.meta.settings.token;

    const { setValue } = useFormContext();

    const actionFieldName = `actions.[${index.toString()}]`;
    useFormField<Record<string, IProposalActionData>, typeof actionFieldName>(actionFieldName);

    const formPrefix = `${actionFieldName}.proposedSettings`;

    // Set default values to form values as the values are reset when deleting an item from the useArrayField causing
    // the useWatch to return undefined before unmounting the component
    const supportThreshold = useWatch<Record<string, ITokenSetupGovernanceForm['supportThreshold']>>({
        name: `${formPrefix}.supportThreshold`,
        defaultValue: 0,
    });

    const minParticipation = useWatch<Record<string, ITokenSetupGovernanceForm['minParticipation']>>({
        name: `${formPrefix}.minParticipation`,
        defaultValue: 0,
    });

    const minVotingPowerValue = useWatch<Record<string, ITokenSetupGovernanceForm['minProposerVotingPower']>>({
        name: `${formPrefix}.minProposerVotingPower`,
        defaultValue: '0',
    });

    const minDuration = useWatch<Record<string, ITokenSetupGovernanceForm['minDuration']>>({
        name: `${formPrefix}.minDuration`,
        defaultValue: 3600,
    });

    const votingMode = useWatch<Record<string, ITokenSetupGovernanceForm['votingMode']>>({
        name: `${formPrefix}.votingMode`,
    });

    /* For the transaction we need the value in seconds, but for the UI it is nicer to use the days/hours/mins object
    When the user does not change the minDuration it will already be in seconds. However once this value is changed
    it will be an object. Therefore we need to check if the value is an object and convert it to seconds if needed */
    const minDurationInSeconds =
        typeof minDuration === 'object' ? dateUtils.durationToSeconds(minDuration) : minDuration;

    useEffect(() => {
        const updateSettingsParams = {
            votingMode,
            supportThreshold: tokenSettingsUtils.percentageToRatio(supportThreshold),
            minParticipation: tokenSettingsUtils.percentageToRatio(minParticipation),
            minDuration: minDurationInSeconds,
            minProposerVotingPower: parseUnits(minVotingPowerValue, decimals),
        };

        const newData = encodeFunctionData({ abi: [updateTokenSettingsAbi], args: [updateSettingsParams] });
        const paramValues = Object.values(updateSettingsParams).map((value) => value.toString());
        const minDuration = dateUtils.secondsToDuration(minDurationInSeconds);

        setValue(`${actionFieldName}.data`, newData);
        setValue(`${actionFieldName}.inputData.parameters[0].value`, paramValues);
        setValue(`${actionFieldName}.proposedSettings.minDuration`, minDuration);
    }, [
        actionFieldName,
        minDurationInSeconds,
        minParticipation,
        minVotingPowerValue,
        setValue,
        supportThreshold,
        votingMode,
        decimals,
    ]);

    return (
        <TokenSetupGovernance
            formPrefix={`${actionFieldName}.proposedSettings`}
            token={action.meta.settings.token}
            isSubPlugin={action.meta.isSubPlugin}
            showProposalCreationSettings={!action.meta.isSubPlugin}
        />
    );
};
