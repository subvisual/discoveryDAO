import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { TChildren } from '@/app/_types';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 0,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
    },
  },
});

export function ReactQueryProviderWrapper({ children }: TChildren) {
  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}
