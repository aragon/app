import { SetupBodyType, type ISetupBodyForm } from '@/modules/createDao/dialogs/setupBodyDialog';
import { useTranslations } from '@/shared/components/translationsProvider';
import { addressUtils, ChainEntityType, DefinitionList, IconType, Link, useBlockExplorer } from '@aragon/gov-ui-kit';
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
