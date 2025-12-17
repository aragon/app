import type { IProposalActionComponentProps } from '@aragon/gov-ui-kit';
import { useEffect } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';
import { encodeFunctionData, parseUnits } from 'viem';
import type { IProposalAction } from '@/modules/governance/api/governanceService';
import type { IProposalActionData } from '@/modules/governance/components/createProposalForm';
import type { ITokenSetupGovernanceForm } from '@/plugins/tokenPlugin/components/tokenSetupGovernance';
import { tokenSettingsUtils } from '@/plugins/tokenPlugin/utils/tokenSettingsUtils';
import type { IDaoPlugin } from '@/shared/api/daoService';
import { useFormField } from '@/shared/hooks/useFormField';
import type { ILockToVotePluginSettings } from '../../../types';
import { LockToVoteSetupGovernance } from '../../lockToVoteSetupGovernance';

export interface ILockToVoteUpdateSettingsActionProps
    extends IProposalActionComponentProps<IProposalActionData<IProposalAction, IDaoPlugin<ILockToVotePluginSettings>>> {}

const updateLockToVoteSettingsAbi = {
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
                {
                    name: 'supportThresholdRatio',
                    internalType: 'uint32',
                    type: 'uint32',
                },
                {
                    name: 'minParticipationRatio',
                    internalType: 'uint32',
                    type: 'uint32',
                },
                {
                    name: 'minApprovalRatio',
                    internalType: 'uint32',
                    type: 'uint32',
                },
                {
                    name: 'proposalDuration',
                    internalType: 'uint64',
                    type: 'uint64',
                },
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
} as const;

export const LockToVoteUpdateSettingsAction: React.FC<ILockToVoteUpdateSettingsActionProps> = (props) => {
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

    const proposalDuration = useWatch<Record<string, ITokenSetupGovernanceForm['minDuration']>>({
        name: `${formPrefix}.minDuration`,
        defaultValue: 3600,
    });

    const votingMode = useWatch<Record<string, ITokenSetupGovernanceForm['votingMode']>>({
        name: `${formPrefix}.votingMode`,
        defaultValue: 0,
    });

    useEffect(() => {
        const updateSettingsParams = {
            votingMode,
            supportThresholdRatio: tokenSettingsUtils.percentageToRatio(supportThreshold),
            minParticipationRatio: tokenSettingsUtils.percentageToRatio(minParticipation),
            minApprovalRatio: 0,
            proposalDuration: BigInt(proposalDuration),
            minProposerVotingPower: parseUnits(minVotingPowerValue, decimals),
        };

        const newData = encodeFunctionData({
            abi: [updateLockToVoteSettingsAbi],
            args: [updateSettingsParams],
        });
        const paramValues = Object.values(updateSettingsParams).map((value) => value.toString());

        setValue(`${actionFieldName}.data`, newData);
        setValue(`${actionFieldName}.inputData.parameters[0].value`, paramValues);
    }, [actionFieldName, minParticipation, minVotingPowerValue, setValue, supportThreshold, votingMode, decimals, proposalDuration]);

    const membershipSettings = { token: action.meta.settings.token };

    return (
        <LockToVoteSetupGovernance
            formPrefix={`${actionFieldName}.proposedSettings`}
            isSubPlugin={action.meta.isSubPlugin}
            membershipSettings={membershipSettings}
            showProposalCreationSettings={!action.meta.isSubPlugin}
        />
    );
};
