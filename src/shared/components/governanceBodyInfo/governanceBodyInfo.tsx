import { useTranslations } from '@/shared/components/translationsProvider';
import { pluginRegistryUtils } from '@/shared/utils/pluginRegistryUtils';
import { addressUtils, invariant } from '@aragon/gov-ui-kit';

export interface IGovernanceBodyInfoProps {
    /**
     * The name of the governance body.
     */
    name?: string;
    /**
     * The subdomain of the plugin associated with the body.
     */
    pluginSubdomain?: string;
    /**
     * The address of the governance body.
     */
    address?: string;
}

export const GovernanceBodyInfo: React.FC<IGovernanceBodyInfoProps> = (props) => {
    const { name, pluginSubdomain, address } = props;

    invariant(
        address != null || pluginSubdomain != null,
        'GovernanceBodyInfo: address or pluginSubdomain must be set.',
    );

    const { t } = useTranslations();

    const shortenedAddress = addressUtils.truncateAddress(address);

    const bodyName = name ?? shortenedAddress;

    const plugin = pluginRegistryUtils.getPlugin(pluginSubdomain ?? '');
    const pluginVersion =
        plugin && `v${plugin.installVersion.release.toString()}.${plugin.installVersion.build.toString()}`;

    const subtitle = !pluginSubdomain
        ? t('app.shared.governanceBodyInfo.external')
        : plugin
          ? // at this point plugin version will be defined
            `${plugin.name} ${pluginVersion!}`
          : null;

    return (
        <div className="flex w-full flex-col items-start gap-1">
            <div className="flex w-full items-center justify-between">
                <p className="text-base leading-tight text-neutral-800 md:text-lg">{bodyName}</p>
                {address && name != null && (
                    <p className="text-base leading-tight text-neutral-500 md:text-lg">{shortenedAddress}</p>
                )}
            </div>
            {subtitle && <p className="text-sm leading-tight text-neutral-500 md:text-base">{subtitle}</p>}
        </div>
    );
};
