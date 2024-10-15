import { type IDaoPlugin } from '@/shared/api/daoService';

import { Page } from '@/shared/components/page';
import { useTranslations } from '@/shared/components/translationsProvider';
import { type PluginType } from '@/shared/types';
import { addressUtils, DateFormat, DefinitionList, formatterUtils, IconType, Link } from '@aragon/ods';

export interface IDaoPlugInfoProps {
    /**
     * The DAO plugin to display information for.
     */
    plugin: IDaoPlugin;
    /**
     * The type of plugin.
     */
    type: PluginType;
}

export const DaoPluginInfo: React.FC<IDaoPlugInfoProps> = (props) => {
    const { plugin, type } = props;

    const { t } = useTranslations();

    return (
        <Page.Section
            title={t('app.governance.daoProposalsPage.aside.details.title')}
            inset={false}
            className="gap-y-4"
        >
            <p>
                This is an example description for the purposes of establishing layout while we we await description
                aggregation from the backend service.
            </p>
            <div>
                <Link href="/" target="_blank" iconRight={IconType.LINK_EXTERNAL}>
                    Delete these
                </Link>
                <p className="truncate">https://localhost:3000</p>
            </div>
            <div>
                <Link href="/" target="_blank" iconRight={IconType.LINK_EXTERNAL}>
                    Example Links
                </Link>
                <p className="truncate">https://localhost:3000</p>
            </div>
            {/* {plugin.resources((resource: IResource, index: number) => () => (
                    <div key={index}>
                        <Link href={resource.url}>{resource.name}</Link>
                        <p className="truncate">{resource.url}</p>
                    </div>
                ))} */}
            <DefinitionList.Container>
                <DefinitionList.Item term={t('Body Name')}>{plugin.name}</DefinitionList.Item>
                <DefinitionList.Item term={t('Plugin')}>
                    <Link className="capitalize" href="/" iconRight={IconType.LINK_EXTERNAL}>
                        {plugin.subdomain}
                    </Link>
                    <p>{addressUtils.truncateAddress(plugin.address)}</p>
                </DefinitionList.Item>
                <DefinitionList.Item term="Launched at">
                    <Link href="/" target="_blank" iconRight={IconType.LINK_EXTERNAL}>
                        {formatterUtils.formatDate(plugin.blockTimestamp * 1000, {
                            format: DateFormat.YEAR_MONTH,
                        })}
                    </Link>
                </DefinitionList.Item>
            </DefinitionList.Container>
        </Page.Section>
    );
};
