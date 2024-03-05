'use client';

import { ConnectButton } from '@rainbow-me/rainbowkit';
import { Button } from '../components';

export function WalletButton() {
  return (
    <ConnectButton.Custom>
      {({
        account,
        chain,
        openAccountModal,
        openChainModal,
        openConnectModal,
        mounted,
      }) => {
        const connected = mounted && account && chain;

        if (!mounted)
          return (
            <Button disabled variant="primary-disabled">
              Connect Wallet
            </Button>
          );

        return (() => {
          if (!connected) {
            return (
              <Button
                type="button"
                variant="primary"
                onClick={openConnectModal}
              >
                Connect Wallet
              </Button>
            );
          }
          if (chain.unsupported) {
            return (
              <Button type="button" variant="dropdown" onClick={openChainModal}>
                Wrong network
              </Button>
            );
          }
          return (
            <Button type="button" variant="dropdown" onClick={openAccountModal}>
              {account.displayName}
            </Button>
          );
        })();
      }}
    </ConnectButton.Custom>
  );
}
