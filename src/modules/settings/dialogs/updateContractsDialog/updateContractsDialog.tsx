import type { IDaoPlugin } from "@/shared/api/daoService";
import { useDialogContext, type IDialogComponentProps } from "@/shared/components/dialogProvider";
import { useTranslations } from "@/shared/components/translationsProvider";
import { Dialog, invariant } from "@aragon/gov-ui-kit";
import { PluginCard } from "./pluginCard";

export interface IUpdateContractsDialogParams {
  /**
  * The plugins that are going to be updated.
  */
  plugins: IDaoPlugin[];
  /**
  * The process that was selected to publish the proposal.
  */
  process: IDaoPlugin
}

export interface IUpdateContractsDialogProps extends IDialogComponentProps<IUpdateContractsDialogParams> {}

export const UpdateContractsDialog: React.FC<IUpdateContractsDialogProps> = (props) => {
  const { location } = props;

      const { t } = useTranslations();
      const { close } = useDialogContext();

      invariant(location.params != null, 'UpdateContractsDialog: required parameters must be set.');

      const { plugins, process } = location.params;

      const onPropose = () => {
              console.log('UpdateContractsDialog', plugins, process);
      }

    return (
      <>
        <Dialog.Header onClose={close} title={t('app.settings.updateContractsDialog.title')} />
        <Dialog.Content description={t('app.settings.updateContractsDialog.description')} >
          {plugins.map((plugin) => (
            <PluginCard
              key={plugin.address}
              plugin={plugin}
            />
          ))}
          </Dialog.Content>
          <Dialog.Footer
            primaryAction={{
              label: t('app.settings.updateContractsDialog.action.confirm'),
              onClick: onPropose,
            }}
             secondaryAction={{
                    label: t('app.settings.updateContractsDialog.action.cancel'),
                    onClick: () => close(),
                }}
          />
      </>
    );
};
