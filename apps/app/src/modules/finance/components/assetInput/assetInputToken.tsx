import { Avatar, addressUtils } from '@aragon/gov-ui-kit';
import classNames from 'classnames';
import type { ComponentProps } from 'react';
import { useTranslations } from '@/shared/components/translationsProvider';
import type { IToken } from '../../api/financeService';

export interface IAssetInputTokenProps extends ComponentProps<'div'> {
    /**
     * The token to be rendered.
     */
    token?: IToken;
}

export const AssetInputToken: React.FC<IAssetInputTokenProps> = (props) => {
    const { token, className, ...otherProps } = props;

    const { t } = useTranslations();

    return (
        <div
            className={classNames('flex items-center gap-x-1.5', className)}
            {...otherProps}
        >
            {token && <Avatar size="xs" src={token.logo || undefined} />}
            {token
                ? token.symbol || addressUtils.truncateAddress(token.address)
                : t('app.finance.assetInput.token.trigger')}
        </div>
    );
};
