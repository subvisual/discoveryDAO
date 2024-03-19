import Image from 'next/image';

import { WalletButton } from '@/app/_ui/components';
import { NavLink } from './nav-link';

export function Topbar() {
  return (
    <header className="flex flex-row justify-between bg-white px-6 py-5 md:justify-normal md:px-28 md:py-6">
      <Image
        src="/citizend-logo.svg"
        alt="Citizend Logo"
        width={157}
        height={52}
        priority
        className="hidden md:block"
      />
      <Image
        src="/citizend-logo.svg"
        alt="Citizend Logo"
        width={96}
        height={31}
        priority
        className="md:hidden"
      />
      <div className="ml-20 hidden flex-grow items-center gap-8 md:flex">
        <NavLink href="/" name="All Projects" className="" />
        <NavLink href="/projects/my-projects" name="My Projects" />
      </div>
      <WalletButton />
    </header>
  );
}
