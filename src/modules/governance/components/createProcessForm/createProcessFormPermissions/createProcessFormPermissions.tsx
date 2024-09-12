import { Card, Heading } from '@aragon/ods';

export interface ICreateProcessFormPermissionProps {}

export const CreateProcessFormPermissions: React.FC<ICreateProcessFormPermissionProps> = () => {
    return (
        <Card className="flex grow flex-col justify-center p-6">
            <div className="mx-auto flex flex-col space-y-2">
                <Heading size="h1">TBD</Heading>
                <p>Open questions at:</p>
                <ul className="flex flex-col items-start">
                    <li>Proposal Creation (Threshold)</li>
                    <li>Permissions to protected OSx contracts</li>
                    <li>Permissions to any smart contract actions</li>
                </ul>
            </div>
        </Card>
    );
};
