import Image from 'next/image';
import { WalletButton } from '@/app/_ui/components';

export function Topbar() {
  return (
    <header className="flex justify-between bg-white px-28 py-6">
      <Image
        src="/citizend-logo.svg"
        alt="Citizend Logo"
        width={157}
        height={52}
        priority
      />
      <WalletButton />
    </header>
  );
}
