import * as Sentry from '@sentry/nextjs';
import { monitoringUtils } from '@/shared/utils/monitoringUtils';

Sentry.init(monitoringUtils.getBaseConfig());
