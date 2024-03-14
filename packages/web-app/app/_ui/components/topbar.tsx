import Image from 'next/image';

import { WalletButton } from '@/app/_ui/components';
import { NavLink } from './nav-link';

export function Topbar() {
  return (
    <header className="flex flex-col bg-white px-28 py-6 md:flex-row">
      <Image
        src="/citizend-logo.svg"
        alt="Citizend Logo"
        width={157}
        height={52}
        priority
      />
      <div className="ml-20 flex flex-grow flex-col items-center gap-8 md:flex-row">
        <NavLink href="/" name="All Projects" className="" />
        <NavLink href="/projects/my-projects" name="My Projects" />
      </div>
      <WalletButton />
    </header>
  );
}
