import type { IProposalActionComponentProps } from '@aragon/gov-ui-kit';
import type { IProposalAction } from '@/modules/governance/api/governanceService';
import type { IProposalActionData } from '@/modules/governance/components/createProposalForm';
import type { IDaoPlugin } from '@/shared/api/daoService';
import { useTranslations } from '@/shared/components/translationsProvider';
import { useFormField } from '@/shared/hooks/useFormField';

export interface ICrossChainControllerForwardMessageActionProps
    extends IProposalActionComponentProps<
        IProposalActionData<IProposalAction, IDaoPlugin>
    > {}

export const CrossChainControllerForwardMessageAction: React.FC<
    ICrossChainControllerForwardMessageActionProps
> = (props) => {
    const { index } = props;

    const { t } = useTranslations();

    const actionFieldName = `actions.[${index.toString()}]`;
    useFormField<Record<string, IProposalActionData>, typeof actionFieldName>(
        actionFieldName,
    );

    // TODO(APP-1029): replace the placeholder with the destination-chain, gas-limit and
    // message fields, then encode them into `${actionFieldName}.data` via
    // `encodeFunctionData` and mirror the values on `inputData.parameters`.
    return (
        <p className="text-neutral-500 text-sm leading-normal md:text-base">
            {t(
                'app.plugins.crossChainController.crossChainControllerForwardMessageAction.placeholder',
            )}
        </p>
    );
};
