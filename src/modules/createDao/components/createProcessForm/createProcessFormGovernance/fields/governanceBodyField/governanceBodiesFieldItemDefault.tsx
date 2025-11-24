import { type ISetupBodyForm } from '@/modules/createDao/dialogs/setupBodyDialog';
import { useDao } from '@/shared/api/daoService';
import { useTranslations } from '@/shared/components/translationsProvider';
import { useDaoChain } from '@/shared/hooks/useDaoChain';
import { addressUtils, ChainEntityType, DefinitionList } from '@aragon/gov-ui-kit';
import type { Hash } from 'viem';
import { useEnsName } from 'wagmi';
import { BodyType } from '../../../../../types/enum';
import { createProcessFormUtils } from '../../../createProcessFormUtils';

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
    const { data: dao } = useDao({ urlParams: { id: daoId } });
    const { buildEntityUrl } = useDaoChain({ network: dao?.network });

    const { data: ensName } = useEnsName({
        address: body.type !== BodyType.NEW ? (body.address as Hash) : undefined,
    });

    if (body.type !== BodyType.EXTERNAL && body.type !== BodyType.EXISTING) {
        return null;
    }

    const bodyAddressLink = buildEntityUrl({ type: ChainEntityType.ADDRESS, id: body.address });

    return (
        <DefinitionList.Container>
            {ensName != null && (
                <DefinitionList.Item
                    term={t('app.createDao.createProcessForm.governance.bodyField.default.ens')}
                    link={{ href: bodyAddressLink }}
                >
                    {ensName}
                </DefinitionList.Item>
            )}
            <DefinitionList.Item
                term={t('app.createDao.createProcessForm.governance.bodyField.default.address')}
                link={{ href: bodyAddressLink }}
            >
                {addressUtils.truncateAddress(body.address)}
            </DefinitionList.Item>
            {createProcessFormUtils.isBodySafe(body) && (
                <DefinitionList.Item term={t('app.createDao.createProcessForm.governance.bodyField.default.type')}>
                    {t('app.createDao.createProcessForm.governance.bodyField.default.safe')}
                </DefinitionList.Item>
            )}
        </DefinitionList.Container>
    );
};
