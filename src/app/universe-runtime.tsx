import '@vitejs/plugin-react/preamble';

import { QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import { createRoot, type Root } from 'react-dom/client';

import { App, type UniverseAppProps } from './App';

import { queryClient } from '@/services/query-client';

import '@/styles/reset.css';
import '@/app/global.scss';

const mountedRoots = new WeakMap<Element, Root>();

export const mountUniverseRuntime = (container: Element, props: UniverseAppProps = {}) => {
  const root = mountedRoots.get(container) ?? createRoot(container);

  mountedRoots.set(container, root);

  root.render(
    <QueryClientProvider client={queryClient}>
      <App {...props} />
    </QueryClientProvider>,
  );
};
