import { QueryClientProvider } from '@tanstack/react-query';
import React from 'react';

import { App } from './App';
import type { UniverseAppProps } from './App';

import { queryClient } from '@/services/query-client';

import '@/assets/css/reset.css';
import '@/assets/css/styles.scss';

const UniverseApp = (props: UniverseAppProps) => (
  <QueryClientProvider client={queryClient}>
    <App {...props} />
  </QueryClientProvider>
);

export default UniverseApp;
