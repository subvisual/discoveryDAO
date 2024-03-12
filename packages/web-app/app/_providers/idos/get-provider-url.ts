const providerBaseUrl = process.env.NEXT_PUBLIC_PROFILE_PROVIDER_TEST_BASE;
const providerIdosCheck =
  '%20verification.idos%3Aread%20verification.idos.details%3Aread';
const providerLivenessCheck =
  '%20verification.liveness%3Aread%20verification.liveness.details%3Aread';
const providerEthWalletCheck =
  '%20verification.wallet-eth%3Aread%20verification.wallet-eth.details%3Aread';
const providerEnsureWalletCheck = '&ensure_wallet=';

export const getProviderUrl = (address: string) => {
  return (
    providerBaseUrl +
    providerIdosCheck +
    providerLivenessCheck +
    providerEthWalletCheck +
    providerEnsureWalletCheck +
    address
  );
};
