import {
    addressUtils,
    type IProposalActionComponentProps,
    invariant,
} from '@aragon/gov-ui-kit';
import { useEffect, useMemo } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';
import { encodeFunctionData } from 'viem';
import type { IProposalAction } from '@/modules/governance/api/governanceService';
import type { IProposalActionData } from '@/modules/governance/components/createProposalForm';
import type { IMultisigRemoveMembersActionDialogParams } from '@/plugins/multisigPlugin/dialogs/multisigRemoveMembersActionDialog';
import type { IMultisigPluginSettings } from '@/plugins/multisigPlugin/types';
import type { IDaoPlugin } from '@/shared/api/daoService';
import { useDialogContext } from '@/shared/components/dialogProvider';
import { useFormField } from '@/shared/hooks/useFormField';
import { MultisigPluginDialogId } from '../../../constants/multisigPluginDialogId';
import type { IMultisigSetupMembershipForm } from '../../multisigSetupMembership';
import { MultisigSetupMembership } from '../../multisigSetupMembership';

export interface IMultisigRemoveMembersActionProps
    extends IProposalActionComponentProps<
        IProposalActionData<
            IProposalAction,
            IDaoPlugin<IMultisigPluginSettings>
        >
    > {}

const removeMembersAbi = {
    type: 'function',
    inputs: [
        { name: '_members', internalType: 'address[]', type: 'address[]' },
    ],
    name: 'removeAddresses',
    outputs: [],
    stateMutability: 'nonpayable',
};

export const MultisigRemoveMembersAction: React.FC<
    IMultisigRemoveMembersActionProps
> = (props) => {
    const { action, index } = props;
    const { daoId } = action;

    // The view resolves its DAO data from the action, so it only supports actions composed in DAO context.
    invariant(
        daoId != null,
        'MultisigRemoveMembersAction: daoId must be set on the action.',
    );

    const { setValue } = useFormContext();
    const { open } = useDialogContext();

    const actionFieldName = `actions.[${index.toString()}]`;
    useFormField<Record<string, IProposalActionData>, typeof actionFieldName>(
        actionFieldName,
    );

    const membersFieldName: `${string}.members` = `${actionFieldName}.members`;

    const watchFieldArray = useWatch<
        Record<string, IMultisigSetupMembershipForm['members']>
    >({
        name: membersFieldName,
        defaultValue: [],
    });
    const controlledMembersField = useMemo(
        () =>
            watchFieldArray.map((field, index) => ({
                ...field,
                ...watchFieldArray[index],
            })),
        [watchFieldArray],
    );

    const handleMemberClick = (memberAddress: string) => {
        const memberExists = watchFieldArray.some(
            (member) => member.address === memberAddress,
        );

        if (!memberExists) {
            setValue(membersFieldName, [
                ...watchFieldArray,
                { address: memberAddress },
            ]);
        }
    };

    const handleAddClick = () => {
        const params: IMultisigRemoveMembersActionDialogParams = {
            daoId,
            pluginAddress: action.to,
            onMemberClick: handleMemberClick,
        };
        open(MultisigPluginDialogId.REMOVE_MEMBERS, { params, stack: true });
    };

    useEffect(() => {
        if (
            controlledMembersField.some(
                (field) => !addressUtils.isAddress(field.address),
            )
        ) {
            return;
        }

        const addresses = controlledMembersField.map((field) => field.address);
        const newData = encodeFunctionData({
            abi: [removeMembersAbi],
            args: [addresses],
        });
        setValue(`${actionFieldName}.data`, newData);
        setValue(`${actionFieldName}.inputData.parameters[0].value`, addresses);
    }, [actionFieldName, controlledMembersField, setValue]);

    return (
        <MultisigSetupMembership
            daoId={action.daoId}
            disabled={true}
            formPrefix={actionFieldName}
            hideLabel={true}
            onAddClick={handleAddClick}
            showResetAllAction={false}
        />
    );
};
