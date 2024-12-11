import { type IDaoPlugin } from '@/shared/api/daoService';
import { type ITabComponentPlugin } from '@/shared/components/pluginTabComponent';
import { DefinitionList } from '@aragon/gov-ui-kit';

export interface IMultisigCreateProposalParams {
    /**
     * Name of the multisig.
     */
    plugin: ITabComponentPlugin<IDaoPlugin>;
}

export interface IMultisigCreateProposalProps extends IMultisigCreateProposalParams {}

export const MultisigCreateProposalRequirements: React.FC<IMultisigCreateProposalProps> = (props) => {
    const { plugin } = props;
    const { meta } = plugin;

    return (
        <DefinitionList.Container>
            <DefinitionList.Item term="Name">{meta.name}</DefinitionList.Item>
            <DefinitionList.Item term="Proposal creation">Multisig member</DefinitionList.Item>
        </DefinitionList.Container>
    );
};
