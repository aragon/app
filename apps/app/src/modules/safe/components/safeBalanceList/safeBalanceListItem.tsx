import {
    AssetDataListItemStructure,
    ChainEntityType,
} from '@aragon/gov-ui-kit';
import type { Network } from '@/shared/api/daoService';
import type { ISafeBalance } from '@/shared/api/safeService';
import { networkDefinitions } from '@/shared/constants/networkDefinitions';
import { useDaoChain } from '@/shared/hooks/useDaoChain';
import { safeBalanceUtils } from '../../utils/safeBalanceUtils';

export interface ISafeBalanceListItemProps {
    /**
     * Network the Safe is deployed on.
     */
    network: Network;
    /**
     * Balance to be rendered.
     */
    balance: ISafeBalance;
}

export const SafeBalanceListItem: React.FC<ISafeBalanceListItemProps> = (
    props,
) => {
    const { network, balance } = props;

    const { buildEntityUrl } = useDaoChain({ network });

    const { name, symbol, amount, logoSrc, tokenAddress } =
        safeBalanceUtils.getBalanceAsset({
            balance,
            nativeCurrency: networkDefinitions[network].nativeCurrency,
        });

    const tokenUrl =
        tokenAddress != null
            ? buildEntityUrl({ type: ChainEntityType.TOKEN, id: tokenAddress })
            : undefined;

    return (
        <AssetDataListItemStructure
            amount={amount}
            hideValue={true}
            href={tokenUrl}
            logoSrc={logoSrc}
            name={name}
            rel="noopener"
            symbol={symbol}
            target={tokenUrl != null ? '_blank' : undefined}
        />
    );
};
