import { GukModulesProvider } from '@aragon/gov-ui-kit';
import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useEffect, useState } from 'react';
import {
    FormProvider,
    type UseFormReturn,
    useForm,
    useFormContext,
} from 'react-hook-form';
import { encodeFunctionData } from 'viem';
import { useProposalActionsField } from '@/modules/governance/hooks/useProposalActionsField';
import { ReactQueryWrapper } from '@/shared/testUtils';
import { PermissionActionCreate } from './components/permissionActionCreate';
import { permissionActionAbis } from './constants/permissionActionSelectors';

describe('permission action reordering', () => {
    const daoAddress = '0x9332000000000000000000000000000000000A62';
    const mintReceiver = '0xAAAA000000000000000000000000000000000001';
    const mintData = '0xdeadbeef';

    const grantValues = {
        where: '0x1111111111111111111111111111111111111111',
        who: '0x2222222222222222222222222222222222222222',
        permissionId: `0x${'11'.repeat(32)}`,
    };

    const grantAction = {
        fieldId: 'action-grant',
        type: 'PERMISSION_GRANT',
        from: '',
        to: daoAddress,
        data: '0x',
        value: '0',
        inputData: {
            function: 'grant',
            contract: 'DAO',
            stateMutability: 'nonpayable',
            parameters: [
                { name: '_where', type: 'address', value: grantValues.where },
                { name: '_who', type: 'address', value: grantValues.who },
                {
                    name: '_permissionId',
                    type: 'bytes32',
                    value: grantValues.permissionId,
                },
            ],
        },
    };

    const mintAction = {
        fieldId: 'action-mint',
        type: 'MINT_TOKENS',
        from: '',
        to: '0xBBBB000000000000000000000000000000000002',
        data: '0x',
        value: '0',
        inputData: {
            function: 'mint',
            contract: 'Token',
            stateMutability: 'nonpayable',
            parameters: [{ name: 'to', type: 'address', value: '' }],
        },
    };

    const expectedGrantData = encodeFunctionData({
        abi: [permissionActionAbis.grant],
        args: [grantValues.where, grantValues.who, grantValues.permissionId],
    });

    // Same effect shape as tokenMintTokensAction, which is what exposed the bug.
    const MintLikeAction: React.FC<{ index: number }> = ({ index }) => {
        const { setValue } = useFormContext();
        const [receiver] = useState(mintReceiver);
        const fieldName = `actions.${index.toString()}`;

        useEffect(() => {
            setValue(`${fieldName}.data`, mintData);
        }, [setValue, fieldName]);

        useEffect(() => {
            setValue(`${fieldName}.inputData.parameters.0.value`, receiver);
        }, [receiver, fieldName, setValue]);

        return <p>mint action</p>;
    };

    const Harness = () => {
        const { actionsMerged, getArrayControls } = useProposalActionsField();

        return (
            <>
                {actionsMerged.map((action, index) =>
                    action.type === 'MINT_TOKENS' ? (
                        <MintLikeAction index={index} key={action.fieldId} />
                    ) : (
                        <PermissionActionCreate
                            action={action as never}
                            chainId={1}
                            index={index}
                            key={action.fieldId}
                        />
                    ),
                )}
                <button
                    onClick={() => getArrayControls(1).moveUp.onClick(1)}
                    type="button"
                >
                    move up
                </button>
            </>
        );
    };

    let formMethods: UseFormReturn | undefined;

    const TestForm = () => {
        const methods = useForm({
            mode: 'onTouched',
            defaultValues: { actions: [mintAction, grantAction] },
        });
        formMethods = methods as unknown as UseFormReturn;

        return (
            <GukModulesProvider>
                <ReactQueryWrapper>
                    <FormProvider {...methods}>
                        <Harness />
                    </FormProvider>
                </ReactQueryWrapper>
            </GukModulesProvider>
        );
    };

    const valueAt = (actionIndex: number, parameterIndex: number) =>
        formMethods?.getValues(
            `actions.${actionIndex.toString()}.inputData.parameters.${parameterIndex.toString()}.value`,
        );

    const dataAt = (actionIndex: number) =>
        formMethods?.getValues(`actions.${actionIndex.toString()}.data`);

    const flushEffects = async () => {
        await act(async () => {
            await new Promise((resolve) => setTimeout(resolve, 0));
        });
    };

    it('keeps every action with its own values and calldata after a reorder', async () => {
        const user = userEvent.setup();
        render(<TestForm />);
        await flushEffects();

        expect(dataAt(0)).toEqual(mintData);
        expect(valueAt(0, 0)).toEqual(mintReceiver);
        expect(dataAt(1)).toEqual(expectedGrantData);

        await act(async () => {
            await formMethods?.trigger('actions');
        });

        await user.click(screen.getByRole('button', { name: 'move up' }));
        await flushEffects();

        expect(valueAt(0, 0)).toEqual(grantValues.where);
        expect(valueAt(0, 1)).toEqual(grantValues.who);
        expect(valueAt(0, 2)).toEqual(grantValues.permissionId);
        expect(dataAt(0)).toEqual(expectedGrantData);
        expect(valueAt(1, 0)).toEqual(mintReceiver);
        expect(dataAt(1)).toEqual(mintData);
    }, 30_000);
});
