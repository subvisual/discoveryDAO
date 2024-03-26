import { Fragment, PropsWithChildren } from 'react';
import { Menu, Transition } from '@headlessui/react';
import clsx from 'clsx';
import Link from 'next/link';

const BurgerMenu = () => {
  return (
    <div className="bg-transparent">
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <path
          d="M4.00195 5H19.9993"
          stroke="currentColor"
          stroke-width="3"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
        <path
          d="M4 12H19.9934"
          stroke="currentColor"
          stroke-width="3"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
        <path
          d="M4.00195 19H19.9926"
          stroke="currentColor"
          stroke-width="3"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      </svg>
    </div>
  );
};

type TDropdownItemProps = {
  href: string;
  name: string;
};

function DropdownItem({ href, name }: TDropdownItemProps) {
  return (
    <div className="py-1">
      <Menu.Item>
        {({ active }) => (
          <Link
            href={href}
            className={clsx(
              active ? 'bg-gray-100 text-gray-900' : 'text-gray-700',
              'block px-4 py-2 text-sm',
            )}
          >
            {name}
          </Link>
        )}
      </Menu.Item>
    </div>
  );
}

type TDropdownProps = PropsWithChildren & {
  classNames?: string;
};

export function Dropdown({ children, classNames }: TDropdownProps) {
  return (
    <Menu
      as="div"
      className={clsx('relative inline-block text-left', classNames)}
    >
      <div className="flex h-full content-center items-center">
        <Menu.Button className="items-cente flex text-[#3865FD] hover:text-blue-light focus:outline-none focus:ring-2 focus:ring-[#3865FD]">
          <span className="sr-only">Open navigation menu</span>
          <BurgerMenu />
        </Menu.Button>
      </div>
      <Transition
        as={Fragment}
        enter="transition ease-out duration-100"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
      >
        <Menu.Items className="absolute right-0 z-10 mt-2 w-56 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
          {children}
        </Menu.Items>
      </Transition>
    </Menu>
  );
}

Dropdown.Item = DropdownItem;
