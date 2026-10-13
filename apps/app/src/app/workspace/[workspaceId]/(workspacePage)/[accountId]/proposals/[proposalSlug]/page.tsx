// Imported from the page file (not the module barrel): the RSC pulls in
// server-only prefetch code that must stay out of the barrel's client graph.
import { WorkspaceProposalDetailsPage } from '@/modules/workspace/pages/workspaceProposalDetailsPage/workspaceProposalDetailsPage';
import { workspaceMetadataUtils } from '@/modules/workspace/utils/workspaceMetadataUtils';

export const generateMetadata = workspaceMetadataUtils.generateProposalMetadata;
export default WorkspaceProposalDetailsPage;
