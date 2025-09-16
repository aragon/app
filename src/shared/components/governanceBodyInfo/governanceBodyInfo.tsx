import { useTranslations } from '@/shared/components/translationsProvider';
import { daoUtils } from '@/shared/utils/daoUtils';
import { addressUtils, Avatar, invariant } from '@aragon/gov-ui-kit';

export interface IGovernanceBodyInfoProps {
    /**
     * The name of the body.
     */
    name?: string;
    /**
     * The address of the body.
     */
    address?: string;
    /**
     * The subdomain of the plugin.
     */
    subdomain?: string;
    /**
     * The release number of the plugin.
     */
    release?: string;
    /**
     * The build number of the plugin.
     */
    build?: string;
    /**
     * The logo of the body, i.e., Safe logo
     */
    logoSrc?: string;
}

export const GovernanceBodyInfo: React.FC<IGovernanceBodyInfoProps> = (props) => {
    const { name, subdomain, address, release, build, logoSrc } = props;

    invariant(address != null || subdomain != null, 'GovernanceBodyInfo: address or subdomain must be set.');

    const { t } = useTranslations();

    const truncatedAddress = addressUtils.truncateAddress(address);

    const bodyName = name != null && name != '' ? name : truncatedAddress;

    const isPlugin = !!subdomain && !!release && !!build;

    const subtitle = isPlugin
        ? `${daoUtils.parsePluginSubdomain(subdomain)} v${release}.${build}`
        : t('app.shared.governanceBodyInfo.external');

    return (
        <div className="flex w-full flex-col items-start gap-1">
            <div className="flex w-full items-center justify-between">
                <p className="flex items-center gap-2 text-base leading-tight text-neutral-800 md:text-lg">
                    {bodyName}
                    {logoSrc && <Avatar src={logoSrc} size="sm" />}
                </p>
                {address && name != null && name != '' && (
                    <p className="text-base leading-tight text-neutral-500 md:text-lg">{truncatedAddress}</p>
                )}
            </div>
            <p className="text-sm leading-tight text-neutral-500 md:text-base">{subtitle}</p>
        </div>
    );
};
