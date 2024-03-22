import { useQuery } from '@tanstack/react-query';
import { useIdOS } from '../_providers/idos';
import { idOSCredential } from '../_types/idos';
import { useMemo } from 'react';
import { compareAddresses } from './utils';
import { getPublicInfo } from '../_server/idos';

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

export const useFetchCredentialContent = (credentialId: string | undefined) => {
  const { sdk } = useIdOS();

  return useQuery({
    queryKey: ['credential-content', credentialId],
    queryFn: async ({ queryKey: [, credentialId] }) => {
      if (!sdk || !credentialId) return '';

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

export const useFetchGrants = () => {
  const { sdk, address } = useIdOS();

  return useQuery({
    queryKey: ['grants', address],
    queryFn: async () => {
      const { grantee } = await getPublicInfo();
      return sdk?.grants.list({ owner: address, grantee });
    },
  });
};

export const useFetchKycCredential = () => {
  const { data: credentials, isLoading, error } = useFetchCredentials();

  const credential = useMemo(() => {
    if (!credentials) return;

    return credentials.find((c) => c.credential_type === 'kyc');
  }, [credentials]);

  return {
    credential,
    id: credential?.id,
    approved: credential?.credential_status === 'approved',
    isLoading,
    error,
  };
};

type TCredentialContent = {
  country: string | undefined;
  wallet:
    | {
        address: string;
        verified: boolean;
      }
    | undefined;
  id: string | undefined;
  approved: boolean | undefined;
  isLoading: boolean;
  error: any;
};

export const useFetchKycData = () => {
  const { address } = useIdOS();
  const {
    id,
    approved,
    isLoading: kycLoading,
    error: kycError,
  } = useFetchKycCredential();
  const {
    data: credentialContent,
    isLoading: contentLoading,
    error: contentError,
  } = useFetchCredentialContent(id);

  const credential: TCredentialContent = useMemo(() => {
    return {
      id: id,
      approved,
      country:
        credentialContent?.credentialSubject?.residential_address_country,
      wallet: credentialContent?.credentialSubject?.wallets.find((wallet) => {
        return (
          address &&
          compareAddresses(wallet?.address, address) &&
          wallet?.verified
        );
      }),
      isLoading: kycLoading || contentLoading,
      error: kycError || contentError,
    };
  }, [
    credentialContent,
    address,
    id,
    approved,
    kycLoading,
    contentLoading,
    kycError,
    contentError,
  ]);

  return credential;
};
