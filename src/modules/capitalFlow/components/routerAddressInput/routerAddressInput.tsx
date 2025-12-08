import { useTranslations } from '@/shared/components/translationsProvider';
import { useFormField } from '@/shared/hooks/useFormField';
import {
    AddressInput,
    addressUtils,
    Button,
    Card,
    IconType,
    type IAddressInputResolvedValue,
} from '@aragon/gov-ui-kit';
import { useState } from 'react';
import type { IAddress } from '../../dialogs/setupStrategyDialog/setupStrategyDialogDefinitions';

interface IRouterAddressInputProps {
    /**
     * The index of this router address input in the list.
     */
    index: number;
    /**
     * The total number of router address inputs.
     */
    total: number;
    /**
     * The chain ID for address validation.
     */
    chainId: number;
    /**
     * Callback function called when the remove button is clicked.
     */
    onRemove: () => void;
    /**
     * Whether the remove button should be enabled.
     */
    canRemove: boolean;
    /**
     * Callback function called when the move up button is clicked.
     */
    onMoveUp: () => void;
    /**
     * Callback function called when the move down button is clicked.
     */
    onMoveDown: () => void;
    /**
     * Whether the move up button should be enabled.
     */
    canMoveUp: boolean;
    /**
     * Whether the move down button should be enabled.
     */
    canMoveDown: boolean;
}

/**
 * A component for inputting and managing a single router address in a multi-dispatch configuration.
 * Provides address input with validation, remove functionality, and ordering controls (move up/down).
 */
export const RouterAddressInput: React.FC<IRouterAddressInputProps> = ({
    index,
    total,
    chainId,
    onRemove,
    canRemove,
    onMoveUp,
    onMoveDown,
    canMoveUp,
    canMoveDown,
}) => {
    const { t } = useTranslations();

    const fieldPrefix = `distributionMultiDispatch.routerAddresses[${index.toString()}]`;

    const {
        onChange: onAddressChange,
        value: addressValue,
        ...addressField
    } = useFormField<IAddress, 'address'>('address', {
        rules: {
            validate: (val) => addressUtils.isAddress(val),
        },
        fieldPrefix,
    });

    const [addressInput, setAddressInput] = useState<string | undefined>(addressValue);

    const handleAddressAccept = (value?: IAddressInputResolvedValue) => {
        onAddressChange(value?.address ?? '');
    };

    return (
        <Card className="flex flex-col gap-3 border border-neutral-100 p-6 shadow-sm">
            {/* Header row: Label + Remove button */}
            <div className="flex items-center justify-between">
                <label className="text-lg leading-tight font-normal text-neutral-800">
                    {t('app.capitalFlow.setupStrategyDialog.distributionMultiDispatch.addressLabel')}
                </label>
                <Button
                    variant="tertiary"
                    size="sm"
                    iconLeft={IconType.CLOSE}
                    onClick={onRemove}
                    disabled={!canRemove}
                    className={canRemove ? '' : 'invisible'}
                    aria-label={t('app.capitalFlow.setupStrategyDialog.distributionMultiDispatch.remove')}
                />
            </div>

            {/* Input row: AddressInput + Ordering controls */}
            <div className="flex items-center gap-4">
                <div className="flex-1">
                    <AddressInput
                        value={addressInput}
                        onChange={setAddressInput}
                        onAccept={handleAddressAccept}
                        chainId={chainId}
                        placeholder={t('app.capitalFlow.setupStrategyDialog.distributionMultiDispatch.placeholder')}
                        {...addressField}
                    />
                </div>

                <div className="flex items-center gap-3">
                    <Button
                        variant="tertiary"
                        size="sm"
                        iconLeft={IconType.CHEVRON_UP}
                        onClick={onMoveUp}
                        disabled={!canMoveUp}
                        aria-label={t('app.capitalFlow.setupStrategyDialog.distributionMultiDispatch.moveUp')}
                    />
                    <span className="text-sm leading-tight font-normal text-neutral-500">
                        {t('app.capitalFlow.setupStrategyDialog.distributionMultiDispatch.positionCounter', {
                            current: index + 1,
                            total,
                        })}
                    </span>
                    <Button
                        variant="tertiary"
                        size="sm"
                        iconLeft={IconType.CHEVRON_DOWN}
                        onClick={onMoveDown}
                        disabled={!canMoveDown}
                        aria-label={t('app.capitalFlow.setupStrategyDialog.distributionMultiDispatch.moveDown')}
                    />
                </div>
            </div>
        </Card>
    );
};
