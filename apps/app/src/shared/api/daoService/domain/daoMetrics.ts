export interface IDaoMetrics {
    /**
     * Number of proposals created in the DAO.
     */
    proposalsCreated: number;
    /**
     * Number of members of the DAO.
     */
    members: number;
    /**
     * Total value locked of the DAO.
     */
    tvlUSD: string;
}
