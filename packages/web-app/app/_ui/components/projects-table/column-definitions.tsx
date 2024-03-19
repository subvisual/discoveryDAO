import { Project } from '@/app/_types';
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
} from '@tanstack/react-table';
import Link from 'next/link';

const columnHelper = createColumnHelper<Project>();

const formatDate = (date: Date) => {
  return new Intl.DateTimeFormat('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  }).format(date);
};

export const columns = [
  columnHelper.accessor('id', {
    header: () => '#',
    cell: (info) => info.getValue(),
  }),
  columnHelper.accessor('project', {
    cell: (info) => (
      <Link
        href={`/projects/${info.row.original.urlId}`}
        className="font-semibold"
      >
        {info.getValue()}
      </Link>
    ),
    header: () => 'Project',
    footer: (info) => info.column.id,
  }),
  columnHelper.accessor('targetedRaise', {
    header: () => 'Targeted Raise (ETH)',
    cell: (info) => info.renderValue(),
  }),
  columnHelper.accessor('supplySold', {
    header: () => '% of supply sold',
    cell: (info) => <span>{info.renderValue()}%</span>,
  }),
  columnHelper.accessor('votes', {
    header: () => 'Votes',
    cell: (info) => info.renderValue(),
  }),
];

export const desktopUpcoming = [
  columnHelper.accessor('project', {
    cell: (info) => (
      <Link
        href={`/projects/${info.row.original.urlId}`}
        className="font-semibold"
      >
        {info.getValue()}
      </Link>
    ),
    header: () => 'Project',
    footer: (info) => info.column.id,
  }),
  columnHelper.accessor('targetedRaise', {
    header: () => 'Targeted Raise (ETH)',
    cell: (info) => info.renderValue(),
  }),
  columnHelper.accessor('startDate', {
    header: () => 'Sale Starts in',
    cell: (info) => <span>{formatDate(info.getValue())}</span>,
  }),
];

export const mobileUpcoming = [
  columnHelper.accessor('project', {
    cell: (info) => (
      <Link
        href={`/projects/${info.row.original.urlId}`}
        className="font-semibold"
      >
        {info.getValue()}
      </Link>
    ),
    header: () => 'Project',
    footer: (info) => info.column.id,
  }),
  columnHelper.accessor('targetedRaise', {
    header: () => 'Targeted Raise (ETH)',
    cell: (info) => info.renderValue(),
  }),
];
