import { SetupBodyType, type ISetupBodyForm } from '@/modules/createDao/dialogs/setupBodyDialog';
import { useTranslations } from '@/shared/components/translationsProvider';
import { pluginRegistryUtils } from '@/shared/utils/pluginRegistryUtils';
import { addressUtils } from '@aragon/gov-ui-kit';

export interface IGovernanceBodyFieldItemHeaderProps {
    body: ISetupBodyForm;
}

export const GovernanceBodyFieldItemHeader: React.FC<IGovernanceBodyFieldItemHeaderProps> = (props) => {
    const { body } = props;

    const { t } = useTranslations();

    const bodyName =
        body.type === SetupBodyType.NEW ? body.name : (body.name ?? addressUtils.truncateAddress(body.address));

    const plugin = pluginRegistryUtils.getPlugin(body.plugin);

    const bodyInfo = () => {
        if (body.type === SetupBodyType.EXTERNAL) {
            return t('app.createDao.createProcessForm.governance.bodyField.external');
        }
        if (plugin) {
            const { build, release } = plugin.installVersion;

            return `${plugin.name} v${release.toString()}.${build.toString()}`;
        }
        return null;
    };

    return (
        <div className="flex w-full flex-col items-start gap-1">
            <div className="flex w-full items-center justify-between">
                <p className="text-base leading-tight text-neutral-800 md:text-lg">{bodyName}</p>
                {body.type !== SetupBodyType.NEW && body.name != null && (
                    <p className="text-base leading-tight text-neutral-500 md:text-lg">
                        {addressUtils.truncateAddress(body.address)}
                    </p>
                )}
            </div>
            <p className="text-sm leading-tight text-neutral-500 md:text-base">{bodyInfo()}</p>
        </div>
    );
};
