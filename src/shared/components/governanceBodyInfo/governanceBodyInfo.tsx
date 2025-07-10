import { useTranslations } from '@/shared/components/translationsProvider';
import { addressUtils, invariant } from '@aragon/gov-ui-kit';

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
     * The name of the plugin.
     */
    pluginName?: string;
    /**
     * The release number of the plugin.
     */
    release?: string;
    /**
     * The build number of the plugin.
     */
    build?: string;
}

export const GovernanceBodyInfo: React.FC<IGovernanceBodyInfoProps> = (props) => {
    const { name, pluginName, address, release, build } = props;

    invariant(address != null, 'GovernanceBodyInfo: address must be set.');

    const { t } = useTranslations();

    const truncatedAddress = addressUtils.truncateAddress(address);

    const bodyName = name ?? truncatedAddress;

    const isPlugin = pluginName != null && release != null && build != null;

    const subtitle = isPlugin ? `${pluginName} v${release}.${build}` : t('app.shared.governanceBodyInfo.external');

    return (
        <div className="flex w-full flex-col items-start gap-1">
            <div className="flex w-full items-center justify-between">
                <p className="text-base leading-tight text-neutral-800 md:text-lg">{bodyName}</p>
                {address && name != null && (
                    <p className="text-base leading-tight text-neutral-500 md:text-lg">{truncatedAddress}</p>
                )}
            </div>
            <p className="text-sm leading-tight text-neutral-500 md:text-base">{subtitle}</p>
        </div>
    );
};
