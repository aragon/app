import { SetupBodyType, type ISetupBodyForm } from '@/modules/createDao/dialogs/setupBodyDialog';
import { useDao } from '@/shared/api/daoService';
import { useTranslations } from '@/shared/components/translationsProvider';
import { networkDefinitions } from '@/shared/constants/networkDefinitions';
import { addressUtils, ChainEntityType, DefinitionList, useBlockExplorer } from '@aragon/gov-ui-kit';

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

    const { t } = useTranslations();
    const { buildEntityUrl } = useBlockExplorer();
    const { data: dao } = useDao({ urlParams: { id: daoId } });

    if (body.type !== SetupBodyType.EXTERNAL) {
        return null;
    }

    const chainId = dao ? networkDefinitions[dao.network].id : undefined;
    const bodyAddressLink = buildEntityUrl({ type: ChainEntityType.ADDRESS, id: body.address, chainId });

    return (
        <DefinitionList.Container>
            {body.name && (
                <DefinitionList.Item
                    term={t('app.createDao.createProcessForm.governance.bodyField.default.ens')}
                    link={{ href: bodyAddressLink }}
                >
                    {body.name}
                </DefinitionList.Item>
            )}
            <DefinitionList.Item
                term={t('app.createDao.createProcessForm.governance.bodyField.default.address')}
                link={{ href: bodyAddressLink }}
            >
                {addressUtils.truncateAddress(body.address)}
            </DefinitionList.Item>
        </DefinitionList.Container>
    );
};
