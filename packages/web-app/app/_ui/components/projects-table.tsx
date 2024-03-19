'use client';

import {
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { useEffect, useState } from 'react';
import {
  desktopUpcoming,
  mobileUpcoming,
} from './projects-table/column-definitions';
import { Project } from '@/app/_types';

const defaultData: Project[] = [
  {
    id: 1,
    project: 'Citizend Community Sale',
    targetedRaise: 100,
    supplySold: 50,
    votes: 100,
    urlId: 'citizend',
    startDate: new Date(),
  },
  {
    id: 2,
    project: 'Project 2',
    targetedRaise: 200,
    supplySold: 100,
    votes: 200,
    startDate: new Date(),
  },
  {
    id: 3,
    project: 'Project 3',
    targetedRaise: 300,
    supplySold: 150,
    votes: 300,
    startDate: new Date(),
  },
];

const DesktopTable = () => {
  const table = useReactTable({
    data: [...defaultData],
    columns: desktopUpcoming,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  return (
    <table className="hidden w-full rounded-md border-grey-lightest bg-white shadow-projects-table md:table">
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
};

const MobileTable = () => {
  const table = useReactTable({
    data: [...defaultData],
    columns: mobileUpcoming,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  return (
    <table className="w-full rounded-md border-grey-lightest bg-white shadow-projects-table md:hidden">
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
