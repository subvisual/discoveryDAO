import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { TChildren } from '@/app/_types';

const queryClient = new QueryClient();

export function ReactQueryProviderWrapper({
  children,
}: TChildren) {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}
