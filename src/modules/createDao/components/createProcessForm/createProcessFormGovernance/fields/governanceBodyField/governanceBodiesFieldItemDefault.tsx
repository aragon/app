import { SetupBodyType, type ISetupBodyForm } from '@/modules/createDao/dialogs/setupBodyDialog';
import { useDao } from '@/shared/api/daoService';
import { useTranslations } from '@/shared/components/translationsProvider';
import { networkDefinitions } from '@/shared/constants/networkDefinitions';
import { addressUtils, ChainEntityType, DefinitionList, IconType, Link, useBlockExplorer } from '@aragon/gov-ui-kit';

export interface IGovernanceBodiesFieldItemDefaultProps {
    /**
     * Body to display the details for.
     */
    body: ISetupBodyForm;
    /**
     * ID of the DAO to setup the body for.
     */
    daoId: string;
}

export const GovernanceBodiesFieldItemDefault: React.FC<IGovernanceBodiesFieldItemDefaultProps> = (props) => {
    const { body, daoId } = props;

    const urlParams = { id: daoId };
    const { data: dao } = useDao({ urlParams });

    const chainId = dao ? networkDefinitions[dao.network].id : undefined;

    const { buildEntityUrl } = useBlockExplorer();

    const { t } = useTranslations();

    if (body.type !== SetupBodyType.EXTERNAL) {
        return null;
    }

    const bodyAddressLink = buildEntityUrl({
        type: ChainEntityType.ADDRESS,
        id: body.address,
        chainId,
    });

    return (
        <DefinitionList.Container>
            {body.name && (
                <DefinitionList.Item term={t('app.createDao.createProcessForm.governance.bodyField.default.ens')}>
                    <Link iconRight={IconType.LINK_EXTERNAL} href={bodyAddressLink} target="_blank">
                        {body.name}
                    </Link>
                </DefinitionList.Item>
            )}
            <DefinitionList.Item term={t('app.createDao.createProcessForm.governance.bodyField.default.address')}>
                <Link iconRight={IconType.LINK_EXTERNAL} href={bodyAddressLink} target="_blank">
                    {addressUtils.truncateAddress(body.address)}
                </Link>
            </DefinitionList.Item>
        </DefinitionList.Container>
    );
};
