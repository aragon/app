import {
    WorkspaceAccountType,
    WorkspaceGateRequirement,
} from '../../api/workspaceService';
import {
    generateWorkspaceDetails,
    generateWorkspaceGate,
    generateWorkspaceGateHolder,
    generateWorkspaceGateSelector,
    generateWorkspaceTarget,
} from '../../testUtils';
import { workspaceUtils } from './workspaceUtils';

describe('workspaceUtils', () => {
    const daoAddress = '0x652a31c669f9AB37f6040f279139a75D04F2679e';
    const operatorAddress = '0x1703ed1bFacC04b7eB654b297aA4E52EBC008722';
    const firstTarget = '0x974E865B1BB24AF2a9ef8204AdEA9251Cc7C5FD9';
    const secondTarget = '0xd0F6F372Ae2b640AE3b3875100Ce301d66f74607';

    describe('getGatesCapabilityCount', () => {
        it('counts each selector once when several gates protect the same function', () => {
            const gates = [
                generateWorkspaceGate({
                    selectors: [
                        generateWorkspaceGateSelector({
                            selector: '0xaaaaaaaa',
                        }),
                        generateWorkspaceGateSelector({
                            selector: '0xbbbbbbbb',
                        }),
                    ],
                }),
                generateWorkspaceGate({
                    selectors: [
                        generateWorkspaceGateSelector({
                            selector: '0xbbbbbbbb',
                        }),
                    ],
                }),
            ];

            expect(workspaceUtils.getGatesCapabilityCount(gates)).toEqual(2);
        });
    });

    describe('getTargetCapabilityCount', () => {
        it('counts the distinct selectors gated on the target', () => {
            const target = generateWorkspaceTarget({
                gates: [
                    generateWorkspaceGate({
                        selectors: [
                            generateWorkspaceGateSelector({
                                selector: '0xaaaaaaaa',
                            }),
                        ],
                    }),
                ],
            });

            expect(workspaceUtils.getTargetCapabilityCount(target)).toEqual(1);
        });
    });

    describe('getAccounts', () => {
        it('groups the holders of every gate into accounts with their targets and capabilities', () => {
            const workspace = generateWorkspaceDetails({
                targets: [
                    generateWorkspaceTarget({
                        address: firstTarget,
                        gates: [
                            generateWorkspaceGate({
                                roleName: 'GOVERNANCE_ROLE',
                                holders: [
                                    generateWorkspaceGateHolder({
                                        address: daoAddress,
                                    }),
                                ],
                                selectors: [
                                    generateWorkspaceGateSelector({
                                        selector: '0xaaaaaaaa',
                                    }),
                                    generateWorkspaceGateSelector({
                                        selector: '0xbbbbbbbb',
                                    }),
                                ],
                            }),
                        ],
                    }),
                    generateWorkspaceTarget({
                        address: secondTarget,
                        gates: [
                            generateWorkspaceGate({
                                requirement: WorkspaceGateRequirement.OWNER,
                                holders: [
                                    generateWorkspaceGateHolder({
                                        address: operatorAddress,
                                        type: WorkspaceAccountType.EOA,
                                    }),
                                ],
                                selectors: [
                                    generateWorkspaceGateSelector({
                                        selector: '0xcccccccc',
                                    }),
                                ],
                            }),
                        ],
                    }),
                ],
            });

            const accounts = workspaceUtils.getAccounts(workspace);

            expect(accounts).toHaveLength(2);
            expect(accounts[0].address).toEqual(daoAddress);
            expect(accounts[0].capabilityCount).toEqual(2);
            expect(accounts[0].gateCount).toEqual(1);
            expect(accounts[0].targets).toHaveLength(1);
            expect(accounts[0].targets[0].address).toEqual(firstTarget);
            expect(accounts[1].address).toEqual(operatorAddress);
            expect(accounts[1].type).toEqual(WorkspaceAccountType.EOA);
        });

        it('merges the same holder across gates and targets regardless of address casing', () => {
            const workspace = generateWorkspaceDetails({
                targets: [
                    generateWorkspaceTarget({
                        address: firstTarget,
                        gates: [
                            generateWorkspaceGate({
                                holders: [
                                    generateWorkspaceGateHolder({
                                        address: daoAddress,
                                    }),
                                ],
                                selectors: [
                                    generateWorkspaceGateSelector({
                                        selector: '0xaaaaaaaa',
                                    }),
                                ],
                            }),
                            generateWorkspaceGate({
                                holders: [
                                    generateWorkspaceGateHolder({
                                        address: daoAddress.toLowerCase(),
                                    }),
                                ],
                                selectors: [
                                    generateWorkspaceGateSelector({
                                        selector: '0xbbbbbbbb',
                                    }),
                                ],
                            }),
                        ],
                    }),
                    generateWorkspaceTarget({
                        address: secondTarget,
                        gates: [
                            generateWorkspaceGate({
                                holders: [
                                    generateWorkspaceGateHolder({
                                        address: daoAddress.toUpperCase(),
                                    }),
                                ],
                                selectors: [
                                    generateWorkspaceGateSelector({
                                        selector: '0xcccccccc',
                                    }),
                                ],
                            }),
                        ],
                    }),
                ],
            });

            const accounts = workspaceUtils.getAccounts(workspace);

            expect(accounts).toHaveLength(1);
            expect(accounts[0].gateCount).toEqual(3);
            expect(accounts[0].capabilityCount).toEqual(3);
            expect(accounts[0].targets).toHaveLength(2);
        });

        it('counts a selector once per target when the account holds two gates covering it', () => {
            const sharedSelector = generateWorkspaceGateSelector({
                selector: '0xaaaaaaaa',
            });
            const workspace = generateWorkspaceDetails({
                targets: [
                    generateWorkspaceTarget({
                        address: firstTarget,
                        gates: [
                            generateWorkspaceGate({
                                roleName: 'GOVERNANCE_ROLE',
                                holders: [
                                    generateWorkspaceGateHolder({
                                        address: daoAddress,
                                    }),
                                ],
                                selectors: [sharedSelector],
                            }),
                            generateWorkspaceGate({
                                roleName: 'DEFAULT_ADMIN_ROLE',
                                holders: [
                                    generateWorkspaceGateHolder({
                                        address: daoAddress,
                                    }),
                                ],
                                selectors: [sharedSelector],
                            }),
                        ],
                    }),
                ],
            });

            const accounts = workspaceUtils.getAccounts(workspace);

            expect(accounts[0].gateCount).toEqual(2);
            expect(accounts[0].capabilityCount).toEqual(1);
        });

        it('sorts the accounts by the number of capabilities they control', () => {
            const workspace = generateWorkspaceDetails({
                targets: [
                    generateWorkspaceTarget({
                        address: firstTarget,
                        gates: [
                            generateWorkspaceGate({
                                holders: [
                                    generateWorkspaceGateHolder({
                                        address: operatorAddress,
                                    }),
                                ],
                                selectors: [
                                    generateWorkspaceGateSelector({
                                        selector: '0xaaaaaaaa',
                                    }),
                                ],
                            }),
                            generateWorkspaceGate({
                                holders: [
                                    generateWorkspaceGateHolder({
                                        address: daoAddress,
                                    }),
                                ],
                                selectors: [
                                    generateWorkspaceGateSelector({
                                        selector: '0xbbbbbbbb',
                                    }),
                                    generateWorkspaceGateSelector({
                                        selector: '0xcccccccc',
                                    }),
                                ],
                            }),
                        ],
                    }),
                ],
            });

            const accounts = workspaceUtils.getAccounts(workspace);

            expect(accounts.map((account) => account.address)).toEqual([
                daoAddress,
                operatorAddress,
            ]);
        });
    });

    describe('getSignals', () => {
        it('returns no findings for a workspace held only by DAOs', () => {
            const workspace = generateWorkspaceDetails({
                targets: [
                    generateWorkspaceTarget({
                        gates: [
                            generateWorkspaceGate({
                                holders: [generateWorkspaceGateHolder()],
                            }),
                        ],
                    }),
                ],
            });

            expect(workspaceUtils.getSignals(workspace)).toEqual({
                pendingOwnerTargets: [],
                delegatedAuthorityTargets: [],
                failedTargets: [],
                unclaimedGateTargets: [],
                externalAccounts: [],
                inferredGateCount: 0,
            });
        });

        it('flags pending ownership, authorities, errors, unclaimed gates, external accounts and inferred gates', () => {
            const workspace = generateWorkspaceDetails({
                targets: [
                    generateWorkspaceTarget({
                        address: firstTarget,
                        pendingOwner: daoAddress,
                        error: 'Source not verified',
                        gates: [
                            generateWorkspaceGate({ holders: [] }),
                            generateWorkspaceGate({
                                inferred: true,
                                holders: [
                                    generateWorkspaceGateHolder({
                                        address: operatorAddress,
                                        type: WorkspaceAccountType.EOA,
                                    }),
                                ],
                            }),
                        ],
                    }),
                    generateWorkspaceTarget({
                        address: secondTarget,
                        authority: daoAddress,
                    }),
                ],
            });

            expect(workspaceUtils.getSignals(workspace)).toEqual({
                pendingOwnerTargets: [firstTarget],
                delegatedAuthorityTargets: [secondTarget],
                failedTargets: [firstTarget],
                unclaimedGateTargets: [firstTarget],
                externalAccounts: [operatorAddress],
                inferredGateCount: 1,
            });
        });
    });
});
