import { useDialogContext, type IDialogComponentProps } from '@/shared/components/dialogProvider';
import { useTranslations } from '@/shared/components/translationsProvider';
import { AvatarIcon, Dialog, IconType, Link } from '@aragon/gov-ui-kit';
import { useWeb3Modal } from '@web3modal/wagmi/react';
import { AragonLogo } from '../../components/aragonLogo';

export interface IConnectWalletDialogProps extends IDialogComponentProps {}

export const ConnectWalletDialog: React.FC<IConnectWalletDialogProps> = () => {
    const { close } = useDialogContext();
    const { open: openWeb3Modal } = useWeb3Modal();
    const { t } = useTranslations();

    const handleConnectClick = () => {
        close();
        openWeb3Modal();
    };

    return (
        <div className="flex flex-col gap-4 pt-10 md:gap-8">
            <Dialog.Content className="flex flex-col gap-6">
                <div className="flex flex-col gap-3 md:gap-4">
                    <AragonLogo />
                    <p className="text-lg font-normal leading-tight text-neutral-500 md:text-xl">
                        <span className="block text-neutral-900">{t('app.application.connectWalletDialog.app')}</span>
                        <span>{t('app.application.connectWalletDialog.connect')}</span>
                    </p>
                </div>
                <div className="flex flex-col gap-4 text-sm font-normal leading-tight text-neutral-500">
                    <div className="flex flex-row items-center gap-3">
                        <AvatarIcon icon={IconType.CHECKMARK} variant="primary" size="sm" />
                        <p>{t('app.application.connectWalletDialog.feature.permissions')}</p>
                    </div>
                    <div className="flex flex-row items-center gap-3">
                        <AvatarIcon icon={IconType.APP_MEMBERS} variant="primary" size="sm" />
                        <p>{t('app.application.connectWalletDialog.feature.stats')}</p>
                    </div>
                    <div className="flex flex-row items-center gap-3">
                        <AvatarIcon icon={IconType.BLOCKCHAIN_SMARTCONTRACT} variant="primary" size="sm" />
                        <Link
                            iconRight={IconType.LINK_EXTERNAL}
                            target="_blank"
                            href={t('app.application.connectWalletDialog.auditLink')}
                        >
                            <span className="text-sm">
                                {t('app.application.connectWalletDialog.feature.smartContracts')}
                            </span>
                        </Link>
                    </div>
                </div>
            </Dialog.Content>
            <Dialog.Footer
                primaryAction={{
                    iconLeft: IconType.BLOCKCHAIN_WALLET,
                    label: t('app.application.connectWalletDialog.action.connect'),
                    onClick: handleConnectClick,
                }}
                secondaryAction={{ label: t('app.application.connectWalletDialog.action.cancel'), onClick: close }}
            />
        </div>
    );
};
