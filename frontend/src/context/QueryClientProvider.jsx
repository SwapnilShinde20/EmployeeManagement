import React from 'react';
import { QueryClient, QueryClientProvider as RQProvider } from 'react-query';

const queryClient = new QueryClient();

export const QueryClientProvider = ({ children }) => (
  <RQProvider client={queryClient}>{children}</RQProvider>
);
