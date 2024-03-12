import { useQuery } from '@tanstack/react-query';
import { useIdOS } from '../_providers/idos';
import { idOSCredential } from '../_types/idos';
import { useAccount } from 'wagmi';

export const useFetchIdOSProfile = () => {
  const { sdk } = useIdOS();
  return useQuery({
    queryKey: ['idos-profile'],
    queryFn: () => sdk?.auth?.currentUser(),
  });
};

export const useFetchCredentials = () => {
  const { sdk } = useIdOS();

  return useQuery({
    queryKey: ['credentials'],
    queryFn: async ({ queryKey: [tableName] }) => {
      if (!sdk) return [];

      const credentials = await sdk.data.list<idOSCredential>(tableName);
      return credentials.map((credential) => ({
        ...credential,
        shares: credentials
          .filter((_credential) => _credential.original_id === credential.id)
          .map((c) => c.id),
      }));
    },
    select: (credentials) =>
      credentials.filter((credential) => !credential.original_id),
  });
};

export const useFetchWallets = () => {
  const { sdk } = useIdOS();

  return useQuery({
    queryKey: ['wallets'],
    queryFn: () => sdk?.data.list('wallets'),
  });
};

export const useFetchGrants = () => {
  const { sdk } = useIdOS();
  const { address } = useAccount();

  return useQuery({
    queryKey: ['grants', address],
    queryFn: () => sdk?.grants.list({ owner: address }),
  });
};
