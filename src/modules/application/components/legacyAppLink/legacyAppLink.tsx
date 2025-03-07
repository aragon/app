import { type IDao, Network } from '@/shared/api/daoService';
import { useTranslations } from '@/shared/components/translationsProvider';
import { Button, IconType } from '@aragon/gov-ui-kit';

const legacyNetworkMap: Partial<Record<Network, string>> = {
    [Network.ETHEREUM_MAINNET]: 'ethereum',
    [Network.ETHEREUM_SEPOLIA]: 'sepolia',
    [Network.POLYGON_MAINNET]: 'polygon',
    [Network.BASE_MAINNET]: 'base',
    [Network.ARBITRUM_MAINNET]: 'arbitrum',
    [Network.ZKSYNC_MAINNET]: 'zksync',
    [Network.ZKSYNC_SEPOLIA]: 'zksepolia',
};

const baseUrl = 'https://app.aragon.org';

export interface ILegacyAppLinkProps {
    /**
     * The DAO to display the data for.
     */
    dao?: IDao;
}

export const LegacyAppLink: React.FC<ILegacyAppLinkProps> = (props) => {
    const { dao } = props;

    const { t } = useTranslations();

    if (!dao) {
        return (
            <Button target="_blank" href={baseUrl} iconRight={IconType.LINK_EXTERNAL} variant="secondary" size="md">
                {t('app.application.legacyAppLink.link.legacy')}
            </Button>
        );
    }

    const { version, network, address } = dao;

    const legacyNetwork = legacyNetworkMap[network];
    const [release, build] = version.split('.').map(Number);

    const showDaoLegacyButton = legacyNetwork && (release < 1 || (release === 1 && build < 4));

    if (!showDaoLegacyButton) {
        return null;
    }

    const legacyDaoUrl = `https://app.aragon.org/#/daos/${legacyNetwork}/${address}`;

    return (
        <Button target="_blank" href={legacyDaoUrl} iconRight={IconType.LINK_EXTERNAL} variant="secondary" size="md">
            {t('app.application.legacyAppLink.link.legacy')}
        </Button>
    );
};
