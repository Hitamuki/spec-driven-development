import { defineConfig } from 'orval';

export default defineConfig({
  api: {
    output: {
      target: 'generated',
      schemas: './generated/model',
      client: 'react-query',
      mode: 'split',
      mock: true,
    },
    input: {
      target: './openapi.yaml',
    },
  },
});
