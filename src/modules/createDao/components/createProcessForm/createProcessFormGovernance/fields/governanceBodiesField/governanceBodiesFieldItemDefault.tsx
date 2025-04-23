import type { ISetupBodyForm } from '@/modules/createDao/dialogs/setupBodyDialog';
import { useTranslations } from '@/shared/components/translationsProvider';
import { ChainEntityType, DefinitionList, IconType, Link, useBlockExplorer } from '@aragon/gov-ui-kit';
import { useAccount } from 'wagmi';

export interface IGovernanceBodiesFieldItemDefaultProps {
    /**
     * Body to display the details for.
     */
    body?: ISetupBodyForm;
    /**
     * External body details for the voting body.
     */
    externalBody?: ISetupBodyForm;
}

export const GovernanceBodiesFieldItemDefault: React.FC<IGovernanceBodiesFieldItemDefaultProps> = (props) => {
    const { body, externalBody } = props;

    const processedBody = body ?? externalBody;

    const { chainId } = useAccount();

    const { buildEntityUrl } = useBlockExplorer();

    const { t } = useTranslations();

    if (processedBody == null) {
        return null;
    }

    const bodyAddressLink = buildEntityUrl({
        type: ChainEntityType.ADDRESS,
        id: processedBody.membership.members[0].address,
        chainId,
    });

    return (
        <DefinitionList.Container>
            {processedBody.membership.members[0].name && (
                <DefinitionList.Item term={t('app.dao.external')}>
                    <Link iconRight={IconType.LINK_EXTERNAL} href={bodyAddressLink} target="_blank">
                        {processedBody.membership.members[0].name}
                    </Link>
                </DefinitionList.Item>
            )}
            <DefinitionList.Item term={t('app.dao.address')}>
                <Link iconRight={IconType.LINK_EXTERNAL} href={bodyAddressLink} target="_blank">
                    {processedBody.membership.members[0].address}
                </Link>
            </DefinitionList.Item>
        </DefinitionList.Container>
    );
};
