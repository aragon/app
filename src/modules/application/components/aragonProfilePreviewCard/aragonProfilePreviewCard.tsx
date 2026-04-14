'use client';

import { Card, MemberAvatar, Tag } from '@aragon/gov-ui-kit';
import type { Address } from 'viem';
import { useTranslations } from '@/shared/components/translationsProvider';

/** Props for {@link AragonProfilePreviewCard}. */
export interface IAragonProfilePreviewCardProps {
    /** Wallet address of the profile owner. */
    address?: Address;
    /** ENS name to display as the profile label. */
    label: string;
    /** Optional avatar image URL. */
    avatarSrc?: string;
    /** Optional ENS name passed to MemberAvatar for avatar resolution. */
    ensName?: string;
}

export const AragonProfilePreviewCard: React.FC<
    IAragonProfilePreviewCardProps
> = (props) => {
    const { address, label, avatarSrc, ensName } = props;

    const { t } = useTranslations();

    return (
        <Card className="w-full border border-neutral-100 px-6 py-0 shadow-neutral-sm">
            <div className="flex flex-col gap-3 py-6">
                <div className="flex items-center gap-4">
                    <MemberAvatar
                        address={address}
                        avatarSrc={avatarSrc}
                        ensName={ensName}
                        size="md"
                    />
                    <div className="flex flex-1 justify-end">
                        <Tag
                            label={t(
                                'app.application.aragonProfilePreviewCard.you',
                            )}
                        />
                    </div>
                </div>
                <p className="truncate text-neutral-800 text-xl leading-tight">
                    {label}
                </p>
            </div>
        </Card>
    );
};
