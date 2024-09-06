import { CreateDaoForm } from '@/modules/createDao/components/createDaoForm';
import { useFormField } from '@/shared/hooks/useFormField';
import type { IProposalActionComponentProps } from '@aragon/ods';
import { useWatch } from 'react-hook-form';
import type { IProposalActionIndexed } from '../../../createProposalFormDefinitions';

export interface IUpdateDaoMetadaActionProps extends IProposalActionComponentProps<IProposalActionIndexed> {}

export const UpdateDaoMetadataAction: React.FC<IUpdateDaoMetadaActionProps> = (props) => {
    const metadataActionField = useFormField(`actions.[${props.action.index}]`);
    const metadataAction = useWatch({ name: `actions.[${props.action.index}]` });

    console.log({ metadataAction, metadataActionField });

    return <CreateDaoForm.Metadata fieldPrefix={`actions.[${props.action.index}].metadata`} />;
};
