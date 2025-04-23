import type { ISetupBodyForm } from '@/modules/createDao/dialogs/setupBodyDialog';
import { useTranslations } from '@/shared/components/translationsProvider';
import { ChainEntityType, DefinitionList, IconType, Link, useBlockExplorer } from '@aragon/gov-ui-kit';
import { useAccount } from 'wagmi';

export interface IGovernanceBodiesFieldItemDefaultProps {
    /**
     * Body to display the details for.
     */
    body: ISetupBodyForm;
}

export const GovernanceBodiesFieldItemDefault: React.FC<IGovernanceBodiesFieldItemDefaultProps> = (props) => {
    const { body } = props;

    const { chainId } = useAccount();

    const { buildEntityUrl } = useBlockExplorer();

    const { t } = useTranslations();

    if (body.type === 'NEW') {
        return null;
    }

    const bodyAddressLink = buildEntityUrl({
        type: ChainEntityType.ADDRESS,
        id: body.address,
        chainId,
    });

    return (
        <DefinitionList.Container>
            {body.ensName && (
                <DefinitionList.Item term={t('app.dao.external')}>
                    <Link iconRight={IconType.LINK_EXTERNAL} href={bodyAddressLink} target="_blank">
                        {body.ensName}
                    </Link>
                </DefinitionList.Item>
            )}
            <DefinitionList.Item term={t('app.dao.address')}>
                <Link iconRight={IconType.LINK_EXTERNAL} href={bodyAddressLink} target="_blank">
                    {body.address}
                </Link>
            </DefinitionList.Item>
        </DefinitionList.Container>
    );
};
