import { useQuery } from '@tanstack/react-query';
import { useIdOS } from '../_providers/idos';
import { idOSCredential } from '../_types/idos';
// import { idOS } from '@idos-network/idos-sdk';

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

export const useFetchCredentialContent = (credentialId: string) => {
  const { sdk } = useIdOS();

  return useQuery({
    queryKey: ['credential-content', credentialId],
    queryFn: async ({ queryKey: [, credentialId] }) => {
      if (!sdk) return;

      const credential = await sdk.data.get<
        idOSCredential & { content: string }
      >('credentials', credentialId);

      if (!credential) return '';

      // check if this step is really needed
      // const verified = await idOS.verifiableCredentials.verify(credential?.content);

      // console.log(
      //   '%c==>Verify Credential:',
      //   'color: green; background: yellow; font-size: 20px',
      //   verified,
      // );

      return JSON.parse(credential?.content);
    },
    enabled: !!credentialId,
  });
};

export const useFetchWallets = () => {
  const { sdk } = useIdOS();

  return useQuery({
    queryKey: ['wallets'],
    queryFn: () => sdk?.data.list('wallets'),
  });
};

export const useFetchGrants = (grantee: string) => {
  const { sdk, address } = useIdOS();

  return useQuery({
    queryKey: ['grants', address, grantee],
    queryFn: () => sdk?.grants.list({ owner: address, grantee }),
  });
};
