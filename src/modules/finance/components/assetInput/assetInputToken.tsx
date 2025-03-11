import { useTranslations } from '@/shared/components/translationsProvider';
import { Avatar } from '@aragon/gov-ui-kit';
import type { IToken } from '../../api/financeService';

export interface IAssetInputTokenProps {
    /**
     * The token to be rendered.
     */
    token?: IToken;
}

export const AssetInputToken: React.FC<IAssetInputTokenProps> = (props) => {
    const { token } = props;

    const { t } = useTranslations();

    return (
        <div className="flex items-center gap-x-1.5">
            {token && <Avatar src={token.logo} size="sm" />}
            {token ? token.symbol : t('app.finance.assetInput.token.trigger')}
        </div>
    );
};
