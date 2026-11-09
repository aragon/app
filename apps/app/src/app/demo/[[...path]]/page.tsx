import { WorkspaceDemoPage } from '@/modules/workspace/pages/workspaceDemoPage';

interface DemoPageProps {
    params: Promise<{ path?: string[] }>;
}

export default async function DemoPage(props: DemoPageProps) {
    const { path } = await props.params;

    return <WorkspaceDemoPage path={path} />;
}
