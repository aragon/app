import { TokenSetupMembership } from '@/plugins/tokenPlugin/components/tokenSetupMembership';
import type { ICreateProcessFormBodyDialogStepsProps } from '../../../createProcessFormStages/fields/stageBodiesField/stageBodiesFieldDefinitions';

export interface ICreateProcessFormTokenVotingDistroProps extends ICreateProcessFormBodyDialogStepsProps {}

export const CreateProcessFormTokenVotingDistro: React.FC<ICreateProcessFormTokenVotingDistroProps> = (props) => {
    const { fieldPrefix } = props;

    return <TokenSetupMembership formPrefix={fieldPrefix} />;
};
