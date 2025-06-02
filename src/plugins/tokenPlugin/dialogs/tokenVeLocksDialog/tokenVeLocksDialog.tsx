import type { IDialogComponentProps } from '@/shared/components/dialogProvider';
import { useTranslations } from '@/shared/components/translationsProvider';
import { Avatar, Button, DataList, Dialog, Heading, invariant, Tag } from '@aragon/gov-ui-kit';
import { useRouter } from 'next/navigation';
import type { ITokenVeLock } from '../../types';

export interface ITokenVeLocksDialogParams {
    /**
     * Action to be performed.
     */
    locks: ITokenVeLock[];
}

export interface ITokenVeLocksDialogProps extends IDialogComponentProps<ITokenVeLocksDialogParams> {}

export const TokenVeLocksDialog: React.FC<ITokenVeLocksDialogProps> = (props) => {
    const { location } = props;
    invariant(location.params != null, 'TokenVeLocksDialog: required parameters must be set.');

    const { locks } = location.params;

    const { t } = useTranslations();
    const router = useRouter();

    const hasMultiplier = true;

    return (
        <>
            <Dialog.Header title="Your locks" />
            <Dialog.Content description="Unlock or withdraw your PDT tokens" className="pb-4 md:pb-6">
                <DataList.Root entityLabel="Locks" pageSize={6} itemsCount={22}>
                    <DataList.Container>
                        <DataList.Item className="flex flex-col gap-4 py-4 md:py-6">
                            <div className="flex justify-between">
                                <div className="flex items-center gap-3 md:gap-4">
                                    <Avatar
                                        fallback={
                                            <span className="flex size-full items-center justify-center bg-primary-400 text-neutral-0">
                                                TI
                                            </span>
                                        }
                                    />
                                    <Heading size="h4">ID: 54</Heading>
                                </div>
                                <div className="flex items-center gap-2 md:gap-3">
                                    <p className="text-sm leading-tight text-neutral-500 md:text-base">3 days left</p>
                                    <Tag label="Active" variant="primary" />
                                </div>
                            </div>
                            <hr className="border-neutral-100" />
                            <div className="grid grid-cols-3 gap-4 text-base leading-tight text-neutral-800 md:text-lg">
                                {[
                                    { label: 'Locked', value: '280.2' },
                                    { label: 'Multiplier', value: '3.5x', hidden: hasMultiplier },
                                    { label: 'Voting power', value: '1280.2' },
                                ]
                                    .filter((val) => !val.hidden)
                                    .map(({ label, value }) => (
                                        <div key="label" className="flex flex-col">
                                            <div className="text-sm text-neutral-500 md:text-base">{label}</div>
                                            <div>{value}</div>
                                        </div>
                                    ))}
                            </div>
                            <div className="flex flex-col items-center gap-3 md:flex-row md:gap-4">
                                <Button disabled={true} className="w-full md:w-auto" variant="tertiary" size="md">
                                    Withdraw PDT
                                </Button>
                                <p className="text-sm leading-normal text-neutral-500">
                                    5 days left until withdrawable
                                </p>
                            </div>
                        </DataList.Item>
                    </DataList.Container>
                    <DataList.Pagination />
                </DataList.Root>
            </Dialog.Content>
        </>
    );
};
