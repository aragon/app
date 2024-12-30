import { type IDialogComponentProps, useDialogContext } from '@/shared/components/dialogProvider';
import { Button, Dialog, Heading, IllustrationObject, invariant } from '@aragon/gov-ui-kit';

export interface ICreateProcessInfoDialogParams {
    /**
     * ID of the DAO to create the governance process for.
     */
    daoId: string;
}

export interface ICreateProcessInfoDialogProps extends IDialogComponentProps<ICreateProcessInfoDialogParams> {}

export const CreateProcessInfoDialog: React.FC<ICreateProcessInfoDialogProps> = (props) => {
    const { location } = props;

    invariant(location.params != null, 'CreateProcessInfoDialog: required parameters must be set.');
    const { daoId } = location.params;

    const { close } = useDialogContext();

    return (
        <Dialog.Content className="flex flex-col gap-y-6 py-10">
            <div className="px-4">
                <div className="flex flex-col gap-y-3">
                    <Heading size="h3">Create governance process</Heading>
                    <p className="text-base font-normal leading-normal text-neutral-500">
                        Define any kind of governance process to help your onchain organisation making great decisions
                        and only allow to execute what it’s right for certain decisions 😉
                    </p>
                </div>
                <div className="flex flex-col">
                    <div className="flex items-center gap-x-6 py-4">
                        <IllustrationObject
                            className="size-16 rounded-full border border-neutral-100"
                            object="LABELS"
                        />
                        <p className="grow py-4 font-normal leading-normal text-neutral-800">
                            Describe governance process
                        </p>
                        <p className="text-base font-normal leading-normal text-neutral-500">Step 1</p>
                    </div>
                    <div className="flex items-center gap-x-6 py-4">
                        <IllustrationObject className="size-16 rounded-full border border-neutral-100" object="USERS" />
                        <p className="grow py-4 font-normal leading-normal text-neutral-800">
                            Setup governance process
                        </p>
                        <p className="text-base font-normal leading-normal text-neutral-500">Step 2</p>
                    </div>
                    <div className="flex items-center gap-x-6 py-4">
                        <IllustrationObject
                            className="size-16 rounded-full border border-neutral-100"
                            object="SETTINGS"
                        />
                        <p className="grow py-4 font-normal leading-normal text-neutral-800">Manage permissions</p>
                        <p className="text-base font-normal leading-normal text-neutral-500">Step 3</p>
                    </div>
                </div>
                <div className="flex gap-x-4 pt-6">
                    <Button href={`/dao/${daoId}/create/process`} onClick={() => close()}>
                        Create new
                    </Button>
                    <Button variant="tertiary" onClick={() => close()}>
                        Cancel
                    </Button>
                </div>
            </div>
        </Dialog.Content>
    );
};
