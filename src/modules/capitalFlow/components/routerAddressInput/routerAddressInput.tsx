import {
    AddressInput,
    addressUtils,
    Button,
    Card,
    type IAddressInputResolvedValue,
    type ICompositeAddress,
    IconType,
} from '@aragon/gov-ui-kit';
import { useState } from 'react';
import { useTranslations } from '@/shared/components/translationsProvider';
import { useFormField } from '@/shared/hooks/useFormField';

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

export const RouterAddressInput: React.FC<IRouterAddressInputProps> = (props) => {
    const { index, total, chainId, onRemove, canRemove, onMoveUp, onMoveDown, canMoveUp, canMoveDown } = props;
    const { t } = useTranslations();

    const fieldPrefix = `distributionMultiDispatch.routerAddresses[${index.toString()}]`;

    const {
        onChange: onAddressChange,
        value: addressValue,
        ...addressField
    } = useFormField<ICompositeAddress, 'address'>('address', {
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
                <label className="font-normal text-lg text-neutral-800 leading-tight">
                    {t('app.capitalFlow.setupStrategyDialog.distributionMultiDispatch.addressLabel')}
                </label>
                <Button
                    aria-label={t('app.capitalFlow.setupStrategyDialog.distributionMultiDispatch.remove')}
                    className={canRemove ? '' : 'invisible'}
                    disabled={!canRemove}
                    iconLeft={IconType.CLOSE}
                    onClick={onRemove}
                    size="sm"
                    variant="tertiary"
                />
            </div>

            {/* Input row: AddressInput + Ordering controls */}
            <div className="flex items-center gap-4">
                <div className="flex-1">
                    <AddressInput
                        chainId={chainId}
                        onAccept={handleAddressAccept}
                        onChange={setAddressInput}
                        placeholder={t('app.capitalFlow.setupStrategyDialog.distributionMultiDispatch.placeholder')}
                        value={addressInput}
                        {...addressField}
                    />
                </div>

                <div className="flex items-center gap-3">
                    <Button
                        aria-label={t('app.capitalFlow.setupStrategyDialog.distributionMultiDispatch.moveUp')}
                        disabled={!canMoveUp}
                        iconLeft={IconType.CHEVRON_UP}
                        onClick={onMoveUp}
                        size="sm"
                        variant="tertiary"
                    />
                    <span className="font-normal text-neutral-500 text-sm leading-tight">
                        {t('app.capitalFlow.setupStrategyDialog.distributionMultiDispatch.positionCounter', {
                            current: index + 1,
                            total,
                        })}
                    </span>
                    <Button
                        aria-label={t('app.capitalFlow.setupStrategyDialog.distributionMultiDispatch.moveDown')}
                        disabled={!canMoveDown}
                        iconLeft={IconType.CHEVRON_DOWN}
                        onClick={onMoveDown}
                        size="sm"
                        variant="tertiary"
                    />
                </div>
            </div>
        </Card>
    );
};
