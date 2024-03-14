'use client';
import { useReadControllerProjects } from '@/wagmi.generated';
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
} from '@tanstack/react-table';
import Link from 'next/link';
import { useEffect, useState } from 'react';

type Project = {
  id: number;
  project: string;
  targetedRaise: number;
  supplySold: number;
  votes: number;
  urlId?: string;
};

const defaultData: Project[] = [
  {
    id: 1,
    project: 'Citizend Community Sale',
    targetedRaise: 100,
    supplySold: 50,
    votes: 100,
    urlId: 'citizend',
  },
  {
    id: 2,
    project: 'Project 2',
    targetedRaise: 200,
    supplySold: 100,
    votes: 200,
  },
  {
    id: 3,
    project: 'Project 3',
    targetedRaise: 300,
    supplySold: 150,
    votes: 300,
  },
];

const columnHelper = createColumnHelper<Project>();

const columns = [
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

export function ProjectsTable() {
  //   const { data, isError, isLoading } = useReadControllerProjects();
  //   const [projects, setProjects] = useState<any[] | null>(null);
  const table = useReactTable({
    data: [...defaultData],
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  //   useEffect(() => {
  //     if (data) {
  //       setProjects(data);
  //     }
  //   }, [data]);

  //   if (isLoading) return <p>Loading...</p>;
  //   if (isError) return <p>Error</p>;

  return (
    <table className="shadow-projects-table w-full rounded-md border-grey-lightest bg-white">
      <thead>
        {table.getHeaderGroups()?.map((headerGroup) => (
          <tr key={headerGroup.id}>
            {headerGroup.headers.map((header) => {
              return (
                <td
                  key={header.id}
                  className="p-6 font-semibold uppercase text-font-color-light"
                >
                  {flexRender(
                    header.column.columnDef.header,
                    header.getContext(),
                  )}
                </td>
              );
            })}
          </tr>
        ))}
      </thead>
      {table.getRowCount() ? (
        <tbody>
          {table.getRowModel().rows.map((row) => (
            <tr key={row.id} className="hover:bg-grey-lightest">
              {row.getVisibleCells().map((cell) => (
                <td key={cell.id} className="border-t border-grey-lightest p-6">
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      ) : null}
    </table>
  );
}
