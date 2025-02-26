'use client';

import { multisigPlugin } from '@/plugins/multisigPlugin/constants/multisigPlugin';
import { Network } from '@/shared/api/daoService';
import { Page } from '@/shared/components/page';
import { fetchLatestVersion } from '@/shared/utils/fetchLatestVersion';
import { useEffect, useState } from 'react';

const TestPage = () => {
    const [latestVersion, setLatestVersion] = useState<{ release: number; build: number } | null>(null);

    useEffect(() => {
        const fetchVersion = async () => {
            try {
                const version = await fetchLatestVersion(Network.ETHEREUM_SEPOLIA, multisigPlugin);
                console.log('Fetched latest version:', version);
                setLatestVersion(version);
            } catch (error) {
                console.error('Error fetching latest version:', error);
            }
        };

        void fetchVersion();
    }, []);

    return (
        <Page.Container>
            <div>
                <h3>Testing Latest Version Fetch</h3>
                {latestVersion ? (
                    <p>
                        Release: {latestVersion.release}, Build: {latestVersion.build}
                    </p>
                ) : (
                    <p>Loading...</p>
                )}
            </div>
        </Page.Container>
    );
};

export default TestPage;
