import { Button, DefinitionList, IconType } from '@aragon/gov-ui-kit';
import { useTranslations } from '../../../../shared/components/translationsProvider';
import type { IEfpStats } from '../../api/efpService/domain';

export interface IEfpCardProps {
    /**
     * The EFP stats for the member (following and followers).
     */
    efpStats: IEfpStats;
    /**
     * The address of the member.
     */
    address: string;
}

export const EfpCard: React.FC<IEfpCardProps> = (props) => {
    const { efpStats, address } = props;

    const { t } = useTranslations();

    const { followers_count: followers, following_count: following } = efpStats;

    const efpProfileUrl = `https://efp.app/${address}`;

    return (
        <div className="flex flex-col gap-6">
            <DefinitionList.Container>
                <DefinitionList.Item
                    term={t('app.governance.efpCard.following')}
                >
                    <p className="text-neutral-500">{following}</p>
                </DefinitionList.Item>
                <DefinitionList.Item
                    term={t('app.governance.efpCard.followers')}
                >
                    <p className="text-neutral-500">{followers}</p>
                </DefinitionList.Item>
            </DefinitionList.Container>
            <div className="flex flex-col gap-3">
                <Button
                    className="w-full"
                    href={efpProfileUrl}
                    iconRight={IconType.LINK_EXTERNAL}
                    size="md"
                    target="_blank"
                    variant="tertiary"
                >
                    {t('app.governance.efpCard.cta')}
                </Button>
                <p className="text-center text-neutral-500 text-sm">
                    {t('app.governance.efpCard.info')}
                </p>
            </div>
        </div>
    );
};
