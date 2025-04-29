import { useTranslations } from '@/shared/components/translationsProvider';
import type { IPluginInfo } from '@/shared/types';
import { addressUtils, invariant } from '@aragon/gov-ui-kit';

export interface IGovernanceBodyInfoProps {
    /**
     * The name of the governance body.
     */
    name?: string;
    /**
     * The address of the governance body.
     */
    address?: string;
    /**
     * Information of plugin (name and version number).
     */
    pluginInfo?: IPluginInfo;
}

export const GovernanceBodyInfo: React.FC<IGovernanceBodyInfoProps> = (props) => {
    const { name, pluginInfo, address } = props;

    invariant(address != null || pluginInfo != null, 'GovernanceBodyInfo: address or subdomain must be set.');

    const { t } = useTranslations();

    const shortenedAddress = addressUtils.truncateAddress(address);

    const bodyName = name ?? shortenedAddress;

    const subtitle = pluginInfo
        ? `${pluginInfo.name} v${pluginInfo.installVersion.release.toString()}.${pluginInfo.installVersion.build.toString()}`
        : t('app.shared.governanceBodyInfo.external');

    return (
        <div className="flex w-full flex-col items-start gap-1">
            <div className="flex w-full items-center justify-between">
                <p className="text-base leading-tight text-neutral-800 md:text-lg">{bodyName}</p>
                {address && name != null && (
                    <p className="text-base leading-tight text-neutral-500 md:text-lg">{shortenedAddress}</p>
                )}
            </div>
            <p className="text-sm leading-tight text-neutral-500 md:text-base">{subtitle}</p>
        </div>
    );
};
