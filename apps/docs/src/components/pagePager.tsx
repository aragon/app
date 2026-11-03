'use client';

import { Button, IconType } from '@aragon/gov-ui-kit';
import type { ReactNode } from 'react';

interface IPagerLink {
    name: ReactNode;
    url: string;
}

export interface IPagePagerProps {
    previous?: IPagerLink;
    next?: IPagerLink;
}

/**
 * Previous and next page in sidebar order, as kit tertiary buttons under a hairline.
 */
export const PagePager = ({ previous, next }: IPagePagerProps) => {
    if (previous == null && next == null) {
        return null;
    }

    return (
        <nav
            aria-label="Pages"
            className="mt-6 flex flex-wrap items-center justify-between gap-4 border-neutral-100 border-t pt-6"
        >
            {previous == null ? (
                <span />
            ) : (
                <Button
                    href={previous.url}
                    iconLeft={IconType.CHEVRON_LEFT}
                    size="md"
                    variant="tertiary"
                >
                    {previous.name}
                </Button>
            )}
            {next != null && (
                <Button
                    href={next.url}
                    iconRight={IconType.CHEVRON_RIGHT}
                    size="md"
                    variant="tertiary"
                >
                    {next.name}
                </Button>
            )}
        </nav>
    );
};
