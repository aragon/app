import { useEffect, useState } from 'react';

export const useCurrentUrl = () => {
    const [currentUrl, setCurrentUrl] = useState('');

    // Process the page url inside an use effect to make sure to run the code only on the client side.
    useEffect(() => setCurrentUrl(window.location.href.replace(/(http(s?)):\/\//, '')), []);

    return currentUrl;
};
