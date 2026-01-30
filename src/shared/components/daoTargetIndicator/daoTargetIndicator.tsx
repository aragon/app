import { addressUtils, DaoAvatar } from '@aragon/gov-ui-kit';
import type { IDao, IDaoPlugin, ISubDaoSummary } from '@/shared/api/daoService';
import { ipfsUtils } from '@/shared/utils/ipfsUtils';

export interface IDaoTargetIndicatorProps {
    /**
     * The root DAO used to determine if there are subDAOs.
     */
    dao?: IDao;
    /**
     * The plugin whose target DAO should be displayed.
     * When provided, targetDaoAddress will be derived from the plugin.
     */
    plugin?: IDaoPlugin;
    /**
     * Explicit target DAO address. Used when plugin is not available (e.g., for policies).
     * Takes precedence over plugin if both are provided.
     */
    targetDaoAddress?: string;
    /**
     * Size variant affecting text size.
     * - undefined: no text class (inherits from parent, use in DefinitionList)
     * - 'sm': text-sm (14px), for DataList items
     * - 'xs': text-xs (12px)
     */
    size?: 'sm' | 'xs';
}

/**
 * Resolves the target DAO address from either explicit address or plugin.
 * If plugin has daoAddress, it's installed on a subDAO; otherwise it's on main DAO.
 */
const resolveTargetAddress = (
    targetDaoAddress?: string,
    plugin?: IDaoPlugin,
    mainDaoAddress?: string,
): string | undefined => {
    if (targetDaoAddress != null) {
        return targetDaoAddress;
    }
    return plugin?.daoAddress ?? mainDaoAddress;
};

/**
 * Finds the target DAO info (either parent DAO or a subDAO) based on the target address.
 */
const findTargetDao = (
    dao: IDao,
    targetAddress: string,
): Pick<IDao | ISubDaoSummary, 'name' | 'avatar'> | undefined => {
    // Check if targeting parent DAO
    if (addressUtils.isAddressEqual(dao.address, targetAddress)) {
        return dao;
    }

    // Check subDAOs
    return dao.subDaos?.find((subDao) =>
        addressUtils.isAddressEqual(subDao.address, targetAddress),
    );
};

/**
 * Displays a target DAO indicator (avatar + name) for a plugin or policy.
 * Only renders when there are multiple DAOs/subDAOs.
 */
const sizeConfig = {
    sm: 'text-sm',
    xs: 'text-xs',
} as const;

export const DaoTargetIndicator: React.FC<IDaoTargetIndicatorProps> = (
    props,
) => {
    const { dao, plugin, targetDaoAddress, size } = props;

    // Only show when there are subDAOs
    const hasSubDaos = (dao?.subDaos?.length ?? 0) > 0;
    if (!hasSubDaos || dao == null) {
        return null;
    }

    // Resolve target address
    const resolvedAddress = resolveTargetAddress(
        targetDaoAddress,
        plugin,
        dao.address,
    );
    if (resolvedAddress == null) {
        return null;
    }

    // Find target DAO info
    const targetDao = findTargetDao(dao, resolvedAddress);
    if (targetDao == null) {
        return null;
    }

    const avatarSrc = ipfsUtils.cidToSrc(targetDao.avatar);
    const textSizeClass = size != null ? sizeConfig[size] : '';

    return (
        <div className="flex items-center gap-2 text-neutral-500 leading-tight">
            <DaoAvatar name={targetDao.name} size="sm" src={avatarSrc} />
            <span className={`${textSizeClass} truncate`.trim()}>
                {targetDao.name}
            </span>
        </div>
    );
};
