import { useMemberList, type IProposalAction } from '@/modules/governance/api/governanceService';
import type { IProposalActionData } from '@/modules/governance/components/createProposalForm';
import type { IMultisigPluginSettings } from '@/plugins/multisigPlugin/types';
import type { IDaoPlugin } from '@/shared/api/daoService';
import { useFormField } from '@/shared/hooks/useFormField';
import type { IProposalActionComponentProps } from '@aragon/gov-ui-kit';
import { useCallback } from 'react';
import { useFormContext } from 'react-hook-form';
import { encodeFunctionData } from 'viem';
import { MultisigSetupGovernance, type IMultisigSetupGovernanceForm } from '../../multisigSetupGovernance';

export interface IMultisigUpdateSettingsActionProps
    extends IProposalActionComponentProps<IProposalActionData<IProposalAction, IDaoPlugin<IMultisigPluginSettings>>> {}

const updateMultisigSettingsAbi = {
    type: 'function',
    inputs: [
        {
            name: '_multisigSettings',
            internalType: 'struct Multisig.MultisigSettings',
            type: 'tuple',
            components: [
                { name: 'onlyListed', internalType: 'bool', type: 'bool' },
                { name: 'minApprovals', internalType: 'uint16', type: 'uint16' },
            ],
        },
    ],
    name: 'updateMultisigSettings',
    outputs: [],
    stateMutability: 'nonpayable',
};

export const MultisigUpdateSettingsAction: React.FC<IMultisigUpdateSettingsActionProps> = (props) => {
    const { index, action } = props;

    const { setValue } = useFormContext();

    const actionFieldName = `actions.[${index.toString()}]`;
    useFormField<Record<string, IProposalActionData>, typeof actionFieldName>(actionFieldName);

    const memberParams = { pluginAddress: action.to, daoId: action.daoId };
    const { data: memberList } = useMemberList({ queryParams: memberParams });
    const membersCount = memberList?.pages[0].metadata.totalRecords ?? 1;

    const handleDataChange = useCallback(
        ({ minApprovals, onlyListed }: IMultisigSetupGovernanceForm) => {
            const updateSettingsParams = { onlyListed, minApprovals };
            const newData = encodeFunctionData({ abi: [updateMultisigSettingsAbi], args: [updateSettingsParams] });

            setValue(`${actionFieldName}.data`, newData);
            setValue(`${actionFieldName}.inputData.parameters[0].value`, [onlyListed, minApprovals]);
        },
        [setValue, actionFieldName],
    );

    return (
        <MultisigSetupGovernance
            fieldPrefix={`${actionFieldName}.proposedSettings`}
            membersCount={membersCount}
            onDataChange={handleDataChange}
            showProposalCreationSettings={true}
        />
    );
};
