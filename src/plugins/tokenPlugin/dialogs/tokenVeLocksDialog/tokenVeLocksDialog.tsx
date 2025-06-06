import type { IToken } from '@/modules/finance/api/financeService';
import type { IDialogComponentProps } from '@/shared/components/dialogProvider';
import { useTranslations } from '@/shared/components/translationsProvider';
import { Dialog, invariant } from '@aragon/gov-ui-kit';
import { useAccount } from 'wagmi';
import { type IGetTokenLocksParams } from '../../api/tokenService';
import type { EscrowSettings } from '../../types';
import { TokenVeLocksList } from './components/tokenVeLocksList';

export interface ITokenVeLocksDialogParams {
    /**
     * Initial parameters to use for fetching the token locks.
     */
    initialParams: IGetTokenLocksParams;
    /**
     * Token for which the ve locks are displayed.
     */
    token: IToken;
    /**
     * Token voting escrow settings.
     */
    votingEscrow: EscrowSettings;
}

export interface ITokenVeLocksDialogProps extends IDialogComponentProps<ITokenVeLocksDialogParams> {}

export type VeLockStatus = 'active' | 'cooldown' | 'available';

export const TokenVeLocksDialog: React.FC<ITokenVeLocksDialogProps> = (props) => {
    const { location } = props;
    invariant(location.params != null, 'TokenVeLocksDialog: required parameters must be set.');

    const { address } = useAccount();
    invariant(address != null, 'TokenVeLocksDialog: user must be connected.');

    const { t } = useTranslations();

    return (
        <>
            <Dialog.Header title={t('app.plugins.token.tokenVeLocksDialog.title')} />
            <Dialog.Content
                description={t('app.plugins.token.tokenVeLocksDialog.description')}
                className="pb-4 md:pb-6"
            >
                <TokenVeLocksList {...location.params} />
            </Dialog.Content>
        </>
    );
};
