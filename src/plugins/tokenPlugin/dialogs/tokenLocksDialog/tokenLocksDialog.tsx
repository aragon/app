import type { IDialogComponentProps } from '@/shared/components/dialogProvider';
import { useTranslations } from '@/shared/components/translationsProvider';
import { Dialog, invariant } from '@aragon/gov-ui-kit';
import { useAccount } from 'wagmi';
import { type ITokenLockListProps, TokenLockList } from '../../components/tokenLockList';

export interface ITokenLocksDialogParams extends ITokenLockListProps {}

export interface ITokenLocksDialogProps extends IDialogComponentProps<ITokenLocksDialogParams> {}

export type LockStatus = 'active' | 'cooldown' | 'available';

export const TokenLocksDialog: React.FC<ITokenLocksDialogProps> = (props) => {
    const { location } = props;
    invariant(location.params != null, 'TokenLocksDialog: required parameters must be set.');

    const { address } = useAccount();
    invariant(address != null, 'TokenLocksDialog: user must be connected.');

    const { t } = useTranslations();

    return (
        <>
            <Dialog.Header title={t('app.plugins.token.tokenLocksDialog.title')} />
            <Dialog.Content description={t('app.plugins.token.tokenLocksDialog.description')} className="pb-4 md:pb-6">
                <TokenLockList {...location.params} />
            </Dialog.Content>
        </>
    );
};
