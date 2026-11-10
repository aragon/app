import { ProposalStatus } from '@aragon/gov-ui-kit';
import { generateSafeMultisigTransaction } from '../../testUtils';
import { safeMultisigProposalUtils } from './safeMultisigProposalUtils';

describe('safeMultisigProposal utils', () => {
    describe('getTransactionStatus', () => {
        it.each([
            { nonce: '10', isExecuted: false, status: ProposalStatus.ACTIVE },
            { nonce: '9', isExecuted: false, status: ProposalStatus.EXPIRED },
            { nonce: '9', isExecuted: true, status: ProposalStatus.EXECUTED },
        ])(
            'maps a transaction at nonce $nonce to $status',
            ({ nonce, isExecuted, status }) => {
                const transaction = generateSafeMultisigTransaction({
                    nonce,
                    isExecuted,
                });

                expect(
                    safeMultisigProposalUtils.getTransactionStatus({
                        transaction,
                        currentNonce: '10',
                    }),
                ).toEqual(status);
            },
        );
    });
});
