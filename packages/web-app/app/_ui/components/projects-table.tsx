'use client';
import { useReadControllerProjects } from '@/wagmi.generated';
import {
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { useEffect, useState } from 'react';

const columns = [
  {
    header: 'Project',
    accessor: 'project',
  },
  {
    header: 'Targeted Raise (ETH)',
    accessor: 'targetedRaise',
  },
  {
    header: '% of supply sold',
    accessor: 'supplySold',
  },
  {
    header: 'Votes',
    accessor: 'votes',
  },
];

const dummyData = [
  {
    project: 'Project 1',
    targetedRaise: 100,
    supplySold: 50,
    votes: 100,
  },
  {
    project: 'Project 2',
    targetedRaise: 200,
    supplySold: 100,
    votes: 200,
  },
  {
    project: 'Project 3',
    targetedRaise: 300,
    supplySold: 150,
    votes: 300,
  },
];

export function ProjectsTable() {
  //   const { data, isError, isLoading } = useReadControllerProjects();
  //   const [projects, setProjects] = useState<any[] | null>(null);
  const table = useReactTable({
    data: dummyData,
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

  console.log(
    '%c==>',
    'color: green; background: yellow; font-size: 20px',
    table.getRowCount(),
  );

  return (
    <table className="shadow-projects-table w-full rounded-md border-grey-lightest bg-white">
      <thead>
        {table.getHeaderGroups()?.map((headerGroup) => (
          <tr key={headerGroup.id}>
            {headerGroup.headers.map((header) => {
              return (
                <td
                  key={header.id}
                  align={header.column.columnDef?.align}
                  className="p-6"
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
          {table.getRowModel()?.rows?.map((row) => {
            return (
              <tr key={row.id}>
                {row
                  .getVisibleCells()
                  ?.map((cell) => (
                    <td key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </td>
                  ))}
              </tr>
            );
          })}
        </tbody>
      ) : null}
    </table>
  );
}
