'use client';

import { useAccount, useBalance } from 'wagmi';
import { formatEther } from 'viem';
import { Button } from './button';
import {
  useFetchCredentials,
  useFetchGrants,
  useFetchIdOSProfile,
  useFetchWallets,
  useIdOS,
} from '@/app/_providers/idos';
import { useReadControllerProjects } from '@/wagmi.generated';
import { useState } from 'react';
import { idOS } from '@idos-network/idos-sdk';
import { getAccessGrantsContentDecrypted } from '@/app/server/idos';

const json = (object) => {
  return JSON.stringify(object, '', 2).replace(/"(data:.*?;).*/g, '$1 (...)');
};

const DecryptButton = ({ dataId }: { dataId: string }) => {
  const getAccessGrants = getAccessGrantsContentDecrypted.bind(null, dataId);

  return (
    <form action={getAccessGrants}>
      <Button type="submit">Decrypt</Button>
    </form>
  );
};

const IdosInfo = () => {
  const [contentStr, setContentStr] = useState('');
  const { address } = useAccount();
  const { sdk } = useIdOS();
  const { data, isError, isLoading } = useFetchCredentials();
  const { data: wallets } = useFetchWallets();
  const { data: grants } = useFetchGrants();
  // const { data: credentials } = useFetchCredentials();

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
              className="p-2"
              onClick={async () => {
                if (!sdk) return;

                const { content } = await sdk.data.get(
                  'credentials',
                  credential.id,
                );

                try {
                  console.log(
                    '%c==>Verify Credential:',
                    'color: green; background: yellow; font-size: 20px',
                    await idOS.verifiableCredentials.verify(content),
                  );
                } catch (error) {
                  console.log(
                    '%c==>',
                    'color: green; background: yellow; font-size: 20px',
                    error,
                  );
                }

                try {
                  const result = await sdk.grants.list({
                    owner: address,
                    // grantee: fakeServer.publicInfo.granteeAddress,
                  });

                  console.log(
                    '%c==>GRANTS',
                    'color: green; background: yellow; font-size: 20px',
                    result,
                  );
                } catch (error) {}

                setContentStr(JSON.parse(content));
              }}
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
      {contentStr ? <pre>${json(contentStr)}</pre> : null}
      <h4 className="mt-6 font-semibold">Grants</h4>
      {grants?.map((grant) => (
        <div key={grant.dataId} className="flex flex-col gap-2 py-4">
          <p>
            <span>DataId: </span>
            {grant.dataId}
          </p>
          <p>
            <span>Owner: </span>
            {grant.owner}
          </p>
          <DecryptButton dataId={grant.dataId} />
        </div>
      ))}
    </div>
  );
};

export function Info() {
  const { hasSigned, authenticate, address } = useIdOS();
  const test = useReadControllerProjects();

  if (!address) return null;

  return (
    <div className="grid grid-cols-1 gap-2">
      {hasSigned ? (
        <IdosInfo />
      ) : (
        <Button onClick={authenticate}>Check KYC status</Button>
      )}
    </div>
  );
}
