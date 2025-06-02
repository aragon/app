import { type IDao, Network } from '@/shared/api/daoService';
import { useTranslations } from '@/shared/components/translationsProvider';
import { Button, IconType } from '@aragon/gov-ui-kit';

const legacyNetworkMap: Partial<Record<Network, string>> = {
    [Network.ETHEREUM_MAINNET]: 'ethereum',
    [Network.ETHEREUM_SEPOLIA]: 'sepolia',
    [Network.POLYGON_MAINNET]: 'polygon',
    [Network.BASE_MAINNET]: 'base',
    [Network.ARBITRUM_MAINNET]: 'arbitrum',
    [Network.ZKSYNC_MAINNET]: 'zksyncMainnet',
    [Network.ZKSYNC_SEPOLIA]: 'zksepolia',
};

const getLegacyUrl = (dao?: IDao): string | null => {
    const baseUrl = 'https://app-legacy.aragon.org';

    // If no DAO is provided, use the explore page
    if (!dao) {
        return baseUrl;
    }

    const { version, network, address } = dao;
    const legacyNetwork = legacyNetworkMap[network];
    const [release, build] = version.split('.').map(Number);

    // Check if the DAO is supported in the legacy app
    const isLegacyDao = legacyNetwork && (release < 1 || (release === 1 && build < 4));

    if (!isLegacyDao) {
        return null;
    }

    return `${baseUrl}/#/daos/${legacyNetwork}/${address}`;
};

export interface INavigationAppLinksLegacyProps {
    /**
     * The DAO to enable us to navigate to the correct dao dashboard in the legacy app.
     */
    dao?: IDao;
}

export const NavigationAppLinksLegacy: React.FC<INavigationAppLinksLegacyProps> = (props) => {
    const { dao } = props;

    const { t } = useTranslations();

    const legacyUrl = getLegacyUrl(dao);

    if (!legacyUrl) {
        return null;
    }

    return (
        <Button
            target="_blank"
            href={legacyUrl}
            iconRight={IconType.LINK_EXTERNAL}
            variant="tertiary"
            size="sm"
            className="text-nowrap"
        >
            {t('app.application.navigation.appLinks.legacy')}
        </Button>
    );
};
