import {
    AddressOutput,
    Avatar,
    addressUtils,
    invariant,
} from '@aragon/gov-ui-kit';
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
        <div className="flex w-full flex-col items-start gap-1">
            <div className="flex w-full items-center justify-between">
                <p className="flex items-center gap-2 text-base leading-tight text-neutral-800 md:text-lg">
                    {/* A named body shows its name and the plain short address: resolving that address would
                     * repeat a name. An unnamed one shows its address, named by the address book. */}
                    {bodyName ??
                        (address != null && (
                            <AddressOutput address={address} />
                        ))}
                    {logoSrc && <Avatar size="sm" src={logoSrc} />}
                </p>
                {address != null && bodyName != null && (
                    <p className="text-base leading-tight text-neutral-500 md:text-lg">
                        {addressUtils.truncateAddress(address)}
                    </p>
                )}
            </div>
            <p className="text-sm leading-tight text-neutral-500 md:text-base">
                {subtitle}
            </p>
        </div>
    );
};
