interface IPermissionSummaryFieldProps {
    children: React.ReactNode;
    label: string;
}

export const PermissionSummaryField: React.FC<IPermissionSummaryFieldProps> = ({
    children,
    label,
}) => (
    <span className="flex min-w-0 flex-col gap-1 md:block">
        <span className="text-neutral-500 text-xs md:hidden">{label}</span>
        {children}
    </span>
);
