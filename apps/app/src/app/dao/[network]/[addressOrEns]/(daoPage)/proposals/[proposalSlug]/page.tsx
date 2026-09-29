// Imported from the page file (not the module barrel): the RSC pulls in
// server-only prefetch code that must stay out of the barrel's client graph.
import { DaoProposalDetailsPage } from '@/modules/governance/pages/daoProposalDetailsPage/daoProposalDetailsPage';
import { governanceMetadataUtils } from '@/modules/governance/utils/governanceMetadataUtils';

export const generateMetadata =
    governanceMetadataUtils.generateProposalMetadata;
export default DaoProposalDetailsPage;
