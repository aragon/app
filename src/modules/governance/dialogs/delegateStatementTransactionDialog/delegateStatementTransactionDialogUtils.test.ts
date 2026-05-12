import { decodeFunctionData } from 'viem';
import { namehash } from 'viem/ens';
import { Network } from '@/shared/api/daoService';
import { delegateStatementTransactionDialogUtils } from './delegateStatementTransactionDialogUtils';
import { ensPublicResolverAbi } from './ensPublicResolverAbi';

const RESOLVER = '0xResolverResolverResolverResolverResolver01' as const;
const TOKEN_ADDRESS = '0x1234ABCDef1234ABCDef1234ABCDef1234ABCDef';
const ENS_NAME = 'whomst.eth';
const CID = 'bafyTestCidValue';

describe('delegateStatementTransactionDialogUtils.buildTransaction', () => {
    it('builds an ENS setText call with value=ipfs://<cid>', () => {
        const tx = delegateStatementTransactionDialogUtils.buildTransaction({
            resolverAddress: RESOLVER,
            ensName: ENS_NAME,
            network: Network.ETHEREUM_MAINNET,
            tokenAddress: TOKEN_ADDRESS,
            cid: CID,
        });

        expect(tx.to).toBe(RESOLVER);
        expect(tx.value).toBe(BigInt(0));

        const decoded = decodeFunctionData({
            abi: ensPublicResolverAbi,
            data: tx.data,
        });
        expect(decoded.functionName).toBe('setText');
        expect(decoded.args[2]).toBe(`ipfs://${CID}`);
    });

    it('formats the setText key as <eip3770Shortname>.<lowercase tokenAddress>.delegate on mainnet', () => {
        const tx = delegateStatementTransactionDialogUtils.buildTransaction({
            resolverAddress: RESOLVER,
            ensName: ENS_NAME,
            network: Network.ETHEREUM_MAINNET,
            tokenAddress: TOKEN_ADDRESS,
            cid: CID,
        });

        const decoded = decodeFunctionData({
            abi: ensPublicResolverAbi,
            data: tx.data,
        });
        expect(decoded.args[1]).toBe(
            'eth.0x1234abcdef1234abcdef1234abcdef1234abcdef.delegate',
        );
    });

    it('passes the ENS namehash as the node argument', () => {
        const tx = delegateStatementTransactionDialogUtils.buildTransaction({
            resolverAddress: RESOLVER,
            ensName: ENS_NAME,
            network: Network.ETHEREUM_MAINNET,
            tokenAddress: TOKEN_ADDRESS,
            cid: CID,
        });

        const decoded = decodeFunctionData({
            abi: ensPublicResolverAbi,
            data: tx.data,
        });
        expect(decoded.args[0]).toBe(namehash(ENS_NAME));
    });

    it('uses the canonical EIP-3770 shortname for non-mainnet networks', () => {
        const tx = delegateStatementTransactionDialogUtils.buildTransaction({
            resolverAddress: RESOLVER,
            ensName: ENS_NAME,
            network: Network.POLYGON_MAINNET,
            tokenAddress: TOKEN_ADDRESS,
            cid: CID,
        });

        const decoded = decodeFunctionData({
            abi: ensPublicResolverAbi,
            data: tx.data,
        });
        expect(decoded.args[1]).toBe(
            'matic.0x1234abcdef1234abcdef1234abcdef1234abcdef.delegate',
        );
    });

    it('uses the generic "test" namespace for testnet networks', () => {
        const tx = delegateStatementTransactionDialogUtils.buildTransaction({
            resolverAddress: RESOLVER,
            ensName: ENS_NAME,
            network: Network.ETHEREUM_SEPOLIA,
            tokenAddress: TOKEN_ADDRESS,
            cid: CID,
        });

        const decoded = decodeFunctionData({
            abi: ensPublicResolverAbi,
            data: tx.data,
        });
        expect(decoded.args[1]).toBe(
            'test.0x1234abcdef1234abcdef1234abcdef1234abcdef.delegate',
        );
    });
});
