#!/usr/bin/env node

import { main } from '../../.agents/hooks/inject-rules.mjs';

main({ defaultAdapter: 'claude' });
