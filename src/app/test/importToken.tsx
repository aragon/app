import { Link } from '@/shared/components/link';
import { ITransactionStatusStepMeta, TransactionStatus } from '@/shared/components/transactionStatus';
import { useTranslations } from '@/shared/components/translationsProvider';
import type { IStepperStep } from '@/shared/utils/stepperUtils';
import { AddressInput, addressUtils, AlertCard, Heading, type IAddressInputResolvedValue } from '@aragon/gov-ui-kit';
import { useState } from 'react';

const checkSteps: Array<IStepperStep<ITransactionStatusStepMeta>> = [
    {
        id: 'erc20',
        order: 0,
        meta: {
            label: 'ERC-20 token standard',
            state: 'pending', //idle, pending, success, error, warning
        },
    },
    {
        id: 'governance',
        order: 0,
        meta: {
            label: 'Governance compatible',
            state: 'error', //idle, pending, success, error, warning
        },
    },
    {
        id: 'delegation',
        order: 0,
        meta: {
            label: 'Delegation compatible',
            state: 'success', //idle, pending, success, error, warning
        },
    },
];
export const ImportTokenCheck = () => {
    const { t } = useTranslations();
    const [toketnAddressInput, settoketnAddressInput] = useState<string | undefined>();

    const handleTokenAddressChange = (value?: IAddressInputResolvedValue) => {
        console.log('VALUE TO CHECK', value);
    };
    return (
        <div className="flex flex-col gap-4 rounded-xl border border-neutral-100 bg-neutral-0 p-4 shadow-neutral-sm md:gap-6 md:p-6">
            {/*Address check*/}
            <div className="flex flex-col gap-2 md:gap-3">
                <AddressInput
                    label="Contract address"
                    placeholder={t('app.finance.transferAssetForm.receiver.placeholder')}
                    chainId={1}
                    value={toketnAddressInput}
                    onChange={settoketnAddressInput}
                    onAccept={handleTokenAddressChange}
                />

                <TransactionStatus.Container steps={checkSteps}>
                    <Heading size="h4">{addressUtils.truncateAddress(toketnAddressInput)}</Heading>
                    {checkSteps.map((step) => (
                        <TransactionStatus.Step key={step.id} {...step} />
                    ))}
                </TransactionStatus.Container>
            </div>

            {/* Alerts*/}
            <RequiresWrappingWarning />
            <NotCompatibleError />
        </div>
    );
};

const RequiresWrappingWarning = () => {
    return (
        <AlertCard
            variant="warning"
            message="Requires wrapping"
            description={
                <div className="flex flex-col gap-3">
                    <div>
                        <p>This token must be wrapped by its holders to be used in governance.</p>
                        <br />
                        <p>
                            Token holders will be able to wrap their tokens at any time to receive equivalent governance
                            tokens, which can be used to vote on proposals. They can unwrap at any time to receive their
                            original tokens.
                        </p>
                    </div>

                    <Link
                        href="https://docs.aragon.org/token-voting/1.x/importing-existent-tokens.html"
                        target="_blank"
                    >
                        Learn more
                    </Link>
                </div>
            }
        />
    );
};

const NotCompatibleError = () => {
    return (
        <AlertCard
            variant="critical"
            message="Not compatible"
            description={
                <div className="flex flex-col gap-3">
                    <p>The address isn’t a valid ERC-20 address and therefore can't be used in governance.</p>

                    <Link
                        href="https://docs.aragon.org/token-voting/1.x/importing-existent-tokens.html"
                        target="_blank"
                    >
                        Learn more
                    </Link>
                </div>
            }
        />
    );
};
