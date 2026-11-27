import classNames from 'classnames';
import { useContext, useId } from 'react';
import { mainnet } from 'viem/chains';
import { useEnsName } from 'wagmi';
import { AddressOutput, addressUtils, InteractiveAncestorContext, StateSkeletonBar } from '../../../core';
import { AddressResolutionContext } from '../../../core/components/addressResolution/addressResolutionProvider';
import type { ICompositeAddress, IWeb3ComponentProps } from '../../types';
import { useGukModulesContext } from '../gukModulesProvider';
import { MemberAvatar } from '../member';

export interface IWalletProps extends React.ButtonHTMLAttributes<HTMLButtonElement>, IWeb3ComponentProps {
    /**
     * The connected user details.
     */
    user?: ICompositeAddress;
}

/**
 * Our Wallet button implementation is intentionally minimal for full flexibility.
 * As a controlled component you can pass the user details and connectivity actions to the component.
 * This includes a global connected state, likely from your WAGMI provider.
 *
 * Usage notes:
 *
 * - The connected handle is hidden below the `md` breakpoint, leaving only the avatar. Without a `user.name`, the
 *   address is named by the nearest `AddressResolutionProvider` (an address book or ENS name). With no provider, the
 *   Wallet looks up the ENS name itself. Without a name the address shows short.
 * - Render it inside `GukModulesProvider`, even when no user is connected: its wagmi ENS-name hook is always mounted
 *   and only disabled, so it needs the provider's wagmi and React Query context.
 */
export const Wallet: React.FC<IWalletProps> = (props) => {
    const { user, className, chainId = mainnet.id, wagmiConfig, ...otherProps } = props;

    const { copy } = useGukModulesContext();

    // Without a provider nothing resolves, so the Wallet keeps ENS names by looking them up itself.
    const hasResolution = useContext(AddressResolutionContext) != null;
    const { data: ensName, isLoading: isEnsLoading } = useEnsName({
        address: user == null ? undefined : addressUtils.getChecksum(user.address),
        query: { enabled: user != null && user.name == null && !hasResolution },
        chainId,
        config: wagmiConfig,
    });

    const contentId = useId();

    const buttonClassName = classNames(
        'flex max-w-48 cursor-pointer items-center gap-3 rounded-full border border-neutral-100 bg-neutral-0 text-neutral-500 transition-all',
        'focus-ring-primary hover:border-neutral-200 active:bg-neutral-50 active:text-neutral-800 disabled:cursor-default',
        { 'px-4 py-2.5': user == null },
        { 'p-1 md:pl-4': user != null },
        className,
    );

    return (
        <div className={classNames(buttonClassName, 'relative')}>
            <button
                {...otherProps}
                aria-labelledby={contentId}
                className="absolute inset-0 z-0 cursor-pointer rounded-full border-0 bg-transparent p-0 focus-ring-primary disabled:cursor-default"
            />
            <InteractiveAncestorContext.Provider value={true}>
                <div
                    className="pointer-events-none relative z-10 flex w-full items-center gap-3 [&_[role=button]]:pointer-events-auto [&_a]:pointer-events-auto [&_button]:pointer-events-auto"
                    id={contentId}
                >
                    {!user && copy.wallet.connect}
                    {user && isEnsLoading && <StateSkeletonBar className="block max-md:hidden" size="lg" width={56} />}
                    {user && !isEnsLoading && (
                        <AddressOutput
                            address={user.address}
                            className="truncate max-md:hidden"
                            label={user.name ?? ensName ?? undefined}
                        />
                    )}
                    {user && (
                        <MemberAvatar
                            address={user.address}
                            avatarSrc={user.avatarSrc}
                            chainId={chainId}
                            ensName={user.name}
                            size="lg"
                            wagmiConfig={wagmiConfig}
                        />
                    )}
                </div>
            </InteractiveAncestorContext.Provider>
        </div>
    );
};
