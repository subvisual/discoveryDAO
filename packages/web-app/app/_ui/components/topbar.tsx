'use client';

import Image from 'next/image';

import { WalletButton } from '@/app/_ui/components';
import { NavLink } from './nav-link';
import { useEffect, useState } from 'react';
import clsx from 'clsx';

export const useScrollPosition = () => {
  const [scrollPosition, setScrollPosition] = useState(0);

  useEffect(() => {
    const updatePosition = () => {
      setScrollPosition(window.scrollY);
    };

    window.addEventListener('scroll', updatePosition);

    updatePosition();

    return () => window.removeEventListener('scroll', updatePosition);
  }, []);

  return scrollPosition;
};

export function Topbar() {
  const scrollPosition = useScrollPosition();

  return (
    <header
      className={clsx(
        'sticky top-0 transition-all duration-100',
        scrollPosition > 40 && 'bg-navy-dark',
      )}
    >
      <div className="mx-auto flex max-w-6xl flex-row justify-between px-6 py-5 md:justify-normal md:py-6">
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
        <nav className="ml-20 hidden flex-grow items-center gap-8 md:flex">
          <NavLink href="/" name="All Projects" className="" />
          <NavLink href="/projects/my-projects" name="My Projects" />
        </nav>
        <WalletButton />
      </div>
    </header>
  );
}
