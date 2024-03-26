'use client';

import { Button } from '../components/button';
import { useState } from 'react';
import {
  useFetchCredentialContent,
  useFetchCredentials,
} from '@/app/_lib/queries';
import { PublicInfo } from '@/app/_server/types';
import { AcquireAccessGrantButton } from '../components/dialogs/acquire-access-grant-button';
import { Grants } from './grants';

type TJson = {
  [key: string]: any;
};

const json = (object: TJson) => {
  return JSON.stringify(object, () => '', 2).replace(
    /"(data:.*?;).*/g,
    '$1 (...)',
  );
};

type TIdosInfoProps = {
  serverInfo: PublicInfo;
};

// TEST COMPONENT - NOT FINAL, JUST TO OUTPUT INFO IN THE PAGE
export const IdosInfo = ({ serverInfo }: TIdosInfoProps) => {
  const [credentialId, setCredentialId] = useState('');
  const { data, isError, isLoading } = useFetchCredentials();
  const { data: credentialContent } = useFetchCredentialContent(credentialId);

  return (
    <div className="mt-2">
      <h3>Idos</h3>
      <h4 className="mt-6 font-medium">Credentials</h4>
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
      {credentialId ? <AcquireAccessGrantButton id={credentialId} /> : null}
      {credentialContent ? (
        <pre className="mt-5 flex overflow-auto bg-slate-400">
          ${json(credentialContent)}
        </pre>
      ) : null}
      <Grants serverInfo={serverInfo} />
    </div>
  );
};
