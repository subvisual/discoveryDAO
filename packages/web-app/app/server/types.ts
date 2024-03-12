import type { SignerSupplier } from '@kwilteam/kwil-js/dist/core/builders.d';

export interface KwilSigner {
  signer: SignerSupplier;
  publicKey: string;
  signatureType: string;
}

export interface Grant {
  content: string;
  encryption_public_key: string;
}
