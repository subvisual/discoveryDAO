'use client';

import {
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { useEffect, useState } from 'react';
import { columns } from './column-definitions';
import { Project } from '@/app/_types';
import { formatDate } from './format-date';
import { upcomingMobile } from './column-visibility';

const defaultData: Project[] = [
  {
    id: 1,
    project: 'Citizend Community Sale',
    targetedRaise: 100,
    supplySold: 50,
    urlId: 'citizend',
    startDate: new Date(),
    endDate: new Date(),
  },
  {
    id: 2,
    project: 'Project 2',
    targetedRaise: 200,
    supplySold: 100,
    startDate: new Date(),
    endDate: new Date(),
  },
  {
    id: 3,
    project: 'Project 3',
    targetedRaise: 300,
    supplySold: 150,
    startDate: new Date(),
    endDate: new Date(),
  },
];

const DesktopTable = () => {
  const table = useReactTable({
    data: [...defaultData],
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  return (
    <table className="bg-white-anti-flash hidden w-full rounded-md border-grey-lightest md:table">
      <thead>
        {table.getHeaderGroups()?.map((headerGroup) => (
          <tr key={headerGroup.id}>
            {headerGroup.headers.map((header) => {
              return (
                <td
                  key={header.id}
                  className="p-6 font-medium uppercase text-font-color-light"
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
};

const MobileTable = () => {
  const table = useReactTable({
    data: [...defaultData],
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    state: {
      columnVisibility: upcomingMobile,
    },
  });

  return (
    <table className="bg-white-anti-flash w-full overflow-hidden rounded-md border-grey-lightest md:hidden">
      <thead>
        {table.getHeaderGroups()?.map((headerGroup) => (
          <tr key={headerGroup.id}>
            {headerGroup.headers.map((header) => {
              return (
                <td
                  key={header.id}
                  className="p-4 text-xs font-medium uppercase leading-4 text-font-color-light"
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
            <>
              <tr key={row.id} className="hover:bg-grey-lightest">
                {row.getVisibleCells().map((cell) => (
                  <td
                    key={cell.id}
                    className="border-t border-grey-lightest p-6"
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
              <tr key={`${row.id}-bottom`}>
                <td
                  className="bg-slate-200 px-6 py-3"
                  key={`${row.id}-inner`}
                  colSpan={row.getVisibleCells().length}
                >
                  Starts: {formatDate(row.original.startDate)}
                </td>
              </tr>
            </>
          ))}
        </tbody>
      ) : null}
    </table>
  );
};

export function ProjectsTable() {
  //   const [projects, setProjects] = useState<any[] | null>(null);

  //   useEffect(() => {
  //     if (data) {
  //       setProjects(data);
  //     }
  //   }, [data]);

  //   if (isLoading) return <p>Loading...</p>;
  //   if (isError) return <p>Error</p>;

  return (
    <>
      <DesktopTable />
      <MobileTable />
    </>
  );
}
