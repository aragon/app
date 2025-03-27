import { type IProposalAction } from '@/modules/governance/api/governanceService';
import type { IProposalActionData } from '@/modules/governance/components/createProposalForm';
import { type IMultisigPluginSettings } from '@/plugins/multisigPlugin/types';
import { type IDaoPlugin } from '@/shared/api/daoService';
import { useFormField } from '@/shared/hooks/useFormField';
import { addressUtils, type IProposalActionComponentProps } from '@aragon/gov-ui-kit';
import { useEffect, useMemo, useState } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';
import { encodeFunctionData } from 'viem';
import type { IMultisigSetupMembershipForm } from '../../multisigSetupMembership';
import { MultisigSetupMembership } from '../../multisigSetupMembership';
import { MultisigRemoveMembersActionDialog } from './multisigRemoveMembersActionDialog';

export interface IMultisigRemoveMembersActionProps
    extends IProposalActionComponentProps<IProposalActionData<IProposalAction, IDaoPlugin<IMultisigPluginSettings>>> {}

const removeMembersAbi = {
    type: 'function',
    inputs: [{ name: '_members', internalType: 'address[]', type: 'address[]' }],
    name: 'removeAddresses',
    outputs: [],
    stateMutability: 'nonpayable',
};

export const MultisigRemoveMembersAction: React.FC<IMultisigRemoveMembersActionProps> = (props) => {
    const { action, index } = props;

    const { setValue } = useFormContext();

    const [isDialogOpen, setIsDialogOpen] = useState(false);

    const actionFieldName = `actions.[${index.toString()}]`;
    useFormField<Record<string, IProposalActionData>, typeof actionFieldName>(actionFieldName);

    const membersFieldName: `${string}.members` = `${actionFieldName}.members`;

    const watchFieldArray = useWatch<Record<string, IMultisigSetupMembershipForm['members']>>({
        name: membersFieldName,
    });
    const controlledMembersField = useMemo(
        () => watchFieldArray.map((field, index) => ({ ...field, ...watchFieldArray[index] })),
        [watchFieldArray],
    );

    const handleMemberClick = (memberAddress: string) => {
        const memberExists = watchFieldArray.some((member) => member.address === memberAddress);

        if (!memberExists) {
            setValue(membersFieldName, [...watchFieldArray, { address: memberAddress }]);
        }
    };

    useEffect(() => {
        if (controlledMembersField.some((field) => !addressUtils.isAddress(field.address))) {
            return;
        }

        const addresses = controlledMembersField.map((field) => field.address);
        const newData = encodeFunctionData({ abi: [removeMembersAbi], args: [addresses] });
        setValue(`${actionFieldName}.data`, newData);
        setValue(`${actionFieldName}.inputData.parameters[0].value`, addresses);
    }, [actionFieldName, controlledMembersField, setValue]);

    return (
        <>
            <MultisigSetupMembership
                formPrefix={actionFieldName}
                disabled={true}
                onAddClick={() => setIsDialogOpen(true)}
            />
            <MultisigRemoveMembersActionDialog
                open={isDialogOpen}
                onOpenChange={setIsDialogOpen}
                daoId={action.daoId}
                pluginAddress={action.to}
                onMemberClick={handleMemberClick}
            />
        </>
    );
};
