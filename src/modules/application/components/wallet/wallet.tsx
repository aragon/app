export interface IWalletProps {}

export const Wallet: React.FC<IWalletProps> = () => {
    return (
        <button className="rounded-full border border-neutral-100 bg-neutral-0 px-4 py-3.5 text-neutral-500">
            Connect
        </button>
    );
};
