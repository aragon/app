'use client';

import type { IDao, IDaoPlugin } from '@/shared/api/daoService';
import { type IDialogComponentProps, useDialogContext } from '@/shared/components/dialogProvider';
import { useTranslations } from '@/shared/components/translationsProvider';
import { Dialog, invariant } from '@aragon/gov-ui-kit';
import { useAccount } from 'wagmi';
import { TokenLockList } from '../../components/tokenMemberPanel/tokenLock';
import type { ITokenPluginSettings } from '../../types';

export interface ITokenLocksDialogParams {
    /**
     * DAO with the token-voting plugin.
     */
    dao: IDao;
    /**
     * Token plugin containing voting escrow settings.
     */
    plugin: IDaoPlugin<ITokenPluginSettings>;
}

export interface ITokenLocksDialogProps extends IDialogComponentProps<ITokenLocksDialogParams> {}

export const TokenLocksDialog: React.FC<ITokenLocksDialogProps> = (props) => {
    const { location } = props;
    invariant(location.params != null, 'TokenLocksDialog: required parameters must be set.');
    const { plugin, dao } = location.params;

    const { address } = useAccount();
    invariant(address != null, 'TokenLocksDialog: user must be connected.');

    const { t } = useTranslations();
    const { close } = useDialogContext();

    const { token } = plugin.settings;

    return (
        <>
            <Dialog.Header title={t('app.plugins.token.tokenLocksDialog.title')} onClose={close} />
            <Dialog.Content
                description={t('app.plugins.token.tokenLocksDialog.description', { symbol: token.symbol })}
                className="pb-4 md:pb-6"
            >
                <TokenLockList dao={dao} plugin={plugin} />
            </Dialog.Content>
        </>
    );
};
