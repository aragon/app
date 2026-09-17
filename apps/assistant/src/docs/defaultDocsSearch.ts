import { getConfig } from '../lib/config';
import { observability } from '../lib/observability';
import {
    createGatewayQueryEmbedder,
    createGatewayReranker,
} from './docsModels';
import { createDocsSearch, type IDocsSearch } from './docsSearch';
import { docsIndexArtifact } from './generated/docsIndex';

// The deployed wiring: the index built into the bundle, queries embedded with the model the index
// was built with (they must share a space, so the artifact — not the config — names it) and the
// reranker from the config. A failed model step is reported and the search degrades around it.
export const createDefaultDocsSearch = (): IDocsSearch => {
    const { embeddingModel } = docsIndexArtifact.meta;

    return createDocsSearch(
        docsIndexArtifact,
        {
            embedQuery:
                embeddingModel == null
                    ? undefined
                    : createGatewayQueryEmbedder(embeddingModel),
            rerank: createGatewayReranker(getConfig().docs.rerankModel),
        },
        {
            onFallback: (_stage, error) =>
                observability.logError(error, { step: 'searchDocs' }),
        },
    );
};
