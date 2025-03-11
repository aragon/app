import { useEfpStats } from '@/shared/api/efpService/queries';
import { Button, DefinitionList, IconType } from '@aragon/gov-ui-kit';
import Image from 'next/image';
import { useTranslations } from '../translationsProvider';
import Logo from './efpLogo.svg';

export interface IEfpCardProps {
    address: string;
}

export const EfpCard: React.FC<IEfpCardProps> = (props) => {
    const { address } = props;
    const { t } = useTranslations();
    const efpParams = { urlParams: { address } };
    const { data: efpStats } = useEfpStats(efpParams);

    if (!efpStats) {
        return null;
    }

    const { followers_count: followers, following_count: following } = efpStats;

    const efpProfileUrl = `https://efp.app/${address}`;

    return (
        <>
            <Image alt="logo" className="absolute right-6 top-6 size-8" src={Logo as string} height={100} width={100} />
            <div className="flex flex-col gap-6">
                <DefinitionList.Container>
                    <DefinitionList.Item term={t('app.shared.efpCard.following')}>
                        <p className="text-neutral-500">{following}</p>
                    </DefinitionList.Item>
                    <DefinitionList.Item term={t('app.shared.efpCard.followers')}>
                        <p className="text-neutral-500">{followers}</p>
                    </DefinitionList.Item>
                </DefinitionList.Container>
                <Button
                    href={efpProfileUrl}
                    target="_blank"
                    className="w-full"
                    variant="tertiary"
                    iconRight={IconType.LINK_EXTERNAL}
                >
                    {t('app.shared.efpCard.cta')}
                </Button>
                <p className="text-center text-sm text-neutral-500">{t('app.shared.efpCard.info')}</p>
            </div>
        </>
    );
};
