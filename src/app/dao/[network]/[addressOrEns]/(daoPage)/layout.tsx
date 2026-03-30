import { LayoutDao } from '@/modules/application/components/layouts/layoutDao';
import { applicationMetadataUtils } from '@/modules/application/utils/applicationMetadataUtils';

export const revalidate = 60; // ISR: regenerate every minute

export const generateMetadata = applicationMetadataUtils.generateDaoMetadata;
export default LayoutDao;
