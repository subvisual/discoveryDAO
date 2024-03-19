import type { ReactNode } from 'react';

export type TChildren = {
  children: ReactNode;
};

export type Project = {
  id: number;
  project: string;
  targetedRaise: number;
  supplySold: number;
  votes: number;
  urlId?: string;
  startDate: Date;
};
