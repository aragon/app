import { useEffect } from 'react';

export const scrollToTop = (): void => {
    window.scrollTo(0, 0);
};

export const useScrollToTop = (): void => {
    useEffect(() => {
        scrollToTop();
    }, []);
};
