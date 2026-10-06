import * as GovUiKit from '@aragon/gov-ui-kit';
import { render, screen } from '@testing-library/react';
import { zeroAddress } from 'viem';
import { generateToken } from '@/modules/finance/testUtils';
import {
    type IProposalActionWithdrawToken,
    ProposalActionType,
} from '@/modules/governance/api/governanceService';
import type { IProposalActionData } from '@/modules/governance/components/createProposalForm';
import { generateProposalActionWithdrawToken } from '@/modules/governance/testUtils';
import {
    type IWithdrawTokenActionDetailsProps,
    WithdrawTokenActionDetails,
} from './withdrawTokenActionDetails';

describe('<WithdrawTokenActionDetails /> component', () => {
    const assetTransferSpy = jest.spyOn(GovUiKit, 'AssetTransfer');

    beforeEach(() => {
        assetTransferSpy.mockReturnValue(<div data-testid="asset-transfer" />);
    });

    afterEach(() => {
        assetTransferSpy.mockReset();
    });

    const buildAction = (
        action?: Partial<IProposalActionWithdrawToken>,
    ): IProposalActionData => ({
        ...generateProposalActionWithdrawToken(action),
        daoId: 'dao-id',
        meta: undefined,
    });

    const createTestComponent = (
        props?: Partial<IWithdrawTokenActionDetailsProps>,
    ) => {
        const completeProps: IWithdrawTokenActionDetailsProps = {
            action: buildAction(),
            index: 0,
            ...props,
        };

        return <WithdrawTokenActionDetails {...completeProps} />;
    };

    it('renders the transfer through the AssetTransfer component', () => {
        render(createTestComponent());
        expect(screen.getByTestId('asset-transfer')).toBeInTheDocument();
    });

    it('passes the transfer details to AssetTransfer and formats the amount with the token decimals', () => {
        const token = generateToken({
            address: '0x95ad61b0a150d79219dcf64e1e6cc01f0b64c4ce',
            name: 'Shiba Inu',
            symbol: 'SHIB',
            logo: 'shib-logo.png',
            priceUsd: '0.00002459',
            decimals: 18,
        });
        const withdrawAction = generateProposalActionWithdrawToken({
            sender: { address: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e' },
            receiver: {
                address: '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045',
                name: 'vitalik.eth',
            },
            amount: '1500000000000000000',
            token,
        });

        render(
            createTestComponent({
                action: buildAction(withdrawAction),
                chainId: 137,
            }),
        );

        expect(assetTransferSpy).toHaveBeenCalledWith(
            expect.objectContaining({
                sender: withdrawAction.sender,
                recipient: withdrawAction.receiver,
                assetAmount: '1.5',
                assetName: token.name,
                assetSymbol: token.symbol,
                assetIconSrc: token.logo,
                assetAddress: token.address,
                assetFiatPrice: token.priceUsd,
                chainId: 137,
            }),
            undefined,
        );
    });

    it('forwards the zero address as asset address for native transfers', () => {
        const token = generateToken({
            address: zeroAddress,
            name: 'Ether',
            symbol: 'ETH',
            decimals: 18,
        });
        const withdrawAction = generateProposalActionWithdrawToken({
            type: ProposalActionType.TRANSFER_NATIVE,
            amount: '2000000000000000000',
            token,
        });

        render(createTestComponent({ action: buildAction(withdrawAction) }));

        expect(assetTransferSpy).toHaveBeenCalledWith(
            expect.objectContaining({
                assetAddress: zeroAddress,
                assetAmount: '2',
                assetSymbol: 'ETH',
            }),
            undefined,
        );
    });
});
