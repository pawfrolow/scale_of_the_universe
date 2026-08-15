import { QueryClientProvider } from '@tanstack/react-query';
import React from 'react';

import { App } from './App';
import type { UniverseAppProps } from './App';

import { queryClient } from '@/services/query-client';

import '@/styles/reset.css';
import '@/app/global.scss';

const UniverseApp = (props: UniverseAppProps) => (
  <QueryClientProvider client={queryClient}>
    <App {...props} />
  </QueryClientProvider>
);

export default UniverseApp;
