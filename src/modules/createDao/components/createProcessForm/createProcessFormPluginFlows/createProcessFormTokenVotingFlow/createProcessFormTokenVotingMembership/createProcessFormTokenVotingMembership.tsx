import { TokenSetupMembership } from '@/plugins/tokenPlugin/components/tokenSetupMembership';
import type { ICreateProcessFormBodyDialogStepsProps } from '../../../createProcessFormStages/fields/stageBodiesField/stageBodiesFieldDefinitions';

export interface ICreateProcessFormTokenVotingMembershipProps extends ICreateProcessFormBodyDialogStepsProps {}

export const CreateProcessFormTokenVotingMembership: React.FC<ICreateProcessFormTokenVotingMembershipProps> = (
    props,
) => {
    const { fieldPrefix } = props;

    return <TokenSetupMembership formPrefix={fieldPrefix} />;
};
