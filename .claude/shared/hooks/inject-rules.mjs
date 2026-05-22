#!/usr/bin/env node

import { main } from '../../../.agents/shared/hooks/inject-rules.mjs';

main({ defaultAdapter: 'claude' });
