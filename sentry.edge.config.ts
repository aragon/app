import { monitoringUtils } from '@/shared/utils/monitoringUtils';
import * as Sentry from '@sentry/nextjs';

Sentry.init(monitoringUtils.getBaseConfig());
