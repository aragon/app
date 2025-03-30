import { type IProposalAction } from '@/modules/governance/api/governanceService';
import type { IProposalActionData } from '@/modules/governance/components/createProposalForm';
import { type IMultisigPluginSettings } from '@/plugins/multisigPlugin/types';
import { type IDaoPlugin } from '@/shared/api/daoService';
import { useFormField } from '@/shared/hooks/useFormField';
import { addressUtils, type IProposalActionComponentProps } from '@aragon/gov-ui-kit';
import { useEffect, useMemo } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';
import { encodeFunctionData } from 'viem';
import type { IMultisigSetupMembershipForm } from '../../multisigSetupMembership';
import { MultisigSetupMembership } from '../../multisigSetupMembership';

export interface IMultisigAddMembersActionProps
    extends IProposalActionComponentProps<IProposalActionData<IProposalAction, IDaoPlugin<IMultisigPluginSettings>>> {}

const addMembersAbi = {
    type: 'function',
    inputs: [{ name: '_members', internalType: 'address[]', type: 'address[]' }],
    name: 'addAddresses',
    outputs: [],
    stateMutability: 'nonpayable',
};

export const MultisigAddMembersAction: React.FC<IMultisigAddMembersActionProps> = (props) => {
    const { index, action } = props;

    const { setValue } = useFormContext();

    const actionFieldName = `actions.[${index.toString()}]`;
    useFormField<Record<string, IProposalActionData>, typeof actionFieldName>(actionFieldName);

    const membersFieldName: `${string}.members` = `${actionFieldName}.members`;

    const watchMembersField = useWatch<Record<string, IMultisigSetupMembershipForm['members']>>({
        name: membersFieldName,
    });
    const controlledMembersField = useMemo(
        () => watchMembersField.map((field, index) => ({ ...field, ...watchMembersField[index] })),
        [watchMembersField],
    );

    useEffect(() => {
        if (controlledMembersField.some((field) => !addressUtils.isAddress(field.address))) {
            return;
        }

        const addresses = controlledMembersField.map((field) => field.address);
        const newData = encodeFunctionData({ abi: [addMembersAbi], args: [addresses] });
        setValue(`${actionFieldName}.data`, newData);
        setValue(`${actionFieldName}.inputData.parameters[0].value`, addresses);
    }, [actionFieldName, controlledMembersField, setValue]);

    return <MultisigSetupMembership formPrefix={actionFieldName} pluginAddress={action.to} hideLabel={true} />;
};
