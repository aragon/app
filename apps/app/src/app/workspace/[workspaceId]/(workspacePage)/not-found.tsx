// Sits below the workspace layout, so a `notFound()` raised anywhere in the workspace tree renders inside it and
// keeps the workspace navigation. Without this boundary the root one handles it, and that renders under the root
// layout alone — no navigation, no workspace context.
import { NotFoundBase } from '@/modules/application/components/notFound/notFoundBase';

export default NotFoundBase;
