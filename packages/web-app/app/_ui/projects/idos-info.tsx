'use client';

import { Button } from '../components/button';
import { useState } from 'react';
import {
  useFetchCredentialContent,
  useFetchCredentials,
  useFetchWallets,
} from '@/app/_lib/queries';
import { PublicInfo } from '@/app/_server/types';
import { AcquireAccessGrantButton } from './acquire-access-grant-button';
import { Grants } from './grants';

const json = (object) => {
  return JSON.stringify(object, '', 2).replace(/"(data:.*?;).*/g, '$1 (...)');
};

type TIdosInfoProps = {
  serverInfo: PublicInfo;
};

export const IdosInfo = ({ serverInfo }: TIdosInfoProps) => {
  const [credentialId, setCredentialId] = useState('');
  const { data, isError, isLoading } = useFetchCredentials();
  const { data: credentialContent } = useFetchCredentialContent(credentialId);
  const { data: wallets } = useFetchWallets();

  return (
    <div className="mt-2">
      <h3>Idos</h3>
      <h4 className="my-4 font-semibold">Wallets</h4>
      {wallets?.map((wallet) => (
        <div key={wallet.id}>
          <p>
            <span>Id: </span>
            {wallet.id}
          </p>
          <p>
            <span>Address: </span>
            {wallet.address}
          </p>
        </div>
      ))}
      <h4 className="mt-6 font-semibold">Credentials</h4>
      {data?.map((credential) => (
        <div key={credential.id} className="flex flex-col gap-2 py-4">
          <p>
            <span>Id: </span>
            <Button
              className="p-0"
              onClick={() => setCredentialId(credential.id)}
            >
              {credential.id}
            </Button>
          </p>
          <p>
            <span>Level: </span>
            {credential.credential_level}
          </p>
          <p>
            <span>Status: </span>
            {credential.credential_status}
          </p>
        </div>
      ))}
      {credentialId ? (
        <AcquireAccessGrantButton id={credentialId} serverInfo={serverInfo} />
      ) : null}
      {credentialContent ? (
        <pre className="mt-5 flex overflow-auto bg-slate-400">
          ${json(credentialContent)}
        </pre>
      ) : null}
      <Grants serverInfo={serverInfo} />
    </div>
  );
};
