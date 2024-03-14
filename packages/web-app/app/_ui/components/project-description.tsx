'use client';

import { useState, useEffect } from 'react';
import { useReadProjectDescription } from '@/wagmi.generated';

export const ProjectDescription = () => {
  const [isSSR, setIsSSR] = useState(true);
  const { data, isLoading } = useReadProjectDescription();

  useEffect(() => {
    setIsSSR(false);
  }, []);

  if (isSSR || isLoading) return <p className="load">Loading...</p>;

  return <p>{data}</p>;
};
