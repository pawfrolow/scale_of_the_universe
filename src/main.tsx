import { QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import ReactDOM from 'react-dom/client';

import { App } from './app/App';
import { setBrowserTheme } from './helpers/browserTheme';
import { lockViewportScale } from './helpers/lockViewportScale';
import { queryClient } from './services/query-client';

import './styles/reset.css';
import './app/global.scss';

lockViewportScale();
document.documentElement.classList.add('sotu-runtime-active');
document.body.classList.add('sotu-runtime-active');
setBrowserTheme('light');

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <QueryClientProvider client={queryClient}>
    <App />
  </QueryClientProvider>,
);
