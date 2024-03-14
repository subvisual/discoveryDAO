'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import clsx from 'clsx';

type TNavLinkProps = {
  href: string;
  name: string;
  className?: string;
};

export const NavLink = ({ href, name, className }: TNavLinkProps) => {
  const pathname = usePathname();

  return (
    <Link
      href={href}
      className={clsx(
        'p-3 font-semibold uppercase text-font-color-light',
        className,
      )}
    >
      <span
        className={clsx({
          'relative flex items-center text-grey-dark before:absolute before:-left-4 before:top-1.5 before:block before:h-2 before:w-2 before:rotate-45 before:bg-blue':
            pathname === href,
        })}
      >
        {name}
      </span>
    </Link>
  );
};
