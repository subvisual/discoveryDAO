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
import { upcomingDesktop, upcomingMobile } from './column-visibility';

const defaultData: Project[] = [
  {
    id: 1,
    project: 'Citizend Community Sale',
    targetedRaise: 100,
    supplySold: 50,
    urlId: 'citizend',
    startDate: new Date('2024-04-24'),
    endDate: new Date(),
  },
  {
    id: 2,
    project: 'Project 2',
    targetedRaise: 200,
    supplySold: 100,
    startDate: new Date('2024-04-24'),
    endDate: new Date(),
  },
  {
    id: 3,
    project: 'Project 3',
    targetedRaise: 300,
    supplySold: 150,
    startDate: new Date('2024-04-24'),
    endDate: new Date(),
  },
];

const DesktopTable = () => {
  const table = useReactTable({
    data: [...defaultData],
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    state: {
      columnVisibility: upcomingDesktop,
    },
  });

  return (
    <table className="hidden w-full rounded-md border-grey-lightest bg-white-anti-flash md:table">
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
        <tbody className="border-t border-grey-light">
          {table.getRowModel().rows.map((row) => (
            <tr key={row.id} className="hover:bg-grey-light">
              {row.getVisibleCells().map((cell) => (
                <td key={cell.id} className="p-6">
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
    <table className="w-full overflow-hidden rounded-md border-grey-lightest bg-white-anti-flash md:hidden">
      <thead>
        {table.getHeaderGroups()?.map((headerGroup) => (
          <tr key={`${headerGroup.id}-mobile`}>
            {headerGroup.headers.map((header) => {
              return (
                <td
                  key={`${header.id}-mobile`}
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
              <tr
                key={`${row.id}-row-mobile`}
                className="hover:bg-grey-lightest"
              >
                {row.getVisibleCells().map((cell) => (
                  <td
                    key={`${cell.id}-cell-mobile`}
                    className="border-t border-grey-lightest p-6"
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
              <tr key={`${row.id}-row-mobile-bottom`}>
                <td
                  className="bg-slate-200 px-6 py-3"
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

// const useWindowWidth = () => {
//   const [windowWidth, setWindowWidth] = useState(0);

//   useEffect(() => {
//     const updateWidth = () => {
//       setWindowWidth(window.innerWidth);
//     };

//     window.addEventListener('resize', updateWidth);

//     updateWidth();

//     return () => window.removeEventListener('resize', updateWidth);
//   }, []);

//   return windowWidth;
// };

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
