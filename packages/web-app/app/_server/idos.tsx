'use server';

// adapted from https://github.dev/idos-network/idos-sdk-js/tree/main/apps/idos-example-dapp

import { idOS } from '@idos-network/idos-sdk';
import { WebKwil } from '@kwilteam/kwil-js';
import type { SignerSupplier } from '@kwilteam/kwil-js/dist/core/builders.d';
import * as Base64Codec from '@stablelib/base64';
import * as Utf8Codec from '@stablelib/utf8';
import { ethers } from 'ethers';
import nacl from 'tweetnacl';
import { Grant, KwilSigner, PublicInfo } from './types';

const ENCRYPTION_SECRET_KEY = Base64Codec.decode(
  process.env.NEXT_ENCRYPTION_SECRET_KEY,
);
const EVM_GRANTEE_PRIVATE_KEY = process.env.NEXT_EVM_GRANTEE_PRIVATE_KEY;

const ENCRYPTION_KEY_PAIR = nacl.box.keyPair.fromSecretKey(
  ENCRYPTION_SECRET_KEY,
);

const EVM_NODE_URL = 'https://ethereum-sepolia.publicnode.com';
const evmGrantee = new ethers.Wallet(
  EVM_GRANTEE_PRIVATE_KEY,
  new ethers.JsonRpcProvider(EVM_NODE_URL),
);

const kwilSigner: KwilSigner = {
  signer: evmGrantee as unknown as SignerSupplier,
  publicKey: evmGrantee.signingKey.publicKey,
  signatureType: 'secp256k1_ep',
};

const decrypt = async (
  b64FullMessage: string,
  b64SenderPublicKey: string,
): Promise<string> => {
  const fullMessage = Base64Codec.decode(b64FullMessage);
  const senderPublicKey = Base64Codec.decode(b64SenderPublicKey);

  const nonce = fullMessage.slice(0, nacl.box.nonceLength);
  const message = fullMessage.slice(nacl.box.nonceLength, fullMessage.length);

  const decrypted = nacl.box.open(
    message,
    nonce,
    senderPublicKey,
    ENCRYPTION_KEY_PAIR.secretKey,
  );

  if (!decrypted) {
    throw Error(
      `Couldn't decrypt. ${JSON.stringify(
        {
          fullMessage: Base64Codec.encode(fullMessage),
          message: Base64Codec.encode(message),
          nonce: Base64Codec.encode(nonce),
          senderPublicKey: Base64Codec.encode(senderPublicKey),
          serverPublicKey: Base64Codec.encode(ENCRYPTION_KEY_PAIR.publicKey),
        },
        null,
        2,
      )}`,
    );
  }

  return Utf8Codec.decode(decrypted);
};

const fetchAccessGrantDataFromIdos = async (
  signer: KwilSigner,
  dataId: string,
): Promise<Grant> => {
  const kwilClient = new WebKwil({
    kwilProvider: process.env.NEXT_PUBLIC_IDOS_NODE_URL as string,
    chainId: process.env.NEXT_PUBLIC_IDOS_CHAIN_ID as string,
  });

  const res = await kwilClient.call(
    {
      dbid: process.env.NEXT_PUBLIC_IDOS_DB_ID as string,
      action: 'get_credential_shared',
      inputs: [{ $id: dataId }],
    },
    signer,
  );

  if (!res.data || !res.data.result) throw new Error(res.toString());

  if (!res.data.result[0])
    throw new Error(
      `Programming error: access grant for credential ${dataId} exists in the smart contract, but the credential does not exist in idOS.`,
    );

  return res.data.result[0] as unknown as Grant;
};

export const getAccessGrantsContentDecrypted = async (dataId: string) => {
  try {
    const credentialCopy = await fetchAccessGrantDataFromIdos(
      kwilSigner,
      dataId,
    );

    const decryptedContent = await decrypt(
      credentialCopy.content,
      credentialCopy.encryption_public_key,
    );

    return { content: decryptedContent };
  } catch (error: any) {
    return { content: 'error', errors: error?.message };
  }
};

const publicInfo: PublicInfo = {
  grantee: evmGrantee.address,
  encryptionPublicKey: Base64Codec.encode(ENCRYPTION_KEY_PAIR.publicKey),
  lockTimeSpanSeconds: 3600, // one hour
};

export const getPublicInfo = (): Promise<PublicInfo> =>
  new Promise((resolve) => {
    resolve(publicInfo);
  });
