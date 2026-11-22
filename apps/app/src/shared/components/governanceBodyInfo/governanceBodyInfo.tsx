import { AddressOutput, Avatar, invariant } from '@aragon/gov-ui-kit';
import { useTranslations } from '@/shared/components/translationsProvider';
import { daoUtils } from '@/shared/utils/daoUtils';

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

export const GovernanceBodyInfo: React.FC<IGovernanceBodyInfoProps> = (
    props,
) => {
    const { name, subdomain, address, release, build, logoSrc } = props;

    invariant(
        address != null || subdomain != null,
        'GovernanceBodyInfo: address or subdomain must be set.',
    );

    const { t } = useTranslations();

    const bodyName = name != null && name !== '' ? name : undefined;

    const isPlugin = !!subdomain && !!release && !!build;

    const subtitle = isPlugin
        ? `${daoUtils.parsePluginSubdomain(subdomain)} v${release}.${build}`
        : t('app.shared.governanceBodyInfo.external');

    return (
        <div className="flex w-full flex-col items-start gap-tight">
            <div className="flex w-full items-center justify-between">
                <p className="flex items-center gap-related--fixed-8 text-base leading-tight text-surface-primary md:text-lg">
                    {address != null ? (
                        <AddressOutput address={address} label={bodyName} />
                    ) : (
                        bodyName
                    )}
                    {logoSrc && <Avatar size="sm" src={logoSrc} />}
                </p>
                {address && name != null && name !== '' && (
                    <p className="text-base leading-tight text-surface-secondary md:text-lg">
                        <AddressOutput address={address} />
                    </p>
                )}
            </div>
            <p className="text-sm leading-tight text-surface-secondary md:text-base">
                {subtitle}
            </p>
        </div>
    );
};
