import { QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import ReactDOM from 'react-dom/client';

import { App } from './app/App';
import { lockViewportScale } from './helpers/lockViewportScale';
import { queryClient } from './services/query-client';

import './styles/reset.css';
import './app/global.scss';

lockViewportScale();

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <QueryClientProvider client={queryClient}>
    <App />
  </QueryClientProvider>,
);
