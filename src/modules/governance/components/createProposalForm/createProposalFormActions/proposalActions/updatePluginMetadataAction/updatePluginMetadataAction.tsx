import {
    ProposalActionType,
    type IProposalAction,
    type IProposalActionUpdatePluginMetadata,
} from '@/modules/governance/api/governanceService/domain';
import type { IDaoPlugin } from '@/shared/api/daoService';
import { usePinJson } from '@/shared/api/ipfsService/mutations';
import { ResourcesInput } from '@/shared/components/forms/resourcesInput';
import { useTranslations } from '@/shared/components/translationsProvider';
import { useFormField } from '@/shared/hooks/useFormField';
import { transactionUtils } from '@/shared/utils/transactionUtils';
import { InputText, TextArea, type IProposalActionComponentProps } from '@aragon/gov-ui-kit';
import { useCallback, useEffect } from 'react';
import { encodeFunctionData } from 'viem';
import type { IProposalActionData } from '../../../createProposalFormDefinitions';
import { useCreateProposalFormContext } from '../../../createProposalFormProvider';
import type { IUpdatePluginMetadataFormData } from './updatePluginMetadataActionDefinitions';
import type { IDaoPluginMetadataObject } from '@/modules/governance/api/governanceService/domain/proposalActionUpdatePluginMetadata';

export interface IUpdatePluginMetadataAction extends Omit<IProposalActionUpdatePluginMetadata, 'proposedMetadata'> {
    /**
     * Metadata proposed on the action.
     */
    proposedMetadata: IDaoPluginMetadataObject;
}

export interface IUpdatePluginMetadataActionProps
    extends IProposalActionComponentProps<IProposalActionData<IProposalAction, IDaoPlugin>> {}

const nameMaxLength = 40;
const keyMaxLength = 5;
const summaryMaxLength = 480;

const setMetadataAbi = {
    type: 'function',
    inputs: [{ name: '_metadata', internalType: 'bytes', type: 'bytes' }],
    name: 'setMetadata',
    outputs: [],
    stateMutability: 'nonpayable',
};

export const UpdatePluginMetadataAction: React.FC<IUpdatePluginMetadataActionProps> = (props) => {
    const { index, action } = props;

    const { meta } = action;

    const { isProcess } = meta;

    const { t } = useTranslations();

    const { mutateAsync: pinJsonAsync } = usePinJson();
    const { addPrepareAction } = useCreateProposalFormContext();

    const actionFieldName = `actions.[${index.toString()}]`;
    useFormField<Record<string, IProposalActionData>, typeof actionFieldName>(actionFieldName);

    const nameField = useFormField<IUpdatePluginMetadataFormData, 'name'>('name', {
        label: t('app.governance.updatePluginMetadataAction.nameField.label'),
        fieldPrefix: `${actionFieldName}.proposedMetadata`,
        rules: { required: true, maxLength: nameMaxLength },
        trimOnBlur: true,
        defaultValue: '',
    });

    const processKeyField = useFormField<IUpdatePluginMetadataFormData, 'processKey'>('processKey', {
        label: t('app.governance.updatePluginMetadataAction.keyField.label'),
        fieldPrefix: `${actionFieldName}.proposedMetadata`,
        rules: { required: true, maxLength: keyMaxLength },
        trimOnBlur: true,
        defaultValue: '',
    });

    const summaryField = useFormField<IUpdatePluginMetadataFormData, 'summary'>('summary', {
        label: t('app.governance.updatePluginMetadataAction.summaryField.label'),
        fieldPrefix: `${actionFieldName}.proposedMetadata`,
        rules: { maxLength: summaryMaxLength },
        trimOnBlur: true,
        defaultValue: '',
    });

    const prepareAction = useCallback(
        async (action: IProposalAction) => {
            const { name, summary, resources } = (action as IUpdatePluginMetadataAction).proposedMetadata;
            const proposedMetadata = {
                name,
                description: summary,
                links: resources,
                ...(action.type === ProposalActionType.METADATA_PLUGIN_UPDATE && {
                    processKey: (action as IUpdatePluginMetadataAction).proposedMetadata.processKey,
                }),
            };

            const ipfsResult = await pinJsonAsync({ body: proposedMetadata });
            const hexResult = transactionUtils.cidToHex(ipfsResult.IpfsHash);

            const data = encodeFunctionData({ abi: [setMetadataAbi], args: [hexResult] });
            return data;
        },
        [pinJsonAsync],
    );

    useEffect(() => {
        addPrepareAction(ProposalActionType.METADATA_PLUGIN_UPDATE, prepareAction);
    }, [addPrepareAction, prepareAction]);

    const type = isProcess
        ? t('app.governance.updatePluginMetadataAction.process')
        : t('app.governance.updatePluginMetadataAction.plugin');

    return (
        <div className="flex w-full flex-col gap-y-6">
            <InputText
                helpText={t('app.governance.updatePluginMetadataAction.nameField.helpText', { type })}
                placeholder={t('app.governance.updatePluginMetadataAction.nameField.placeholder')}
                maxLength={nameMaxLength}
                {...nameField}
            />
            {isProcess && (
                <InputText
                    helpText={t('app.governance.updatePluginMetadataAction.keyField.helpText')}
                    placeholder={t('app.governance.updatePluginMetadataAction.keyField.placeholder')}
                    maxLength={keyMaxLength}
                    {...processKeyField}
                />
            )}
            <TextArea
                helpText={t('app.governance.updatePluginMetadataAction.summaryField.helpText', { type })}
                placeholder={t('app.governance.updatePluginMetadataAction.summaryField.placeholder')}
                maxLength={summaryMaxLength}
                isOptional={true}
                {...summaryField}
            />
            <ResourcesInput
                name="resources"
                fieldPrefix={`${actionFieldName}.proposedMetadata`}
                helpText={t('app.createDao.createDaoForm.metadata.resources.helpText')}
            />
        </div>
    );
};
