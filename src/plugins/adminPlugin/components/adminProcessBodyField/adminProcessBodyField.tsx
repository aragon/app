'use client';

import { SetupBodyType, type ISetupBodyForm } from '@/modules/createDao/dialogs/setupBodyDialog';
import { useDao } from '@/shared/api/daoService';
import { useTranslations } from '@/shared/components/translationsProvider';
import { networkDefinitions } from '@/shared/constants/networkDefinitions';
import { addressUtils, ChainEntityType, DefinitionList, useBlockExplorer } from '@aragon/gov-ui-kit';

export interface IAdminProcessBodyFieldProps {
    /**
     * Body to display the details for.
     */
    body: ISetupBodyForm;
    /**
     * ID of the DAO to setup the body for.
     */
    daoId: string;
}

export const AdminProcessBodyField: React.FC<IAdminProcessBodyFieldProps> = (props) => {
    const { body, daoId } = props;

    const { t } = useTranslations();
    const { buildEntityUrl } = useBlockExplorer();
    const { data: dao } = useDao({ urlParams: { id: daoId } });

    if (body.type !== SetupBodyType.EXTERNAL && body.type !== SetupBodyType.EXISTING) {
        return null;
    }

    const chainId = dao ? networkDefinitions[dao.network].id : undefined;
    const bodyAddressLink = buildEntityUrl({ type: ChainEntityType.ADDRESS, id: body.address, chainId });

    return (
        <DefinitionList.Container>
            {body.name && body.type === SetupBodyType.EXTERNAL && (
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
