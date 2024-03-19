import { Project } from '@/app/_types';
import { createColumnHelper } from '@tanstack/react-table';
import Link from 'next/link';
import { formatDate } from './format-date';

const columnHelper = createColumnHelper<Project>();

export const columns = [
  columnHelper.accessor('id', {
    header: () => '#',
    cell: (info) => info.getValue(),
  }),
  columnHelper.accessor('project', {
    cell: (info) => (
      <Link
        href={`/projects/${info.row.original.urlId}`}
        className="font-medium"
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
  columnHelper.accessor('endDate', {
    header: () => 'Sale Starts in',
    cell: (info) => <span>{formatDate(info.getValue())}</span>,
  }),
  columnHelper.accessor('supplySold', {
    header: () => '% of supply sold',
    cell: (info) => <span>{info.renderValue()}%</span>,
  }),
  columnHelper.accessor('startDate', {
    header: () => 'Sale Starts in',
    cell: (info) => <span>{formatDate(info.getValue())}</span>,
  }),
];
