import type { ISetupBodyForm } from '@/modules/createDao/dialogs/setupBodyDialog';
import { useTranslations } from '@/shared/components/translationsProvider';
import { ChainEntityType, DefinitionList, IconType, Link, useBlockExplorer } from '@aragon/gov-ui-kit';
import { useAccount } from 'wagmi';

export interface IGovernanceBodiesFieldItemDefaultProps {
    /**
     * Account details for the voting body to be added.
     */
    body: ISetupBodyForm;
}

export const GovernanceBodiesFieldItemDefault: React.FC<IGovernanceBodiesFieldItemDefaultProps> = (props) => {
    const { body } = props;

    const { chainId } = useAccount();

    const { buildEntityUrl } = useBlockExplorer();

    const { t } = useTranslations();

    const bodyAddressLink = buildEntityUrl({
        type: ChainEntityType.ADDRESS,
        id: body.membership.members[0].address,
        chainId,
    });

    return (
        <DefinitionList.Container>
            {body.membership.members[0].name && (
                <DefinitionList.Item term={t('app.dao.external')}>
                    <Link iconRight={IconType.LINK_EXTERNAL} href={bodyAddressLink} target="_blank">
                        {body.membership.members[0].name}
                    </Link>
                </DefinitionList.Item>
            )}
            <DefinitionList.Item term={t('app.dao.address')}>
                <Link iconRight={IconType.LINK_EXTERNAL} href={bodyAddressLink} target="_blank">
                    {body.membership.members[0].address}
                </Link>
            </DefinitionList.Item>
        </DefinitionList.Container>
    );
};
