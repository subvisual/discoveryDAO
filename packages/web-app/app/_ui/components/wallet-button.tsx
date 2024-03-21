'use client';

import { ConnectButton } from '@rainbow-me/rainbowkit';
import { Button } from '../components';
import { useDialog } from '@/app/_providers/dialog/context';
import { SettingsDialog } from './dialogs';

export function WalletButton() {
  const { open } = useDialog();

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
            <>
              <Button
                type="button"
                variant="dropdown"
                onClick={() => open(SettingsDialog.displayName)}
              >
                {account.displayName}
              </Button>
            </>
          );
        })();
      }}
    </ConnectButton.Custom>
  );
}
