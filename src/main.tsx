import { QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import ReactDOM from 'react-dom/client';

import { App } from './app/App';
import { queryClient } from './services/query-client';

import './assets/css/reset.css';
import './assets/css/styles.scss';

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <QueryClientProvider client={queryClient}>
    <App />
  </QueryClientProvider>,
);
